const path = require('path');

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    // show eslint errors/warnings in the editor
    path.join(__dirname, 'node_modules/xo/config/plugins.cjs'),
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['tsconfig.json'],
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'import/extensions': 0
  },
};
