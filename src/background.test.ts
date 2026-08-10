import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/auth/authService', () => ({
	authService: { handleCallback: vi.fn() },
}));

/**
 * From Chrome 148 the extension APIs are also reachable through a `browser` root object, which is
 * distinct from `chrome` but exposes the very same namespace objects. It has no `sidebarAction`.
 */
function createChromeApi() {
	const chrome = {
		action: { onClicked: { addListener: vi.fn() } },
		runtime: { onMessage: { addListener: vi.fn() } },
		sidePanel: { setPanelBehavior: vi.fn().mockResolvedValue(undefined) },
	};
	return { chrome, browser: { ...chrome } };
}

function createFirefoxApi() {
	let clickListener: (() => void) | undefined;
	return {
		action: {
			onClicked: {
				addListener: vi.fn((listener: () => void) => {
					clickListener = listener;
				}),
			},
		},
		runtime: { onMessage: { addListener: vi.fn() } },
		sidebarAction: { open: vi.fn() },
		clickAction: () => clickListener?.(),
	};
}

describe('background', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('opens the side panel on action click in Chrome, where the `browser` namespace also exists', async () => {
		const { chrome, browser } = createChromeApi();
		vi.stubGlobal('chrome', chrome);
		vi.stubGlobal('browser', browser);

		await import('./background');

		expect(chrome.sidePanel.setPanelBehavior).toHaveBeenCalledWith({ openPanelOnActionClick: true });
		expect(chrome.action.onClicked.addListener).not.toHaveBeenCalled();
	});

	it('opens the sidebar on action click in Firefox', async () => {
		const api = createFirefoxApi();
		vi.stubGlobal('browser', api);

		await import('./background');
		api.clickAction();

		expect(api.sidebarAction.open).toHaveBeenCalled();
	});

	it('listens for auth callback messages in Chrome', async () => {
		const { chrome, browser } = createChromeApi();
		vi.stubGlobal('chrome', chrome);
		vi.stubGlobal('browser', browser);

		await import('./background');

		expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
	});
});
