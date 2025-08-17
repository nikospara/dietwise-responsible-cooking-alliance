import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MainPage from 'main/components/MainPage';
import './index.css';
import { configureI18n } from './i18n';

configureI18n('en') // TODO Configuration
	.then(() => {
		const rootElement = document.getElementById('root') as HTMLElement;
		const root = createRoot(rootElement);

		root.render(
			<StrictMode>
				<MainPage />
			</StrictMode>,
		);
	});
