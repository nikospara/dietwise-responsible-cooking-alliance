import { useTranslation } from 'react-i18next';
import { GrUndo } from 'react-icons/gr';
import { TbWorldUpload } from 'react-icons/tb';

export interface AssessRecipeComponentProps {
	assessing: boolean;
	hasOutcome: boolean;
	url: string | null | undefined;
	onAssessButtonClicked: () => void;
	onResetButtonClicked: () => void;
}

const AssessRecipeComponent: React.FC<AssessRecipeComponentProps> = (
	props: AssessRecipeComponentProps,
) => {
	const { t } = useTranslation();

	return (
		<div>
			<div className="flex justify-center gap-2">
				<button
					className="btn btn-xl btn-accent"
					disabled={props.assessing}
					onClick={props.onAssessButtonClicked}
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
				{props.hasOutcome && !props.assessing ? (
					<button
						className="btn btn-xl btn-outline"
						onClick={props.onResetButtonClicked}
					>
						<span>
							<GrUndo />
						</span>
					</button>
				) : null}
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
