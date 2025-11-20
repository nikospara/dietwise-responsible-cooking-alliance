import { useCallback, useEffect, useReducer, useRef } from 'react';
import { createInitialState, reducer } from 'main/reducer';
import {
	createPrepareToAssessRecipeAction,
	createAssessRecipeAction,
	createRecipeAssessmentCompletedAction,
	createRecipeAssessmentFailedAction,
	createResetMainPageAction,
	createMessageReceivedAction,
} from 'main/actions';
import { readCurrentPageMetadata } from 'main/readCurrentPageMetadata';
import { readPageContent } from 'main/readPageContent';
import { cleanHtmlMinimal } from 'main/cleanHtmlForLLM';
import { assessRecipe } from 'main/assessRecipe';
import type { CancellationFunction } from 'main/assessRecipe';
import AssessRecipeComponent from './AssessRecipeComponent';
import RecipesComponent from './RecipesComponent';
import MainPageErrorsComponent from './MainPageErrorsComponent';
import MainPageHelpComponent from './MainPageHelpComponent';
import RatingComponent from './RatingComponent';
import SuggestionsComponent from './SuggestionsComponent';
import i18next from 'i18next';
import type { MainData, Recipe } from 'main/model';
import TurndownService from 'turndown';

function hasRecipes(
	recipeState: MainData,
): recipeState is MainData & { recipes: Recipe[] } {
	return (
		typeof recipeState.recipes?.length === 'number' &&
		recipeState.recipes?.length > 0
	);
}

export interface MainPageProps {
	toConfigurationPage: () => void;
}

const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
	const [recipeState, dispatch] = useReducer(
		reducer,
		null,
		createInitialState,
	);

	const cancelRef = useRef<CancellationFunction>(null);

	useEffect(() => {
		return () => {
			// TODO How/when are we going to cancel the call?
			// cancelRef.current?.();
		};
	});

	const assessRecipeCallback = useCallback(async () => {
		dispatch(createPrepareToAssessRecipeAction());
		try {
			const { tabId, url, title } = await readCurrentPageMetadata();
			dispatch(createAssessRecipeAction(url || '', title));
			const pageContent = await readPageContent(tabId);
			const pageCleaningResult = cleanHtmlMinimal(pageContent);
			let cleanPageContent = pageCleaningResult.html;
			console.log('Size after 1st pass:', cleanPageContent.length);
			cleanPageContent = cleanHtmlMinimal(cleanPageContent).html; // Hack!
			console.log('Size after 2nd pass:', cleanPageContent.length);
			cleanPageContent = new TurndownService().turndown(cleanPageContent);
			console.log('Size after 3rd pass (Markdown):', cleanPageContent.length);
			console.log(cleanPageContent);
			cancelRef.current = assessRecipe(
				url || '',
				cleanPageContent,
				i18next.language,
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

	const resetCallback = useCallback(
		() => dispatch(createResetMainPageAction()),
		[dispatch],
	);

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<AssessRecipeComponent
				assessing={recipeState.status === 'PENDING'}
				hasOutcome={
					recipeState.status === 'SUCCESS' ||
					recipeState.status === 'FAILURE'
				}
				url={recipeState.parsedPageUrl}
				onAssessButtonClicked={assessRecipeCallback}
				onResetButtonClicked={resetCallback}
				toConfigurationPage={props.toConfigurationPage}
			/>
			{hasRecipes(recipeState) ? (
				<RecipesComponent recipes={recipeState.recipes} />
			) : null}
			{recipeState.status === 'SUCCESS' ? (
				<>
					<RatingComponent rating={recipeState.rating} max={5} />
					<SuggestionsComponent
						suggestions={recipeState.suggestions}
					/>
				</>
			) : null}
			{recipeState.status === 'FAILURE' ? (
				<MainPageErrorsComponent errors={recipeState.errors || []} />
			) : null}
			{recipeState.status === 'INITIAL' ? (
				<MainPageHelpComponent />
			) : null}
		</div>
	);
};

export default MainPage;
