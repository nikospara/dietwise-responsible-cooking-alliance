import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
	plugins: [tsconfigPaths(), react(), eslintPlugin()],
	resolve: {
		alias: {
			'@': path.resolve('./src'),
		},
	},
});
