import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: true,
  ignores: ['dist', 'node_modules', '*.d.ts'],
})
