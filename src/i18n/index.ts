import i18next, { TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
// language imports, let's keep them sorted alphabetically; same in the resources object
import el from './el.json';
import en from './en.json';

const resources = {
	el: {
		translation: el
	},
	en: {
		translation: en
	}
};

export function configureI18n(lng: string): Promise<TFunction> {
	return i18next
		.use(initReactI18next)
		.init({
			resources,
			lng,
			debug: true,
			interpolation: {
				escapeValue: false, // not needed for react!!
			},
		});
}
