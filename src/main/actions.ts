import type {
	RecipeAssessmentErrorMessage,
	RecipeAssessmentMessage,
	RecipeExtractionRecipeAssessmentMessage,
	SuggestionsRecipeAssessmentMessage,
} from './model';
import type { Action } from 'model';

export interface PrepareToAssessRecipeAction extends Action {
	type: 'PrepareToAssessRecipeAction';
}

export interface AssessRecipeAction extends Action {
	type: 'AssessRecipeAction';
	url?: string;
	title?: string;
}

export interface RecipeAssessmentFailedAction extends Action {
	type: 'RecipeAssessmentFailedAction';
	error: Error;
}

export interface RecipeAssessmentCompletedAction extends Action {
	type: 'RecipeAssessmentCompletedAction';
}

export interface ResetMainPageAction extends Action {
	type: 'ResetMainPageAction';
}

export interface RecipeExtractionMessageReceivedAction extends Action {
	type: 'RecipeExtractionMessageReceivedAction';
	message: RecipeExtractionRecipeAssessmentMessage;
}

export interface SuggestionsMessageReceivedAction extends Action {
	type: 'SuggestionsMessageReceivedAction';
	message: SuggestionsRecipeAssessmentMessage;
}

export interface RecipeAssessmentErrorMessageReceivedAction extends Action {
	type: 'RecipeAssessmentErrorMessageReceivedAction';
	message: RecipeAssessmentErrorMessage;
}

export type MessageReceivedAction =
	| RecipeExtractionMessageReceivedAction
	| SuggestionsMessageReceivedAction
	| RecipeAssessmentErrorMessageReceivedAction;

export type MainAction =
	| PrepareToAssessRecipeAction
	| AssessRecipeAction
	| RecipeAssessmentFailedAction
	| RecipeAssessmentCompletedAction
	| ResetMainPageAction
	| RecipeExtractionMessageReceivedAction
	| SuggestionsMessageReceivedAction
	| RecipeAssessmentErrorMessageReceivedAction;

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

export function createRecipeAssessmentFailedAction(
	e: unknown,
): RecipeAssessmentFailedAction {
	let error: Error;
	if (e instanceof Error) {
		error = e;
	} else {
		error = new Error(e as string);
	}
	return {
		type: 'RecipeAssessmentFailedAction',
		error,
	};
}

export function createRecipeAssessmentCompletedAction(): RecipeAssessmentCompletedAction {
	return {
		type: 'RecipeAssessmentCompletedAction',
	};
}

export function createResetMainPageAction(): ResetMainPageAction {
	return {
		type: 'ResetMainPageAction',
	};
}

export function createMessageReceivedAction(
	message: RecipeAssessmentMessage,
): MessageReceivedAction {
	switch (message.type) {
		case 'RECIPES':
			return {
				type: 'RecipeExtractionMessageReceivedAction',
				message,
			};
		case 'SUGGESTIONS':
			return {
				type: 'SuggestionsMessageReceivedAction',
				message,
			};
		case 'ERROR':
			return {
				type: 'RecipeAssessmentErrorMessageReceivedAction',
				message,
			};
	}
}
