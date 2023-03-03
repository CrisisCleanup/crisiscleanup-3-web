const path = require('path');

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended', // See: https://eslint.vuejs.org/user-guide/#bundle-configurations
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    // show eslint errors/warnings in the editor
    path.join(__dirname, 'node_modules/xo/config/plugins.cjs'),
    // for unplugin-auto-import
    './.eslintrc-auto-import.json',
  ],
  // See: https://eslint.vuejs.org/user-guide/#how-to-use-a-custom-parser
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'warn',
    'n/file-extension-in-import': 'off',
    'import/extensions': 0,
    'import/no-anonymous-default-export': 0,
    // This rule is giving false positives on VueX find methods
    'unicorn/no-array-callback-reference': 0,
    'unicorn/filename-case': 0,
    'unicorn/prevent-abbreviations': 0,
    'unicorn/no-array-reduce': 0,
    '@typescript-eslint/naming-convention': 0,
    'import/no-unassigned-import': 0,
    'vue/multi-word-component-names': 'warn',
    'import/no-cycle': 0,
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'vue/multi-word-component-names': 'warn',
        'vue/no-reserved-component-names': 'warn',
      },
    },
  ],
};
