import type { RecipeAssessmentMessage, RecipeAssessmentParam } from './model';
import { streamJson } from '@/common/streamJson';

export interface CancellationFunction {
	(): void;
}

export function assessRecipe(
	apiServerHost: string,
	url: string,
	pageContent: string,
	langCode: string,
	accessToken?: string | null,
	onMessage?: (message: RecipeAssessmentMessage) => void,
	onError?: (error: unknown) => void,
	onComplete?: () => void,
): CancellationFunction {
	const handler = streamJson(
		apiServerHost + '/recipe/assess/markdown',
		{
			url,
			pageContent: pageContent || '',
			langCode,
		} as RecipeAssessmentParam,
		{
			onMessage,
			onError,
			onComplete,
			headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
		},
	);
	return () => handler.cancel();
}
