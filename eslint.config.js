import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: true,
  formatters: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  ignores: [
    '**/dist/**',
    '**/node_modules/**',
    '**/.ldesign/**',
    '**/coverage/**',
    '**/*.min.js',
  ],
})
