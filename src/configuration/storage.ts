import type { Settings } from './model';
import { DEFAULT_SETTINGS } from './model';

const SETTINGS_KEY = 'rca.settings';

export async function loadSettings(): Promise<Settings> {
	let result = DEFAULT_SETTINGS;
	try {
		if (typeof browser !== 'undefined') {
			result = (await browser.storage.local.get(DEFAULT_SETTINGS)) as Settings;
		} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
			result = (await chrome.storage.local.get(DEFAULT_SETTINGS)) as Settings;
		} else {
			// Here we are running in a browser, probably for development.
			const settingsJson = window.localStorage.getItem(SETTINGS_KEY);
			const settingsFromLocalStorage = settingsJson ? (JSON.parse(settingsJson) as Settings) : null;
			result = {
				...DEFAULT_SETTINGS,
				...settingsFromLocalStorage,
			};
		}
	} catch (_e) {
		// fallback to default, already assigned
	}
	return result;
}

export async function saveSettings(settings: Settings): Promise<void> {
	if (typeof browser !== 'undefined') {
		await browser.storage.local.set(settings);
	} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
		await chrome.storage.local.set(settings);
	} else {
		// Here we are running in a browser, probably for development.
		window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	}
}

export async function get<T>(key: string): Promise<T | null> {
	if (typeof browser !== 'undefined') {
		const result = await browser.storage.local.get(key);
		return ({ ...DEFAULT_SETTINGS, ...result }[key] as T) ?? null;
	} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
		const result = await chrome.storage.local.get(key);
		return ({ ...DEFAULT_SETTINGS, ...result }[key] as T) ?? null;
	} else {
		// Here we are running in a browser, probably for development.
		const settingsJson = window.localStorage.getItem(SETTINGS_KEY);
		const settingsFromLocalStorage = settingsJson ? JSON.parse(settingsJson) : null;
		const result = {
			...DEFAULT_SETTINGS,
			...settingsFromLocalStorage,
		};
		return result[key] as T;
	}
}

export async function set<T>(key: string, value: T) {
	if (typeof browser !== 'undefined') {
		await browser.storage.local.set({ [key]: value });
	} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
		await chrome.storage.local.set({ [key]: value });
	} else {
		// Here we are running in a browser, probably for development.
		const settings = await loadSettings();
		window.localStorage.setItem(
			SETTINGS_KEY,
			JSON.stringify({
				...settings,
				[key]: value,
			}),
		);
	}
}

export async function remove(key: string) {
	await set(key, null);
}
