import { atomWithReducer } from 'jotai/utils';
import { createInitialState, reducer } from 'main/reducer';

export const mainStateAtom = atomWithReducer(createInitialState(), reducer);
