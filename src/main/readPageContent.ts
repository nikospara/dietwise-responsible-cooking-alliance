declare const browser: object;

export async function readPageContent(): Promise<string> {
	if (typeof browser !== 'undefined') {
		console.error('`browser` not supported yet');
		throw new Error('`browser` not supported yet');
	} else if (
		typeof chrome !== 'undefined' &&
		typeof chrome.scripting !== 'undefined'
	) {
		return readPageContentChrome();
	} else {
		// Here we are running in a browser, probably for development. Allow
		// short-circuiting this functionality by providing a value for the
		// global READ_PAGE_CONTENT_RESULT.
		return Promise.resolve(
			((<unknown>window) as { READ_PAGE_CONTENT_RESULT: string })
				.READ_PAGE_CONTENT_RESULT,
		);
	}
}

async function readPageContentChrome(): Promise<string> {
	const activeTabs = await chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
	});
	console.log('Active Tabs:', activeTabs);
	if (activeTabs.length === 0 || typeof activeTabs[0].id !== 'number') {
		console.log('Cannot locate active tab id');
		throw new Error('Cannot locate active tab id');
	}
	console.log('Active tab id:', activeTabs[0].id);
	const results = await chrome.scripting.executeScript({
		func: () => document.body.innerHTML,
		target: {
			tabId: activeTabs[0].id,
		},
	});
	if (results.length === 0) {
		console.log('Getting the tab content did not produce any result');
		throw new Error('Getting the tab content did not produce any result');
	}
	return results[0].result as string;
}
