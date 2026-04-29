import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TbAlertCircle, TbCheck, TbX } from 'react-icons/tb';
import type { Suggestion, SuggestionStatus } from '@/main/model';
import { makeCostString, isOutsideSeasonalityRange } from './suggestionsComponentUtils';

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

	const showSeasonalityWarning = isOutsideSeasonalityRange(suggestion);

	return (
		<div className="rounded-box border-base-300 bg-base-100 border p-4">
			<div className="font-medium">{suggestion.text}</div>
			<div className="text-base-content/70 mt-2 text-sm font-semibold">
				<span>{makeCostString(suggestion.cost)}</span>
				{showSeasonalityWarning ? (
					<>
						<TbAlertCircle />
						<span>{t('recipe.seasonalityWarning')}</span>
					</>
				) : null}
			</div>
			<div className="mt-3 flex gap-2">
				<button
					className={`btn btn-sm ${status === 'ACCEPTED' ? 'btn-success' : 'btn-outline btn-success'}`}
					disabled={disabled}
					onClick={acceptCallback}
				>
					<TbCheck /> {t('main.SuggestionsComponent.accept')}
				</button>
				<button
					className={`btn btn-sm ${status === 'REJECTED' ? 'btn-warning' : 'btn-outline btn-warning'}`}
					disabled={disabled}
					onClick={rejectCallback}
				>
					<TbX /> {t('main.SuggestionsComponent.reject')}
				</button>
			</div>
		</div>
	);
};

export default SuggestionComponent;
