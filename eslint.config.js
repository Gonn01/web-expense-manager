import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginA11y from 'eslint-plugin-jsx-a11y';
import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginPrettier from 'eslint-plugin-prettier';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    { ignores: ['node_modules', 'dist', 'build', 'public', '*.html', 'index.html'] },

    js.configs.recommended,
    pluginReact.configs.flat.recommended,

    prettier,

    {
        files: ['**/*.{js,jsx}'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },

        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                node: { extensions: ['.js', '.jsx'] },
                alias: { map: [['@', './src']], extensions: ['.js', '.jsx'] },
            },
        },

        plugins: {
            react: pluginReact,
            'react-hooks': pluginReactHooks,
            'jsx-a11y': pluginA11y,
            import: pluginImport,
            unicorn: pluginUnicorn,
            prettier: pluginPrettier,
        },

        rules: {
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',

            'react/jsx-uses-vars': 'error',

            'no-empty': ['error', { allowEmptyCatch: true }],

            'react/jsx-no-undef': ['error', { allowGlobals: false }],

            'import/no-unresolved': 'error',

            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'unicorn/prefer-query-selector': 'warn',
            'unicorn/filename-case': ['warn', { cases: { pascalCase: true, kebabCase: true } }],

            'prettier/prettier': 'warn',
        },
    },
];
