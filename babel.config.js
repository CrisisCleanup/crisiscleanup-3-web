module.exports = {
  presets: [
    ['@babel/preset-env'],
    [
      '@vue/babel-preset-jsx',
      {
        injectH: false,
      },
    ],
    [
      '@vue/app',
      {
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    'lodash',
  ],
  env: {
    storybook: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
    test: {
      plugins: ['require-context-hook'],
      presets: [
        [
          '@babel/preset-env',
          { targets: { node: 'current' }, modules: 'commonjs' },
        ],
      ],
    },
  },
};
