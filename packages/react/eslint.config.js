import antfu from '@antfu/eslint-config'

export default antfu({
  // React规则暂时禁用以兼容ESLint 8.x
  react: false,
  typescript: true,
  jsx: true,
  formatters: true,
  ignores: ['dist', 'node_modules', '*.d.ts'],
})
