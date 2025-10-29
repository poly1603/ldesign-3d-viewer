import type { QRL, Signal } from '@builder.io/qwik'
import { $, component$, noSerialize, useOnDocument, useSignal, useVisibleTask$ } from '@builder.io/qwik'
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
  onReady$?: QRL<(viewer: CoreViewer) => void>
  onError$?: QRL<(error: Error) => void>
}

export const PanoramaViewer = component$<PanoramaViewerProps>((props) => {
  const containerRef = useSignal<HTMLDivElement>()
  const viewerRef = useSignal<CoreViewer | null>(null)

  useVisibleTask$(({ cleanup }) => {
    const container = containerRef.value
    if (!container || !props.image) {
      return
    }

    const options: ViewerOptions = {
      container,
      image: props.image,
      fov: props.fov ?? 75,
      minFov: props.minFov ?? 30,
      maxFov: props.maxFov ?? 100,
      autoRotate: props.autoRotate ?? false,
      autoRotateSpeed: props.autoRotateSpeed ?? 0.5,
      gyroscope: props.gyroscope ?? true,
      viewLimits: props.viewLimits ?? null,
    }

    try {
      const viewer = new CoreViewer(options)
      viewerRef.value = noSerialize(viewer) as any

      // Add hotspots
      if (props.hotspots && props.hotspots.length > 0) {
        props.hotspots.forEach(hotspot => viewer.addHotspot(hotspot))
      }

      if (props.onReady$) {
        props.onReady$(viewer)
      }
    }
    catch (error) {
      console.error('[PanoramaViewer] Failed to initialize:', error)
      if (props.onError$) {
        props.onError$(error as Error)
      }
    }

    cleanup(() => {
      const viewer = viewerRef.value
      if (viewer) {
        viewer.dispose()
        viewerRef.value = null
      }
    })
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
})

export function usePanoramaViewer(): {
  viewer: Signal<CoreViewer | null>
  loadImage: QRL<(url: string) => Promise<void>>
  reset: QRL<() => void>
} {
  const viewer = useSignal<CoreViewer | null>(null)

  const loadImage = $(async (url: string) => {
    if (viewer.value) {
      await viewer.value.loadImage(url)
    }
  })

  const reset = $(() => {
    viewer.value?.reset()
  })

  useOnDocument(
    'qvisible',
    $(() => {
      // Cleanup on document unload
      const v = viewer.value
      if (v) {
        v.dispose()
        viewer.value = null
      }
    }),
  )

  return { viewer, loadImage, reset }
}
