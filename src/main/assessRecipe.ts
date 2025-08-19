import type { RecipeAssessmentOutcome } from './model';

export async function assessRecipe(): Promise<RecipeAssessmentOutcome> {
	const result = await new Promise<RecipeAssessmentOutcome>((res) =>
		setTimeout(
			() =>
				res({
					status: 'success',
					rating: (Math.floor(Math.random() * (10 - 1 + 1)) + 1) / 2,
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
