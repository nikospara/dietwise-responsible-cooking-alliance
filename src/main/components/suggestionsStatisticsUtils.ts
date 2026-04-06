import { postSuggestionStatistics } from '@/main/api';
import type { StatisticsAction } from '@/main/api';
import type { SuggestionStatus } from '@/main/model';

const SUGGESTION_STATISTICS_TIMEOUT_MS = 8000;

export function statisticsActionsForSuggestionTransition(
	currentStatus: SuggestionStatus,
	nextStatus: SuggestionStatus,
): StatisticsAction[] {
	const statisticsActions: StatisticsAction[] = [];

	if (currentStatus === 'ACCEPTED' && nextStatus !== 'ACCEPTED') {
		statisticsActions.push('decreaseTimesAccepted');
	}
	if (currentStatus === 'REJECTED' && nextStatus !== 'REJECTED') {
		statisticsActions.push('decreaseTimesRejected');
	}
	if (currentStatus !== 'ACCEPTED' && nextStatus === 'ACCEPTED') {
		statisticsActions.push('increaseTimesAccepted');
	}
	if (currentStatus !== 'REJECTED' && nextStatus === 'REJECTED') {
		statisticsActions.push('increaseTimesRejected');
	}

	return statisticsActions;
}

export async function notifySuggestionStatistics(
	apiServerHost: string,
	accessToken: string | null | undefined,
	suggestionId: string,
	currentStatus: SuggestionStatus,
	nextStatus: SuggestionStatus,
) {
	const statisticsActions = statisticsActionsForSuggestionTransition(currentStatus, nextStatus);
	if (!statisticsActions.length || !accessToken) {
		return;
	}

	for (const statisticsAction of statisticsActions) {
		await postSuggestionStatistics(apiServerHost, accessToken, statisticsAction, { suggestionId });
	}
}

export async function waitForSuggestionStatisticsWithTimeout(
	apiServerHost: string,
	accessToken: string | null | undefined,
	suggestionId: string,
	currentStatus: SuggestionStatus,
	nextStatus: SuggestionStatus,
) {
	await Promise.race([
		notifySuggestionStatistics(apiServerHost, accessToken, suggestionId, currentStatus, nextStatus),
		new Promise<void>((_, reject) => {
			window.setTimeout(
				() => reject(new Error('Suggestion statistics timeout')),
				SUGGESTION_STATISTICS_TIMEOUT_MS,
			);
		}),
	]);
}
