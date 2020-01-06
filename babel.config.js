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
  env: {
    test: {
      plugins: ['istanbul'],
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  },
};
