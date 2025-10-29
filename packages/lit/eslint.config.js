import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  formatters: true,
  ignores: ['dist', 'node_modules', '*.d.ts'],
})
