import { useTranslation } from 'react-i18next';
import type { SuggestionState } from '@/main/model';

export interface SuggestionsComponentProps {
	suggestionKeys: string[] | undefined;
	suggestions: { [key: string]: SuggestionState } | undefined;
	errors?: string[];
	emptySuggestionsFromServer?: boolean;
}

const SuggestionsComponent: React.FC<SuggestionsComponentProps> = (props: SuggestionsComponentProps) => {
	const { t } = useTranslation();

	return (
		<div className="shrink grow basis-auto overflow-y-auto">
			<h2>{t('main.SuggestionsComponent.title')}</h2>
			<div>
				{props.suggestionKeys?.map((suggestionKey) => {
					const suggestion = props.suggestions?.[suggestionKey]?.suggestion;
					return suggestion ? <p key={suggestionKey}>{suggestion.text}</p> : null;
				})}
				{props.errors?.map((error, index) => (
					<p key={`error-${index}`}>{error}</p>
				))}
				{props.emptySuggestionsFromServer ? <p>{t('recipe.emptySuggestionsFromServer')}</p> : null}
			</div>
		</div>
	);
};

export default SuggestionsComponent;
