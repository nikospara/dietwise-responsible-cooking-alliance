export interface RecipeAssessmentParam {
	/** The URL of the page containing the recipe to assess. */
	url: string;
	/** The page content, HTML stringified and cleaned. */
	pageContent: string;
	/** The language of the page. */
	langCode: string;
}

export interface AppliesToIngredient {
	type: 'INGREDIENT';
	/** The name of the ingredient this suggestion applies to. */
	ingredient: string;
	// TODO must also reference recipe
}

export interface AppliesToRecipe {
	type: 'RECIPE';
	/** The name of the recipe this suggestion applies to. */
	recipe: string;
}

export interface Suggestion {
	text: string;
	appliesTo: AppliesToIngredient | AppliesToRecipe;
}

export interface Recipe {
	name: string;
	recipeYield: string;
	recipeIngredient: string[];
	recipeInstructions: string[]; // TODO Must reference ingedient
	text: string;
}

export interface RecipeExtractionRecipeAssessmentMessage {
	type: 'RECIPES';
	recipes: Recipe[];
}

export interface SuggestionsRecipeAssessmentMessage {
	type: 'SUGGESTIONS';
	suggestions?: Suggestion[];
	rating?: number;
}

export interface RecipeAssessmentErrorMessage {
	type: 'ERROR';
	errors?: string[];
}

export type RecipeAssessmentMessage =
	| RecipeExtractionRecipeAssessmentMessage
	| SuggestionsRecipeAssessmentMessage
	| RecipeAssessmentErrorMessage;

export interface MainData {
	status: 'INITIAL' | 'SUCCESS' | 'FAILURE' | 'PENDING';
	errors?: string[];
	rating?: number;
	recipes?: Recipe[];
	suggestions?: Suggestion[];
	/**
	 * The URL of the recipe page. When the user changes tabs, the content of the extension UI should
	 * indicate that the information applies to a different URL.
	 */
	parsedPageUrl?: string;
}
