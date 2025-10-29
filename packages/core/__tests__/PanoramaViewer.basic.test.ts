import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PanoramaViewer } from '../src/PanoramaViewer'
import type { ViewerOptions } from '../src/types'

/**
 * Note: These integration tests require a full WebGL context from Three.js
 * Current mock environment doesn't fully support Three.js WebGLRenderer initialization
 * TODO: Use @vitest/browser or run these tests in a real browser environment
 */
describe.skip('panoramaViewer - Basic Tests', () => {
  let container: HTMLDivElement
  let viewer: PanoramaViewer | null = null

  beforeEach(() => {
    // Create a container element for each test
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Cleanup after each test
    if (viewer) {
      viewer.dispose()
      viewer = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('initialization', () => {
    it('should create a viewer instance with valid options', () => {
      const options: ViewerOptions = {
        container,
        image: '/test-panorama.jpg',
      }

      viewer = new PanoramaViewer(options)

      expect(viewer).toBeDefined()
      expect(viewer).toBeInstanceOf(PanoramaViewer)
    })

    it('should throw error when WebGL is not supported', () => {
      // Mock WebGL as unsupported
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

      expect(() => {
        viewer = new PanoramaViewer({
          container,
          image: '/test.jpg',
        })
      }).toThrow('WebGL is not supported')

      // Restore
      HTMLCanvasElement.prototype.getContext = originalGetContext
    })

    it('should set default options correctly', () => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })

      const rotation = viewer.getRotation()
      expect(rotation).toBeDefined()
      expect(rotation).toHaveProperty('x')
      expect(rotation).toHaveProperty('y')
      expect(rotation).toHaveProperty('z')
    })

    it('should accept custom fov option', () => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
        fov: 90,
      })

      expect(viewer).toBeDefined()
      // Custom fov should be applied
    })
  })

  describe('camera Control', () => {
    beforeEach(() => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })
    })

    it('should get current rotation', () => {
      const rotation = viewer!.getRotation()

      expect(rotation).toBeDefined()
      expect(typeof rotation.x).toBe('number')
      expect(typeof rotation.y).toBe('number')
      expect(typeof rotation.z).toBe('number')
    })

    it('should set rotation', () => {
      viewer!.setRotation(1, 2, 3)
      const rotation = viewer!.getRotation()

      expect(rotation.x).toBeCloseTo(1, 1)
      expect(rotation.y).toBeCloseTo(2, 1)
      expect(rotation.z).toBeCloseTo(3, 1)
    })

    it('should reset camera to initial position', () => {
      viewer!.setRotation(1, 2, 3)
      viewer!.reset()

      const rotation = viewer!.getRotation()
      expect(rotation.x).toBeCloseTo(0, 1)
      expect(rotation.y).toBeCloseTo(0, 1)
    })
  })

  describe('auto Rotation', () => {
    beforeEach(() => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })
    })

    it('should enable auto rotation', () => {
      viewer!.enableAutoRotate()
      // Auto rotation should be enabled
      expect(viewer).toBeDefined()
    })

    it('should disable auto rotation', () => {
      viewer!.enableAutoRotate()
      viewer!.disableAutoRotate()
      // Auto rotation should be disabled
      expect(viewer).toBeDefined()
    })
  })

  describe('hotspots', () => {
    beforeEach(() => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })
    })

    it('should add a hotspot', () => {
      const hotspot = {
        id: 'test-1',
        position: { theta: 0, phi: 0 },
        label: 'Test Hotspot',
      }

      viewer!.addHotspot(hotspot)
      const hotspots = viewer!.getHotspots()

      expect(hotspots).toHaveLength(1)
      expect(hotspots[0].id).toBe('test-1')
      expect(hotspots[0].label).toBe('Test Hotspot')
    })

    it('should remove a hotspot', () => {
      const hotspot = {
        id: 'test-1',
        position: { theta: 0, phi: 0 },
      }

      viewer!.addHotspot(hotspot)
      expect(viewer!.getHotspots()).toHaveLength(1)

      viewer!.removeHotspot('test-1')
      expect(viewer!.getHotspots()).toHaveLength(0)
    })

    it('should get all hotspots', () => {
      viewer!.addHotspot({ id: '1', position: { theta: 0, phi: 0 } })
      viewer!.addHotspot({ id: '2', position: { theta: 1, phi: 1 } })

      const hotspots = viewer!.getHotspots()
      expect(hotspots).toHaveLength(2)
    })
  })

  describe('resource Cleanup', () => {
    it('should dispose resources properly', () => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })

      // Should not throw error
      expect(() => viewer!.dispose()).not.toThrow()
    })

    it('should not crash when disposing twice', () => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })

      viewer.dispose()
      // Second dispose should be safe
      expect(() => viewer!.dispose()).not.toThrow()
    })
  })

  describe('screenshot', () => {
    beforeEach(() => {
      viewer = new PanoramaViewer({
        container,
        image: '/test.jpg',
      })
    })

    it('should generate a screenshot', () => {
      const screenshot = viewer!.screenshot()

      expect(screenshot).toBeDefined()
      expect(typeof screenshot).toBe('string')
      expect(screenshot).toMatch(/^data:image\/png/)
    })

    it('should generate screenshot with custom dimensions', () => {
      const screenshot = viewer!.screenshot(1920, 1080)

      expect(screenshot).toBeDefined()
      expect(typeof screenshot).toBe('string')
    })
  })
})
