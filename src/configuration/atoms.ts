import { atom } from 'jotai';
import { changeLanguage } from 'i18next';
import { saveSettings } from '@/configuration/storage';
import type { Settings } from './model';

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

export const apiServerHostAtom = atom(
	(get) => get(settingsAtom).apiServerHost,
	async (get, set, apiServerHost: string) => {
		await set(settingsAtom, { ...get(settingsAtom), apiServerHost });
	},
);
