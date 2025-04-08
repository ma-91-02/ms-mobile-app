module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    'react-native/react-native': true,
    browser: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React Native rules
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',

    // React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // General rules
    'no-console': 'warn',
    'prettier/prettier': 'warn',
  },
  ignorePatterns: [
    'node_modules/**',
    '.expo/**',
    'dist/**',
    'web-build/**',
    'coverage/**',
    '*.d.ts',
    '*.js.map',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
  ],
};
