import { URL, fileURLToPath } from 'node:url';
import { defineConfig, UserConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsxPlugin from '@vitejs/plugin-vue-jsx';

export default defineConfig(() => {
  const config: UserConfig = {
    plugins: [vuePlugin(), vueJsxPlugin()],
    server: {
      port: 8080,
    },
    resolve: {
      alias: {
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
