export interface StreamJsonOptions<T> {
	onMessage?: (message: T) => void;
	onError?: (error: unknown) => void;
	onComplete?: () => void;
	headers?: Record<string, string>;
}

export interface StreamJsonHandler {
	cancel: () => void;
}

export function streamJson<T = unknown>(
	url: string,
	payload?: unknown,
	options: StreamJsonOptions<T> = {},
): StreamJsonHandler {
	const controller = new AbortController();

	(async () => {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				body: payload ? JSON.stringify(payload) : undefined,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP error ${response.status}`);
			}

			if (!response.body) {
				throw new Error('Missing response body');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder('utf-8');
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				let newlineIndex;
				while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
					const line = buffer.slice(0, newlineIndex).trim();
					buffer = buffer.slice(newlineIndex + 1);
					if (!line) continue;
					try {
						options.onMessage?.(JSON.parse(line));
					} catch (e) {
						console.warn('Skipping invalid JSON line:', line, e);
					}
				}
			}

			if (buffer.trim()) {
				try {
					options.onMessage?.(JSON.parse(buffer.trim()));
				} catch (e) {
					console.warn('Skipping trailing invalid JSON:', buffer, e);
				}
			}

			options.onComplete?.();
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				options.onComplete?.();
			} else {
				options.onError?.(err);
			}
		}
	})();

	return {
		cancel: () => controller.abort(),
	};
}
