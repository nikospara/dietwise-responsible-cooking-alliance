import type {
	AssessRecipeAction,
	RecipeAssessedAction,
	RecipeAssessmentFailedAction,
	RecipeAssessmentOutcome,
} from './model';

export function createAssessRecipeAction(url: string): AssessRecipeAction {
	return {
		type: 'AssessRecipeAction',
		url,
	};
}

export function createRecipeAssessedAction(
	_outcome: RecipeAssessmentOutcome,
): RecipeAssessedAction {
	return {
		type: 'RecipeAssessedAction',
	};
}

export function createRecipeAssessmentFailedAction(
	_e: unknown,
): RecipeAssessmentFailedAction {
	return {
		type: 'RecipeAssessmentFailedAction',
	};
}
