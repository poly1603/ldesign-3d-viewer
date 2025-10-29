/**
 * Vue Composition API 辅助函数
 * 用于在 Vue 3 中使用 PanoramaViewer
 */
import { onBeforeUnmount, ref } from 'vue';
import { EventBus, PanoramaViewer, } from '@panorama-viewer/core';
/**
 * 使用 PanoramaViewer 的 Composition API
 */
export function usePanoramaViewer(options) {
    const viewer = ref(null);
    const eventBus = new EventBus();
    const isLoading = ref(false);
    const loadingProgress = ref(0);
    const error = ref(null);
    const performanceStats = ref(null);
    const isReady = ref(false);
    // 订阅事件
    eventBus.on('viewer:ready', () => {
        isReady.value = true;
    });
    eventBus.on('image:loading', ({ progress }) => {
        isLoading.value = true;
        loadingProgress.value = progress;
    });
    eventBus.on('image:loaded', () => {
        isLoading.value = false;
        error.value = null;
    });
    eventBus.on('image:error', ({ error: err }) => {
        isLoading.value = false;
        error.value = err;
        isReady.value = false;
    });
    eventBus.on('performance:stats', (stats) => {
        performanceStats.value = stats;
    });
    eventBus.on('error', (err) => {
        error.value = err;
    });
    const init = async (container) => {
        if (viewer.value) {
            console.warn('Viewer already initialized');
            return;
        }
        try {
            const viewerOptions = {
                container,
                ...options,
            };
            viewer.value = new PanoramaViewer(viewerOptions);
            isReady.value = true;
        }
        catch (err) {
            error.value = err;
            throw err;
        }
    };
    const destroy = () => {
        if (viewer.value) {
            viewer.value.dispose();
            viewer.value = null;
        }
        eventBus.dispose();
        isReady.value = false;
    };
    // 自动清理
    onBeforeUnmount(() => {
        destroy();
    });
    return {
        viewer: viewer,
        eventBus,
        isLoading,
        loadingProgress,
        error,
        performanceStats,
        isReady,
        init,
        destroy,
    };
}
/**
 * 使用热点功能
 */
export function useHotspots(viewer) {
    const hotspots = ref([]);
    const addHotspot = (hotspot) => {
        if (viewer.value) {
            viewer.value.addHotspot(hotspot);
            hotspots.value.push(hotspot);
        }
    };
    const removeHotspot = (id) => {
        if (viewer.value) {
            viewer.value.removeHotspot(id);
            hotspots.value = hotspots.value.filter(h => h.id !== id);
        }
    };
    const clearHotspots = () => {
        hotspots.value.forEach(h => removeHotspot(h.id));
        hotspots.value = [];
    };
    return {
        hotspots,
        addHotspot,
        removeHotspot,
        clearHotspots,
    };
}
/**
 * 使用全屏功能
 */
export function useFullscreen(viewer) {
    const isFullscreen = ref(false);
    const enterFullscreen = async () => {
        if (viewer.value) {
            await viewer.value.enterFullscreen();
            isFullscreen.value = true;
        }
    };
    const exitFullscreen = () => {
        if (viewer.value) {
            viewer.value.exitFullscreen();
            isFullscreen.value = false;
        }
    };
    const toggleFullscreen = async () => {
        if (isFullscreen.value) {
            exitFullscreen();
        }
        else {
            await enterFullscreen();
        }
    };
    return {
        isFullscreen,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen,
    };
}
//# sourceMappingURL=usePanoramaViewer.js.map