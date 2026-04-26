import { atom } from 'jotai';
import { changeLanguage } from 'i18next';
import { saveSettings } from '@/configuration/storage';
import { API_SERVER_HOST, AUTH_SERVER_HOST, type Settings } from './model';

export const settingsAtom = atom({} as Settings, async (_get, set, value: Settings) => {
	await saveSettings(value);
	set(settingsAtom, value);
});

export const languageAtom = atom(
	(get) => get(settingsAtom).language,
	async (get, set, language: string) => {
		await set(settingsAtom, { ...get(settingsAtom), language });
		await changeLanguage(language);
	},
);

export const countryAtom = atom(
	(get) => get(settingsAtom).country,
	async (get, set, country: string | null) => {
		await set(settingsAtom, { ...get(settingsAtom), country });
	},
);

export const apiServerHostAtom = atom(API_SERVER_HOST);

export const authServerHostAtom = atom(AUTH_SERVER_HOST);
