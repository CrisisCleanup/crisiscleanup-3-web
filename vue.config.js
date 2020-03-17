module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  configureWebpack: () => {
    if (!(process.env.NODE_ENV === 'production')) {
      return {
        devtool: 'inline-source-map',
        devServer: {
          hot: true,
        },
      };
    }
    return {};
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          'primary-color': '#FECE09',
          'link-color': '#FECE09',
          'text-color': '#000000',
          'layout-header-background': '#353535',
          'font-family': "'Nunito Sans', sans-serif",
        },
        javascriptEnabled: true,
      },
    },
  },
  pluginOptions: {
    s3Deploy: {
      registry: undefined,
      awsProfile: 'default',
      region: 'us-east-2',
      bucket: 'app.dev.crisiscleanup.io',
      createBucket: true,
      staticHosting: true,
      staticIndexPage: 'index.html',
      staticErrorPage: 'index.html',
      assetPath: 'dist',
      assetMatch: '**',
      deployPath: '/',
      acl: 'public-read',
      pwa: true,
      enableCloudfront: true,
      cloudfrontId: 'E30EMJPSSZIB2U',
      cloudfrontMatchers: '/*',
      uploadConcurrency: 5,
      pluginVersion: '4.0.0-rc3',
      cacheControl: 'max-age=86400',
      pwaFiles: 'index.html,app.js',
    },
  },
};
