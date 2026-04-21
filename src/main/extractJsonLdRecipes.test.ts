// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { extractJsonLdRecipesFromString, type JsonLdRecipe, type SchemaRecipe } from './extractJsonLdRecipes';

function wrapJsonLd(json: unknown, type = 'application/ld+json'): string {
	return `<!doctype html><html><head></head><body><script type="${type}">${JSON.stringify(json)}</script></body></html>`;
}

function isJsonLdRecipe(r: JsonLdRecipe | SchemaRecipe): r is JsonLdRecipe {
	return !!r && 'recipeIngredients' in r;
}

describe('extractJsonLdRecipes', () => {
	it('finds recipe JSON-LD located in the head', () => {
		const json = {
			'@context': 'https://schema.org',
			'@type': 'Recipe',
			name: 'Head Recipe',
			recipeIngredient: ['1 egg'],
			recipeInstructions: ['Cook'],
		};
		const html = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify(json)}</script></head><body><p>Recipe page</p></body></html>`;
		const recipes = extractJsonLdRecipesFromString(html);
		expect(recipes).toHaveLength(1);
		expect(recipes[0]?.name).toBe('Head Recipe');
	});

	it('finds recipe in application/ld+json with parameters and nested mainEntity', () => {
		const json = {
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			mainEntity: {
				'@type': 'Recipe',
				name: 'Nested Recipe',
				recipeIngredient: ['1 egg'],
				recipeInstructions: ['Whisk'],
			},
		};
		const html = wrapJsonLd(json, 'application/ld+json; charset=utf-8');
		const recipes = extractJsonLdRecipesFromString(html);
		expect(recipes).toHaveLength(1);
		expect(recipes[0]?.name).toBe('Nested Recipe');
	});

	it('walks recipeIngredient objects and converts them to strings', () => {
		const json = {
			'@context': 'https://schema.org',
			'@type': 'Recipe',
			name: 'Ingredient Variants',
			recipeIngredient: [
				{ '@type': 'Role', recipeIngredient: '2 eggs' },
				{ '@type': 'HowToSupply', name: '1 cup flour' },
				{ '@id': 'urn:ing:salt' },
			],
			recipeInstructions: ['Mix'],
		};
		const html = wrapJsonLd(json);
		const recipes = extractJsonLdRecipesFromString(html, true);
		expect(recipes).toHaveLength(1);
		expect(isJsonLdRecipe(recipes[0])).toBe(true);
		expect((recipes[0] as JsonLdRecipe)?.recipeIngredients).toEqual(['2 eggs', '1 cup flour', 'urn:ing:salt']);
	});

	it('handles top-level JSON-LD arrays with context objects', () => {
		const json = [
			{ '@context': 'https://schema.org' },
			{
				'@type': 'Recipe',
				name: 'Array Recipe',
				recipeIngredient: ['1 egg'],
				recipeInstructions: ['Cook'],
			},
		];
		const html = wrapJsonLd(json);
		const recipes = extractJsonLdRecipesFromString(html);
		expect(recipes).toHaveLength(1);
		expect(recipes[0]?.name).toBe('Array Recipe');
	});
});
