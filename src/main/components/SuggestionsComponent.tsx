import { useTranslation } from 'react-i18next';
import SuggestionComponent from './SuggestionComponent';
import type { SuggestionState, SuggestionStatus } from '@/main/model';

export interface SuggestionsComponentProps {
	suggestionKeys: string[] | undefined;
	suggestions: { [key: string]: SuggestionState } | undefined;
	errors?: string[];
	emptySuggestionsFromServer?: boolean;
	isSuggestionInFlight: (suggestionKey: string) => boolean;
	onAction: (suggestionKey: string, action: SuggestionStatus) => void | Promise<void>;
}

const SuggestionsComponent: React.FC<SuggestionsComponentProps> = (props: SuggestionsComponentProps) => {
	const { t } = useTranslation();

	return (
		<div className="shrink grow basis-auto overflow-y-auto">
			<h2>{t('main.SuggestionsComponent.title')}</h2>
			<div className="space-y-3">
				{props.suggestionKeys?.map((suggestionKey) => {
					const suggestionState = props.suggestions?.[suggestionKey];
					if (!suggestionState) return null;
					return (
						<SuggestionComponent
							key={suggestionKey}
							suggestion={suggestionState.suggestion}
							status={suggestionState.status}
							disabled={props.isSuggestionInFlight(suggestionKey)}
							onAction={(action) => props.onAction(suggestionKey, action)}
						/>
					);
				})}
				{props.errors?.map((error, index) => (
					<div key={`error-${index}`} className="alert alert-error">
						<span>{error}</span>
					</div>
				))}
				{props.emptySuggestionsFromServer ? <p>{t('recipe.emptySuggestionsFromServer')}</p> : null}
			</div>
		</div>
	);
};

export default SuggestionsComponent;
