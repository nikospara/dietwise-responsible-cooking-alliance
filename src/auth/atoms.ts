import { atom } from 'jotai';
import { authService } from 'auth/authService';
import { get } from 'configuration/storage';
import type { Tokens } from 'configuration/model';

export const tokensAtom = atom<Tokens | null>(null);

export const loadTokensAtom = atom(null, async (_, set) => {
	const tokens = await get<Tokens>('tokens');
	set(tokensAtom, tokens);
});

export const loginAtom = atom(null, async () => {
	await authService.login();
});

export const logoutAtom = atom(null, async (_, set) => {
	await authService.logout();
	set(tokensAtom, null);
});

export const ensureValidTokenAtom = atom(
	(get) => get(tokensAtom),
	async (get, set) => {
		const tokens = get(tokensAtom);
		if (!tokens) return null;

		if (Date.now() < tokens.expiresAt - 30_000) {
			return tokens.accessToken;
		}

		const refreshed = await authService.refresh(tokens.refreshToken);
		set(tokensAtom, refreshed);
		return refreshed.accessToken;
	},
);
