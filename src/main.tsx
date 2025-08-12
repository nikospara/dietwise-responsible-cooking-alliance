import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { configureI18n } from './i18n';

configureI18n('en') // TODO Configuration
	.then(() => {
		const rootElement = document.getElementById('root') as HTMLElement;
		const root = ReactDOM.createRoot(rootElement);

		root.render(
			<StrictMode>
				<App />
			</StrictMode>,
		);
	});
