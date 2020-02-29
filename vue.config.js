module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    devtool: 'source-map',
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
      bucket: 'app.staging.crisiscleanup.io',
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
      cloudfrontId: 'E3DNZ4GD3WPDPE',
      cloudfrontMatchers: '/*',
      uploadConcurrency: 5,
      pluginVersion: '4.0.0-rc3',
      cacheControl: 'max-age=86400',
      pwaFiles: 'index.html,app.js',
    },
  },
};
