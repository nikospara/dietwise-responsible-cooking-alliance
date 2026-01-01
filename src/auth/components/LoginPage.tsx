import type { UserInfo } from 'auth/model';
import { useTranslation } from 'react-i18next';

export interface LoginPageProps {
	onAuthenticated: (userInfo: UserInfo) => void;
}

const DUMMY_USERINFO: UserInfo = Object.freeze({
	username: 'dummy',
});

const LoginPage: React.FC<LoginPageProps> = (props) => {
	const { t } = useTranslation();

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<button className="btn btn-accent" onClick={() => props.onAuthenticated(DUMMY_USERINFO)}>
				{t('login.loginLabel')}
			</button>
		</div>
	);
};

export default LoginPage;
