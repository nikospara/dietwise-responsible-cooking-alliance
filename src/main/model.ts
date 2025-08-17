import type { Action } from 'model';

export interface Suggestion {
	text: string;
}

export interface RecipeAssessmentOutcome {
	status: 'success' | 'failure';
	errors?: string[];
	rating?: number;
	allowRatingToBeDisplayedWithTheRecipe?: boolean;
	suggestions?: Suggestion[];
}

export interface MainData {
	/**
	 * True if it has sent the contents of a page to the recipe parser.
	 *
	 * If true, the `parsedPageUrl` contains the URL of the page currently sent to the parser, not
	 * the previous parsed one (if any).
	 */
	parsing: boolean;
	/**
	 * The URL of the page whose data has been parsed to populate the rest of this structure, if
	 * `parsing === false`, or the page being parsed, if `parsing === true`.
	 */
	parsedPageUrl?: string;

	outcome?: RecipeAssessmentOutcome;
}

export interface AssessRecipeAction extends Action {
	type: 'AssessRecipeAction';
	url: string;
}

export interface RecipeAssessedAction extends Action {
	type: 'RecipeAssessedAction';
}

export interface RecipeAssessmentFailedAction extends Action {
	type: 'RecipeAssessmentFailedAction';
}

export type MainAction =
	| AssessRecipeAction
	| RecipeAssessedAction
	| RecipeAssessmentFailedAction;
