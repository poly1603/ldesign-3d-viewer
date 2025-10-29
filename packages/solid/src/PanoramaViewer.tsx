import type { Accessor, Component } from 'solid-js'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import type { Hotspot, ViewLimits, ViewerOptions } from '@panorama-viewer/core'
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core'

export interface PanoramaViewerProps {
  image: string
  fov?: number
  minFov?: number
  maxFov?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  gyroscope?: boolean
  width?: string
  height?: string
  hotspots?: Hotspot[]
  viewLimits?: ViewLimits | null
  onReady?: (viewer: CoreViewer) => void
  onError?: (error: Error) => void
}

export const PanoramaViewer: Component<PanoramaViewerProps> = (props) => {
  let containerRef: HTMLDivElement | undefined
  let viewer: CoreViewer | null = null

  const [, setReady] = createSignal(false)

  onMount(() => {
    if (!containerRef) {
      console.warn('[PanoramaViewer] Container ref not available')
      return
    }

    if (!props.image) {
      console.warn('[PanoramaViewer] No image provided')
      return
    }

    try {
      const options: ViewerOptions = {
        container: containerRef,
        image: props.image,
        fov: props.fov ?? 75,
        minFov: props.minFov ?? 30,
        maxFov: props.maxFov ?? 100,
        autoRotate: props.autoRotate ?? false,
        autoRotateSpeed: props.autoRotateSpeed ?? 0.5,
        gyroscope: props.gyroscope ?? true,
        viewLimits: props.viewLimits ?? null,
      }

      viewer = new CoreViewer(options)

      // Add hotspots
      if (props.hotspots && props.hotspots.length > 0) {
        props.hotspots.forEach(hotspot => viewer!.addHotspot(hotspot))
      }

      setReady(true)
      props.onReady?.(viewer)
    }
    catch (error) {
      console.error('[PanoramaViewer] Failed to initialize:', error)
      props.onError?.(error as Error)
    }
  })

  createEffect(() => {
    if (viewer && props.hotspots) {
      // Update hotspots when they change
      const currentHotspots = viewer.getHotspots()
      const currentIds = new Set(currentHotspots.map(h => h.id))
      const newIds = new Set(props.hotspots.map(h => h.id))

      // Remove old hotspots
      currentIds.forEach((id) => {
        if (!newIds.has(id)) {
          viewer!.removeHotspot(id)
        }
      })

      // Add new hotspots
      props.hotspots.forEach((hotspot) => {
        if (!currentIds.has(hotspot.id)) {
          viewer!.addHotspot(hotspot)
        }
      })
    }
  })

  onCleanup(() => {
    if (viewer) {
      viewer.dispose()
      viewer = null
    }
  })

  return (
    <div
      ref={containerRef}
      class="panorama-viewer-container"
      style={{
        width: props.width ?? '100%',
        height: props.height ?? '600px',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  )
}

export function createPanoramaViewer(container: HTMLElement, options: ViewerOptions): CoreViewer {
  return new CoreViewer({ ...options, container })
}

export function usePanoramaViewer(): {
  viewer: Accessor<CoreViewer | null>
  setViewer: (v: CoreViewer | null) => void
} {
  const [viewer, setViewer] = createSignal<CoreViewer | null>(null)

  onCleanup(() => {
    const v = viewer()
    if (v) {
      v.dispose()
    }
  })

  return { viewer, setViewer }
}
