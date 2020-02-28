const webpackConfig = require('@vue/cli-service/webpack.config');

module.exports = {
  stories: ['../src/**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-a11y/register',
    '@storybook/addon-links',
  ],
  webpackFinal: config => {
    return {
      ...config,
      module: { ...config.module, rules: webpackConfig.module.rules },
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
