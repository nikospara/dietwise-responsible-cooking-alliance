import { atom } from 'jotai';
import { INITIAL_STATE } from './model';

export const appLayoutStateAtom = atom(INITIAL_STATE);

export const showingConfigurationAtom = atom(
	(get) => get(appLayoutStateAtom).showingConfiguration,
	(get, set, showingConfiguration: boolean) =>
		set(appLayoutStateAtom, { ...get(appLayoutStateAtom), showingConfiguration }),
);
