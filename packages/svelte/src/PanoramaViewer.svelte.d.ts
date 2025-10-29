import type { SvelteComponentTyped } from 'svelte'
import type { Hotspot, ViewLimits } from '@panorama-viewer/core'

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
}

export default class PanoramaViewer extends SvelteComponentTyped<PanoramaViewerProps> {}
