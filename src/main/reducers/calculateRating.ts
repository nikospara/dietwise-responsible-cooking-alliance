import type { MainData } from '@/main/model';

type PresenceMap = { [key: string]: boolean };

export function calculateRating(state: MainData): number | undefined {
	if (!state.scoringData) return undefined;
	const presenceMap: PresenceMap = Object.keys(state.scoringData.recommendationWeights).reduce(
		(aggr, cur) => ({ ...aggr, [cur]: false }),
		{},
	);
	for (const ingredientId in state.scoringData.recommendationsPerIngredient) {
		let recommendations = state.scoringData.recommendationsPerIngredient[ingredientId];
		if (state.ingredientState?.[ingredientId]) {
			const suggestionKey = state.ingredientState[ingredientId];
			const acceptedSuggestion = suggestionKey ? state.suggestions?.[suggestionKey] : undefined;
			const maybeRecommendations = acceptedSuggestion?.suggestion.alternativeComponentNames;
			if (maybeRecommendations) recommendations = maybeRecommendations;
		}
		for (let i = 0; i < recommendations.length; i++) {
			presenceMap[recommendations[i]] = true;
		}
	}
	let score = 0;
	for (const recommendationComponentName in state.scoringData.recommendationWeights) {
		const weight = state.scoringData.recommendationWeights[recommendationComponentName];
		const present = presenceMap[recommendationComponentName];
		if (weight === 'LIMITED' && !present) score += 1;
		else if (weight === 'ENCOURAGED' && present) score += 1;
	}
	return score / state.scoringData.totalNumberOfRecomendations;
}
