/**
 * @panorama-viewer/core 构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 包名
  name: '@panorama-viewer/core',

  // 入口文件
  entry: 'src/index.ts',

  // 输出配置
  output: {
    dir: 'dist',
    formats: ['esm', 'cjs'],
  },

  // 外部依赖（不打包）
  external: [
    'three',
  ],

  // TypeScript
  typescript: {
    // 生成声明文件
    declaration: true,
    // 声明文件目录
    declarationDir: 'dist',
    // tsconfig 路径
    tsconfigPath: './tsconfig.json',
  },

  // 代码分析
  analysis: {
    // 生成构建报告
    report: true,
    // 包体积分析
    bundleSize: true,
  },
})
