function getHostPermissionPattern(url: string | undefined): string | null {
	if (!url) {
		return null;
	}

	const parsedUrl = new URL(url);
	if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
		return null;
	}

	return `${parsedUrl.protocol}//${parsedUrl.host}/*`;
}

export async function ensureHostPermission(url: string | undefined): Promise<void> {
	const originPattern = getHostPermissionPattern(url);
	if (!originPattern) {
		return;
	}

	if (typeof browser !== 'undefined' && typeof browser.permissions !== 'undefined') {
		await ensureFirefoxHostPermission(originPattern);
	} else if (typeof chrome !== 'undefined' && typeof chrome.permissions !== 'undefined') {
		await ensureChromeHostPermission(originPattern);
	}
}

async function ensureChromeHostPermission(originPattern: string): Promise<void> {
	const permission = { origins: [originPattern] };
	const granted = await chrome.permissions.request(permission);
	if (!granted) {
		throw new Error(`Permission to read ${originPattern} was not granted`);
	}
}

async function ensureFirefoxHostPermission(originPattern: string): Promise<void> {
	const permission = { origins: [originPattern] };
	const granted = await browser.permissions.request(permission);
	if (!granted) {
		throw new Error(`Permission to read ${originPattern} was not granted`);
	}
}
