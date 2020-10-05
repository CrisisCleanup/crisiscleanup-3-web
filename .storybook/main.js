const webpackConfig = require('@vue/cli-service/webpack.config');
const path = require('path');
module.exports = {
  stories: ['../src/**/*.stories.@(js|mdx)'],
  addons: [
    '@storybook/addon-storysource',
    '@storybook/addon-actions',
    '@storybook/addon-knobs',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-backgrounds',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
  ],
  parameters: {
    layout: 'centered',
    backgrounds: [
      { name: 'CrisisCleanup Gray', value: '#f9f9f9', default: true },
      { name: 'White', value: '#fff' },
      { name: 'Dark', value: '#4a4a4a' },
    ],
  },
  decorators: [require('@storybook/addon-a11y').withA11y],
  webpackFinal: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: webpackConfig.module.rules.concat([
          {
            test: /\.vue$/,
            loader: 'vue-docgen-loader',
            enforce: 'post',
          },
          {
            test: /\.stories\.jsx?$/,
            loaders: [require.resolve('@storybook/source-loader')],
            enforce: 'pre',
          },
        ]),
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          ...webpackConfig.resolve.alias,
          'core-js/modules': path.resolve(
            __dirname,
            '..',
            'node_modules/core-js/modules',
          ),
        },
      },
    };
  },
};
