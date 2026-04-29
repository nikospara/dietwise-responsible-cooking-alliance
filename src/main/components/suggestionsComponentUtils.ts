import type { Cost, Suggestion } from '@/main/model';

export function makeCostString(cost?: Cost) {
	switch (cost) {
		case 'HI':
			return '€€€';
		case 'LO':
			return '€';
		default:
			return '€€';
	}
}

export function isOutsideSeasonalityRange(suggestion: Suggestion, currentMonth = new Date().getMonth() + 1): boolean {
	const seasonality = suggestion.seasonality;
	if (!seasonality) {
		return false;
	}

	return !isMonthWithinRange(currentMonth, seasonality.monthFrom, seasonality.monthTo);
}

export function isMonthWithinRange(month: number, monthFrom: number, monthTo: number): boolean {
	if (monthFrom <= monthTo) {
		return month >= monthFrom && month <= monthTo;
	}
	return isMonthWithinRange(month, monthFrom, 12) || isMonthWithinRange(month, 1, monthTo);
}
