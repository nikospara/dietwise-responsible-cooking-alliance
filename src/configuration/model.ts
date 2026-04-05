export type Tokens = {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
};

export interface Settings {
	language: string;
	authServerHost: string;
	apiServerHost: string;
	tokens?: Tokens;
	pkce_verifier?: string;
}

export const DEFAULT_SETTINGS: Settings = Object.freeze({
	language: 'en',
	authServerHost: 'http://localhost:8280/realms/dietwise',
	apiServerHost: 'http://localhost:8180/api/v1',
});
