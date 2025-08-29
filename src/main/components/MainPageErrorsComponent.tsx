import { TbExclamationCircle } from 'react-icons/tb';

export interface MainPageErrorsComponentProps {
	errors: string[];
}

const MainPageErrorsComponent: React.FC<MainPageErrorsComponentProps> = (
	props,
) => {
	return (
		<div className="shrink grow basis-auto overflow-y-auto">
			<div>
				{props.errors
					? props.errors.map((error, index) => (
							<div
								role="alert"
								className="alert alert-error"
								key={index}
							>
								<TbExclamationCircle />
								<span>{error}</span>
							</div>
						))
					: null}
			</div>
		</div>
	);
};

export default MainPageErrorsComponent;
