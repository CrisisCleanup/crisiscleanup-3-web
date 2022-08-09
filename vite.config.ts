import { URL, fileURLToPath } from 'node:url';
import { defineConfig, UserConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsxPlugin from '@vitejs/plugin-vue-jsx';
import postcssConfig from './postcss.config';

export default defineConfig(() => {
  const config: UserConfig = {
    plugins: [
      /**
       * TODO: remove compilerOptions this when app is fully migrated to vue3
       * for vue2 <-> vue3 compatibility
       */
      vuePlugin({
        template: {
          compilerOptions: {
            compatConfig: {
              MODE: 2,
            },
          },
        },
      }),
      vueJsxPlugin(),
    ],
    server: {
      port: 8080,
    },
    css: {
      postcss: {
        from: './src/index.css',
        plugins: postcssConfig.plugins,
      },
    },
    resolve: {
      alias: {
        /**
         * TODO: remove this when app is fully migrated to vue3
         * for vue2 <-> vue3 compatibility
         */
        vue: '@vue/compat',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '/@/': fileURLToPath(new URL('./src', import.meta.url)),
        ejs: fileURLToPath(new URL('ejs/ejs.min.js', import.meta.url)),
        fs: fileURLToPath(
          new URL('./src/utils/virtual-fs.js', import.meta.url),
        ),
      },
    },
  };
  return config;
});
