import type { SuggestionStatusAction } from '@/main/actions';
import type { MainData, SuggestionState } from '@/main/model';
import { calculateRating } from './calculateRating';

export function acceptedSuggestion(state: MainData, action: SuggestionStatusAction, target: SuggestionState): MainData {
	if (target.suggestion.target.type === 'INGREDIENT') {
		const newSuggestionState: SuggestionState = {
			...target,
			status: 'ACCEPTED',
		};
		const targetIngredientId = target.suggestion.target.ingredient;
		let newSuggestions = state.suggestions;
		const previouslySelectedSuggestionId = state.ingredientState?.[targetIngredientId];
		if (previouslySelectedSuggestionId) {
			const previouslySelectedSuggestion = state.suggestions?.[previouslySelectedSuggestionId];
			if (!previouslySelectedSuggestion) {
				throw new Error(
					`The previous suggestion for ingredient does not exist: i: ${targetIngredientId}, s: ${previouslySelectedSuggestionId}`,
				);
			}
			newSuggestions = {
				...newSuggestions,
				[previouslySelectedSuggestionId]: {
					...previouslySelectedSuggestion,
					status: 'UNDECIDED',
				},
			};
		}
		newSuggestions = {
			...newSuggestions,
			[action.key]: newSuggestionState,
		};
		const newIngredientState = {
			...state.ingredientState,
			[targetIngredientId]: action.key,
		};
		const newState = {
			...state,
			suggestions: newSuggestions,
			ingredientState: newIngredientState,
		};
		newState.rating = calculateRating(newState);
		return newState;
	}
	return state;
}

export function rejectedSuggestion(state: MainData, action: SuggestionStatusAction, target: SuggestionState): MainData {
	if (target.suggestion.target.type === 'INGREDIENT') {
		const newSuggestionState: SuggestionState = {
			...target,
			status: 'REJECTED',
		};
		const targetIngredientId = target.suggestion.target.ingredient;
		const newSuggestions = {
			...state.suggestions,
			[action.key]: newSuggestionState,
		};
		let newIngredientState = state.ingredientState;
		const previouslySelectedSuggestionId = state.ingredientState?.[targetIngredientId];
		if (previouslySelectedSuggestionId === action.key) {
			newIngredientState = {
				...state.ingredientState,
				[targetIngredientId]: undefined,
			};
		}
		const newState = {
			...state,
			suggestions: newSuggestions,
			ingredientState: newIngredientState,
		};
		newState.rating = calculateRating(newState);
		return newState;
	}
	return state;
}

export function undecided(state: MainData, action: SuggestionStatusAction, target: SuggestionState): MainData {
	if (target.suggestion.target.type === 'INGREDIENT') {
		const newSuggestionState: SuggestionState = {
			...target,
			status: 'UNDECIDED',
		};
		const targetIngredientId = target.suggestion.target.ingredient;
		const newSuggestions = {
			...state.suggestions,
			[action.key]: newSuggestionState,
		};
		let newIngredientState = state.ingredientState;
		const previouslySelectedSuggestionId = state.ingredientState?.[targetIngredientId];
		if (previouslySelectedSuggestionId === action.key) {
			newIngredientState = {
				...state.ingredientState,
				[targetIngredientId]: undefined,
			};
		}
		const newState = {
			...state,
			suggestions: newSuggestions,
			ingredientState: newIngredientState,
		};
		newState.rating = calculateRating(newState);
		return newState;
	}
	return state;
}
