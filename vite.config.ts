import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import fs from 'node:fs';
import path from 'path';
import { configDefaults } from 'vitest/config';

function browserStaticFilesPlugin(browser: string) {
	return {
		name: 'browser-static-files',
		closeBundle() {
			const browserPublicDir = path.resolve(__dirname, `public-${browser}`);
			const outDir = path.resolve(__dirname, `dist-${browser}`);
			for (const filename of ['manifest.json', 'callback.html', 'callback-content.js']) {
				const source = path.join(browserPublicDir, filename);
				if (!fs.existsSync(source)) continue;
				fs.copyFileSync(source, path.join(outDir, filename));
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

	return {
		plugins: [react(), svgr(), eslintPlugin(), browserStaticFilesPlugin(browser)],
		resolve: {
			tsconfigPaths: true,
			alias: {
				'@': path.resolve('./src'),
			},
		},
		build: {
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
