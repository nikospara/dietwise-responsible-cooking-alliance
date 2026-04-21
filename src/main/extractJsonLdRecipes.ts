export interface JsonLdRecipe {
	name?: string;
	recipeYield?: string;
	recipeIngredients: string[];
	recipeInstructions: string[];
	text?: string;
}

type WithContextThing = { '@context'?: unknown };

export type SchemaRecipe = {
	'@id'?: unknown;
	'@type'?: unknown;
	name?: unknown;
	recipeYield?: unknown;
	recipeIngredient?: unknown;
	ingredients?: unknown;
	recipeInstructions?: unknown;
};
type CreativeWork = { '@type'?: unknown; name?: unknown };
type Graph = { '@graph'?: unknown };
type HowToStep = { text?: unknown };
type ItemList = { itemListElement?: unknown };
type RecipeInstructions = unknown;
type ThingWithTextOrName = { text?: string; name?: string };
type IngredientValue = unknown;

export function extractJsonLdRecipesFromString(
	html: string,
	normalize: boolean = false,
): JsonLdRecipe[] | SchemaRecipe[] {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return extractJsonLdRecipes(doc, normalize);
}

export function extractJsonLdRecipes(doc: Document, normalize: boolean = false): JsonLdRecipe[] | SchemaRecipe[] {
	const jsonLdRecipes = findJsonLdRecipes(doc);
	return normalize ? jsonLdRecipes.map((r) => normalizeJsonLdRecipe(r)) : jsonLdRecipes;
}

function findJsonLdRecipes(doc: Document): SchemaRecipe[] {
	const blocks = Array.from(doc.querySelectorAll('script[type^="application/ld+json" i]')) as HTMLScriptElement[];
	const recipes: SchemaRecipe[] = [];
	const seenIds = new Set<string>();
	for (const block of blocks) {
		const text = block.textContent?.trim();
		if (!text) continue;
		try {
			const json = JSON.parse(text);
			addIfRecipe(json, recipes, seenIds, false);
		} catch (_e) {
			// ignore parse errors
		}
	}
	return recipes;
}

function addIfRecipe(node: unknown, recipes: SchemaRecipe[], seenIds: Set<string>, contextAllowed: boolean) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		const inheritedContext = contextAllowed || arrayHasSchemaOrgContext(node);
		for (const n of node) addIfRecipe(n, recipes, seenIds, inheritedContext);
		return;
	}
	const context = (node as WithContextThing)['@context'];
	const allowContext = contextAllowed || isSchemaOrgContext(context);
	if (!allowContext) return;
	const type = normalizeType((node as SchemaRecipe)['@type']);
	if (type.includes('Recipe')) addRecipe(node as SchemaRecipe, recipes, seenIds);
	const graph = (node as Graph)['@graph'];
	if (Array.isArray(graph)) {
		for (const g of graph) addIfRecipe(g, recipes, seenIds, allowContext);
	}
	addNestedIfRecipe(node, recipes, seenIds, allowContext);
}

function addNestedIfRecipe(node: unknown, recipes: SchemaRecipe[], seenIds: Set<string>, contextAllowed: boolean) {
	if (!node || typeof node !== 'object') return;
	const record = node as Record<string, unknown>;
	const keys = [
		'mainEntity',
		'mainEntityOfPage',
		'hasPart',
		'subjectOf',
		'about',
		'itemListElement',
		'itemList',
		'isPartOf',
	];
	for (const key of keys) {
		const value = record[key];
		if (Array.isArray(value)) {
			for (const entry of value) addIfRecipe(entry, recipes, seenIds, contextAllowed);
		} else if (value && typeof value === 'object') {
			addIfRecipe(value, recipes, seenIds, contextAllowed);
		}
	}
}

function addRecipe(recipe: SchemaRecipe, recipes: SchemaRecipe[], seenIds: Set<string>) {
	const id = recipe['@id'];
	if (typeof id === 'string') {
		if (seenIds.has(id)) return;
		seenIds.add(id);
	}
	recipes.push(recipe);
}

function arrayHasSchemaOrgContext(nodes: unknown[]): boolean {
	return nodes.some((entry) => {
		if (!entry || typeof entry !== 'object') return false;
		const context = (entry as WithContextThing)['@context'];
		return isSchemaOrgContext(context);
	});
}

function isSchemaOrgContext(context: unknown): boolean {
	if (!context) return true;
	const isSchemaOrgString = (value: unknown) =>
		typeof value === 'string' &&
		(value === 'https://schema.org' ||
			value === 'https://schema.org/' ||
			value === 'http://schema.org' ||
			value === 'http://schema.org/');
	if (isSchemaOrgString(context)) return true;
	if (Array.isArray(context)) {
		return (context as unknown[]).some((entry) => {
			if (isSchemaOrgString(entry)) return true;
			if (entry && typeof entry === 'object') {
				return isSchemaOrgString((entry as { '@vocab'?: unknown })['@vocab']);
			}
			return false;
		});
	}
	if (context && typeof context === 'object') {
		return isSchemaOrgString((context as { '@vocab'?: unknown })['@vocab']);
	}
	return false;
}

function normalizeType(t: unknown): string[] {
	if (!t) return [];
	if (Array.isArray(t)) return t.map((x) => String(x));
	return [String(t)];
}

function normalizeJsonLdRecipe(r: SchemaRecipe): JsonLdRecipe {
	const recipeIngredients = normalizeRecipeIngredients(r.recipeIngredient);
	const legacyIngredients = normalizeRecipeIngredients(r.ingredients);
	const mergedIngredients = recipeIngredients.length > 0 ? recipeIngredients : legacyIngredients;
	return {
		name: r.name?.toString(),
		recipeYield: r.recipeYield?.toString(),
		recipeIngredients: mergedIngredients,
		recipeInstructions: flattenInstructions(r.recipeInstructions),
	};
}

function normalizeRecipeIngredients(ingredients: IngredientValue): string[] {
	if (!ingredients) return [];
	if (Array.isArray(ingredients)) {
		return ingredients.map(normalizeRecipeIngredientItem).filter((item): item is string => item.length > 0);
	}
	const single = normalizeRecipeIngredientItem(ingredients);
	return single ? [single] : [];
}

function normalizeRecipeIngredientItem(item: IngredientValue): string {
	if (!item) return '';
	if (typeof item === 'string') return cleanText(item);
	if (typeof item !== 'object') return cleanText(String(item));
	return ingredientFromRole(item) || ingredientFromNamedObject(item) || ingredientFromUnknownObject(item);
}

function ingredientFromRole(item: unknown): string {
	if (!item || typeof item !== 'object') return '';
	const record = item as Record<string, unknown>;
	const type = normalizeType(record['@type']);
	if (type.includes('Role') || 'recipeIngredient' in record) {
		const value = record['recipeIngredient'];
		if (typeof value === 'string') return cleanText(value);
		if (Array.isArray(value)) {
			const parts = value.map((entry) => normalizeRecipeIngredientItem(entry as IngredientValue));
			return cleanText(parts.filter((part) => part.length > 0).join(' '));
		}
		if (value && typeof value === 'object') return ingredientFromNamedObject(value);
	}
	return '';
}

function ingredientFromNamedObject(item: unknown): string {
	if (!item || typeof item !== 'object') return '';
	const record = item as Record<string, unknown>;
	const text = record['text'];
	if (typeof text === 'string') return cleanText(text);
	const name = record['name'];
	if (typeof name === 'string') return cleanText(name);
	return '';
}

function ingredientFromUnknownObject(item: unknown): string {
	if (!item || typeof item !== 'object') return '';
	const record = item as Record<string, unknown>;
	const id = record['@id'];
	if (typeof id === 'string') return cleanText(id);
	try {
		return cleanText(JSON.stringify(record));
	} catch (_e) {
		return cleanText(String(item));
	}
}

function flattenInstructions(instructions: RecipeInstructions): string[] {
	const out: string[] = [];
	if (!instructions) return out;
	const push = (s: string) => {
		const t = cleanText(s);
		if (t.length > 0) out.push(t);
	};
	const walk = (node: RecipeInstructions | CreativeWork | ItemList | HowToStep) => {
		if (!node) return;
		if (typeof node === 'string') return push(node);
		if (Array.isArray(node)) return node.forEach(walk);
		const type = normalizeType((node as CreativeWork)['@type']);
		const itemListElement = (node as ItemList).itemListElement;
		if (itemListElement && (type.includes('HowToSection') || type.includes('ItemList') || type.length === 0)) {
			if (Array.isArray(itemListElement)) return itemListElement.forEach(walk);
			return walk(itemListElement as RecipeInstructions | CreativeWork | ItemList | HowToStep);
		}
		const text = (node as HowToStep).text;
		if (typeof text === 'string') return push(text);
		const name = (node as CreativeWork).name;
		if (type.includes('HowToStep')) {
			if (name && itemListElement) {
				const section =
					String(name) +
					': ' +
					(Array.isArray(itemListElement)
						? itemListElement.map((x: ThingWithTextOrName) => x.text || x.name || '').join(' ')
						: String(itemListElement));
				return push(section);
			}
		}
		if (typeof name === 'string') return push(name);
	};
	walk(instructions);
	return out;
}

function cleanText(t: string): string {
	return t
		.replace(/[\u200B\u200C\u200D]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/^[-–•\s]+/, '')
		.trim();
}
