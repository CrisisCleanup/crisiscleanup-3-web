module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }],
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
  plugins: ['@babel/plugin-proposal-class-properties'],
  env: {
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  },
};
