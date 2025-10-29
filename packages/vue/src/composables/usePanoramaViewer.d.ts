/**
 * Vue Composition API 辅助函数
 * 用于在 Vue 3 中使用 PanoramaViewer
 */
import type { Ref } from 'vue';
import { EventBus, type Hotspot, PanoramaViewer, type PerformanceStats, type ViewerOptions } from '@panorama-viewer/core';
export interface UsePanoramaViewerOptions extends Omit<ViewerOptions, 'container'> {
    /** 自动初始化（默认 true） */
    autoInit?: boolean;
}
export interface UsePanoramaViewerReturn {
    /** Viewer 实例 */
    viewer: Ref<PanoramaViewer | null>;
    /** 事件总线 */
    eventBus: EventBus;
    /** 是否正在加载 */
    isLoading: Ref<boolean>;
    /** 加载进度 (0-100) */
    loadingProgress: Ref<number>;
    /** 错误信息 */
    error: Ref<Error | null>;
    /** 性能统计 */
    performanceStats: Ref<PerformanceStats | null>;
    /** 是否就绪 */
    isReady: Ref<boolean>;
    /** 初始化 Viewer */
    init: (container: HTMLElement) => Promise<void>;
    /** 销毁 Viewer */
    destroy: () => void;
}
/**
 * 使用 PanoramaViewer 的 Composition API
 */
export declare function usePanoramaViewer(options: UsePanoramaViewerOptions): UsePanoramaViewerReturn;
/**
 * 使用热点功能
 */
export declare function useHotspots(viewer: Ref<PanoramaViewer | null>): {
    hotspots: Ref<{
        id: string;
        position: {
            theta: number;
            phi: number;
            radius?: number | undefined;
        };
        label?: string | undefined;
        data?: Record<string, unknown> | undefined;
        element?: HTMLElement | undefined;
        type?: string | undefined;
        visible?: boolean | undefined;
    }[], Hotspot<Record<string, unknown>>[] | {
        id: string;
        position: {
            theta: number;
            phi: number;
            radius?: number | undefined;
        };
        label?: string | undefined;
        data?: Record<string, unknown> | undefined;
        element?: HTMLElement | undefined;
        type?: string | undefined;
        visible?: boolean | undefined;
    }[]>;
    addHotspot: (hotspot: Hotspot) => void;
    removeHotspot: (id: string) => void;
    clearHotspots: () => void;
};
/**
 * 使用全屏功能
 */
export declare function useFullscreen(viewer: Ref<PanoramaViewer | null>): {
    isFullscreen: Ref<boolean, boolean>;
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => void;
    toggleFullscreen: () => Promise<void>;
};
//# sourceMappingURL=usePanoramaViewer.d.ts.map