import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from '@/layout/AppLayout';
import './index.css';
import { loadSettings } from '@/configuration/storage';
import { configureI18n } from './i18n';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { settingsAtom } from '@/configuration/atoms';
import { authService } from '@/auth/authService';

async function bootstrap() {
	// configure the application before launching the UI
	let initialSettings = await loadSettings();
	await configureI18n(initialSettings.language);

	// in case we are in web mode, for development
	const params = new URLSearchParams(window.location.search);
	const code = params.get('code');
	if (typeof code === 'string') {
		await authService.handleCallback(code);
		window.history.replaceState(
			{},
			'Responsible Cooking Alliance',
			window.location.href.substring(0, window.location.href.indexOf('?')),
		);
		initialSettings = await loadSettings();
	}

	const jotaiStore = createStore();
	jotaiStore.set(settingsAtom, initialSettings);

	// launch the UI, remember to keep the JotaiProvider outside of React.StrictMode
	const rootElement = document.getElementById('root') as HTMLElement;
	const root = createRoot(rootElement);

	root.render(
		<JotaiProvider store={jotaiStore}>
			<StrictMode>
				<Suspense fallback={<div>Loading...</div>}>
					<AppLayout />
				</Suspense>
			</StrictMode>
		</JotaiProvider>,
	);
}

bootstrap();
