import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  jsx: true,
  formatters: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
})
