import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    files: ['src/**/*.ts'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin
    },

    rules: {
      ...tseslint.configs.recommended.rules,
      'no-console': 'error'
    }
  }
])
