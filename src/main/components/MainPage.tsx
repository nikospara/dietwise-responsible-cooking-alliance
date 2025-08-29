import { useCallback, useReducer } from 'react';
import reducer from 'main/reducer';
import {
	createPrepareToAssessRecipeAction,
	createAssessRecipeAction,
	createRecipeAssessedAction,
	createRecipeAssessmentFailedAction,
	createResetMainPageAction,
} from 'main/actions';
import { readCurrentPageMetadata } from 'main/readCurrentPageMetadata';
import { readPageContent } from 'main/readPageContent';
import { assessRecipe } from 'main/assessRecipe';
import AssessRecipeComponent from './AssessRecipeComponent';
import MainPageErrorsComponent from './MainPageErrorsComponent';
import MainPageHelpComponent from './MainPageHelpComponent';
import RatingComponent from './RatingComponent';
import SuggestionsComponent from './SuggestionsComponent';

const MainPage: React.FC = () => {
	const [recipeState, dispatch] = useReducer(reducer, {
		parsing: false,
	});

	const assessRecipeCallback = useCallback(async () => {
		dispatch(createPrepareToAssessRecipeAction());
		try {
			const currentPageMetadata = await readCurrentPageMetadata();
			dispatch(
				createAssessRecipeAction(
					currentPageMetadata.url || '',
					currentPageMetadata.title,
				),
			);
			const pageContent = await readPageContent(
				currentPageMetadata.tabId,
			);
			const assessment = await assessRecipe(
				currentPageMetadata.url || '',
				pageContent,
			);
			dispatch(createRecipeAssessedAction(assessment));
		} catch (e) {
			if (e instanceof Error) {
				dispatch(createRecipeAssessmentFailedAction(e));
			} else {
				dispatch(
					createRecipeAssessmentFailedAction(new Error(e as string)),
				);
			}
		}
	}, [dispatch]);

	const resetCallback = useCallback(
		() => dispatch(createResetMainPageAction()),
		[dispatch],
	);

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<AssessRecipeComponent
				assessing={recipeState.parsing}
				hasOutcome={!!recipeState.outcome}
				url={recipeState.parsedPageUrl}
				onAssessButtonClicked={assessRecipeCallback}
				onResetButtonClicked={resetCallback}
			/>
			{recipeState.outcome ? (
				recipeState.outcome.status === 'SUCCESS' ? (
					<>
						<RatingComponent
							rating={recipeState.outcome?.rating}
							max={5}
						/>
						<SuggestionsComponent
							suggestions={recipeState.outcome?.suggestions}
						/>
					</>
				) : (
					<MainPageErrorsComponent
						errors={recipeState.outcome?.errors || []}
					/>
				)
			) : (
				<MainPageHelpComponent />
			)}
		</div>
	);
};

export default MainPage;
