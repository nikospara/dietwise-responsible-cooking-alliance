// auth/authService.ts
import { createPKCE } from './pkce';
import { get, set, remove } from '@/configuration/storage';
import { DEFAULT_SETTINGS, type Tokens } from '@/configuration/model';

const CLIENT_ID = 'rca';
const REDIRECT_URI =
	typeof browser !== 'undefined'
		? `moz-extension://${browser.runtime.id}/callback.html`
		: typeof chrome !== 'undefined' && chrome.runtime
			? 'http://localhost:8180/extension-callback.html' // `chrome-extension://${chrome.runtime.id}/callback.html`
			: window.location.href.indexOf('?') >= 0
				? window.location.href.substring(0, window.location.href.indexOf('?'))
				: window.location.href;

class AuthService {
	private async getServerHost(): Promise<string> {
		return (await get<string>('authServerHost')) || DEFAULT_SETTINGS.authServerHost;
	}

	async login() {
		const { verifier, challenge } = await createPKCE();
		const serverHost = await this.getServerHost();

		await set('pkce_verifier', verifier);

		const params = new URLSearchParams({
			client_id: CLIENT_ID,
			response_type: 'code',
			redirect_uri: REDIRECT_URI,
			scope: 'openid profile email offline_access',
			code_challenge: challenge,
			code_challenge_method: 'S256',
		});

		if (typeof browser !== 'undefined') {
			browser.tabs.create({
				url: `${serverHost}/protocol/openid-connect/auth?${params}`,
			});
		} else if (typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined') {
			chrome.tabs.create({
				url: `${serverHost}/protocol/openid-connect/auth?${params}`,
			});
		} else {
			window.location.replace(`${serverHost}/protocol/openid-connect/auth?${params}`);
		}
	}

	async handleCallback(code: string) {
		const verifier = await get<string>('pkce_verifier');
		const serverHost = await this.getServerHost();
		if (!verifier) throw new Error('Missing PKCE verifier');

		const body = new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			redirect_uri: REDIRECT_URI,
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
