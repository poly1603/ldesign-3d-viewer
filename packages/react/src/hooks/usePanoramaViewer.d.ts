/**
 * React Hooks for PanoramaViewer
 */
import { EventBus, type Hotspot, PanoramaViewer, type PerformanceStats, type ViewerOptions } from '@panorama-viewer/core';
export interface UsePanoramaViewerOptions extends Omit<ViewerOptions, 'container'> {
    /** 自动初始化 */
    autoInit?: boolean;
    /** 启用性能监控 */
    enablePerformanceMonitor?: boolean;
}
export interface UsePanoramaViewerReturn {
    /** Container ref */
    containerRef: React.RefObject<HTMLDivElement>;
    /** Viewer instance */
    viewer: PanoramaViewer | null;
    /** Event bus */
    eventBus: EventBus;
    /** Is loading */
    isLoading: boolean;
    /** Loading progress */
    loadingProgress: number;
    /** Error */
    error: Error | null;
    /** Performance stats */
    performanceStats: PerformanceStats | null;
    /** Is ready */
    isReady: boolean;
}
/**
 * Use PanoramaViewer hook
 */
export declare function usePanoramaViewer(options: UsePanoramaViewerOptions): UsePanoramaViewerReturn;
/**
 * Use hotspots hook
 */
export declare function useHotspots(viewer: PanoramaViewer | null): {
    hotspots: Hotspot<Record<string, unknown>>[];
    addHotspot: (hotspot: Hotspot) => void;
    removeHotspot: (id: string) => void;
    clearHotspots: () => void;
};
/**
 * Use fullscreen hook
 */
export declare function useFullscreen(viewer: PanoramaViewer | null): {
    isFullscreen: boolean;
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => void;
    toggleFullscreen: () => Promise<void>;
};
//# sourceMappingURL=usePanoramaViewer.d.ts.map