const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', 'coverage/*', '.expo/*'],
  },
  {
    files: ['jest.setup.tsx', '**/__mocks__/**'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]);
