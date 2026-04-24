import type { RecipeAssessmentMessage, RecipeAssessmentParam } from './model';
import { streamJson } from '@/common/streamJson';

export interface CancellationFunction {
	(): void;
}

export function assessRecipe(
	apiServerHost: string,
	url: string,
	pageContent: string,
	jsonLdContent: string | undefined | null,
	lang: string,
	countryOverride?: string | null,
	accessToken?: string | null,
	onMessage?: (message: RecipeAssessmentMessage) => void,
	onError?: (error: unknown) => void,
	onComplete?: () => void,
): CancellationFunction {
	const recipeAssessmentParam: RecipeAssessmentParam = {
		url,
		pageContent: pageContent || '',
		jsonLdContent,
		lang,
	};
	if (countryOverride !== null && typeof countryOverride !== 'undefined') {
		recipeAssessmentParam.countryOverride = countryOverride;
	}

	const handler = streamJson(apiServerHost + '/recipe/assess/markdown', recipeAssessmentParam, {
		onMessage,
		onError,
		onComplete,
		headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
	});
	return () => handler.cancel();
}
