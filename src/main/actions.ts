import type {
	PrepareToAssessRecipeAction,
	AssessRecipeAction,
	RecipeAssessedAction,
	RecipeAssessmentFailedAction,
	RecipeAssessmentOutcome,
	ResetMainPageAction,
} from './model';

export function createPrepareToAssessRecipeAction(): PrepareToAssessRecipeAction {
	return {
		type: 'PrepareToAssessRecipeAction',
	};
}

export function createAssessRecipeAction(
	url: string,
	title: string | undefined,
): AssessRecipeAction {
	return {
		type: 'AssessRecipeAction',
		url,
		title,
	};
}

export function createRecipeAssessedAction(
	outcome: RecipeAssessmentOutcome,
): RecipeAssessedAction {
	return {
		type: 'RecipeAssessedAction',
		outcome,
	};
}

export function createRecipeAssessmentFailedAction(
	_e: unknown,
): RecipeAssessmentFailedAction {
	return {
		type: 'RecipeAssessmentFailedAction',
	};
}

export function createResetMainPageAction(): ResetMainPageAction {
	return {
		type: 'ResetMainPageAction',
	};
}
