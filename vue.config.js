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
  pluginOptions: (() => {
    const stages = {
      staging: {
        bucket: 'app.staging.crisiscleanup.io',
        cloudfrontId: 'E3DNZ4GD3WPDPE',
      },
      development: {
        bucket: 'app.dev.crisiscleanup.io',
        cloudfrontId: 'E3NVMNFXV1CDMX',
      },
    };
    return {
      s3Deploy: {
        registry: undefined,
        awsProfile: 'default',
        region: 'us-east-2',
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
        cloudfrontMatchers: '/*',
        uploadConcurrency: 5,
        pluginVersion: '4.0.0-rc3',
        cacheControl: 'max-age=86400',
        pwaFiles: 'index.html,app.js',
        ...stages[process.env.NODE_ENV || 'development'],
      },
    };
  })(),
};
