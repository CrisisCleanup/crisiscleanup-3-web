module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  configureWebpack: () => {
    const common = {
      node: {
        fs: 'empty',
      },
      resolve: {
        alias: {
          ejs: 'ejs/ejs.min.js',
          fs: '@/utils/virtual-fs.js',
        },
      },
      module: {
        rules: [
          {
            test: /\.(xml|xsd)$/i,
            use: 'raw-loader',
          },
        ],
      },
    };
    if (!(process.env.NODE_ENV === 'production')) {
      return {
        devtool: 'inline-source-map',
        devServer: {
          hot: true,
          compress: true,
        },
        ...common,
      };
    }
    return {
      ...common,
      resolve: {
        alias: {
          ...common.resolve.alias,
          'vue-types': require.resolve('vue-types/es/shim.js'),
        },
      },
    };
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
      production: {
        bucket: 'crisiscleanup.org',
        cloudfrontId: 'E2U3CWNPC4HAN7',
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
        ...stages[process.env.VUE_APP_STAGE || 'development'],
      },
    };
  })(),
};
