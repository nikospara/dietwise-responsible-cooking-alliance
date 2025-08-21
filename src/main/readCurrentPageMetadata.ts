declare const browser: object; // TODO Replace when we have the types for the Firefox-compatible extension APIs

export interface PageMetadata {
	tabId: number;
	url?: string;
	title?: string;
}

export async function readCurrentPageMetadata(): Promise<PageMetadata> {
	if (typeof browser !== 'undefined') {
		console.error('`browser` not supported yet');
		throw new Error('`browser` not supported yet');
	} else if (
		typeof chrome !== 'undefined' &&
		typeof chrome.tabs !== 'undefined'
	) {
		return readCurrentPageMetadataChrome();
	} else {
		// Here we are running in a browser, probably for development.
		// Just provide dummy data.
		return Promise.resolve({
			tabId: 0,
			url: 'http://localhost/',
			title: 'Development',
		});
	}
}

async function readCurrentPageMetadataChrome(): Promise<PageMetadata> {
	const activeTabs = await chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
	});
	console.log('Active Tabs:', activeTabs); // TODO Remove when functionality finalized
	if (activeTabs.length === 0 || typeof activeTabs[0].id !== 'number') {
		console.error('Cannot locate active tab id');
		throw new Error('Cannot locate active tab id');
	}
	console.log('Active tab id:', activeTabs[0].id); // TODO Remove when functionality finalized
	return {
		tabId: activeTabs[0].id,
		url: activeTabs[0].url,
		title: activeTabs[0].title,
	};
}
