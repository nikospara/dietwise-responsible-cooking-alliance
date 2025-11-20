import { useState } from 'react';
import { AuthContext } from 'auth/AuthContext';
import MainPage from 'main/components/MainPage';
import LoginPage from 'auth/components/LoginPage';
import ConfigurationPage from 'configuration/components/ConfigurationPage';
import type { AuthenticationInfo } from 'auth/model';

export interface AppLayoutProps {
	initialAuthenticationInfo: AuthenticationInfo;
}

const AppLayout: React.FC<AppLayoutProps> = (props) => {
	const [userInfoState, setUserInfoState] = useState(
		props.initialAuthenticationInfo,
	);
	const [showingConfiguration, setShowingConfiguration] = useState(false);

	return (
		<AuthContext value={userInfoState}>
			{showingConfiguration ? (
				<ConfigurationPage
					back={() => setShowingConfiguration(false)}
				/>
			) : userInfoState.isAuthenticated ? (
				<MainPage
					toConfigurationPage={() => setShowingConfiguration(true)}
				/>
			) : (
				<LoginPage
					onAuthenticated={(ui) =>
						setUserInfoState({
							isAuthenticated: true,
							userInfo: ui,
						})
					}
				/>
			)}
		</AuthContext>
	);
};

export default AppLayout;
