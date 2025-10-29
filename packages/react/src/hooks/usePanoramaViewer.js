/**
 * React Hooks for PanoramaViewer
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { EventBus, PanoramaViewer, } from '@panorama-viewer/core';
/**
 * Use PanoramaViewer hook
 */
export function usePanoramaViewer(options) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const eventBusRef = useRef(new EventBus());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);
    const [performanceStats, setPerformanceStats] = useState(null);
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        if (!containerRef.current)
            return;
        const eventBus = eventBusRef.current;
        // 订阅事件
        const unsubReady = eventBus.on('viewer:ready', () => {
            setIsReady(true);
        });
        const unsubLoading = eventBus.on('image:loading', ({ progress }) => {
            setIsLoading(true);
            setLoadingProgress(progress);
        });
        const unsubLoaded = eventBus.on('image:loaded', () => {
            setIsLoading(false);
            setError(null);
        });
        const unsubError = eventBus.on('image:error', ({ error: err }) => {
            setIsLoading(false);
            setError(err);
        });
        const unsubStats = eventBus.on('performance:stats', (stats) => {
            setPerformanceStats(stats);
        });
        // 创建 viewer
        try {
            const viewerOptions = {
                container: containerRef.current,
                enablePerformanceMonitor: options.enablePerformanceMonitor ?? true,
                ...options,
            };
            viewerRef.current = new PanoramaViewer(viewerOptions);
        }
        catch (err) {
            setError(err);
        }
        return () => {
            // 清理
            unsubReady();
            unsubLoading();
            unsubLoaded();
            unsubError();
            unsubStats();
            if (viewerRef.current) {
                viewerRef.current.dispose();
                viewerRef.current = null;
            }
            eventBus.dispose();
        };
    }, []); // 只初始化一次
    return {
        containerRef,
        viewer: viewerRef.current,
        eventBus: eventBusRef.current,
        isLoading,
        loadingProgress,
        error,
        performanceStats,
        isReady,
    };
}
/**
 * Use hotspots hook
 */
export function useHotspots(viewer) {
    const [hotspots, setHotspots] = useState([]);
    const addHotspot = useCallback((hotspot) => {
        if (viewer) {
            viewer.addHotspot(hotspot);
            setHotspots(prev => [...prev, hotspot]);
        }
    }, [viewer]);
    const removeHotspot = useCallback((id) => {
        if (viewer) {
            viewer.removeHotspot(id);
            setHotspots(prev => prev.filter(h => h.id !== id));
        }
    }, [viewer]);
    const clearHotspots = useCallback(() => {
        hotspots.forEach((h) => {
            if (viewer) {
                viewer.removeHotspot(h.id);
            }
        });
        setHotspots([]);
    }, [viewer, hotspots]);
    return {
        hotspots,
        addHotspot,
        removeHotspot,
        clearHotspots,
    };
}
/**
 * Use fullscreen hook
 */
export function useFullscreen(viewer) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const enterFullscreen = useCallback(async () => {
        if (viewer) {
            await viewer.enterFullscreen();
            setIsFullscreen(true);
        }
    }, [viewer]);
    const exitFullscreen = useCallback(() => {
        if (viewer) {
            viewer.exitFullscreen();
            setIsFullscreen(false);
        }
    }, [viewer]);
    const toggleFullscreen = useCallback(async () => {
        if (isFullscreen) {
            exitFullscreen();
        }
        else {
            await enterFullscreen();
        }
    }, [isFullscreen, enterFullscreen, exitFullscreen]);
    return {
        isFullscreen,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen,
    };
}
//# sourceMappingURL=usePanoramaViewer.js.map