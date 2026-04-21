import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import MainPage from '@/main/components/MainPage';
import LoginPage from '@/auth/components/LoginPage';
import ConfigurationPage from '@/configuration/components/ConfigurationPage';
import { tokensAtom, loadTokensAtom } from '@/auth/atoms';
import { showingConfigurationAtom } from './atoms';

const AppLayout: React.FC = () => {
	const [tokens, setTokens] = useAtom(tokensAtom);
	const loadTokens = useSetAtom(loadTokensAtom);

	useEffect(() => {
		loadTokens();

		const listener = (changes: { [key: string]: browser.storage.StorageChange }) => {
			if ('tokens' in changes) {
				console.log('tokens changed:', changes['tokens']);
				setTokens(changes['tokens'].newValue);
			}
		};

		if (typeof browser !== 'undefined') {
			browser.storage.local.onChanged.addListener(listener);
			return () => browser.storage.local.onChanged.removeListener(listener);
		} else if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
			chrome.storage.local.onChanged.addListener(listener);
			return () => chrome.storage.local.onChanged.removeListener(listener);
		}
	}, [loadTokens, setTokens]);

	const [showingConfiguration, setShowingConfiguration] = useAtom(showingConfigurationAtom);

	if (showingConfiguration) {
		return <ConfigurationPage back={() => setShowingConfiguration(false)} />;
	} else if (tokens) {
		return <MainPage toConfigurationPage={() => setShowingConfiguration(true)} />;
	} else {
		return <LoginPage />;
	}
};

export default AppLayout;
