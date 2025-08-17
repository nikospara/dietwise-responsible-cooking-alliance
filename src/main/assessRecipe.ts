import type { RecipeAssessmentOutcome } from './model';

export async function assessRecipe(): Promise<RecipeAssessmentOutcome> {
	const result = await new Promise<RecipeAssessmentOutcome>((res) =>
		setTimeout(
			() =>
				res({
					status: 'success',
					rating: 3,
					allowRatingToBeDisplayedWithTheRecipe: false,
					suggestions: [
						{
							text: 'Try it with less sugar',
						},
					],
				}),
			3000,
		),
	);
	return result;
}
