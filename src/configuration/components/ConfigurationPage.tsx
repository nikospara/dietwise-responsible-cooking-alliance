import { useTranslation } from 'react-i18next';
import { LiaArrowLeftSolid } from 'react-icons/lia';

export interface ConfigurationPageProps {
	back: () => void;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = (props) => {
	const { t } = useTranslation();

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
		</div>
	);
};

export default ConfigurationPage;
