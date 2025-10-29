import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

// Extend Vitest matchers
expect.extend({
  // Custom matchers can be added here
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock WebGL context for testing
HTMLCanvasElement.prototype.getContext = function (contextId: string) {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return {
      getExtension: () => null,
      getParameter: () => null,
      // Add more WebGL context mocks as needed
    }
  }
  return null
}

// Mock device orientation for gyroscope tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'DeviceOrientationEvent', {
    value: class MockDeviceOrientationEvent extends Event {
      alpha: number | null = 0
      beta: number | null = 0
      gamma: number | null = 0
      absolute = false
    },
  })
}
