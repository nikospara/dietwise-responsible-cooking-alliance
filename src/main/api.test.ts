import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { postSuggestionStatistics } from './api';

vi.mock('i18next', () => ({
	t: (key: string) => key,
}));

const apiServerHost = 'http://example.com';
const accessToken = 'token-123';

describe('statistics api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('postSuggestionStatistics succeeds for 200', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			status: 200,
		} as Response);

		await expect(
			postSuggestionStatistics(apiServerHost, accessToken, 'increaseTimesAccepted', { suggestionId: 's-1' }),
		).resolves.toBeUndefined();
		expect(fetchMock).toHaveBeenCalledWith(apiServerHost + '/statistics/increaseTimesAccepted', {
			method: 'POST',
			body: JSON.stringify({ suggestionId: 's-1' }),
			headers: {
				Accepts: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
		});
	});

	it('postSuggestionStatistics succeeds for 204', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			status: 204,
		} as Response);

		await expect(
			postSuggestionStatistics(apiServerHost, accessToken, 'decreaseTimesRejected', { suggestionId: 's-1' }),
		).resolves.toBeUndefined();
	});

	it('postSuggestionStatistics throws translated error for 401', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			status: 401,
		} as Response);

		await expect(
			postSuggestionStatistics(apiServerHost, accessToken, 'increaseTimesRejected', { suggestionId: 's-1' }),
		).rejects.toThrowError('error.401');
	});

	it('postSuggestionStatistics throws generic error for other status', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			status: 418,
		} as Response);

		await expect(
			postSuggestionStatistics(apiServerHost, accessToken, 'decreaseTimesAccepted', { suggestionId: 's-1' }),
		).rejects.toThrowError('error.unknown');
	});

	it('postSuggestionStatistics throws network/system error on fetch failure', async () => {
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockRejectedValue(new Error('timeout'));

		await expect(
			postSuggestionStatistics(apiServerHost, accessToken, 'increaseTimesAccepted', { suggestionId: 's-1' }),
		).rejects.toThrowError('error.networkOrSystem');
	});
});
