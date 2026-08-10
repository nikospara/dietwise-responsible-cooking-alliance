import { defineConfig, loadEnv, parseAst } from 'vite';
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
	background?: {
		scripts?: string[];
		service_worker?: string;
		type?: string;
	};
	[key: string]: unknown;
}

const MODULE_SYNTAX_NODES = [
	'ImportDeclaration',
	'ExportNamedDeclaration',
	'ExportDefaultDeclaration',
	'ExportAllDeclaration',
];

function usesModuleSyntax(file: string): boolean {
	const ast = parseAst(fs.readFileSync(file, 'utf8'));
	return ast.body.some((node) => MODULE_SYNTAX_NODES.includes(node.type));
}

/**
 * A background script declared without `"type": "module"` is loaded as a classic script, and a
 * classic script containing import/export fails to parse, silently taking the whole background
 * script down with it.
 */
function assertBackgroundScriptsMatchManifestType(outDir: string) {
	const manifestPath = path.join(outDir, 'manifest.json');
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ExtensionManifest;
	const background = manifest.background;
	if (!background || background.type === 'module') {
		return;
	}

	const declaredScripts = background.scripts || (background.service_worker ? [background.service_worker] : []);
	const moduleScripts = declaredScripts.filter((script) => usesModuleSyntax(path.join(outDir, script)));

	if (moduleScripts.length > 0) {
		throw new Error(
			`${manifestPath} declares background script(s) ${moduleScripts.join(', ')} without "type": "module", ` +
				'but the bundle uses import/export. The browser cannot parse it and the background script never runs.',
		);
	}
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
			const browserPublicDir = path.resolve(import.meta.dirname, `public-${browser}`);
			const outDir = path.resolve(import.meta.dirname, `dist-${browser}`);
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
			assertBackgroundScriptsMatchManifestType(outDir);
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
					index: path.resolve(import.meta.dirname, 'index.html'),
					background: path.resolve(import.meta.dirname, 'src/background.ts'),
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
