import type { Recipe } from '@/main/model';
import Markdown from 'react-markdown';

export interface RecipesComponentProps {
	recipes: Recipe[];
}

const RecipesComponent: React.FC<RecipesComponentProps> = (props: RecipesComponentProps) => {
	return (
		<div className="shrink grow-0 basis-auto overflow-y-auto">
			{props.recipes.map((r, index) => {
				return (
					<div key={index}>
						<Markdown>{r.text.trim()}</Markdown>
					</div>
				);
			})}
		</div>
	);
};

export default RecipesComponent;
