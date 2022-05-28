const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8'),
);

module.exports = {
  parser: 'vue-eslint-parser',

  env: {
    jest: true,
    browser: true,
    es6: true,
    node: true,
    'cypress/globals': true,
  },

  plugins: ['vue', 'flowtype', 'cypress'],

  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:vue/strongly-recommended',
    'plugin:prettier/recommended',
    'prettier/babel',
    'prettier/vue',
    'plugin:cypress/recommended',
    'plugin:vue-types/recommended',
    'plugin:flowtype/recommended',
  ],

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    connect: 'readonly',
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  rules: {
    'import/imports-first': 0,
    'import/extensions': 0,
    'import/newline-after-import': 0,
    'import/no-dynamic-require': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-named-as-default': 0,
    'import/no-unresolved': 2,
    'import/no-webpack-loader-syntax': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    'prettier/prettier': ['error', prettierOptions],
    'new-cap': 0,
    'no-underscore-dangle': 0,
    'no-plusplus': 0,
    radix: 0,
    'no-console': 0,
    // TODO: mitigate in the future
    'no-param-reassign': ['error', { props: false }],
    camelcase: 0,
    'global-require': 0,
    'func-names': 0,
    // Vue specific rules
    'vue/max-attributes-per-line': 'off',
  },

  settings: {
    'import/resolver': {
      webpack: {
        config: './node_modules/@vue/cli-service/webpack.config.js',
      },
    },
  },

  'extends': [
    'eslint:recommended',
    'airbnb-base',
    'plugin:vue/strongly-recommended',
    'plugin:prettier/recommended',
    'prettier/babel',
    'prettier/vue',
    'plugin:cypress/recommended',
    'plugin:vue-types/recommended',
    'plugin:flowtype/recommended',
    '@vue/typescript'
  ]
};
