import { useTranslation } from 'react-i18next';

const MainPageHelpComponent: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div>
			<h2>{t('main.MainPageHelpComponent.title')}</h2>
			<p>{t('main.MainPageHelpComponent.paragraph1')}</p>
			<p>{t('main.MainPageHelpComponent.paragraph2')}</p>
		</div>
	);
};

export default MainPageHelpComponent;
