/**
 * React Hooks for PanoramaViewer
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  PanoramaViewer,
  EventBus,
  type ViewerOptions,
  type Hotspot,
  type PerformanceStats,
} from '@panorama-viewer/core';

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
export function usePanoramaViewer(
  options: UsePanoramaViewerOptions
): UsePanoramaViewerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PanoramaViewer | null>(null);
  const eventBusRef = useRef<EventBus>(new EventBus());

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

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
      setPerformanceStats(stats as PerformanceStats);
    });

    // 创建 viewer
    try {
      const viewerOptions: ViewerOptions = {
        container: containerRef.current,
        enablePerformanceMonitor: options.enablePerformanceMonitor ?? true,
        ...options,
      };

      viewerRef.current = new PanoramaViewer(viewerOptions, eventBus);
    } catch (err) {
      setError(err as Error);
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
export function useHotspots(viewer: PanoramaViewer | null) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const addHotspot = useCallback((hotspot: Hotspot) => {
    if (viewer) {
      viewer.addHotspot(hotspot);
      setHotspots(prev => [...prev, hotspot]);
    }
  }, [viewer]);

  const removeHotspot = useCallback((id: string) => {
    if (viewer) {
      viewer.removeHotspot(id);
      setHotspots(prev => prev.filter(h => h.id !== id));
    }
  }, [viewer]);

  const clearHotspots = useCallback(() => {
    hotspots.forEach(h => {
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
export function useFullscreen(viewer: PanoramaViewer | null) {
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
    } else {
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

