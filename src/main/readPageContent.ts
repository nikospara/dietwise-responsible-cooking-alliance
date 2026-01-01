export async function readPageContent(tabId: number): Promise<string> {
	if (typeof browser !== 'undefined') {
		return readPageContentFirefox(tabId);
	} else if (typeof chrome !== 'undefined' && typeof chrome.scripting !== 'undefined') {
		return readPageContentChrome(tabId);
	} else {
		// Here we are running in a browser, probably for development. Allow
		// short-circuiting this functionality by providing a value for the
		// global READ_PAGE_CONTENT_RESULT.
		return Promise.resolve(((<unknown>window) as { READ_PAGE_CONTENT_RESULT: string }).READ_PAGE_CONTENT_RESULT);
	}
}

async function readPageContentChrome(tabId: number): Promise<string> {
	const results = await chrome.scripting.executeScript({
		func: () => document.body.innerHTML,
		target: { tabId: tabId },
	});
	if (results.length === 0) {
		console.log('Getting the tab content did not produce any result');
		throw new Error('Getting the tab content did not produce any result');
	}
	return results[0].result as string;
}

async function readPageContentFirefox(tabId: number): Promise<string> {
	const results = await browser.scripting.executeScript({
		// XXX The type of func in @types/firefox-webext-browser is probably a bug
		func: (() => document.body.innerHTML) as unknown as () => void,
		target: { tabId: tabId },
	});
	if (results.length === 0) {
		console.log('Getting the tab content did not produce any result');
		throw new Error('Getting the tab content did not produce any result');
	}
	return results[0].result as string;
}
