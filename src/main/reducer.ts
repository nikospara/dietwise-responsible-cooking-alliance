import type { MainAction, MainData } from './model';

export default function reducer(state: MainData, action: MainAction): MainData {
	switch (action.type) {
		case 'AssessRecipeAction': {
			return {
				...state,
				parsing: true,
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
