import { atom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import { createInitialState, reducer } from '@/main/reducer';
import type { MainAction } from '@/main/actions';
import type { MainData } from '@/main/model';

export const mainStateAtom = atomWithReducer<MainData, MainAction>(createInitialState(), reducer);

export const suggestionInFlightAtom = atom<Record<string, boolean>>({});
