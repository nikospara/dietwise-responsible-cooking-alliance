import { useTranslation } from 'react-i18next';
import { TbWorldUpload } from 'react-icons/tb';

export interface AssessRecipeComponentProps {
	assessing: boolean;
	url: string | null | undefined;
	onButtonClicked: () => void;
}

const AssessRecipeComponent: React.FC<AssessRecipeComponentProps> = (
	props: AssessRecipeComponentProps,
) => {
	const { t } = useTranslation();

	return (
		<div>
			<div className="text-center">
				<button
					className="btn btn-xl btn-accent"
					disabled={props.assessing}
					onClick={props.onButtonClicked}
				>
					<span
						className={props.assessing ? 'animate-pingpulse' : ''}
					>
						<TbWorldUpload />
					</span>
					<span className="hidden md:inline">
						{t('main.AssessRecipeComponent.labelLong')}
					</span>
					<span className="inline md:hidden">
						{t('main.AssessRecipeComponent.labelShort')}
					</span>
				</button>
			</div>
			<p className="truncate">
				{props.url ? (
					<span className="font-bold">
						{props.assessing
							? t('main.AssessRecipeComponent.assessing')
							: t('main.AssessRecipeComponent.assessed')}
					</span>
				) : null}
				&nbsp;
				{props.url || ''}
			</p>
		</div>
	);
};

export default AssessRecipeComponent;
