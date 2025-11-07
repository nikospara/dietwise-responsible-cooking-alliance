import { useEffect, useRef, useState } from 'react';

export interface UseStreamJsonCallbackOptions<P> extends RequestInit {
	/** Called when a full JSON object (line) is received */
	onMessage?: (data: P) => void;
	/** Called once on error (other than abort) */
	onError?: (error: Error) => void;
	/** Called once when the stream completes */
	onComplete?: () => void;
}

/**
 * useStreamJsonCallback:
 * A lightweight streaming hook that POSTs to a URL and calls `onMessage`
 * for each complete JSON line received.
 */
export function useStreamJsonCallback<P>(
	url: string,
	payload?: P,
	options?: UseStreamJsonCallbackOptions<P>,
) {
	const controllerRef = useRef<AbortController>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	// const onMessageRef = useRef(options?.onMessage);
	// const onErrorRef = useRef(options?.onError);
	// const onCompleteRef = useRef(options?.onComplete);

	// useEffect(() => {
	// 	onMessageRef.current = options?.onMessage;
	// 	onErrorRef.current = options?.onError;
	// 	onCompleteRef.current = options?.onComplete;
	// }, [options?.onMessage, options?.onError, options?.onComplete]);

	useEffect(() => {
		const controller = new AbortController();
		controllerRef.current = controller;

		let isActive = true; // prevent setState after unmount
		setIsLoading(true);
		setError(null);

		(async () => {
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
				const decoder = new TextDecoder('utf-8');
				let buffer = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });

					let lineBreak;
					while ((lineBreak = buffer.indexOf('\n')) >= 0) {
						const line = buffer.slice(0, lineBreak).trim();
						buffer = buffer.slice(lineBreak + 1);
						if (!line) continue;
						try {
							const json = JSON.parse(line);
							if (isActive && options?.onMessage) {
								options.onMessage(json);
							}
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
						} catch (err) {
							console.warn('Skipping invalid JSON line:', line);
						}
					}
				}

				if (isActive && options?.onComplete) {
					options.onComplete();
				}
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					// normal cancel
					return;
				}
				const e = err instanceof Error ? err : new Error(String(err));
				setError(e);
				if (isActive && options?.onError) {
					options.onError(e);
				}
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		})();

		return () => {
			isActive = false;
			controller.abort();
		};
	}, [url, options, payload]);

	const cancel = () => controllerRef.current?.abort();

	return { cancel, isLoading, error };
}
