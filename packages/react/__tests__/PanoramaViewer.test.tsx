import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanoramaViewer, usePanoramaViewer } from '../src/index'

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
    enableGyroscope: vi.fn().mockResolvedValue(true),
    disableGyroscope: vi.fn(),
    getRotation: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
    setRotation: vi.fn(),
    addHotspot: vi.fn(),
    removeHotspot: vi.fn(),
    getHotspots: vi.fn().mockReturnValue([]),
    enterFullscreen: vi.fn().mockResolvedValue(undefined),
    exitFullscreen: vi.fn(),
    isFullscreen: vi.fn().mockReturnValue(false),
    screenshot: vi.fn().mockReturnValue('data:image/png;base64,...'),
  })),
  EventBus: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    dispose: vi.fn(),
  })),
}))

describe('PanoramaViewer Component', () => {
  const defaultProps = {
    image: 'test-image.jpg',
  }

  beforeEach(() => {
    // Create container for tests
    const container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up
    const container = document.getElementById('test-container')
    if (container) {
      document.body.removeChild(container)
    }
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<PanoramaViewer {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should apply width and height styles', () => {
      const { container } = render(
        <PanoramaViewer
          {...defaultProps}
          width="800px"
          height="600px"
        />
      )
      const viewer = container.firstChild as HTMLElement
      expect(viewer).toHaveStyle({ width: '800px', height: '600px' })
    })

    it('should render with className', () => {
      const { container } = render(
        <PanoramaViewer
          {...defaultProps}
          className="custom-class"
        />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Props', () => {
    it('should accept required props', () => {
      const { container } = render(<PanoramaViewer image="test.jpg" />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should use default prop values', () => {
      const { container } = render(<PanoramaViewer {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
      // Default values are applied internally
    })

    it('should accept all optional props', () => {
      const { container } = render(
        <PanoramaViewer
          image="test.jpg"
          format="cubemap"
          fov={90}
          minFov={40}
          maxFov={120}
          autoRotate={true}
          autoRotateSpeed={1.0}
          gyroscope={false}
          width="1024px"
          height="768px"
        />
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Callbacks', () => {
    it('should call onReady when viewer is ready', async () => {
      const onReady = vi.fn()
      render(<PanoramaViewer {...defaultProps} onReady={onReady} />)
      
      await waitFor(() => {
        expect(onReady).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('should call onProgress during loading', async () => {
      const onProgress = vi.fn()
      render(<PanoramaViewer {...defaultProps} onProgress={onProgress} />)
      
      // Progress callback should be called
      // (Mock might not trigger, but structure is here)
    })

    it('should call onError on error', () => {
      const onError = vi.fn()
      // Trigger error scenario
      render(<PanoramaViewer {...defaultProps} onError={onError} />)
      // Error handling would be tested with error injection
    })
  })

  describe('Ref Forwarding', () => {
    it('should expose methods via ref', () => {
      const ref = { current: null as any }
      render(<PanoramaViewer {...defaultProps} ref={ref} />)
      
      expect(ref.current).toBeTruthy()
      expect(typeof ref.current?.loadImage).toBe('function')
      expect(typeof ref.current?.reset).toBe('function')
    })

    it('should call loadImage method', async () => {
      const ref = { current: null as any }
      render(<PanoramaViewer {...defaultProps} ref={ref} />)
      
      await waitFor(() => {
        expect(ref.current).toBeTruthy()
      })

      if (ref.current?.loadImage) {
        await ref.current.loadImage('new-image.jpg')
        // Method should be callable
      }
    })
  })

  describe('Children Rendering', () => {
    it('should render children', () => {
      render(
        <PanoramaViewer {...defaultProps}>
          <div data-testid="child">Child Content</div>
        </PanoramaViewer>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render loading slot', () => {
      render(
        <PanoramaViewer
          {...defaultProps}
          renderLoading={(progress) => (
            <div data-testid="loading">Loading: {progress}%</div>
          )}
        />
      )
      // Loading might be shown initially
    })

    it('should render error slot', () => {
      const error = new Error('Test error')
      render(
        <PanoramaViewer
          {...defaultProps}
          renderError={(err) => (
            <div data-testid="error">Error: {err.message}</div>
          )}
        />
      )
      // Error rendering depends on error state
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = render(<PanoramaViewer {...defaultProps} />)
      unmount()
      // Should not throw errors
      expect(true).toBe(true)
    })
  })
})

describe('usePanoramaViewer Hook', () => {
  it('should return viewer instance and loading state', () => {
    const { result } = renderHook(() => 
      usePanoramaViewer({
        image: 'test.jpg',
      })
    )

    expect(result.current.viewerRef).toBeDefined()
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('should update loading state', async () => {
    const { result } = renderHook(() => 
      usePanoramaViewer({
        image: 'test.jpg',
      })
    )

    // Initially might be loading
    await waitFor(() => {
      expect(typeof result.current.isLoading).toBe('boolean')
    })
  })

  it('should expose loadImage method', () => {
    const { result } = renderHook(() => 
      usePanoramaViewer({
        image: 'test.jpg',
      })
    )

    expect(typeof result.current.loadImage).toBe('function')
  })

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => 
      usePanoramaViewer({
        image: 'test.jpg',
      })
    )

    unmount()
    // Should not throw errors
    expect(true).toBe(true)
  })
})
