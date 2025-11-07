import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStreamJson } from './useStreamJson';

// --- helpers ---------------------------------------------------------------

/**
 * Utility to create a mock ReadableStream that emits chunks sequentially
 * to simulate a chunked HTTP response.
 */
function createMockStream(
	chunks: string[],
	delay = 0,
): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			(async () => {
				for (const chunk of chunks) {
					controller.enqueue(new TextEncoder().encode(chunk));
					if (delay > 0) {
						await new Promise((r) => setTimeout(r, delay));
					}
				}
				controller.close();
			})();
		},
	});
}

// --- tests ----------------------------------------------------------------

describe('useStreamJson', () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		vi.restoreAllMocks();
		global.fetch = originalFetch;
	});

	it('handles multiple JSON lines streamed over time', async () => {
		// Mock chunks (like a real NDJSON response)
		const chunks = [
			'{"key":"key1","value":"value1"}\n',
			'{"key":"key2","value":"value2"}\n{"key":"key3","value":"value3"}\n',
		];

		// Mock fetch to return a Response with our fake stream
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(createMockStream(chunks), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		global.fetch = mockFetch;

		// Run the hook
		const { result } = renderHook(() =>
			useStreamJson<{ some: string }, { key: string; value: string }>(
				'https://example.com/stream',
				{ some: 'data' },
			),
		);

		// Wait for the hook to finish (after the stream closes)
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Validate
		expect(result.current.error).toBeUndefined();
		expect(result.current.data).toEqual([
			{ key: 'key1', value: 'value1' },
			{ key: 'key2', value: 'value2' },
			{ key: 'key3', value: 'value3' },
		]);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it('can be canceled manually', async () => {
		const mockFetch = vi.fn(
			(_url: URL | RequestInfo, init?: RequestInit) => {
				const signal = init?.signal;

				const stream = new ReadableStream({
					start(controller) {
						// enqueue one message (so the hook gets data.length === 1)
						controller.enqueue(
							new TextEncoder().encode(
								'{"key":"x","value":"1"}\n',
							),
						);

						// If the signal is already aborted, immediately error:
						if (signal?.aborted) {
							controller.error(
								new DOMException('Aborted', 'AbortError'),
							);
							return;
						}

						// Otherwise listen for abort and error the stream when it happens.
						const onAbort = () => {
							// This will cause reader.read() to reject with AbortError.
							controller.error(
								new DOMException('Aborted', 'AbortError'),
							);
						};

						signal?.addEventListener?.('abort', onAbort);

						// Cleanup listener if the stream is canceled/closed normally.
						// Note: there is no 'stop' callback here that we can rely on
						// cross-env, but leaving the listener is OK for short-lived tests.
					},
					// We intentionally do not close() the stream so it remains open
					// until the test triggers abort.
				});

				// Resolve with a Response that has the stream as body.
				return Promise.resolve(
					new Response(stream, {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					}),
				);
			},
		);
		global.fetch = mockFetch;

		const { result } = renderHook(() =>
			useStreamJson<void, { key: string; value: string }>(
				'https://example.com/stream',
			),
		);

		// Wait for first message
		await waitFor(() => expect(result.current.data.length).toBe(1));

		// Cancel manually
		result.current.cancel();

		// Wait for cleanup
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.error).toBeUndefined();
	});
});

describe('useStreamJson — error handling', () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		vi.restoreAllMocks();
		global.fetch = originalFetch;
	});

	it('sets error when fetch() rejects (network failure)', async () => {
		const mockError = new Error('Network down');
		const mockFetch = vi.fn().mockRejectedValue(mockError);
		global.fetch = mockFetch;

		const { result } = renderHook(() =>
			useStreamJson('https://example.com/fail'),
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.error).toBe(mockError);
		expect(result.current.data).toEqual([]);
		expect(mockFetch).toHaveBeenCalledOnce();
	});

	it('sets error when HTTP response is not OK', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue(new Response('Bad request', { status: 400 }));
		global.fetch = mockFetch;

		const { result } = renderHook(() =>
			useStreamJson('https://example.com/400'),
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.error?.message).toContain('HTTP error 400');
		expect(result.current.data).toEqual([]);
	});

	it('continues parsing after encountering malformed JSON', async () => {
		const chunks = [
			'{"key":"ok1","value":"v1"}\n',
			'{malformed_json_line}\n',
			'{"key":"ok2","value":"v2"}\n',
		];

		const mockFetch = vi.fn().mockResolvedValue(
			new Response(createMockStream(chunks), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		global.fetch = mockFetch;

		const { result } = renderHook(() =>
			useStreamJson<void, { key: string; value: string }>(
				'https://example.com/stream',
			),
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// Only valid objects should appear
		expect(result.current.data).toEqual([
			{ key: 'ok1', value: 'v1' },
			{ key: 'ok2', value: 'v2' },
		]);
		expect(result.current.error).toBeUndefined();
	});

	it('handles invalid JSON at the very end gracefully', async () => {
		const chunks = [
			'{"key":"ok1","value":"v1"}\n',
			'{"key":"incomplete"', // No closing brace
		];

		const mockFetch = vi.fn().mockResolvedValue(
			new Response(createMockStream(chunks), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
		global.fetch = mockFetch;

		const { result } = renderHook(() =>
			useStreamJson<void, { key: string; value: string }>(
				'https://example.com/stream',
			),
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.data).toEqual([{ key: 'ok1', value: 'v1' }]);
		expect(result.current.error).toBeUndefined();
	});
});
