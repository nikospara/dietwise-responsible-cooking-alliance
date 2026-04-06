import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCheck, TbX } from 'react-icons/tb';
import type { Suggestion, SuggestionStatus, SuggestionStats } from '@/main/model';

export interface SuggestionComponentProps {
	suggestion: Suggestion;
	status: SuggestionStatus | undefined;
	disabled?: boolean;
	onAction: (arg: SuggestionStatus) => void | Promise<void>;
}

const SuggestionComponent: React.FC<SuggestionComponentProps> = ({ suggestion, status, disabled, onAction }) => {
	const { t } = useTranslation();
	const acceptCallback = useCallback(() => onAction('ACCEPTED'), [onAction]);
	const rejectCallback = useCallback(() => onAction('REJECTED'), [onAction]);

	return (
		<div className="rounded-box border-base-300 bg-base-100 border p-4">
			<div className="font-medium">{suggestion.text}</div>
			<div className="mt-2 text-sm opacity-75">
				{t('recipe.userStats')} {formatStats(suggestion.userSuggestionStats, status)} {t('recipe.totalStats')}{' '}
				{formatStats(suggestion.totalSuggestionStats, status)}
			</div>
			<div className="mt-3 flex gap-2">
				<button
					className={`btn btn-sm ${status === 'ACCEPTED' ? 'btn-success' : 'btn-outline btn-success'}`}
					disabled={disabled}
					onClick={acceptCallback}
				>
					<TbCheck /> Accept
				</button>
				<button
					className={`btn btn-sm ${status === 'REJECTED' ? 'btn-warning' : 'btn-outline btn-warning'}`}
					disabled={disabled}
					onClick={rejectCallback}
				>
					<TbX /> Reject
				</button>
			</div>
		</div>
	);
};

function formatStats(stats: SuggestionStats, status: SuggestionStatus | undefined) {
	const timesAccepted =
		status === 'ACCEPTED' && stats.timesAccepted + stats.timesRejected < stats.timesSuggested
			? stats.timesAccepted + 1
			: stats.timesAccepted;
	const timesRejected =
		status === 'REJECTED' && stats.timesAccepted + stats.timesRejected < stats.timesSuggested
			? stats.timesRejected + 1
			: stats.timesRejected;
	return `${timesAccepted}/${timesRejected}/${stats.timesSuggested}`;
}

export default SuggestionComponent;
