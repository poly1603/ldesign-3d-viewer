/**
 * @panorama-viewer/vue 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: '@panorama-viewer/vue',
  entry: 'src/index.ts',

  output: {
    dir: 'dist',
    formats: ['esm', 'cjs'],
  },

  external: [
    'vue',
    '@panorama-viewer/core',
    'three',
  ],

  // Vue 插件
  plugins: [
    'vue', // @ldesign/builder 自动识别并使用 Vue 插件
  ],

  typescript: {
    declaration: true,
    declarationDir: 'dist',
  },

  // 样式处理
  css: {
    // 提取 CSS
    extract: true,
    // 输出文件名
    filename: 'style.css',
  },
})
