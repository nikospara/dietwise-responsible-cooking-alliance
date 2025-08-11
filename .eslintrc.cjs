/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
		es6: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		// ES2021 syntax support
		ecmaVersion: 2021,
		sourceType: 'module',
		ecmaFeatures: {
			// Enable JSX parsing
			jsx: true,
		},
	},
	globals: {
		// For browser-based globals
		window: 'readonly',
		document: 'readonly',
		Edit: 'writable',
		console: 'writable',
		_: 'writable',
		$: 'writable',
	},
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:import-x/recommended',
		'plugin:import-x/typescript',
		// Make prettier as the last item in the extends array, so that it has the opportunity to override other configs
		'plugin:prettier/recommended',
	],
	settings: {
		react: {
			version: 'detect',
		},
		'import-x/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		// https://devrsi0n.com/articles/eslint-typescript-import-unsolve
		'import-x/resolver': {
			typescript: true,
			node: true,
		},
	},
	rules: {
		'@typescript-eslint/no-unused-vars': 'warn',
		'react/jsx-curly-brace-presence': 'warn',
		'react/jsx-no-leaked-render': 'warn',
		quotes: ['warn', 'single'],
		'arrow-body-style': 'off',
		'prefer-arrow-callback': 'off',
		'prettier/prettier': 'warn',
		'react-hooks/exhaustive-deps': 'warn',
		'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				prefer: 'type-imports',
				fixStyle: 'separate-type-imports',
			},
		],
	},
};
