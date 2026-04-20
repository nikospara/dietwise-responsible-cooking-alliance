import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assessRecipe } from './assessRecipe';

vi.mock('@/common/streamJson', () => ({
	streamJson: vi.fn(() => ({
		cancel: vi.fn(),
	})),
}));

import { streamJson } from '@/common/streamJson';

describe('assessRecipe', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('uses the configured API server host and attaches the bearer token when present', () => {
		const onMessage = vi.fn();
		const onError = vi.fn();
		const onComplete = vi.fn();

		assessRecipe(
			'http://example.com/api/v1',
			'https://recipe.example/item',
			'# Recipe',
			null,
			'en',
			'token-123',
			onMessage,
			onError,
			onComplete,
		);

		expect(streamJson).toHaveBeenCalledWith(
			'http://example.com/api/v1/recipe/assess/markdown',
			{
				url: 'https://recipe.example/item',
				pageContent: '# Recipe',
				jsonLdContent: null,
				lang: 'en',
			},
			{
				onMessage,
				onError,
				onComplete,
				headers: {
					Authorization: 'Bearer token-123',
				},
			},
		);
	});

	it('omits Authorization when no token is available', () => {
		assessRecipe('http://example.com/api/v1', 'https://recipe.example/item', '# Recipe', null, 'en', null);

		expect(streamJson).toHaveBeenCalledWith(
			'http://example.com/api/v1/recipe/assess/markdown',
			expect.any(Object),
			expect.objectContaining({
				headers: undefined,
			}),
		);
	});
});
