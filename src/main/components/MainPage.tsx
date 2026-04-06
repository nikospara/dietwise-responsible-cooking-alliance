import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ensureValidTokenAtom } from '@/auth/atoms';
import { apiServerHostAtom } from '@/configuration/atoms';
import { mainStateAtom } from '@/main/atoms';
import {
	createPrepareToAssessRecipeAction,
	createRecipeAssessmentCompletedAction,
	createRecipeAssessmentFailedAction,
	createResetMainPageAction,
	createMessageReceivedAction,
	createSuggestionStatusAction,
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
import SplitPane from './SplitPane';
import SuggestionsComponent from './SuggestionsComponent';
import { waitForSuggestionStatisticsWithTimeout } from './suggestionsStatisticsUtils';
import { useSuggestionInFlight } from './useSuggestionInFlight';
import i18next from 'i18next';
import type { MainData, Recipe, SuggestionStatus } from '@/main/model';
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
	const apiServerHost = useAtomValue(apiServerHostAtom);
	const ensureValidToken = useSetAtom(ensureValidTokenAtom);
	const { isSuggestionInFlight, setSuggestionInFlight } = useSuggestionInFlight();

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
			const accessToken = await ensureValidToken();
			cancelRef.current = assessRecipe(
				apiServerHost,
				url || '',
				cleanPageContent,
				i18next.language, // TODO This needs improvement
				accessToken,
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
	}, [apiServerHost, dispatch, ensureValidToken]);

	const resetCallback = useCallback(() => {
		dispatch(createResetMainPageAction());
	}, [dispatch]);

	const onMarkUndecided = useCallback(
		async (suggestionKey: string, suggestionId: string) => {
			if (isSuggestionInFlight(suggestionKey)) {
				return;
			}
			dispatch(createSuggestionStatusAction(suggestionKey, 'UNDECIDED'));
			setSuggestionInFlight(suggestionKey, true);
			try {
				const accessToken = await ensureValidToken();
				await waitForSuggestionStatisticsWithTimeout(
					apiServerHost,
					accessToken,
					suggestionId,
					'ACCEPTED',
					'UNDECIDED',
				);
			} catch (error) {
				console.error('Unable to notify suggestion statistics', error);
			} finally {
				setSuggestionInFlight(suggestionKey, false);
			}
		},
		[apiServerHost, dispatch, ensureValidToken, isSuggestionInFlight, setSuggestionInFlight],
	);

	const onSuggestionAction = useCallback(
		async (suggestionKey: string, action: SuggestionStatus) => {
			const suggestionState = mainState.suggestions?.[suggestionKey];
			if (!suggestionState || isSuggestionInFlight(suggestionKey)) {
				return;
			}

			const currentStatus = suggestionState.status;
			const nextStatus = currentStatus === action ? 'UNDECIDED' : action;
			const previousAcceptedSuggestionKey =
				nextStatus === 'ACCEPTED' && suggestionState.suggestion.target.type === 'INGREDIENT'
					? mainState.ingredientState?.[suggestionState.suggestion.target.ingredient]
					: undefined;
			const previousAcceptedSuggestion =
				previousAcceptedSuggestionKey && previousAcceptedSuggestionKey !== suggestionKey
					? mainState.suggestions?.[previousAcceptedSuggestionKey]
					: undefined;
			const lockedSuggestionKeys = previousAcceptedSuggestionKey
				? [suggestionKey, previousAcceptedSuggestionKey]
				: [suggestionKey];

			dispatch(createSuggestionStatusAction(suggestionKey, nextStatus));
			for (const lockedSuggestionKey of lockedSuggestionKeys) {
				setSuggestionInFlight(lockedSuggestionKey, true);
			}
			try {
				const accessToken = await ensureValidToken();
				if (previousAcceptedSuggestion) {
					await waitForSuggestionStatisticsWithTimeout(
						apiServerHost,
						accessToken,
						previousAcceptedSuggestion.suggestion.id,
						'ACCEPTED',
						'UNDECIDED',
					);
				}
				await waitForSuggestionStatisticsWithTimeout(
					apiServerHost,
					accessToken,
					suggestionState.suggestion.id,
					currentStatus,
					nextStatus,
				);
			} catch (error) {
				console.error('Unable to notify suggestion statistics', error);
			} finally {
				for (const lockedSuggestionKey of lockedSuggestionKeys) {
					setSuggestionInFlight(lockedSuggestionKey, false);
				}
			}
		},
		[
			apiServerHost,
			dispatch,
			ensureValidToken,
			isSuggestionInFlight,
			mainState.ingredientState,
			mainState.suggestions,
			setSuggestionInFlight,
		],
	);

	const topPaneContent = hasRecipes(mainState) ? (
		<RecipesComponent
			recipes={mainState.recipes}
			detectionTypes={mainState.detectionTypes}
			rating={mainState.rating}
			suggestions={mainState.suggestions}
			ingredientState={mainState.ingredientState}
			isSuggestionInFlight={isSuggestionInFlight}
			onMarkUndecided={onMarkUndecided}
		/>
	) : null;

	const bottomPaneContent =
		mainState.status === 'SUCCESS' && hasSuggestions(mainState) ? (
			<SuggestionsComponent
				suggestionKeys={mainState.suggestionKeys}
				suggestions={mainState.suggestions}
				errors={mainState.errors}
				emptySuggestionsFromServer={mainState.emptySuggestionsFromServer}
				isSuggestionInFlight={isSuggestionInFlight}
				onAction={onSuggestionAction}
			/>
		) : null;

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
			<SplitPane top={topPaneContent} bottom={bottomPaneContent} className="min-h-0 flex-1" />
			{(mainState.status === 'FAILURE' || mainState.status === 'SELECT_RECIPE') && !hasRecipes(mainState) ? (
				<MainPageErrorsComponent errors={mainState.errors || []} />
			) : null}
			{mainState.status === 'INITIAL' ? <MainPageHelpComponent /> : null}
		</div>
	);
};

export default MainPage;
