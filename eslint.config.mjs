import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['node_modules/**', 'dist/**', 'eslint.config.mjs'],
  },

  // ESLint + TypeScript config
  tseslint.configs.recommended,

  // Prettier config (must afther others configs)
  eslintConfigPrettier,

  {
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      curly: ['error', 'all'],
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
