const webpackConfig = require('@vue/cli-service/webpack.config');

module.exports = {
  stories: ['../src/**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-a11y/register',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    '@storybook/addon-backgrounds/register'
  ],
  webpackFinal: config => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: webpackConfig.module.rules.concat([
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
        },
      },
    };
  },
};
