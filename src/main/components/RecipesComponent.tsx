import type { Recipe } from 'main/model';
import Markdown from 'react-markdown';

export interface RecipesComponentProps {
	recipes: Recipe[];
}

const RecipesComponent: React.FC<RecipesComponentProps> = (
	props: RecipesComponentProps,
) => {
	return (
		<>
			{props.recipes.map((r, index) => {
				return (
					<div key={index}>
						<Markdown>{r.text.trim()}</Markdown>
					</div>
				);
			})}
		</>
	);
};

export default RecipesComponent;
