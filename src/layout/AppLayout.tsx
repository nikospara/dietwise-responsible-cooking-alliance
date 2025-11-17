import { useState } from 'react';
import { AuthContext } from 'auth/AuthContext';
import MainPage from 'main/components/MainPage';
import LoginPage from 'auth/components/LoginPage';
import type { AuthenticationInfo } from 'auth/model';

export interface AppLayoutProps {
	initialAuthenticationInfo: AuthenticationInfo;
}

const AppLayout: React.FC<AppLayoutProps> = (props) => {
	const [userInfoState, setUserInfoState] = useState(
		props.initialAuthenticationInfo,
	);

	return (
		<AuthContext value={userInfoState}>
			{userInfoState.isAuthenticated ? (
				<MainPage />
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
