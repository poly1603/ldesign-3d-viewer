<script lang='ts'>
  import { onDestroy, onMount } from 'svelte'
  import type { Hotspot, ViewLimits } from '@panorama-viewer/core'
  import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core'

  export let image: string
  export let fov = 75
  export let minFov = 30
  export let maxFov = 100
  export let autoRotate = false
  export let autoRotateSpeed = 0.5
  export let gyroscope = true
  export let width = '100%'
  export let height = '600px'
  export let hotspots: Hotspot[] = []
  export let viewLimits: ViewLimits | null = null

  let containerElement: HTMLDivElement
  let viewer: CoreViewer | null = null

  // Expose viewer instance for parent components
  export function getViewer(): CoreViewer | null {
    return viewer
  }

  export async function loadImage(url: string): Promise<void> {
    if (viewer) {
      await viewer.loadImage(url)
    }
  }

  export function reset(): void {
    viewer?.reset()
  }

  onMount(() => {
    if (!image) {
      console.warn('[PanoramaViewer] No image provided')
      return
    }

    try {
      viewer = new CoreViewer({
        container: containerElement,
        image,
        fov,
        minFov,
        maxFov,
        autoRotate,
        autoRotateSpeed,
        gyroscope,
        viewLimits,
      })

      // Add hotspots
      if (hotspots && hotspots.length > 0) {
        hotspots.forEach(hotspot => viewer!.addHotspot(hotspot))
      }
    }
    catch (error) {
      console.error('[PanoramaViewer] Failed to initialize:', error)
    }
  })

  onDestroy(() => {
    if (viewer) {
      viewer.dispose()
      viewer = null
    }
  })

  // Reactive hotspot management
  $: if (viewer && hotspots) {
    const currentHotspots = viewer.getHotspots()
    const currentIds = new Set(currentHotspots.map(h => h.id))
    const newIds = new Set(hotspots.map(h => h.id))

    // Remove old hotspots
    currentIds.forEach((id) => {
      if (!newIds.has(id)) {
        viewer!.removeHotspot(id)
      }
    })

    // Add new hotspots
    hotspots.forEach((hotspot) => {
      if (!currentIds.has(hotspot.id)) {
        viewer!.addHotspot(hotspot)
      }
    })
  }
</script>

<div
  bind:this={containerElement}
  class='panorama-viewer-container'
  style:width
  style:height
/>

<style>
  .panorama-viewer-container {
    position: relative;
    overflow: hidden;
  }
</style>
