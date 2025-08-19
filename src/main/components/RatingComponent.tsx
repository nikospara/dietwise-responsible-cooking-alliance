import { useTranslation } from 'react-i18next';
import { TbStar, TbStarFilled, TbStarHalfFilled } from 'react-icons/tb';

export interface RatingComponentProps {
	rating: number | undefined;
	max: number;
}

const RatingComponent: React.FC<RatingComponentProps> = (
	props: RatingComponentProps,
) => {
	const { t } = useTranslation();

	const stars = new Array(props.max);
	const rating = typeof props.rating === 'number' ? props.rating : 0;

	for (let i = 0; i < props.max; i++) {
		if (rating > i + 0.5) {
			stars.push(<TbStarFilled className="inline-block" key={i} />);
		} else if (rating > i) {
			stars.push(<TbStarHalfFilled className="inline-block" key={i} />);
		} else {
			stars.push(<TbStar className="inline-block" key={i} />);
		}
	}

	return (
		<div>
			<span className="font-bold">
				{t('main.RatingComponent.rating')}
			</span>
			&nbsp;
			{typeof props.rating === 'number' && <span>{stars}</span>}
		</div>
	);
};

export default RatingComponent;
