import type { ElementRef, OnDestroy, OnInit } from '@angular/core'
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import type { Hotspot, ViewLimits, ViewerOptions } from '@panorama-viewer/core'
import { PanoramaViewer } from '@panorama-viewer/core'

@Component({
  selector: 'lib-panorama-viewer',
  standalone: true,
  template: `
    <div #container class="panorama-viewer-container" [style.width]="width" [style.height]="height"></div>
  `,
  styles: [`
    .panorama-viewer-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `],
})
export class PanoramaViewerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>

  @Input() image!: string
  @Input() fov = 75
  @Input() minFov = 30
  @Input() maxFov = 100
  @Input() autoRotate = false
  @Input() autoRotateSpeed = 0.5
  @Input() gyroscope = true
  @Input() width = '100%'
  @Input() height = '600px'
  @Input() hotspots: Hotspot[] = []
  @Input() viewLimits?: ViewLimits | null

  @Output() viewerReady = new EventEmitter<PanoramaViewer>()
  @Output() viewerError = new EventEmitter<Error>()
  @Output() rotationChange = new EventEmitter<{ x: number, y: number, z: number }>()

  private viewer: PanoramaViewer | null = null

  ngOnInit(): void {
    this.initViewer()
  }

  ngOnDestroy(): void {
    this.destroyViewer()
  }

  private async initViewer(): Promise<void> {
    if (!this.image) {
      console.warn('[PanoramaViewerComponent] No image provided')
      return
    }

    try {
      const options: ViewerOptions = {
        container: this.containerRef.nativeElement,
        image: this.image,
        fov: this.fov,
        minFov: this.minFov,
        maxFov: this.maxFov,
        autoRotate: this.autoRotate,
        autoRotateSpeed: this.autoRotateSpeed,
        gyroscope: this.gyroscope,
        viewLimits: this.viewLimits,
      }

      this.viewer = new PanoramaViewer(options)

      // Add hotspots
      if (this.hotspots && this.hotspots.length > 0) {
        this.hotspots.forEach(hotspot => this.viewer!.addHotspot(hotspot))
      }

      this.viewerReady.emit(this.viewer)
    }
    catch (error) {
      console.error('[PanoramaViewerComponent] Failed to initialize viewer:', error)
      this.viewerError.emit(error as Error)
    }
  }

  private destroyViewer(): void {
    if (this.viewer) {
      this.viewer.dispose()
      this.viewer = null
    }
  }

  // Public API
  async loadImage(url: string): Promise<void> {
    if (this.viewer) {
      await this.viewer.loadImage(url)
    }
  }

  reset(): void {
    this.viewer?.reset()
  }

  enableAutoRotate(): void {
    this.viewer?.enableAutoRotate()
  }

  disableAutoRotate(): void {
    this.viewer?.disableAutoRotate()
  }

  async enableGyroscope(): Promise<boolean> {
    return this.viewer ? await this.viewer.enableGyroscope() : false
  }

  disableGyroscope(): void {
    this.viewer?.disableGyroscope()
  }

  addHotspot(hotspot: Hotspot): void {
    this.viewer?.addHotspot(hotspot)
  }

  removeHotspot(id: string): void {
    this.viewer?.removeHotspot(id)
  }

  getRotation(): { x: number, y: number, z: number } | undefined {
    return this.viewer?.getRotation()
  }

  setRotation(x: number, y: number, z: number): void {
    this.viewer?.setRotation(x, y, z)
  }

  async enterFullscreen(): Promise<void> {
    if (this.viewer) {
      await this.viewer.enterFullscreen()
    }
  }

  exitFullscreen(): void {
    this.viewer?.exitFullscreen()
  }

  screenshot(width?: number, height?: number): string | undefined {
    return this.viewer?.screenshot(width, height)
  }

  getViewer(): PanoramaViewer | null {
    return this.viewer
  }
}
