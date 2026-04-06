import { TbX } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { keyOfSuggestion } from '@/main/model';
import type { Ingredient, SuggestionState } from '@/main/model';

export interface IngredientComponentProps {
	ingredient: Ingredient;
	acceptedSuggestion: SuggestionState | undefined;
	acceptedSuggestionDisabled?: boolean;
	onMarkUndecided: (suggestionKey: string, suggestionId: string) => void | Promise<void>;
}

const IngredientSuggestion: React.FC<{ acceptedSuggestion: SuggestionState | undefined }> = ({
	acceptedSuggestion,
}) => {
	const { t } = useTranslation();
	const suggestion = acceptedSuggestion?.suggestion;
	return (
		<div className="rounded-box bg-base-200 mt-2 p-3 text-sm">
			<div className="font-semibold">{suggestion?.alternative}</div>
			{suggestion?.equivalence ? (
				<div className="mt-1">
					<span className="font-medium">{t('ingredient.equivalence')}</span> {suggestion.equivalence}
				</div>
			) : null}
			{suggestion?.techniqueNotes ? (
				<div className="mt-1">
					<span className="font-medium">{t('ingredient.techniqueNotes')}</span> {suggestion.techniqueNotes}
				</div>
			) : null}
		</div>
	);
};

const IngredientComponent: React.FC<IngredientComponentProps> = ({
	ingredient,
	acceptedSuggestion,
	acceptedSuggestionDisabled,
	onMarkUndecided,
}) => {
	return (
		<li className="rounded-box border-base-300 bg-base-100 flex items-start justify-between gap-3 border p-3">
			<div className="min-w-0 flex-1">
				<div className={acceptedSuggestion ? 'line-through opacity-60' : ''}>{ingredient.nameInRecipe}</div>
				{acceptedSuggestion ? <IngredientSuggestion acceptedSuggestion={acceptedSuggestion} /> : null}
			</div>
			{acceptedSuggestion ? (
				<button
					className="btn btn-sm btn-outline"
					disabled={acceptedSuggestionDisabled}
					onClick={() =>
						onMarkUndecided(
							keyOfSuggestion(acceptedSuggestion.suggestion),
							acceptedSuggestion.suggestion.id,
						)
					}
				>
					<TbX />
				</button>
			) : null}
		</li>
	);
};

export default IngredientComponent;
