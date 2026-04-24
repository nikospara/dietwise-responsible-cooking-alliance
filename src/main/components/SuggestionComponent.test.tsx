import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Suggestion } from '@/main/model';
import SuggestionComponent from './SuggestionComponent';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const makeSuggestion = (cost?: Suggestion['cost']): Suggestion => ({
	id: 's-1',
	target: { type: 'RECIPE', recipeName: 'Soup' },
	ruleId: 'rule-1',
	recommendation: 'Use seasonal vegetables',
	alternative: 'Seasonal vegetables',
	cost,
	alternativeComponentNames: [],
	totalSuggestionStats: {
		timesSuggested: 10,
		timesAccepted: 4,
		timesRejected: 1,
	},
	userSuggestionStats: {
		timesSuggested: 3,
		timesAccepted: 1,
		timesRejected: 0,
	},
	text: 'Use seasonal vegetables instead.',
});

describe('SuggestionComponent', () => {
	it.each([
		['LO', '€'],
		['MED', '€€'],
		['HI', '€€€'],
		[undefined, '€€'],
	] as const)('displays the expected cost indicator for %s', (cost, expectedCost) => {
		render(<SuggestionComponent suggestion={makeSuggestion(cost)} status="UNDECIDED" onAction={vi.fn()} />);

		expect(screen.getByText(expectedCost)).toBeTruthy();
	});
});
