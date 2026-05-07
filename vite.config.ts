import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import fs from 'node:fs';
import path from 'path';
import { configDefaults } from 'vitest/config';

const DEFAULT_AUTH_SERVER_HOST = 'http://localhost:8280/realms/dietwise';
const DEFAULT_API_SERVER_HOST = 'http://localhost:8180';

interface ExtensionManifest {
	host_permissions?: string[];
	[key: string]: unknown;
}

function toHostPermissionPattern(host: string | undefined): string | null {
	if (!host) {
		return null;
	}

	const url = new URL(host);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return null;
	}

	return `${url.protocol}//${url.host}/*`;
}

function getBackendHostPermissions(env: Record<string, string>): string[] {
	const permissions = [
		toHostPermissionPattern(env.VITE_AUTH_SERVER_HOST || DEFAULT_AUTH_SERVER_HOST),
		toHostPermissionPattern(env.VITE_API_SERVER_HOST || DEFAULT_API_SERVER_HOST),
	].filter((permission): permission is string => permission !== null);

	return [...new Set(permissions)];
}

function copyManifestWithBackendHostPermissions(source: string, destination: string, backendHostPermissions: string[]) {
	const manifest = JSON.parse(fs.readFileSync(source, 'utf8')) as ExtensionManifest;
	const manifestHostPermissions = manifest.host_permissions || [];
	manifest.host_permissions = [...new Set([...manifestHostPermissions, ...backendHostPermissions])];
	fs.writeFileSync(destination, `${JSON.stringify(manifest, null, '\t')}\n`);
}

function browserStaticFilesPlugin(browser: string, backendHostPermissions: string[]) {
	return {
		name: 'browser-static-files',
		closeBundle() {
			const browserPublicDir = path.resolve(__dirname, `public-${browser}`);
			const outDir = path.resolve(__dirname, `dist-${browser}`);
			for (const filename of ['manifest.json', 'callback.html', 'callback-content.js']) {
				const source = path.join(browserPublicDir, filename);
				if (!fs.existsSync(source)) continue;
				const destination = path.join(outDir, filename);
				if (filename === 'manifest.json') {
					copyManifestWithBackendHostPermissions(source, destination, backendHostPermissions);
				} else {
					fs.copyFileSync(source, destination);
				}
			}
		},
	};
}

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const browser = (env.VITE_TARGET_BROWSER || 'Chrome').toLowerCase();
	const backendHostPermissions = getBackendHostPermissions(env);

	return {
		plugins: [react(), svgr(), eslintPlugin(), browserStaticFilesPlugin(browser, backendHostPermissions)],
		resolve: {
			tsconfigPaths: true,
			alias: {
				'@': path.resolve('./src'),
			},
		},
		build: {
			minify: false,
			sourcemap: true,
			assetsInlineLimit: 0,
			// Set to {} to enable a watched build workflow, null to disable (default).
			watch: env.VITE_WATCH ? {} : null,
			outDir: `dist-${browser}`,
			rollupOptions: {
				input: {
					index: path.resolve(__dirname, 'index.html'),
					background: path.resolve(__dirname, 'src/background.ts'),
				},
				output: {
					entryFileNames: (chunkInfo) => {
						if (chunkInfo.name === 'background') {
							return 'background.js';
						} else {
							return 'assets/[name]-[hash].js';
						}
					},
				},
			},
		},
		test: {
			environment: 'jsdom', // Required for DOM-based tests
			globals: true, // So we can use describe/it/expect directly
			exclude: [...configDefaults.exclude],
			coverage: {
				provider: 'v8',
				reporter: ['text', 'html'],
			},
		},
	};
});
