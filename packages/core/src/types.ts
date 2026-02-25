/**
 * Hotspot marker in the panorama
 * @template T - Type of custom data
 */
export interface Hotspot<T = Record<string, unknown>> {
  /** Unique identifier */
  id: string
  /** Position in spherical coordinates (theta: horizontal angle, phi: vertical angle) */
  position: SphericalPosition
  /** Text label */
  label?: string
  /** Custom data with type safety */
  data?: T
  /** Custom icon/element */
  element?: HTMLElement
  /** Hotspot type/category */
  type?: string
  /** Is hotspot visible */
  visible?: boolean
}

/**
 * Spherical position coordinates
 */
export interface SphericalPosition {
  /** Horizontal angle in radians */
  theta: number
  /** Vertical angle in radians */
  phi: number
  /** Optional radius (default: sphere radius) */
  radius?: number
}

/**
 * View limits for restricting camera movement
 */
export interface ViewLimits {
  /** Minimum horizontal angle in radians */
  minTheta?: number
  /** Maximum horizontal angle in radians */
  maxTheta?: number
  /** Minimum vertical angle in radians */
  minPhi?: number
  /** Maximum vertical angle in radians */
  maxPhi?: number
}

/**
 * Image format types
 */
export type ImageFormat = 'equirectangular' | 'cubemap'

/**
 * Cubemap image sources
 */
export interface CubemapImages {
  px: string // positive x
  nx: string // negative x
  py: string // positive y
  ny: string // negative y
  pz: string // positive z
  nz: string // negative z
}

/**
 * Loading progress callback
 */
export type LoadingProgressCallback = (progress: number) => void

/**
 * Options for initializing the PanoramaViewer
 */
export interface ViewerOptions {
  /** The container element to render the viewer in */
  container: HTMLElement
  /** URL or path to the panorama image */
  image: string | CubemapImages
  /** Image format type (default: 'equirectangular') */
  format?: ImageFormat
  /** Field of view in degrees (default: 75) */
  fov?: number
  /** Minimum field of view for zoom (default: 30) */
  minFov?: number
  /** Maximum field of view for zoom (default: 100) */
  maxFov?: number
  /** Enable auto rotation (default: false) */
  autoRotate?: boolean
  /** Auto rotation speed (default: 0.5) */
  autoRotateSpeed?: number
  /** Enable gyroscope controls on mobile (default: true) */
  gyroscope?: boolean
  /** Enable damping/inertia for smooth movement (default: true) */
  enableDamping?: boolean
  /** Damping factor (default: 0.05) */
  dampingFactor?: number
  /** View limits for restricting camera movement */
  viewLimits?: ViewLimits | null
  /** Enable keyboard controls (default: true) */
  keyboardControls?: boolean
  /** Loading progress callback */
  onProgress?: LoadingProgressCallback
  /** Enable render on demand for better performance (default: true) */
  renderOnDemand?: boolean
  /** Maximum texture size (default: 4096) */
  maxTextureSize?: number
  /** Enable performance monitoring (default: false) */
  enablePerformanceMonitor?: boolean
  /** Show performance stats overlay (default: false) */
  showPerformanceStats?: boolean
  /** Enable adaptive quality (default: false) */
  enableAdaptiveQuality?: boolean
  /** Initial quality preset (default: 'high') */
  qualityPreset?: 'ultra' | 'high' | 'medium' | 'low'
  /** Enable WebWorker texture loading (default: true) */
  useWebWorker?: boolean
  /** Enable advanced gesture recognition (default: false) */
  advancedGestures?: boolean
  /** Enable GPU instanced hotspots (default: true) */
  useGPUInstancing?: boolean
  /** Images to preload in background */
  preloadImages?: string[]
  /** Compass/MiniMap options */
  compass?: CompassOptions | boolean
  /** Enable entrance animation (default: false) */
  entranceAnimation?: boolean
  /** Entrance animation duration in milliseconds (default: 1000) */
  entranceAnimationDuration?: number
  /** Initial camera position for entrance animation */
  initialPosition?: { x: number, y: number, z: number }
  /** Initial camera rotation for entrance animation (in degrees) */
  initialRotation?: { pitch: number, yaw: number }
  /** Zoom indicator options */
  zoomIndicator?: ZoomIndicatorOptions | boolean
  /** Auto tour control options */
  autoTour?: AutoTourOptions | boolean
  /** Tour scenes for auto tour */
  tourScenes?: TourScene[]
  /** Help overlay options */
  helpOverlay?: HelpOverlayOptions | boolean
  /** Gyroscope indicator options (mobile only) */
  gyroscopeIndicator?: GyroscopeIndicatorOptions | boolean
  /** Scene change callback for auto tour */
  onSceneChange?: (index: number, scene: TourScene) => void
}

/**
 * Event types emitted by the viewer
 */
export interface ViewerEvents {
  ready: void
  error: Error
  change: void
}

/**
 * Public API interface for the viewer
 */
export interface IPanoramaViewer {
  // Image and scene control
  /** Load a new panorama image */
  loadImage: (url: string | CubemapImages, transition?: boolean) => Promise<void>
  /** Preload images for faster switching */
  preloadImages: (urls: string[]) => Promise<void>

  // Camera control
  /** Reset camera to initial position */
  reset: () => void
  /** Get the current camera rotation */
  getRotation: () => { x: number, y: number, z: number }
  /** Set the camera rotation */
  setRotation: (x: number, y: number, z: number) => void
  /** Animate camera along path */
  animateCameraPath: (path: CameraPathPoint[]) => void

  // Auto rotation
  /** Enable auto rotation */
  enableAutoRotate: () => void
  /** Disable auto rotation */
  disableAutoRotate: () => void

  // Gyroscope
  /** Enable gyroscope controls (mobile only) */
  enableGyroscope: () => Promise<boolean>
  /** Disable gyroscope controls */
  disableGyroscope: () => void

  // Hotspots
  /** Add a hotspot marker */
  addHotspot: (hotspot: Hotspot) => void
  /** Remove a hotspot by ID */
  removeHotspot: (id: string) => void
  /** Get all hotspots */
  getHotspots: () => Hotspot[]

  // Fullscreen
  /** Enter fullscreen mode */
  enterFullscreen: () => Promise<void>
  /** Exit fullscreen mode */
  exitFullscreen: () => void
  /** Check if in fullscreen */
  isFullscreen: () => boolean

  // Screenshot
  /** Take a screenshot */
  screenshot: (width?: number, height?: number) => string

  // View limits
  /** Set view limits */
  setViewLimits: (limits?: ViewLimits | null) => void

  // Mini map
  /** Show mini map */
  showMiniMap: () => void
  /** Hide mini map */
  hideMiniMap: () => void
  /** Toggle mini map visibility */
  toggleMiniMap: () => void

  // Color adjustment
  /** Set brightness (-1 to 1) */
  setBrightness: (value: number) => void
  /** Set contrast (-1 to 1) */
  setContrast: (value: number) => void
  /** Set saturation (-1 to 1) */
  setSaturation: (value: number) => void
  /** Set exposure (-2 to 2) */
  setExposure: (value: number) => void
  /** Reset color adjustments */
  resetColorAdjustments: () => void

  // Watermark
  /** Show watermark */
  showWatermark: (options?: WatermarkOptions) => void
  /** Hide watermark */
  hideWatermark: () => void

  // Performance
  /** Get performance stats */
  getPerformanceStats: () => PerformanceStats | null
  /** Show/hide performance overlay */
  togglePerformanceOverlay: () => void
  /** Set quality preset */
  setQualityPreset: (preset: QualityPreset) => void

  // Rendering
  /** Force render (useful when renderOnDemand is enabled) */
  render: () => void

  // Cleanup
  /** Destroy the viewer and clean up resources */
  dispose: () => void
}

/**
 * Quality preset levels
 */
export type QualityPreset = 'ultra' | 'high' | 'medium' | 'low'

/**
 * Performance statistics
 */
export interface PerformanceStats {
  /** Frames per second */
  fps: number
  /** Frame time in milliseconds */
  frameTime: number
  /** Number of render calls */
  renderCalls: number
  /** Number of triangles */
  triangles: number
  /** Memory statistics (if available) */
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

/**
 * Watermark options
 */
export interface WatermarkOptions {
  /** Watermark text */
  text?: string
  /** Watermark image URL */
  imageUrl?: string
  /** Position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  /** Opacity (0-1) */
  opacity?: number
  /** Size */
  size?: number
  /** Custom CSS */
  style?: Partial<CSSStyleDeclaration>
}

/**
 * Camera path point
 */
export interface CameraPathPoint {
  /** Camera position */
  position: { x: number, y: number, z: number }
  /** Camera rotation */
  rotation: { x: number, y: number, z: number }
  /** Field of view */
  fov?: number
  /** Duration to this point (ms) */
  duration?: number
}

/**
 * Rotation coordinates
 */
export interface RotationCoordinates {
  /** X rotation in radians */
  x: number
  /** Y rotation in radians */
  y: number
  /** Z rotation in radians */
  z: number
}

/**
 * Position coordinates
 */
export interface PositionCoordinates {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Z position */
  z: number
}

/**
 * Size dimensions
 */
export interface Dimensions {
  /** Width */
  width: number
  /** Height */
  height: number
}

/**
 * Texture information
 */
export interface TextureInfo {
  /** Texture URL */
  url: string
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
  /** Size in bytes */
  size: number
  /** Format */
  format: string
}

/**
 * Compass/MiniMap options
 */
export interface CompassOptions {
  /** Show compass (default: true) */
  enabled?: boolean
  /** Compass size in pixels (default: 100) */
  size?: number
  /** Position on screen - used when not in unified toolbar */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Margin from edge in pixels (default: 16) */
  margin?: number
  /** Background color (default: 'rgba(0, 0, 0, 0.6)') */
  backgroundColor?: string
  /** Pointer/needle color (default: '#3b82f6') */
  pointerColor?: string
  /** North indicator color (default: '#ef4444') */
  northColor?: string
  /** Text color (default: 'rgba(255, 255, 255, 0.9)') */
  textColor?: string
  /** Show cardinal directions N/S/E/W (default: true) */
  showCardinals?: boolean
  /** Show degree numbers (default: false) */
  showDegrees?: boolean
  /** Compass style */
  style?: 'modern' | 'classic' | 'minimal'
}

/**
 * Zoom indicator options
 */
export interface ZoomIndicatorOptions {
  /** Show zoom indicator (default: false) */
  enabled?: boolean
  /** Show +/- buttons (default: true) */
  showButtons?: boolean
  /** Show slider (default: true) */
  showSlider?: boolean
  /** Show zoom level text (default: true) */
  showLevel?: boolean
  /** Background color */
  backgroundColor?: string
  /** Button color */
  buttonColor?: string
  /** Active/highlight color */
  activeColor?: string
  /** Text color */
  textColor?: string
}

/**
 * Auto tour control options
 */
export interface AutoTourOptions {
  /** Show auto tour control (default: false) */
  enabled?: boolean
  /** Auto play interval in milliseconds (default: 5000) */
  interval?: number
  /** Auto start playing (default: false) */
  autoStart?: boolean
  /** Show progress bar (default: true) */
  showProgress?: boolean
  /** Background color */
  backgroundColor?: string
  /** Button color */
  buttonColor?: string
  /** Active/highlight color */
  activeColor?: string
  /** Text color */
  textColor?: string
}

/**
 * Tour scene definition
 */
export interface TourScene {
  /** Unique scene ID */
  id: string
  /** Scene display name */
  name: string
  /** Scene thumbnail URL */
  thumbnail?: string
  /** Scene image URL */
  image?: string
}

/**
 * Help overlay options
 */
export interface HelpOverlayOptions {
  /** Show help button (default: false) */
  enabled?: boolean
  /** Show help on first visit (default: false) */
  showOnFirstVisit?: boolean
  /** Background color */
  backgroundColor?: string
  /** Button color */
  buttonColor?: string
  /** Text color */
  textColor?: string
}

/**
 * Gyroscope indicator options
 */
export interface GyroscopeIndicatorOptions {
  /** Show gyroscope indicator (default: false, only on mobile) */
  enabled?: boolean
  /** Auto enable gyroscope on load (default: false) */
  autoEnable?: boolean
  /** Background color */
  backgroundColor?: string
  /** Active state color */
  activeColor?: string
  /** Inactive state color */
  inactiveColor?: string
  /** Text color */
  textColor?: string
}
