import type { DefineComponent } from 'vue'
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

declare const PanoramaViewer: DefineComponent<PanoramaViewerProps>

export default PanoramaViewer
