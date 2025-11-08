export interface AppliesToIngredient {
	/** The name of the ingredient this suggestion applies to. */
	ingredient: string;
}

export interface AppliesToRecipe {
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
	recipeInstructions: string[];
	recipeIngredient: string[];
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
	allowRatingToBeDisplayedWithTheRecipe?: boolean;
	recipes?: Recipe[];
	suggestions?: Suggestion[];
	/**
	 * The URL of the page whose data has been parsed to populate the rest of this structure, if
	 * `parsing === false`, or the page being parsed, if `parsing === true`.
	 */
	parsedPageUrl?: string;
}
