import { useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { suggestionInFlightAtom } from '@/main/atoms';

export function useSuggestionInFlight() {
	const [inFlightSuggestionKeys, setInFlightSuggestionKeys] = useAtom(suggestionInFlightAtom);
	const inFlightSuggestionKeysRef = useRef(new Set<string>());

	const isSuggestionInFlight = useCallback(
		(suggestionKey: string) => {
			return (
				inFlightSuggestionKeysRef.current.has(suggestionKey) || Boolean(inFlightSuggestionKeys[suggestionKey])
			);
		},
		[inFlightSuggestionKeys],
	);

	const setSuggestionInFlight = useCallback(
		(suggestionKey: string, inFlight: boolean) => {
			if (inFlight) {
				inFlightSuggestionKeysRef.current.add(suggestionKey);
			} else {
				inFlightSuggestionKeysRef.current.delete(suggestionKey);
			}

			setInFlightSuggestionKeys((current) => {
				if (inFlight) {
					return { ...current, [suggestionKey]: true };
				}
				if (!current[suggestionKey]) {
					return current;
				}
				const next = { ...current };
				delete next[suggestionKey];
				return next;
			});
		},
		[setInFlightSuggestionKeys],
	);

	return {
		isSuggestionInFlight,
		setSuggestionInFlight,
	};
}
