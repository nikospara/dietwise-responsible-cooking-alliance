import type { MainAction, MainData } from './model';

export default function reducer(state: MainData, action: MainAction): MainData {
	switch (action.type) {
		case 'PrepareToAssessRecipeAction': {
			return {
				...state,
				parsing: true,
				parsedPageUrl: undefined,
			};
		}
		case 'AssessRecipeAction': {
			if (!state.parsing) {
				throw new Error('Inconsistent state for AssessRecipeAction');
			}
			return {
				...state,
				parsedPageUrl: action.url,
			};
		}
		case 'RecipeAssessedAction': {
			return {
				...state,
				parsing: false,
				outcome: action.outcome,
			};
		}
		case 'RecipeAssessmentFailedAction': {
			return {
				...state,
				parsing: false,
			};
		}
		// see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
		default: {
			const exhaustiveCheck: never = action;
			throw new Error(`Unknown action type: ${exhaustiveCheck['type']}`);
		}
	}
}
