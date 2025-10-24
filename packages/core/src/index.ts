export { PanoramaViewer } from './PanoramaViewer';
export type {
  ViewerOptions,
  IPanoramaViewer,
  Hotspot,
  ViewLimits,
  ImageFormat,
  CubemapImages,
  LoadingProgressCallback,
  QualityPreset,
  PerformanceStats,
  WatermarkOptions,
  CameraPathPoint,
  RotationCoordinates,
  PositionCoordinates,
  Dimensions,
  TextureInfo,
  SphericalPosition,
} from './types';

// Core systems
export { EventBus } from './core/EventBus';
export type { EventMap, EventHandler } from './core/EventBus';

export { Logger, LogLevel, logger } from './core/Logger';
export type { LogEntry, LogHandler } from './core/Logger';

export { StateManager, ViewerState, ControlState, RenderMode, InteractionMode } from './core/StateManager';
export type { ViewerStateData } from './core/StateManager';

export { MemoryManager } from './core/MemoryManager';
export type { MemoryStats, MemoryOptions } from './core/MemoryManager';

// Utilities
export {
  ObjectPool,
  Vector3Pool,
  Vector2Pool,
  EulerPool,
  QuaternionPool,
  Matrix4Pool,
  ColorPool,
  RaycasterPool,
  getAllPoolStats
} from './utils/ObjectPool';

export {
  debounce,
  throttle,
  CancellationToken,
  CancellablePromise,
  delay,
  retry,
  promiseAllLimit,
  deepClone,
  generateId,
  lerp,
  clamp,
  mapRange,
  easing,
  isMobile,
  isTouchDevice,
  formatBytes,
  formatDuration,
  waitFor
} from './utils/helpers';

export { TextureCache } from './utils/TextureCache';

// Video
export { VideoPanorama } from './video/VideoPanorama';
export type { VideoOptions, VideoSource, VideoState } from './video/VideoPanorama';

// Audio
export { SpatialAudio } from './audio/SpatialAudio';
export type { AudioSourceOptions, AmbisonicsOptions } from './audio/SpatialAudio';

// VR
export { VRManager } from './vr/VRManager';
export type { VROptions } from './vr/VRManager';

// Rendering
export { HDRRenderer, ColorGrading } from './rendering/HDRRenderer';
export type { ToneMappingType, HDROptions } from './rendering/HDRRenderer';

// Post-processing
export { PostProcessing } from './postprocessing/PostProcessing';
export type { PostProcessingOptions } from './postprocessing/PostProcessing';

// Camera
export { AdvancedCamera } from './camera/AdvancedCamera';
export type { CameraKeyframe, CameraPathOptions, CameraTarget } from './camera/AdvancedCamera';

// Tiles
export { TileManager } from './tiles/TileManager';
export type { TileCoordinate, TileFormat, TileNode } from './tiles/TileManager';

// Progressive Loading
export { ProgressiveTextureLoader, LODTextureLoader } from './utils/ProgressiveTextureLoader';
export type { ProgressiveLoadOptions } from './utils/ProgressiveTextureLoader';

// Tools
export { MeasureTool } from './tools/MeasureTool';
export type { MeasurePoint, Measurement } from './tools/MeasureTool';

// Plugins
export { PluginManager, definePlugin } from './plugins/PluginManager';
export type { Plugin, PluginContext, PluginMetadata, PluginOptions } from './plugins/PluginManager';
export { SharePlugin } from './plugins/examples/SharePlugin';

// 新增: 性能优化组件
export { TextureFormatDetector, formatDetector } from './utils/TextureFormatDetector';
export type { FormatSupport, ImageFormat, CompressedFormat } from './utils/TextureFormatDetector';

export { ResourcePreloader, resourcePreloader } from './utils/ResourcePreloader';
export type { PreloadOptions, PreloadTask } from './utils/ResourcePreloader';

export { DeviceCapability, deviceCapability } from './utils/DeviceCapability';
export type { DeviceInfo, PerformanceScore, QualitySettings } from './utils/DeviceCapability';

export { PowerManager, powerManager } from './utils/PowerManager';
export type { PowerState, PowerMode } from './utils/PowerManager';

// 新增: 管理器
export { SceneManager } from './managers/SceneManager';
export type { Scene, SceneTransition } from './managers/SceneManager';

// 新增: 工具
export { AnnotationManager } from './tools/AnnotationManager';
export type { Annotation, AnnotationType, AnnotationStyle } from './tools/AnnotationManager';

// 新增: 企业级功能
export { OfflineManager } from './offline/OfflineManager';
export type { OfflineConfig, CacheEntry } from './offline/OfflineManager';

export { LocaleManager } from './i18n/LocaleManager';
export type { Locale, Translation, LocaleConfig } from './i18n/LocaleManager';

// 新增: 渲染增强
export { ColorGrading } from './rendering/ColorGrading';
export type { ColorGradingSettings, ColorGradingPreset } from './rendering/ColorGrading';

export { EnvironmentMapping } from './rendering/EnvironmentMapping';
export type { EnvironmentMappingOptions } from './rendering/EnvironmentMapping';

export { ParticleSystem } from './rendering/ParticleSystem';
export type { ParticleEffect, ParticleConfig } from './rendering/ParticleSystem';

// 新增: 分析工具
export { HeatmapAnalytics } from './analytics/HeatmapAnalytics';
export type { HeatPoint, HeatmapConfig, AnalyticsData } from './analytics/HeatmapAnalytics';

// 新增: 更多工具
export { RegionSelector } from './tools/RegionSelector';
export type { Region, RegionType } from './tools/RegionSelector';

export { PathDrawer } from './tools/PathDrawer';
export type { Path, PathPoint } from './tools/PathDrawer';

// 新增: 数据管理
export { DataExporter, dataExporter } from './utils/DataExporter';
export type { ExportConfig, ExportData } from './utils/DataExporter';

// 新增: 主题系统
export { ThemeManager, themeManager } from './theming/ThemeManager';
export type { Theme, BuiltInTheme } from './theming/ThemeManager';

// 新增: 更多渲染功能
export { DynamicLighting } from './rendering/DynamicLighting';
export type { LightConfig } from './rendering/DynamicLighting';

export { WeatherSystem } from './rendering/WeatherSystem';
export type { WeatherType, WeatherConfig } from './rendering/WeatherSystem';

// 新增: 更多工具
export { ComparisonView } from './tools/ComparisonView';
export type { ComparisonConfig } from './tools/ComparisonView';

export { TimelinePlayer } from './tools/TimelinePlayer';
export type { TimelineFrame, TimelineConfig } from './tools/TimelinePlayer';

// 新增: 安全功能
export { AccessControl } from './security/AccessControl';
export type { Permission, Role, AccessControlConfig, WatermarkConfig } from './security/AccessControl';

