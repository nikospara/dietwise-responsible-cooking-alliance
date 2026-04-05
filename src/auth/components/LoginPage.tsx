import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { loginAtom } from '@/auth/atoms';

const LoginPage: React.FC = () => {
	const login = useSetAtom(loginAtom);
	const { t } = useTranslation();

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<button className="btn btn-accent" onClick={login}>
				{t('login.loginLabel')}
			</button>
		</div>
	);
};

export default LoginPage;
