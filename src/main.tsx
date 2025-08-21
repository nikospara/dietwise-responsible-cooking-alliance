import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MainPage from 'main/components/MainPage';
import './index.css';
import { configureI18n } from './i18n';

const langCode = chrome && chrome.i18n ? chrome.i18n.getUILanguage() : 'en';

configureI18n(langCode).then(() => {
	const rootElement = document.getElementById('root') as HTMLElement;
	const root = createRoot(rootElement);

	root.render(
		<StrictMode>
			<MainPage />
		</StrictMode>,
	);
});
