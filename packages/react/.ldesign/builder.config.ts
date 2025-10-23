/**
 * @panorama-viewer/react 构建配置
 */

import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  name: '@panorama-viewer/react',
  entry: 'src/index.ts',

  output: {
    dir: 'dist',
    formats: ['esm', 'cjs'],
  },

  external: [
    'react',
    'react-dom',
    '@panorama-viewer/core',
    'three',
  ],

  // React 插件
  plugins: [
    'react',
  ],

  typescript: {
    declaration: true,
    declarationDir: 'dist',
  },
});

