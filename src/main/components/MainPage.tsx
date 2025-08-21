import { useCallback, useReducer } from 'react';
import reducer from 'main/reducer';
import {
	createPrepareToAssessRecipeAction,
	createAssessRecipeAction,
	createRecipeAssessedAction,
	createRecipeAssessmentFailedAction,
} from 'main/actions';
import { readCurrentPageMetadata } from 'main/readCurrentPageMetadata';
import { readPageContent } from 'main/readPageContent';
import { assessRecipe } from 'main/assessRecipe';
import AssessRecipeComponent from './AssessRecipeComponent';
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

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<AssessRecipeComponent
				assessing={recipeState.parsing}
				url={recipeState.parsedPageUrl}
				onButtonClicked={assessRecipeCallback}
			/>
			<RatingComponent rating={recipeState.outcome?.rating} max={5} />
			<SuggestionsComponent
				suggestions={recipeState.outcome?.suggestions}
			/>
		</div>
	);
};

export default MainPage;
