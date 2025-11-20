import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GrUndo } from 'react-icons/gr';
import { TbAlertTriangleFilled, TbWorldUpload } from 'react-icons/tb';
import { LiaCogSolid } from 'react-icons/lia';
import classNames from 'classnames';

export interface AssessRecipeComponentProps {
	assessing: boolean;
	hasOutcome: boolean;
	url: string | null | undefined;
	onAssessButtonClicked: () => void;
	onResetButtonClicked: () => void;
	toConfigurationPage: () => void;
}

const AssessRecipeComponent: React.FC<AssessRecipeComponentProps> = (
	props: AssessRecipeComponentProps,
) => {
	const [assessedTabUrl, setAssessedTabUrl] = useState<
		string | null | undefined
	>(null);
	const activeTabId = useRef<number | null | undefined>(-1);

	useEffect(() => {
		if (
			typeof browser !== 'undefined' &&
			typeof browser.tabs !== 'undefined'
		) {
			const activatedListener = (
				activeInfo: browser.tabs._OnActivatedActiveInfo,
			) => {
				activeTabId.current = activeInfo.tabId;
				browser.tabs
					.get(activeInfo.tabId)
					.then((tab) => setAssessedTabUrl(tab.url));
			};
			browser.tabs.onActivated.addListener(activatedListener);

			const updatedListener = (
				tabId: number,
				changeInfo: browser.tabs._OnUpdatedChangeInfo,
			) => {
				if (tabId === activeTabId.current && changeInfo.url) {
					setAssessedTabUrl(changeInfo.url);
				}
			};
			browser.tabs.onUpdated.addListener(updatedListener);

			return () => {
				browser.tabs.onActivated.removeListener(activatedListener);
				browser.tabs.onUpdated.removeListener(updatedListener);
			};
		} else if (
			typeof chrome !== 'undefined' &&
			typeof chrome.tabs !== 'undefined'
		) {
			const activatedListener = (
				activeInfo: chrome.tabs.OnActivatedInfo,
			) => {
				activeTabId.current = activeInfo.tabId;
				chrome.tabs.get(activeInfo.tabId, (tab) => {
					console.log('ASSESSED URL', tab.url);
					setAssessedTabUrl(tab.url);
				});
			};
			chrome.tabs.onActivated.addListener(activatedListener);

			const updatedListener = (
				tabId: number,
				changeInfo: chrome.tabs.OnUpdatedInfo,
			) => {
				if (tabId === activeTabId.current && changeInfo.url) {
					setAssessedTabUrl(changeInfo.url);
				}
			};
			chrome.tabs.onUpdated.addListener(updatedListener);

			return () => {
				chrome.tabs.onActivated.removeListener(activatedListener);
				chrome.tabs.onUpdated.removeListener(updatedListener);
			};
		}
	}, []);

	const { t } = useTranslation();

	return (
		<div>
			<div className="flex items-center justify-center gap-2">
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
				<div
					className={classNames(
						!props.hasOutcome || props.assessing
							? 'max-w-0'
							: 'max-w-[200px]',
						'transition-[max-width]',
						'duration-300',
						'overflow-hidden',
					)}
				>
					<button
						className="btn btn-xl btn-outline"
						onClick={props.onResetButtonClicked}
						disabled={!props.hasOutcome || props.assessing}
					>
						<span>
							<GrUndo
								size="1.25em"
								title={t(
									'main.AssessRecipeComponent.labelReset',
								)}
							/>
						</span>
					</button>
				</div>
				<button
					className="btn btn-outline"
					onClick={props.toConfigurationPage}
				>
					<span>
						<LiaCogSolid
							size="1.5em"
							title={t(
								'main.AssessRecipeComponent.labelConfiguration',
							)}
						/>
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
				{!!props.url &&
				assessedTabUrl &&
				props.url !== assessedTabUrl ? (
					<>
						&nbsp;
						<span>
							<TbAlertTriangleFilled
								className="text-(--color-error) inline-block"
								title={t(
									'main.AssessRecipeComponent.notTheAssessedPage',
								)}
							/>
						</span>
					</>
				) : null}
				&nbsp;
				<span>{props.url || ''}</span>
			</p>
		</div>
	);
};

export default AssessRecipeComponent;
