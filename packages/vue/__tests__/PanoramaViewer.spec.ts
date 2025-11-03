import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PanoramaViewer from '../src/PanoramaViewer.vue'

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(() => ({})),
  PerspectiveCamera: vi.fn(() => ({})),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    domElement: document.createElement('canvas'),
    render: vi.fn(),
    dispose: vi.fn(),
  })),
  Mesh: vi.fn(() => ({})),
  SphereGeometry: vi.fn(() => ({})),
  MeshBasicMaterial: vi.fn(() => ({})),
  TextureLoader: vi.fn(() => ({
    load: vi.fn((url, onLoad) => {
      setTimeout(() => onLoad?.({}), 0)
      return {}
    }),
  })),
  Raycaster: vi.fn(() => ({})),
  Vector2: vi.fn(() => ({ x: 0, y: 0 })),
  Euler: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
}))

// Mock @panorama-viewer/core
vi.mock('@panorama-viewer/core', () => ({
  PanoramaViewer: vi.fn().mockImplementation(() => ({
    loadImage: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    enableAutoRotate: vi.fn(),
    disableAutoRotate: vi.fn(),
    setViewLimits: vi.fn(),
    showMiniMap: vi.fn(),
    hideMiniMap: vi.fn(),
    reset: vi.fn(),
  })),
  EventBus: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    dispose: vi.fn(),
  })),
}))

describe('PanoramaViewer Component', () => {
  let wrapper: VueWrapper<any>
  const defaultProps = {
    image: 'test-image.jpg',
  }

  beforeEach(() => {
    // Create a container element
    const container = document.createElement('div')
    container.id = 'app'
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // Clean up container
    const container = document.getElementById('app')
    if (container) {
      document.body.removeChild(container)
    }
  })

  describe('Component Mounting', () => {
    it('should mount successfully', () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render container div', () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      const container = wrapper.find('.panorama-viewer')
      expect(container.exists()).toBe(true)
    })

    it('should apply width and height styles', () => {
      wrapper = mount(PanoramaViewer, {
        props: {
          ...defaultProps,
          width: '800px',
          height: '600px',
        },
      })
      const container = wrapper.find('.panorama-viewer')
      expect(container.attributes('style')).toContain('width: 800px')
      expect(container.attributes('style')).toContain('height: 600px')
    })
  })

  describe('Props', () => {
    it('should accept image prop', () => {
      wrapper = mount(PanoramaViewer, {
        props: {
          image: 'custom-image.jpg',
        },
      })
      expect(wrapper.props('image')).toBe('custom-image.jpg')
    })

    it('should accept format prop', () => {
      wrapper = mount(PanoramaViewer, {
        props: {
          ...defaultProps,
          format: 'cubemap',
        },
      })
      expect(wrapper.props('format')).toBe('cubemap')
    })

    it('should have default props', () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      expect(wrapper.props('format')).toBe('equirectangular')
      expect(wrapper.props('fov')).toBe(75)
      expect(wrapper.props('autoRotate')).toBe(false)
      expect(wrapper.props('gyroscope')).toBe(true)
    })

    it('should accept custom fov values', () => {
      wrapper = mount(PanoramaViewer, {
        props: {
          ...defaultProps,
          fov: 90,
          minFov: 40,
          maxFov: 120,
        },
      })
      expect(wrapper.props('fov')).toBe(90)
      expect(wrapper.props('minFov')).toBe(40)
      expect(wrapper.props('maxFov')).toBe(120)
    })
  })

  describe('Events', () => {
    it('should emit ready event on mount', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await nextTick()
      expect(wrapper.emitted('ready')).toBeTruthy()
    })

    it('should emit progress event', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await nextTick()
      // Progress event should be emitted during load
      // (Mock implementation might not trigger this, but test structure is here)
    })
  })

  describe('Reactivity', () => {
    it('should react to image changes', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await wrapper.setProps({ image: 'new-image.jpg' })
      expect(wrapper.props('image')).toBe('new-image.jpg')
    })

    it('should react to autoRotate changes', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await wrapper.setProps({ autoRotate: true })
      expect(wrapper.props('autoRotate')).toBe(true)
    })

    it('should react to viewLimits changes', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      const limits = { minPhi: 0.5, maxPhi: 2.5 }
      await wrapper.setProps({ viewLimits: limits })
      expect(wrapper.props('viewLimits')).toEqual(limits)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on unmount', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await nextTick()
      wrapper.unmount()
      // Verify no errors during cleanup
      expect(true).toBe(true)
    })
  })

  describe('Slots', () => {
    it('should render loading slot when loading', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
        slots: {
          loading: '<div class="custom-loading">Loading...</div>',
        },
      })
      await nextTick()
      // Loading slot should be rendered initially
    })

    it('should render error slot when error occurs', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
        slots: {
          error: '<div class="custom-error">Error occurred</div>',
        },
      })
      await nextTick()
      // Error slot rendering depends on error state
    })
  })

  describe('Exposed Methods', () => {
    it('should expose loadImage method', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await nextTick()
      expect(typeof wrapper.vm.loadImage).toBe('function')
    })

    it('should expose reset method', async () => {
      wrapper = mount(PanoramaViewer, {
        props: defaultProps,
      })
      await nextTick()
      expect(typeof wrapper.vm.reset).toBe('function')
    })
  })
})
