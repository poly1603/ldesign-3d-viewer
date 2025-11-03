import { describe, it, expect } from 'vitest'

describe('Basic Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have testing environment', () => {
    expect(true).toBe(true)
  })
})
