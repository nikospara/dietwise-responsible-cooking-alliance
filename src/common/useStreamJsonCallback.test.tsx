import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useStreamJsonCallback } from './useStreamJsonCallback';

// --- helpers ---------------------------------------------------------------

/**
 * Helper: mock a streaming fetch that sends lines with optional delay and abort support
 */
function mockFetchStream(lines: string[], delayMs = 0) {
	vi.spyOn(global, 'fetch').mockImplementation((_, init?: RequestInit) => {
		const signal = init?.signal;
		const encoder = new TextEncoder();

		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				let aborted = false;
				const onAbort = () => {
					aborted = true;
					controller.error(new DOMException('Aborted', 'AbortError'));
				};
				signal?.addEventListener('abort', onAbort);

				for (const line of lines) {
					if (aborted) return;
					controller.enqueue(encoder.encode(line + '\n'));
					if (delayMs) {
						await new Promise((r) => setTimeout(r, delayMs));
					}
				}
				if (!aborted) controller.close();
			},
		});

		return Promise.resolve(
			new Response(stream, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);
	});
}

// --- tests ----------------------------------------------------------------

describe('useStreamJsonCallback', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('calls onMessage for each chunk and onComplete at the end', async () => {
		// Why set? In React 18 and 19, the default test renderer (and development builds) run
		// effects twice in Strict Mode to help you detect side effects that aren’t properly
		// cleaned up. This means your useEffect() inside useStreamJsonCallback runs twice:
		// - Mount → start fetch stream → onMessage called for each chunk
		// - React simulates an unmount (calls your cleanup → aborts), then remounts immediately
		//   → starts the effect again → calls onMessage again for the same chunks
		const setOfResponses = new Set<string>();
		const onMessage = (x: { key: string; value: string }) =>
			setOfResponses.add(x.key);
		const onComplete = vi.fn();

		mockFetchStream([
			'{"key":"a","value":"1"}',
			'{"key":"b","value":"2"}',
			'{"key":"c","value":"3"}',
		]);

		renderHook(() =>
			useStreamJsonCallback('/api/stream', undefined, {
				onMessage,
				onComplete,
			}),
		);

		// Wait for all messages to be delivered
		await waitFor(() => expect(setOfResponses).toHaveLength(3));
		await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(2));
	});

	it('can be canceled manually', async () => {
		const onMessage = vi.fn();
		const onComplete = vi.fn();
		const onError = vi.fn();

		mockFetchStream(
			['{"key":"x","value":"1"}', '{"key":"y","value":"2"}'],
			100,
		);

		const { result } = renderHook(() =>
			useStreamJsonCallback('/api/stream', undefined, {
				onMessage,
				onComplete,
				onError,
			}),
		);

		// Wait for the first message to be received
		await waitFor(() => expect(onMessage).toHaveBeenCalledTimes(1));

		// Cancel streaming
		act(() => {
			result.current.cancel();
		});

		// Wait until hook finishes cleanup
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		// Verify that abort didn't call onError or onComplete
		expect(onError).not.toHaveBeenCalled();
		expect(onComplete).not.toHaveBeenCalled();
	});

	it('calls onError on HTTP error', async () => {
		const onError = vi.fn();

		vi.spyOn(global, 'fetch').mockResolvedValue(
			new Response(null, { status: 500 }),
		);

		const NoStrict: React.FC<{ children: React.ReactNode }> = ({
			children,
		}) => <>{children}</>;
		renderHook(
			() => useStreamJsonCallback('/api/error', undefined, { onError }),
			{ wrapper: NoStrict },
		);

		await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
		expect(onError.mock.calls[0][0].message).toMatch(/HTTP error 500/);
	});

	it('skips invalid JSON lines', async () => {
		const setOfResponses = new Set<number>();
		const onMessage = (x: { valid: number }) => setOfResponses.add(x.valid);
		const onComplete = vi.fn();

		mockFetchStream(['{"valid":1}', 'INVALID_JSON', '{"valid":2}']);

		renderHook(() =>
			useStreamJsonCallback('/api/stream', undefined, {
				onMessage,
				onComplete,
			}),
		);

		await waitFor(() => expect(onComplete).toHaveBeenCalled());
		await waitFor(() => expect(setOfResponses).toEqual(new Set([1, 2]))); // only valid lines
	});
});
