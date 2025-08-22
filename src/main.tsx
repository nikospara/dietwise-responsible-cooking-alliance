import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MainPage from 'main/components/MainPage';
import './index.css';
import { configureI18n } from './i18n';

const langCode =
	typeof browser !== 'undefined' && typeof browser.i18n !== 'undefined'
		? browser.i18n.getUILanguage()
		: typeof chrome !== 'undefined' && typeof chrome.i18n !== 'undefined'
			? chrome.i18n.getUILanguage()
			: 'en';

configureI18n(langCode).then(() => {
	const rootElement = document.getElementById('root') as HTMLElement;
	const root = createRoot(rootElement);

	root.render(
		<StrictMode>
			<MainPage />
		</StrictMode>,
	);
});
