import type { RecipeAssessmentMessage } from './model';
import { streamJson } from 'common/streamJson';

export interface CancellationFunction {
	(): void;
}

export function assessRecipe(
	url: string,
	pageContent: string,
	langCode: string,
	onMessage?: (message: RecipeAssessmentMessage) => void,
	onError?: (error: unknown) => void,
	onComplete?: () => void,
): CancellationFunction {
	const handler = streamJson(
		// TODO Parameterize this!!!
		'http://localhost:8180/api/v1/recipe/assess/html',
		{
			url,
			pageContent: pageContent || '',
			langCode,
		},
		{
			onMessage,
			onError,
			onComplete,
		},
	);
	return () => handler.cancel();
}
