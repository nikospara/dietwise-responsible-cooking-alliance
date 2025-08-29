import type { RecipeAssessmentOutcome } from './model';
import i18next from 'i18next';

export async function assessRecipe(
	url: string,
	pageContent: string,
): Promise<RecipeAssessmentOutcome> {
	const response = await fetch(
		'http://localhost:8180/api/v1/recipe/assess/html',
		{
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				url,
				pageContent: pageContent || '',
				langCode: i18next.language,
			}),
		},
	);
	// TODO fetch will throw for network errors, maybe we should catch that
	if (response.ok) {
		const result = await response.json();
		return result as RecipeAssessmentOutcome;
	} else {
		throw new Error(
			`The assessment service call resulted in HTTP: ${response.status}`,
		);
	}
}
