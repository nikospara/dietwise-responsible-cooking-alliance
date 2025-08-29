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
			dispatch(createRecipeAssessmentFailedAction(e));
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
				<MainPageHelpComponent />
			)}
		</div>
	);
};

export default MainPage;
