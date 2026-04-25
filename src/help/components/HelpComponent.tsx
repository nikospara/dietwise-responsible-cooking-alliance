import { useTranslation } from 'react-i18next';

export type HelpTarget = 'MAIN' | 'LOGIN';

export interface HelpComponentProps {
	target: HelpTarget;
}

const HelpComponent: React.FC<HelpComponentProps> = ({ target }) => {
	const { t } = useTranslation();

	return (
		<div>
			<h2>{t('HelpComponent.title')}</h2>
			<p className="text-justify">{t('HelpComponent.welcome1')}</p>
			{target === 'MAIN' && <p className="text-justify">{t('HelpComponent.welcome2')}</p>}
			<hr />
			<h3>{t('HelpComponent.titleInstructions')}</h3>
			{target === 'MAIN' && (
				<>
					<p className="text-justify">{t('HelpComponent.paragraph1')}</p>
					<p className="text-justify">{t('HelpComponent.paragraph2')}</p>
					<p className="text-justify">{t('HelpComponent.paragraph3')}</p>
					<ol className="list-decimal p-[20px]">
						<li>{t('HelpComponent.explainUndecidedButton')}</li>
						<li>
							{t('HelpComponent.explainApproveButton')}: {t('main.SuggestionsComponent.accept')}
						</li>
						<li>
							{t('HelpComponent.explainRejectButton')}: {t('main.SuggestionsComponent.reject')}
						</li>
					</ol>
					<p className="text-justify">{t('HelpComponent.paragraph4')}</p>
					<p className="text-justify">{t('HelpComponent.paragraph5')}</p>
				</>
			)}
			{target === 'LOGIN' && (
				<>
					<p className="text-justify">{t('HelpComponent.loginParagraph1')}</p>
				</>
			)}
		</div>
	);
};

export default HelpComponent;
