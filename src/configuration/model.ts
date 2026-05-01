export type Tokens = {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
};

export interface Settings {
	language: string;
	country: string | null;
}

export const DEFAULT_SETTINGS: Settings = Object.freeze({
	language: 'en',
	country: null,
});

export const AUTH_SERVER_HOST = import.meta.env.VITE_AUTH_SERVER_HOST || 'http://localhost:8280/realms/dietwise';
export const API_SERVER_HOST = import.meta.env.VITE_API_SERVER_HOST || 'http://localhost:8180';
