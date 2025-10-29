import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disabled due to .svelte file and chokidar type issues
  clean: true,
  sourcemap: true,
  external: [
    'svelte',
    '@panorama-viewer/core',
    'three',
  ],
  treeshake: true,
  splitting: false,
  minify: false,
})
