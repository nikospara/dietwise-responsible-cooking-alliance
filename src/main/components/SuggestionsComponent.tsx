import { useTranslation } from 'react-i18next';
import type { Suggestion } from 'main/model';

export interface SuggestionsComponentProps {
	suggestions: Suggestion[] | undefined;
}

const SuggestionsComponent: React.FC<SuggestionsComponentProps> = (
	props: SuggestionsComponentProps,
) => {
	const { t } = useTranslation();

	return (
		<div className="shrink grow basis-auto overflow-y-auto">
			<h2>{t('main.SuggestionsComponent.title')}</h2>
			<div>
				{props.suggestions
					? props.suggestions.map((suggestion, index) => (
							<p key={index}>{suggestion.text}</p>
						))
					: null}
			</div>
		</div>
	);
};

export default SuggestionsComponent;
