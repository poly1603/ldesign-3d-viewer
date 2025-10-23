/**
 * @ldesign/builder 配置
 * 3D Panorama Viewer Monorepo 构建配置
 */

import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  // Monorepo 根配置
  root: './',

  // 工作空间包
  workspaces: [
    'packages/core',
    'packages/vue',
    'packages/react',
    'packages/lit',
    'packages/cli',
  ],

  // 全局外部依赖
  external: [
    'three',
    'vue',
    'react',
    'react-dom',
    'lit',
  ],

  // 构建选项
  build: {
    // 输出目录
    outDir: 'dist',

    // 生成格式
    formats: ['esm', 'cjs'],

    // TypeScript 声明文件
    dts: true,

    // 代码压缩
    minify: false, // 库模式不压缩，由使用者决定

    // Source Map
    sourcemap: true,

    // 清理输出目录
    clean: true,
  },

  // 优化选项
  optimization: {
    // Tree Shaking
    treeShaking: true,

    // 代码分割
    codeSplitting: false, // 库模式不分割

    // 并行构建
    parallel: true,
  },

  // 插件
  plugins: [],
});

