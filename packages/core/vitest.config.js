import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                '__tests__/',
                '*.config.*',
                'dist/',
            ],
        },
        setupFiles: ['./__tests__/setup.ts'],
    },
});
//# sourceMappingURL=vitest.config.js.map