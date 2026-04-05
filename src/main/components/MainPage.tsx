import { useCallback, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { mainStateAtom } from '@/main/atoms';
import {
	createPrepareToAssessRecipeAction,
	createRecipeAssessmentCompletedAction,
	createRecipeAssessmentFailedAction,
	createResetMainPageAction,
	createMessageReceivedAction,
} from '@/main/actions';
import { readCurrentPageMetadata } from '@/main/readCurrentPageMetadata';
import { readPageContent } from '@/main/readPageContent';
import { cleanHtmlMinimal } from '@/main/cleanHtmlForLLM';
import { assessRecipe } from '@/main/assessRecipe';
import type { CancellationFunction } from '@/main/assessRecipe';
import AssessRecipeComponent from './AssessRecipeComponent';
import RecipesComponent from './RecipesComponent';
import MainPageErrorsComponent from './MainPageErrorsComponent';
import MainPageHelpComponent from './MainPageHelpComponent';
import RatingComponent from './RatingComponent';
import SuggestionsComponent from './SuggestionsComponent';
import i18next from 'i18next';
import type { MainData, Recipe } from '@/main/model';
import TurndownService from 'turndown';

function hasRecipes(recipeState: MainData): recipeState is MainData & { recipes: Recipe[] } {
	return typeof recipeState.recipes?.length === 'number' && recipeState.recipes?.length > 0;
}

function hasSuggestions(state: MainData): boolean {
	return Boolean(state.suggestionKeys?.length || state.emptySuggestionsFromServer || (state.errors && state.recipes));
}

export interface MainPageProps {
	toConfigurationPage: () => void;
}

const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
	const [mainState, dispatch] = useAtom(mainStateAtom);

	const cancelRef = useRef<CancellationFunction>(null);

	useEffect(() => {
		return () => {
			// TODO How/when are we going to cancel the call?
			// cancelRef.current?.();
		};
	});

	const assessRecipeCallback = useCallback(async () => {
		try {
			const { tabId, url, title } = await readCurrentPageMetadata();
			void title;
			dispatch(createPrepareToAssessRecipeAction(url || ''));
			const pageContent = await readPageContent(tabId);
			console.log('Size, before cleaning:', pageContent.length);
			const pageCleaningResult = cleanHtmlMinimal(pageContent);
			let cleanPageContent = pageCleaningResult.html;
			console.log('Size after 1st pass:', cleanPageContent.length);
			cleanPageContent = new TurndownService().turndown(cleanPageContent);
			console.log('Size after 3rd pass (Markdown):', cleanPageContent.length);
			console.log(cleanPageContent);
			cancelRef.current = assessRecipe(
				url || '',
				cleanPageContent,
				i18next.language, // TODO This needs improvement
				(message) => {
					dispatch(createMessageReceivedAction(message));
				},
				(error) => {
					cancelRef.current = null;
					dispatch(createRecipeAssessmentFailedAction(error));
				},
				() => {
					cancelRef.current = null;
					dispatch(createRecipeAssessmentCompletedAction());
				},
			);
		} catch (error) {
			dispatch(createRecipeAssessmentFailedAction(error));
		}
	}, [dispatch]);

	const resetCallback = useCallback(() => dispatch(createResetMainPageAction()), [dispatch]);

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<AssessRecipeComponent
				assessing={mainState.status === 'PENDING'}
				hasOutcome={mainState.status !== 'INITIAL' && mainState.status !== 'PENDING'}
				url={mainState.url}
				onAssessButtonClicked={assessRecipeCallback}
				onResetButtonClicked={resetCallback}
				toConfigurationPage={props.toConfigurationPage}
			/>
			{hasRecipes(mainState) ? <RecipesComponent recipes={mainState.recipes} /> : null}
			{mainState.status === 'SUCCESS' && typeof mainState.rating === 'number' ? (
				<>
					<RatingComponent rating={5 * mainState.rating} max={5} />
				</>
			) : null}
			{mainState.status === 'SUCCESS' && hasSuggestions(mainState) ? (
				<>
					<SuggestionsComponent
						suggestionKeys={mainState.suggestionKeys}
						suggestions={mainState.suggestions}
						errors={mainState.errors}
						emptySuggestionsFromServer={mainState.emptySuggestionsFromServer}
					/>
				</>
			) : null}
			{(mainState.status === 'FAILURE' || mainState.status === 'SELECT_RECIPE') && !hasRecipes(mainState) ? (
				<MainPageErrorsComponent errors={mainState.errors || []} />
			) : null}
			{mainState.status === 'INITIAL' ? <MainPageHelpComponent /> : null}
		</div>
	);
};

export default MainPage;
