import type { Recipe } from 'main/model';

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
						{r.text}
					</div>
				);
			})}
		</>
	);
};

export default RecipesComponent;
