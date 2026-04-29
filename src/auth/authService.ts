// auth/authService.ts
import { createPKCE } from './pkce';
import { get, set, remove } from '@/configuration/storage';
import { AUTH_SERVER_HOST, type Tokens } from '@/configuration/model';

const CLIENT_ID = 'rca';

function isFirefoxExtension(): boolean {
	return (
		typeof browser !== 'undefined' &&
		typeof browser.runtime !== 'undefined' &&
		browser.runtime.getURL('').startsWith('moz-extension://')
	);
}

function isChromeExtension(): boolean {
	return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined';
}

function getWebRedirectUri(): string {
	if (typeof window === 'undefined') {
		throw new Error('Cannot determine OAuth redirect URI outside a browser context');
	}

	const url = new URL(window.location.href);
	url.search = '';
	url.hash = '';
	return url.toString();
}

function getRedirectUri(): string {
	if (isFirefoxExtension()) {
		if (typeof browser.identity !== 'undefined') {
			return browser.identity.getRedirectURL();
		}
		return browser.runtime.getURL('callback.html');
	}

	if (isChromeExtension()) {
		return 'http://localhost:8180/extension-callback.html'; // `chrome-extension://${chrome.runtime.id}/callback.html`
	}

	return getWebRedirectUri();
}

function getAuthorizationCode(callbackUrl: string): string {
	const url = new URL(callbackUrl);
	const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.substring(1) : url.hash);
	const error = url.searchParams.get('error') ?? hashParams.get('error');

	if (error) {
		const description = url.searchParams.get('error_description') ?? hashParams.get('error_description');
		throw new Error(`OAuth authorization failed: ${description ?? error}`);
	}

	const code = url.searchParams.get('code') ?? hashParams.get('code');
	if (!code) {
		throw new Error('OAuth authorization did not return an authorization code');
	}

	return code;
}

class AuthService {
	private async getServerHost(): Promise<string> {
		return AUTH_SERVER_HOST;
	}

	async login(): Promise<Tokens | null> {
		const { verifier, challenge } = await createPKCE();
		const serverHost = await this.getServerHost();
		const redirectUri = getRedirectUri();

		await set('pkce_verifier', verifier);

		const params = new URLSearchParams({
			client_id: CLIENT_ID,
			response_type: 'code',
			redirect_uri: redirectUri,
			scope: 'openid profile email offline_access',
			code_challenge: challenge,
			code_challenge_method: 'S256',
		});
		const authUrl = `${serverHost}/protocol/openid-connect/auth?${params}`;

		if (isFirefoxExtension() && typeof browser.identity !== 'undefined') {
			const callbackUrl = await browser.identity.launchWebAuthFlow({
				url: authUrl,
				interactive: true,
			});
			return this.handleCallback(getAuthorizationCode(callbackUrl), redirectUri);
		} else if (isFirefoxExtension()) {
			browser.tabs.create({
				url: authUrl,
			});
		} else if (isChromeExtension() && typeof chrome.tabs !== 'undefined') {
			chrome.tabs.create({
				url: authUrl,
			});
		} else {
			window.location.replace(authUrl);
		}

		return null;
	}

	async handleCallback(code: string, redirectUri = getRedirectUri()) {
		const verifier = await get<string>('pkce_verifier');
		const serverHost = await this.getServerHost();
		if (!verifier) throw new Error('Missing PKCE verifier');

		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			redirect_uri: redirectUri,
			code,
			code_verifier: verifier,
		});

		const res = await fetch(`${serverHost}/protocol/openid-connect/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});

		const json = await res.json();

		const tokens: Tokens = {
			accessToken: json.access_token,
			refreshToken: json.refresh_token,
			expiresAt: Date.now() + json.expires_in * 1000,
		};

		await set('tokens', tokens);
		await remove('pkce_verifier');

		return tokens;
	}

	async refresh(refreshToken: string) {
		const serverHost = await this.getServerHost();
		const body = new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: CLIENT_ID,
			refresh_token: refreshToken,
		});

		const res = await fetch(`${serverHost}/protocol/openid-connect/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});

		const json = await res.json();

		const tokens: Tokens = {
			accessToken: json.access_token,
			refreshToken: json.refresh_token ?? refreshToken,
			expiresAt: Date.now() + json.expires_in * 1000,
		};

		await set('tokens', tokens);
		return tokens;
	}

	async logout() {
		await remove('tokens');
	}
}

export const authService = new AuthService();
