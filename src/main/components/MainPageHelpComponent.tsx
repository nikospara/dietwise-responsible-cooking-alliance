import { useTranslation } from 'react-i18next';

const MainPageHelpComponent: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div>
			<h2>{t('main.MainPageHelpComponent.title')}</h2>
			<p className="text-justify">{t('main.MainPageHelpComponent.welcome1')}</p>
			<p className="text-justify">{t('main.MainPageHelpComponent.welcome2')}</p>
			<hr />
			<h3>{t('main.MainPageHelpComponent.titleInstructions')}</h3>
			<p className="text-justify">{t('main.MainPageHelpComponent.paragraph1')}</p>
			<p className="text-justify">{t('main.MainPageHelpComponent.paragraph2')}</p>
			<p className="text-justify">{t('main.MainPageHelpComponent.paragraph3')}</p>
			<ol className="list-decimal p-[20px]">
				<li>{t('main.MainPageHelpComponent.explainUndecidedButton')}</li>
				<li>
					{t('main.MainPageHelpComponent.explainApproveButton')}: {t('main.SuggestionsComponent.accept')}
				</li>
				<li>
					{t('main.MainPageHelpComponent.explainRejectButton')}: {t('main.SuggestionsComponent.reject')}
				</li>
			</ol>
			<p className="text-justify">{t('main.MainPageHelpComponent.paragraph4')}</p>
			<p className="text-justify">{t('main.MainPageHelpComponent.paragraph5')}</p>
		</div>
	);
};

export default MainPageHelpComponent;
