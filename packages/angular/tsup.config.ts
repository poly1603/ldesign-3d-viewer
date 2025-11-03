import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    '@angular/core',
    '@angular/common',
    '@panorama-viewer/core',
    'three',
    'rxjs',
  ],
  treeshake: true,
  splitting: false,
  minify: false,
})
