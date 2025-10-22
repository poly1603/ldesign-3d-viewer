import PanoramaViewer from './PanoramaViewer.vue';

export { PanoramaViewer };
export default PanoramaViewer;

// Composition API
export { usePanoramaViewer, useHotspots, useFullscreen } from './composables/usePanoramaViewer';
export type { UsePanoramaViewerOptions, UsePanoramaViewerReturn } from './composables/usePanoramaViewer';

// 重新导出核心类型
export type {
  ViewerOptions,
  Hotspot,
  ViewLimits,
  CubemapImages,
  QualityPreset,
  PerformanceStats,
} from '@panorama-viewer/core';


