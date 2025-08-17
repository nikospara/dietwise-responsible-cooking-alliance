import { useCallback, useReducer } from 'react';
import reducer from 'main/reducer';
import {
	createAssessRecipeAction,
	createRecipeAssessedAction,
	createRecipeAssessmentFailedAction,
} from 'main/actions';
import { assessRecipe } from 'main/assessRecipe';
import AssessRecipeComponent from './AssessRecipeComponent';

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
		<div className="flex flex-col">
			<AssessRecipeComponent
				assessing={recipeState.parsing}
				url={recipeState.parsedPageUrl}
				onButtonClicked={assessRecipeCallback}
			/>
			<div>Rating</div>
			<div>Suggestions - Advice</div>
		</div>
	);
};

export default MainPage;
