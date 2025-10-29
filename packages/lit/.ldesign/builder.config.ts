/**
 * @panorama-viewer/lit 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: '@panorama-viewer/lit',
  entry: 'src/index.ts',

  output: {
    dir: 'dist',
    formats: ['esm', 'cjs'],
  },

  external: [
    'lit',
    '@panorama-viewer/core',
    'three',
  ],

  // Lit 插件
  plugins: [
    'lit',
  ],

  typescript: {
    declaration: true,
    declarationDir: 'dist',
  },
})
