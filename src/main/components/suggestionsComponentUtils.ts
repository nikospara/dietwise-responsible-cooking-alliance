import type { Cost } from '@/main/model';

export function makeCostString(cost?: Cost) {
	switch (cost) {
		case 'HI':
			return '€€€';
		case 'LO':
			return '€';
		default:
			return '€€';
	}
}
