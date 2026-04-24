import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useSetAtom } from 'jotai';
import { LiaArrowLeftSolid, LiaSignOutAltSolid } from 'react-icons/lia';
import { countryAtom, languageAtom } from '@/configuration/atoms';
import { logoutAtom } from '@/auth/atoms';

export interface ConfigurationPageProps {
	back: () => void;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = (props) => {
	const { t } = useTranslation();
	const [language, setLanguage] = useAtom(languageAtom);
	const [country, setCountry] = useAtom(countryAtom);
	const logout = useSetAtom(logoutAtom);
	const [settingLanguage, setSettingLanguage] = useState(false);
	const [settingCountry, setSettingCountry] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);

	const onChangeLanguageCallback = useCallback(
		async (e: React.ChangeEvent<HTMLSelectElement>) => {
			const newLanguage = e.target.value;
			setSettingLanguage(true);
			await setLanguage(newLanguage);
			setSettingLanguage(false);
		},
		[setLanguage],
	);

	const onChangeCountryCallback = useCallback(
		async (e: React.ChangeEvent<HTMLSelectElement>) => {
			const newCountry = e.target.value;
			setSettingCountry(true);
			await setCountry(newCountry === '' ? null : newCountry);
			setSettingCountry(false);
		},
		[setCountry],
	);

	const onLogoutCallback = useCallback(async () => {
		setLoggingOut(true);
		await logout();
		props.back();
	}, [logout, props]);

	return (
		<div className="flex h-full flex-col gap-[15px] p-[8px]">
			<h1 className="border-b-3 border-b-(--color-accent) mt-[10px] pb-[6px]">
				<button className="btn btn-circle btn-outline" onClick={props.back}>
					<span>
						<LiaArrowLeftSolid size="2.5em" title={t('config.back')} />
					</span>
				</button>{' '}
				<span>{t('config.title')}</span>
			</h1>
			<div className="rounded-box border-base-300 bg-base-100 border">
				<div className="flex items-center justify-between gap-4 p-4">
					<label className="font-medium" htmlFor="ui-language-select">
						{t('config.language')}
					</label>
					<select
						id="ui-language-select"
						className="select select-bordered"
						value={language}
						onChange={onChangeLanguageCallback}
						disabled={settingLanguage}
					>
						<option value="en">English</option>
						<option value="el">Ελληνικά</option>
					</select>
				</div>
				<div className="border-base-300 flex items-center justify-between gap-4 border-t p-4">
					<label className="font-medium" htmlFor="country-select">
						{t('config.country')}
					</label>
					<select
						id="country-select"
						className="select select-bordered"
						value={country ?? ''}
						onChange={onChangeCountryCallback}
						disabled={settingCountry}
					>
						<option value="">{t('config.noCountry')}</option>
						<option value="BE">{t('countries.BE')}</option>
						<option value="GR">{t('countries.GR')}</option>
						<option value="LT">{t('countries.LT')}</option>
					</select>
				</div>
				<div className="border-base-300 flex items-center justify-end border-t p-4">
					<button className="btn btn-outline btn-error" onClick={onLogoutCallback} disabled={loggingOut}>
						<LiaSignOutAltSolid size="1.5em" />
						{t('config.logout')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfigurationPage;
