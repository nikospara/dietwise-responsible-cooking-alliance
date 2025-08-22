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
	build: {
		// Set to {} to enable a watched build workflow, null to disable (default).
		// If only it could be defined in the command line.
		watch: null,
	},
});
