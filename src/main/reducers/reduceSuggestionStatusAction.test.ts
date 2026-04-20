import { describe, expect, it } from 'vitest';
import { createSuggestionStatusAction } from '@/main/actions';
import type { MainData, SuggestionState } from '@/main/model';
import { acceptedSuggestion, rejectedSuggestion, undecided } from './reduceSuggestionStatusAction';

function createIngredientSuggestionState(
	id: string,
	ingredientId: string,
	status: SuggestionState['status'] = 'UNDECIDED',
): SuggestionState {
	return {
		status,
		suggestion: {
			id,
			alternative: `alt-${id}`,
			target: {
				type: 'INGREDIENT',
				ingredient: ingredientId,
			},
			ruleId: `rule-${id}`,
			recommendation: `recommendation-${id}`,
			alternativeComponentNames: [],
			totalSuggestionStats: {
				timesSuggested: 1,
				timesAccepted: 0,
				timesRejected: 0,
			},
			userSuggestionStats: {
				timesSuggested: 1,
				timesAccepted: 0,
				timesRejected: 0,
			},
			text: `text-${id}`,
		},
	};
}

function createRecipeSuggestionState(id: string, status: SuggestionState['status'] = 'UNDECIDED'): SuggestionState {
	return {
		status,
		suggestion: {
			id,
			alternative: `alt-${id}`,
			target: {
				type: 'RECIPE',
				recipeName: 'omelet',
			},
			ruleId: `rule-${id}`,
			recommendation: `recommendation-${id}`,
			alternativeComponentNames: [],
			totalSuggestionStats: {
				timesSuggested: 1,
				timesAccepted: 0,
				timesRejected: 0,
			},
			userSuggestionStats: {
				timesSuggested: 1,
				timesAccepted: 0,
				timesRejected: 0,
			},
			text: `text-${id}`,
		},
	};
}

describe('acceptedSuggestion', () => {
	it('marks ingredient suggestion as accepted and sets ingredient mapping when no previous selection exists', () => {
		const target = createIngredientSuggestionState('s1', 'i1', 'UNDECIDED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				s1: target,
			},
			ingredientState: {},
		};

		const next = acceptedSuggestion(state, createSuggestionStatusAction('s1', 'ACCEPTED'), target);

		expect(next).not.toBe(state);
		expect(next.suggestions?.s1.status).toBe('ACCEPTED');
		expect(next.ingredientState?.i1).toBe('s1');
	});

	it('reverts previously selected suggestion to undecided before accepting the new one for the same ingredient', () => {
		const previous = createIngredientSuggestionState('s-prev', 'i1', 'ACCEPTED');
		const target = createIngredientSuggestionState('s-next', 'i1', 'UNDECIDED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				's-prev': previous,
				's-next': target,
			},
			ingredientState: {
				i1: 's-prev',
			},
		};

		const next = acceptedSuggestion(state, createSuggestionStatusAction('s-next', 'ACCEPTED'), target);

		expect(next.suggestions?.['s-prev'].status).toBe('UNDECIDED');
		expect(next.suggestions?.['s-next'].status).toBe('ACCEPTED');
		expect(next.ingredientState?.i1).toBe('s-next');
	});

	it('throws when ingredient state points to a previous suggestion id that does not exist', () => {
		const target = createIngredientSuggestionState('s-next', 'i1');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				's-next': target,
			},
			ingredientState: {
				i1: 'missing-id',
			},
		};

		expect(() =>
			acceptedSuggestion(state, createSuggestionStatusAction('s-next', 'ACCEPTED'), target),
		).toThrowError('The previous suggestion for ingredient does not exist: i: i1, s: missing-id');
	});

	it('returns the same state for recipe-level suggestions', () => {
		const target = createRecipeSuggestionState('s-recipe', 'UNDECIDED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				's-recipe': target,
			},
			ingredientState: {},
		};

		const next = acceptedSuggestion(state, createSuggestionStatusAction('s-recipe', 'ACCEPTED'), target);

		expect(next).toBe(state);
	});
});

describe('rejectedSuggestion', () => {
	it('marks ingredient suggestion as rejected and keeps ingredient mapping when another suggestion is selected', () => {
		const target = createIngredientSuggestionState('s1', 'i1', 'UNDECIDED');
		const selected = createIngredientSuggestionState('s2', 'i1', 'ACCEPTED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				s1: target,
				s2: selected,
			},
			ingredientState: {
				i1: 's2',
			},
		};

		const next = rejectedSuggestion(state, createSuggestionStatusAction('s1', 'REJECTED'), target);

		expect(next).not.toBe(state);
		expect(next.suggestions?.s1.status).toBe('REJECTED');
		expect(next.ingredientState?.i1).toBe('s2');
	});

	it('clears ingredient mapping when rejecting the currently selected suggestion', () => {
		const target = createIngredientSuggestionState('s1', 'i1', 'ACCEPTED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				s1: target,
			},
			ingredientState: {
				i1: 's1',
			},
		};

		const next = rejectedSuggestion(state, createSuggestionStatusAction('s1', 'REJECTED'), target);

		expect(next.suggestions?.s1.status).toBe('REJECTED');
		expect(next.ingredientState?.i1).toBeUndefined();
	});

	it('returns the same state for recipe-level suggestions', () => {
		const target = createRecipeSuggestionState('s-recipe', 'UNDECIDED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				's-recipe': target,
			},
			ingredientState: {},
		};

		const next = rejectedSuggestion(state, createSuggestionStatusAction('s-recipe', 'REJECTED'), target);

		expect(next).toBe(state);
	});
});

describe('undecided', () => {
	it('marks ingredient suggestion as undecided and keeps ingredient mapping when another suggestion is selected', () => {
		const target = createIngredientSuggestionState('s1', 'i1', 'REJECTED');
		const selected = createIngredientSuggestionState('s2', 'i1', 'ACCEPTED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				s1: target,
				s2: selected,
			},
			ingredientState: {
				i1: 's2',
			},
		};

		const next = undecided(state, createSuggestionStatusAction('s1', 'UNDECIDED'), target);

		expect(next).not.toBe(state);
		expect(next.suggestions?.s1.status).toBe('UNDECIDED');
		expect(next.ingredientState?.i1).toBe('s2');
	});

	it('clears ingredient mapping when setting undecided on the currently selected suggestion', () => {
		const target = createIngredientSuggestionState('s1', 'i1', 'ACCEPTED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				s1: target,
			},
			ingredientState: {
				i1: 's1',
			},
		};

		const next = undecided(state, createSuggestionStatusAction('s1', 'UNDECIDED'), target);

		expect(next.suggestions?.s1.status).toBe('UNDECIDED');
		expect(next.ingredientState?.i1).toBeUndefined();
	});

	it('returns the same state for recipe-level suggestions', () => {
		const target = createRecipeSuggestionState('s-recipe', 'ACCEPTED');
		const state: MainData = {
			status: 'SUCCESS',
			emptySuggestionsFromServer: false,
			lang: 'en',
			suggestions: {
				's-recipe': target,
			},
			ingredientState: {},
		};

		const next = undecided(state, createSuggestionStatusAction('s-recipe', 'UNDECIDED'), target);

		expect(next).toBe(state);
	});
});
