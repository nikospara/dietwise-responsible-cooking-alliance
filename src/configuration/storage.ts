import type { Settings } from './model';
import { DEFAULT_SETTINGS } from './model';

const SETTINGS_KEY = 'rca.settings';

function normalizeSettings(settings: Record<string, unknown> | null | undefined): Settings {
	const country = settings?.country;

	return {
		language: typeof settings?.language === 'string' ? settings.language : DEFAULT_SETTINGS.language,
		country: typeof country === 'string' || country === null ? country : DEFAULT_SETTINGS.country,
	};
}

function readLocalStorageValues(): Record<string, unknown> {
	const settingsJson = window.localStorage.getItem(SETTINGS_KEY);
	return settingsJson ? (JSON.parse(settingsJson) as Record<string, unknown>) : {};
}

export async function loadSettings(): Promise<Settings> {
	let result = DEFAULT_SETTINGS;
	try {
		if (typeof browser !== 'undefined') {
			result = normalizeSettings(
				(await browser.storage.local.get({ ...DEFAULT_SETTINGS })) as Record<string, unknown>,
			);
		} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
			result = normalizeSettings(
				(await chrome.storage.local.get({ ...DEFAULT_SETTINGS })) as Record<string, unknown>,
			);
		} else {
			// Here we are running in a browser, probably for development.
			result = normalizeSettings(readLocalStorageValues());
		}
	} catch (_e) {
		// fallback to default, already assigned
	}
	return result;
}

export async function saveSettings(settings: Settings): Promise<void> {
	const storedSettings = normalizeSettings({ ...settings });
	if (typeof browser !== 'undefined') {
		await browser.storage.local.set(storedSettings);
	} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
		await chrome.storage.local.set(storedSettings);
	} else {
		// Here we are running in a browser, probably for development.
		window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(storedSettings));
	}
}

export async function get<T>(key: string): Promise<T | null> {
	if (typeof browser !== 'undefined') {
		const result = await browser.storage.local.get(key);
		return (({ ...DEFAULT_SETTINGS, ...result } as Record<string, unknown>)[key] as T | undefined) ?? null;
	} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
		const result = await chrome.storage.local.get(key);
		return (({ ...DEFAULT_SETTINGS, ...result } as Record<string, unknown>)[key] as T | undefined) ?? null;
	} else {
		// Here we are running in a browser, probably for development.
		const result = {
			...DEFAULT_SETTINGS,
			...readLocalStorageValues(),
		};
		return ((result as Record<string, unknown>)[key] as T | undefined) ?? null;
	}
}

export async function set<T>(key: string, value: T) {
	if (typeof browser !== 'undefined') {
		await browser.storage.local.set({ [key]: value });
	} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
		await chrome.storage.local.set({ [key]: value });
	} else {
		// Here we are running in a browser, probably for development.
		window.localStorage.setItem(
			SETTINGS_KEY,
			JSON.stringify({
				...readLocalStorageValues(),
				[key]: value,
			}),
		);
	}
}

export async function remove(key: string) {
	await set(key, null);
}
