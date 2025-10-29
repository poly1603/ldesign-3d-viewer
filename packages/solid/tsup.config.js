import { defineConfig } from 'tsup';
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: false, // Disabled due to chokidar type issues
    clean: true,
    sourcemap: true,
    external: [
        'solid-js',
        '@panorama-viewer/core',
        'three',
    ],
    treeshake: true,
    splitting: false,
    minify: false,
});
//# sourceMappingURL=tsup.config.js.map