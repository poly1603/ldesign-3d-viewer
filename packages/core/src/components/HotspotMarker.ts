import * as THREE from 'three'

export interface MarkerOptions {
  enabled?: boolean
  maxMarkers?: number
  markerColor?: string
  hoverColor?: string
  iconSize?: number
  showLabels?: boolean
  labelColor?: string
  labelBackgroundColor?: string
  onClick?: (marker: Marker) => void
  onHover?: (marker: Marker | null) => void
}

export interface Marker {
  id: string
  position: THREE.Vector3
  label?: string
  icon?: string
  data?: any
  element?: HTMLElement
}

const DEFAULT_OPTIONS: Required<MarkerOptions> = {
  enabled: true,
  maxMarkers: 50,
  markerColor: '#3b82f6',
  hoverColor: '#60a5fa',
  iconSize: 32,
  showLabels: true,
  labelColor: '#ffffff',
  labelBackgroundColor: 'rgba(0, 0, 0, 0.75)',
  onClick: () => {},
  onHover: () => {},
}

/**
 * 热点标记系统 - 在全景图中添加可交互的标记点
 */
export class HotspotMarker {
  private container: HTMLElement
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private options: Required<MarkerOptions>
  private markers: Map<string, Marker> = new Map()
  private markerElements: Map<string, HTMLElement> = new Map()
  private hoveredMarker: string | null = null

  constructor(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    options?: MarkerOptions,
  ) {
    this.container = container
    this.camera = camera
    this.scene = scene
    this.options = { ...DEFAULT_OPTIONS, ...options }

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.container.addEventListener('click', this.onContainerClick.bind(this))
    this.container.addEventListener('mousemove', this.onContainerMouseMove.bind(this))
  }

  private onContainerClick(event: MouseEvent): void {
    const marker = this.getMarkerAtPoint(event.clientX, event.clientY)
    if (marker && this.options.onClick) {
      this.options.onClick(marker)
    }
  }

  private onContainerMouseMove(event: MouseEvent): void {
    const marker = this.getMarkerAtPoint(event.clientX, event.clientY)
    const markerId = marker?.id ?? null

    if (markerId !== this.hoveredMarker) {
      this.hoveredMarker = markerId
      if (this.options.onHover) {
        this.options.onHover(marker ?? null)
      }
      this.updateHoverStates()
    }
  }

  private getMarkerAtPoint(clientX: number, clientY: number): Marker | null {
    for (const [id, element] of this.markerElements) {
      const rect = element.getBoundingClientRect()
      if (
        clientX >= rect.left
        && clientX <= rect.right
        && clientY >= rect.top
        && clientY <= rect.bottom
      ) {
        return this.markers.get(id) ?? null
      }
    }
    return null
  }

  private updateHoverStates(): void {
    this.markerElements.forEach((element, id) => {
      const isHovered = id === this.hoveredMarker
      const iconEl = element.querySelector('.marker-icon') as HTMLElement
      if (iconEl) {
        iconEl.style.backgroundColor = isHovered ? this.options.hoverColor : this.options.markerColor
        iconEl.style.transform = isHovered ? 'scale(1.2)' : 'scale(1)'
      }
    })
  }

  /**
   * 添加标记点
   */
  public addMarker(marker: Omit<Marker, 'element'>): void {
    if (this.markers.size >= this.options.maxMarkers) {
      console.warn('Maximum number of markers reached')
      return
    }

    const fullMarker: Marker = {
      ...marker,
      element: this.createMarkerElement(marker),
    }

    this.markers.set(marker.id, fullMarker)
    this.markerElements.set(marker.id, fullMarker.element!)
    this.container.appendChild(fullMarker.element!)
  }

  private createMarkerElement(marker: Omit<Marker, 'element'>): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute;
      pointer-events: all;
      cursor: pointer;
      z-index: 100;
      transition: transform 0.2s;
    `

    const icon = document.createElement('div')
    icon.className = 'marker-icon'
    icon.style.cssText = `
      width: ${this.options.iconSize}px;
      height: ${this.options.iconSize}px;
      background-color: ${this.options.markerColor};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    `

    if (marker.icon) {
      icon.innerHTML = marker.icon
    }

    wrapper.appendChild(icon)

    if (this.options.showLabels && marker.label) {
      const label = document.createElement('div')
      label.style.cssText = `
        position: absolute;
        top: ${this.options.iconSize + 8}px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        padding: 4px 8px;
        background-color: ${this.options.labelBackgroundColor};
        color: ${this.options.labelColor};
        border-radius: 4px;
        font-size: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      `
      label.textContent = marker.label
      wrapper.appendChild(label)
    }

    return wrapper
  }

  /**
   * 移除标记点
   */
  public removeMarker(id: string): void {
    const element = this.markerElements.get(id)
    if (element && this.container.contains(element)) {
      this.container.removeChild(element)
    }
    this.markers.delete(id)
    this.markerElements.delete(id)
  }

  /**
   * 移除所有标记点
   */
  public clearMarkers(): void {
    this.markerElements.forEach((element) => {
      if (this.container.contains(element)) {
        this.container.removeChild(element)
      }
    })
    this.markers.clear()
    this.markerElements.clear()
  }

  /**
   * 更新标记点位置（每帧调用）
   */
  public update(): void {
    if (!this.options.enabled)
      return

    this.markers.forEach((marker, id) => {
      const element = this.markerElements.get(id)
      if (!element)
        return

      // 将3D位置投影到屏幕坐标
      const vector = marker.position.clone()
      vector.project(this.camera)

      // 检查是否在视野内
      const isInView = vector.z < 1 && Math.abs(vector.x) <= 1 && Math.abs(vector.y) <= 1

      if (isInView) {
        const x = (vector.x * 0.5 + 0.5) * this.container.clientWidth
        const y = (-vector.y * 0.5 + 0.5) * this.container.clientHeight

        element.style.display = 'block'
        element.style.left = `${x}px`
        element.style.top = `${y}px`
        element.style.transform = `translate(-50%, -50%)`
      }
      else {
        element.style.display = 'none'
      }
    })
  }

  /**
   * 获取所有标记
   */
  public getMarkers(): Marker[] {
    return Array.from(this.markers.values())
  }

  /**
   * 获取标记
   */
  public getMarker(id: string): Marker | undefined {
    return this.markers.get(id)
  }

  /**
   * 设置选项
   */
  public setOptions(options: Partial<MarkerOptions>): void {
    this.options = { ...this.options, ...options }

    // 重新创建所有标记以应用新样式
    if (options.markerColor || options.iconSize || options.showLabels) {
      const currentMarkers = Array.from(this.markers.values())
      this.clearMarkers()
      currentMarkers.forEach(marker => this.addMarker(marker))
    }
  }

  /**
   * 获取选项
   */
  public getOptions(): Required<MarkerOptions> {
    return { ...this.options }
  }

  /**
   * 显示/隐藏
   */
  public show(): void {
    this.options.enabled = true
    this.markerElements.forEach(el => (el.style.display = 'block'))
  }

  public hide(): void {
    this.options.enabled = false
    this.markerElements.forEach(el => (el.style.display = 'none'))
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.clearMarkers()
  }
}
