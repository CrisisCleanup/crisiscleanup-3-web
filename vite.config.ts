import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import _ from 'lodash';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig(async ({ command }) => {
  const vitePlugins = [
    vue({
      reactivityTransform: true,
    }),
    vueJsx(),
  ];

  const configs: Array<Partial<UserConfig>> = [];
  configs.push(
    {
      define: {
        __VUE_PROD_DEVTOOLS__: true,
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('src', import.meta.url)),
        },
      },
    },
    {
      plugins: vitePlugins,
    },
  );

  return _.merge({}, ...configs) as UserConfig;
});
