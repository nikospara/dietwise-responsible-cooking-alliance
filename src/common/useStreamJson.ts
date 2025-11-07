import { useEffect, useRef, useState, useCallback } from 'react';

export interface StreamState<T> {
	data: T[];
	error?: Error;
	isLoading: boolean;
	/** Call this to cancel the in-flight stream manually. */
	cancel: () => void;
}

/**
 * React hook for consuming newline-delimited JSON (NDJSON) responses
 * from a POST request, supporting manual cancellation.
 */
export function useStreamJson<P, R>(
	url: string,
	payload?: P,
	options?: RequestInit,
): StreamState<R> {
	const [data, setData] = useState<R[]>([]);
	const [error, setError] = useState<Error>();
	const [isLoading, setIsLoading] = useState(false);

	const controllerRef = useRef<AbortController | null>(null);

	// Manual cancel function, stable across renders
	const cancel = useCallback(() => {
		if (controllerRef.current) {
			controllerRef.current.abort();
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		controllerRef.current = controller;
		setIsLoading(true);
		setError(undefined);
		setData([]);

		async function fetchStream() {
			try {
				const response = await fetch(url, {
					...options,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(options?.headers ?? {}),
					},
					body: payload ? JSON.stringify(payload) : undefined,
					signal: controller.signal,
				});

				if (!response.ok || !response.body) {
					throw new Error(`HTTP error ${response.status}`);
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = '';

				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });

					let boundary: number;
					while ((boundary = buffer.indexOf('\n')) !== -1) {
						const line = buffer.slice(0, boundary).trim();
						buffer = buffer.slice(boundary + 1);
						if (!line) continue;

						try {
							const obj = JSON.parse(line) as R;
							setData((prev) => [...prev, obj]);
						} catch (err) {
							console.error('Invalid JSON chunk:', line, err);
						}
					}
				}

				if (buffer.trim().length > 0) {
					try {
						const obj = JSON.parse(buffer.trim()) as R;
						setData((prev) => [...prev, obj]);
					} catch (err) {
						console.error('Invalid final JSON:', buffer, err);
					}
				}
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					// Request was aborted (either manual cancel or unmount)
					return;
				}
				if (err instanceof Error) {
					setError(err);
				} else {
					// Handle unknown values (e.g., non-Error throws)
					setError(new Error(String(err)));
				}
			} finally {
				setIsLoading(false);
			}
		}

		fetchStream();

		// Cleanup if component unmounts or dependencies change
		return () => {
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url, JSON.stringify(payload), JSON.stringify(options?.headers)]);

	return { data, error, isLoading, cancel };
}
