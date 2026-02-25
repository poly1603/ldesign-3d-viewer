import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// GitHub Pages 部署时会通过环境变量传入 base 路径
const base = process.env.VITE_BASE_URL || './';

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3002,
    open: true,
    host: true,
  },
});
