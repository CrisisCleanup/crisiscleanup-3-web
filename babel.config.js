module.exports = {
  presets: [
    '@babel/preset-flow',
    ['@babel/preset-env'],
    'vca-jsx',
    [
      '@vue/app',
      {
        useBuiltIns: 'usage',
      },
    ],
  ],
  plugins: [
    // @compat: decorators needs to come
    // before class properties
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    'lodash',
  ],
  env: {
    storybook: {
      presets: ['@babel/preset-flow', ['@babel/preset-env']],
      plugins: [
        // @compat: decorators needs to come
        // before class properties
        [
          '@babel/plugin-proposal-decorators',
          {
            legacy: true,
          },
        ],
        ['@babel/plugin-proposal-class-properties'],
      ],
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
