import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import pluginPrettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  // Optionally, specify config file name
  // recommendedConfig: '.eslintrc.cjs'
});

export default tseslint.config(
  // This is the main configuration object with files, ignores, languageOptions, etc.
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: [
      'dist',
      '.eslintrc.cjs',
      'postcss.config.js',
      'tailwind.config.js',
      'vite.config.ts',
      'eslint.config.js', // Ignore itself
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-refresh': pluginReactRefresh,
      prettier: pluginPrettier,
    },
    rules: {

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Adjusted rule for TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '_', varsIgnorePattern: '_' },
      ],
      // Rules often disabled in favor of TypeScript or new React JSX transform
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      // Prettier rule integration
      'prettier/prettier': 'warn',
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },

  // --- Extended Configurations ---
  // These are separate config objects or arrays provided as additional arguments
  // to tseslint.config. Use the spread operator (...) for arrays.

  ...compat.extends(pluginReact.configs.recommended),

  pluginReactHooks.configs.recommended, // React hooks recommended rules (often a single object)

  pluginJs.configs.recommended, // Standard JS recommended rules (often a single object)

  ...tseslint.configs.recommended, // Spread the array returned by tseslint.configs.recommended
);
