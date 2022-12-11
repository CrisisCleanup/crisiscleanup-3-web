import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import _ from 'lodash';
import * as vitest from 'vitest';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import postcssConfig from './postcss.config.cjs';

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
      // Css: {
      //   postcss: {
      //     plugins: postcssConfig.plugins,
      //   },
      // },
      optimizeDeps: {
        include: ['tailwind.config'],
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('src', import.meta.url)),
          'tailwind.config': path.resolve(__dirname, 'tailwind.config.cjs'),
        },
      },
    },
    {
      plugins: vitePlugins,
    },
  );

  if (command === 'build') {
    // Do something
  } else {
    // Do something else
  }

  // Vitest config
  configs.push({
    test: {
      include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
      globals: true,
      environment: 'happy-dom',
      deps: {
        inline: ['@vue', '@vueuse'],
      },
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html'],
      },
    },
  });

  return _.merge({}, ...configs) as UserConfig;
});
