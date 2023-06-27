import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import _ from 'lodash';
import * as vitest from 'vitest';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import autoImport from 'unplugin-auto-import/vite';
import inspect from 'vite-plugin-inspect';
import inspector from 'vite-plugin-vue-inspector';
import postcssConfig from './postcss.config.cjs';

export default defineConfig(async ({ command }) => {
  const vitePlugins = [
    vue({
      reactivityTransform: true,
    }),
    vueJsx(),
    // https://github.com/antfu/unplugin-auto-import
    autoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        'vue/macros',
        'vuex',
        'vitest', // see: https://vitest.dev/config/#globals
        '@vueuse/core',
        {
          '@/hooks/useApi': ['useApi'],
        },
      ],
      dts: 'src/types/auto-imports.d.ts',
      dirs: ['src/stores'],
      vueTemplate: true,
      // Generate corresponding .eslintrc-auto-import.json file.
      // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    // https://github.com/antfu/vite-plugin-inspect
    inspect(),
    // https://github.com/webfansplz/vite-plugin-vue-inspector
    inspector(),
  ];

  const configs: Array<Partial<UserConfig>> = [];
  configs.push(
    {
      optimizeDeps: {
        include: ['tailwind.config'],
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('src', import.meta.url)),
          'tailwind.config': fileURLToPath(
            new URL('tailwind.config.cjs', import.meta.url),
          ),
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
      setupFiles: ['./test/setupTests.ts', 'fake-indexeddb/auto'],
      globals: true,
      environment: 'happy-dom',
      deps: {
        inline: ['@vue', '@vueuse'],
      },
      coverage: {
        provider: 'c8',
        reporter: ['text', 'json', 'html'],
      },
      globalSetup: './test/globalSetup.ts',
    },
  });

  return _.merge({}, ...configs) as UserConfig;
});
