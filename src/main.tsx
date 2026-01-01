import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from 'layout/AppLayout';
import './index.css';
import { configureI18n } from './i18n';
import type { AuthenticationInfo } from 'auth/model';

const langCode =
	typeof browser !== 'undefined' && typeof browser.i18n !== 'undefined'
		? browser.i18n.getUILanguage()
		: typeof chrome !== 'undefined' && typeof chrome.i18n !== 'undefined'
			? chrome.i18n.getUILanguage()
			: 'en';

const authenticationInfoPromise: Promise<AuthenticationInfo> = new Promise((resolve) => {
	// TODO Real initial authentication
	resolve({
		isAuthenticated: false,
	});
});

Promise.all([configureI18n(langCode), authenticationInfoPromise]).then(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	([_t, initialAuthenticationInfo]) => {
		const rootElement = document.getElementById('root') as HTMLElement;
		const root = createRoot(rootElement);

		root.render(
			<StrictMode>
				<AppLayout initialAuthenticationInfo={initialAuthenticationInfo} />
			</StrictMode>,
		);
	},
);
