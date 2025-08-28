import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const browser = (env.VITE_TARGET_BROWSER || 'Chrome').toLowerCase();

	const viteStaticCopyCfg = viteStaticCopy({
		targets: [
			{
				src: `public-${browser}/manifest.json`,
				dest: '',
				overwrite: true,
			},
		],
	});

	return {
		plugins: [tsconfigPaths(), react(), eslintPlugin(), viteStaticCopyCfg],
		resolve: {
			alias: {
				'@': path.resolve('./src'),
			},
		},
		build: {
			// Set to {} to enable a watched build workflow, null to disable (default).
			watch: env.VITE_WATCH ? {} : null,
			outDir: `dist-${browser}`,
		},
	};
});
