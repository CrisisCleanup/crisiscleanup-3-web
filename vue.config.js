const threadLoader = require('thread-loader');
// const LodashPlugin = require('lodash-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const Version = require('./package.json').version;
const basicPool = {
  workerParallelJobs: 200,
  name: 'basicPool',
};
if (process.env.NODE_ENV === 'development') {
  threadLoader.warmup(basicPool, ['babel-loader', 'vue-loader']);
}
module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  configureWebpack: () => {
    const common = {
      node: {
        fs: 'empty',
      },
      resolve: {
        symlinks: false,
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
        devtool: '#eval-source-map',
        output: {
          pathinfo: false,
        },
        devServer: {
          hot: true,
          compress: true,
        },
        optimization: {
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        },
        stats: {
          colors: true,
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
  chainWebpack: (config) => {
    const vueRule = config.module.rule('vue');
    const jsRule = config.module.rule('js');

    const useBasicTPool = (rule, loader) => {
      rule.uses.clear();
      rule
        .use('cache-loader')
        .loader('cache-loader')
        .end()
        .use('thread-loader')
        .loader('thread-loader')
        .tap((options) => ({ ...options, ...basicPool }))
        .end()
        .use(loader)
        .loader(loader)
        .end();
    };

    jsRule.test(/\.js$/).exclude.add(/node_modules/);
    if (process.env.NODE_ENV !== 'storybook') {
      useBasicTPool(jsRule, 'babel-loader');
      useBasicTPool(vueRule, 'vue-loader');
    }
    // config.plugin('lodash').use(LodashPlugin);
    if (['staging', 'production'].includes(process.env.VUE_APP_STAGE)) {
      config.plugin('sentry').use(SentryWebpackPlugin, [
        {
          include: '.',
          ignoreFile: '.gitignore',
          ignore: ['node_modules', 'vue.config.js'],
          configFile: 'sentry.properties',
          release: `crisiscleanup-3-web@v${Version}`,
          setCommits: {
            repo: 'CrisisCleanup/crisiscleanup-3-web',
            auto: true,
          },
        },
      ]);
    }
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
  transpileDependencies: [
    '@crisiscleanup/amazon-connect-streams',
    '@crisiscleanup/connect-rtc',
    'bp-vuejs-dropdown',
    'circle-to-polygon',
    'ismobilejs',
  ],
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
