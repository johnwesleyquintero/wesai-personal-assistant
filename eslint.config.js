import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import pluginPrettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'babel-worker.ts'],
  },
  {
    // 💡 Restrict typed linting only to TypeScript files covered by tsconfig
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true, // ✅ Enables type-aware linting
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-refresh': pluginReactRefresh,
      prettier: pluginPrettier,
      react: pluginReact,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '_', varsIgnorePattern: '_', caughtErrorsIgnorePattern: '_' },
      ],
      'prettier/prettier': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'react/self-closing-comp': ['warn', { component: true, html: true }],
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/function-component-definition': [
        'warn',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/hook-use-state': ['warn'],
      'react/destructuring-assignment': ['warn', 'always'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: true },
      ],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
  },

  // Non-TS files: JS-only config (no type-aware rules)
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // --- Shared Configs ---
  ...compat.extends('plugin:react/recommended'),
  ...compat.extends('plugin:react-hooks/recommended'),
  pluginJs.configs.recommended,

  // ✅ Use the base recommended config for all files
  ...tseslint.configs.recommended,

  // ✅ Add the type-checked config ONLY for TS files (already scoped above)
  {
    settings: {
      react: { version: 'detect' }, // Add this to resolve the React version warning
    },
    rules: {
      'react/prop-types': 'off', // Explicitly turn off again after extends
      'react/display-name': 'off', // Explicitly turn off again after extends
      'react/react-in-jsx-scope': 'off', // Explicitly turn off again after extends
    },
  },
);
