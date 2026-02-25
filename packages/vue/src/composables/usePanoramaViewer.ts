/**
 * Vue Composition API 辅助函数
 * 用于在 Vue 3 中使用 PanoramaViewer
 */

import type { Ref } from 'vue'
import { onBeforeUnmount, ref } from 'vue'
import {
  EventBus,
  type Hotspot,
  PanoramaViewer,
  type PerformanceStats,
  type ViewerOptions,
} from '@ldesign/3d-viewer'

export interface UsePanoramaViewerOptions extends Omit<ViewerOptions, 'container'> {
  /** 自动初始化（默认 true） */
  autoInit?: boolean
}

export interface UsePanoramaViewerReturn {
  /** Viewer 实例 */
  viewer: Ref<PanoramaViewer | null>
  /** 事件总线 */
  eventBus: EventBus
  /** 是否正在加载 */
  isLoading: Ref<boolean>
  /** 加载进度 (0-100) */
  loadingProgress: Ref<number>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 性能统计 */
  performanceStats: Ref<PerformanceStats | null>
  /** 是否就绪 */
  isReady: Ref<boolean>
  /** 初始化 Viewer */
  init: (container: HTMLElement) => Promise<void>
  /** 销毁 Viewer */
  destroy: () => void
}

/**
 * 使用 PanoramaViewer 的 Composition API
 */
export function usePanoramaViewer(
  options: UsePanoramaViewerOptions,
): UsePanoramaViewerReturn {
  const viewer = ref<PanoramaViewer | null>(null)
  const eventBus = new EventBus()
  const isLoading = ref(false)
  const loadingProgress = ref(0)
  const error = ref<Error | null>(null)
  const performanceStats = ref<PerformanceStats | null>(null)
  const isReady = ref(false)

  // 订阅事件
  eventBus.on('viewer:ready', () => {
    isReady.value = true
  })

  eventBus.on('image:loading', ({ progress }) => {
    isLoading.value = true
    loadingProgress.value = progress
  })

  eventBus.on('image:loaded', () => {
    isLoading.value = false
    error.value = null
  })

  eventBus.on('image:error', ({ error: err }) => {
    isLoading.value = false
    error.value = err
    isReady.value = false
  })

  eventBus.on('performance:stats', (stats) => {
    performanceStats.value = stats as PerformanceStats
  })

  eventBus.on('error', (err) => {
    error.value = err
  })

  const init = async (container: HTMLElement): Promise<void> => {
    if (viewer.value) {
      console.warn('Viewer already initialized')
      return
    }

    try {
      const viewerOptions: ViewerOptions = {
        container,
        ...options,
      }

      viewer.value = new PanoramaViewer(viewerOptions)
      isReady.value = true
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const destroy = () => {
    if (viewer.value) {
      viewer.value.dispose()
      viewer.value = null
    }
    eventBus.dispose()
    isReady.value = false
  }

  // 自动清理
  onBeforeUnmount(() => {
    destroy()
  })

  return {
    viewer: viewer as Ref<PanoramaViewer | null>,
    eventBus,
    isLoading,
    loadingProgress,
    error,
    performanceStats,
    isReady,
    init,
    destroy,
  }
}

/**
 * 使用热点功能
 */
export function useHotspots(viewer: Ref<PanoramaViewer | null>) {
  const hotspots = ref<Hotspot[]>([])

  const addHotspot = (hotspot: Hotspot) => {
    if (viewer.value) {
      viewer.value.addHotspot(hotspot)
      hotspots.value.push(hotspot)
    }
  }

  const removeHotspot = (id: string) => {
    if (viewer.value) {
      viewer.value.removeHotspot(id)
      hotspots.value = hotspots.value.filter(h => h.id !== id)
    }
  }

  const clearHotspots = () => {
    hotspots.value.forEach(h => removeHotspot(h.id))
    hotspots.value = []
  }

  return {
    hotspots,
    addHotspot,
    removeHotspot,
    clearHotspots,
  }
}

/**
 * 使用全屏功能
 */
export function useFullscreen(viewer: Ref<PanoramaViewer | null>) {
  const isFullscreen = ref(false)

  const enterFullscreen = async () => {
    if (viewer.value) {
      await viewer.value.enterFullscreen()
      isFullscreen.value = true
    }
  }

  const exitFullscreen = () => {
    if (viewer.value) {
      viewer.value.exitFullscreen()
      isFullscreen.value = false
    }
  }

  const toggleFullscreen = async () => {
    if (isFullscreen.value) {
      exitFullscreen()
    }
    else {
      await enterFullscreen()
    }
  }

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
