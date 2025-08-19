import { useCallback, useReducer } from 'react';
import reducer from 'main/reducer';
import {
	createAssessRecipeAction,
	createRecipeAssessedAction,
	createRecipeAssessmentFailedAction,
} from 'main/actions';
import { assessRecipe } from 'main/assessRecipe';
import AssessRecipeComponent from './AssessRecipeComponent';
import RatingComponent from './RatingComponent';
import SuggestionsComponent from './SuggestionsComponent';

const MainPage: React.FC = () => {
	const [recipeState, dispatch] = useReducer(reducer, {
		parsing: false,
	});

	const assessRecipeCallback = useCallback(async () => {
		dispatch(createAssessRecipeAction('dummy url but quite long so that I can see what happens to long lines and if the component displays ellipses as desired'));
		try {
			const assessment = await assessRecipe();
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
