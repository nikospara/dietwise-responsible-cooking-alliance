import { useTranslation } from 'react-i18next';
import IngredientComponent from './IngredientComponent';
import RatingComponent from './RatingComponent';
import type { IngredientStateType, Recipe, RecipeDetectionType, SuggestionState } from '@/main/model';
import Markdown from 'react-markdown';
import BrainIcon from '@/assets/images/brain.svg?react';
import JsonLdIcon from '@/assets/images/json-ld.svg?react';

export interface RecipesComponentProps {
	recipes: Recipe[];
	detectionTypes?: RecipeDetectionType[];
	rating?: number;
	suggestions?: { [key: string]: SuggestionState };
	ingredientState?: IngredientStateType;
	isSuggestionInFlight: (suggestionKey: string) => boolean;
	onMarkUndecided: (suggestionKey: string, suggestionId: string) => void | Promise<void>;
}

const RecipesComponent: React.FC<RecipesComponentProps> = (props: RecipesComponentProps) => {
	const { t } = useTranslation();
	return (
		<div className="shrink grow basis-auto space-y-4 overflow-y-auto">
			{props.recipes.map((r, index) => {
				const detectionType = props.detectionTypes?.[index];
				return (
					<section key={r.name ?? index} className="rounded-box border-base-300 bg-base-100 border p-4">
						<div className="flex items-start justify-between gap-3">
							<h2 className="mb-2 mt-0">
								{r.name ? r.name : t('recipe.anonymousRecipeTemplateTitle', { index: index + 1 })}
							</h2>
							{detectionType ? (
								detectionType === 'JSONLD' ? (
									<JsonLdIcon
										className="size-[28px] fill-current text-[#CCCCCC]"
										aria-label="JSON-LD"
									/>
								) : (
									<BrainIcon className="size-[28px] fill-current text-[#CCCCCC]" aria-label="AI" />
								)
							) : null}
						</div>
						{props.recipes.length === 1 && typeof props.rating === 'number' ? (
							<RatingComponent rating={10 * props.rating} max={10} />
						) : null}
						{r.recipeIngredients?.length > 0 ? (
							<div className="mt-4">
								<h3>{t('recipe.titleOfIngredients')}</h3>
								<ul className="mt-3 space-y-2">
									{r.recipeIngredients.map((ingredient) => {
										const acceptedSuggestionId = props.ingredientState?.[ingredient.id];
										const acceptedSuggestion = acceptedSuggestionId
											? props.suggestions?.[acceptedSuggestionId]
											: undefined;
										return (
											<IngredientComponent
												key={ingredient.id}
												ingredient={ingredient}
												acceptedSuggestion={acceptedSuggestion}
												acceptedSuggestionDisabled={Boolean(
													acceptedSuggestionId &&
													props.isSuggestionInFlight(acceptedSuggestionId),
												)}
												onMarkUndecided={props.onMarkUndecided}
											/>
										);
									})}
								</ul>
							</div>
						) : (
							<div className="prose prose-sm max-w-none">
								<Markdown>{r.text?.trim() || ''}</Markdown>
							</div>
						)}
					</section>
				);
			})}
		</div>
	);
};

export default RecipesComponent;
