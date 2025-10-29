/**
 * 比较模式
 * 分屏对比两个全景，支持同步控制
 */

import * as THREE from 'three'

export interface ComparisonConfig {
  mode: 'split-vertical' | 'split-horizontal' | 'slider'
  splitPosition: number // 0-1
  syncCamera: boolean
  syncZoom: boolean
}

export class ComparisonView {
  private container: HTMLElement
  private leftViewer: any // PanoramaViewer实例
  private rightViewer: any // PanoramaViewer实例
  private config: Required<ComparisonConfig>
  private divider: HTMLElement
  private isDragging = false

  private defaultConfig: ComparisonConfig = {
    mode: 'split-vertical',
    splitPosition: 0.5,
    syncCamera: true,
    syncZoom: true,
  }

  constructor(
    container: HTMLElement,
    leftViewer: any,
    rightViewer: any,
    config?: Partial<ComparisonConfig>,
  ) {
    this.container = container
    this.leftViewer = leftViewer
    this.rightViewer = rightViewer
    this.config = { ...this.defaultConfig, ...config }

    // 创建分隔线
    this.divider = this.createDivider()
    this.setupLayout()
    this.setupSyncControls()
  }

  /**
   * 创建分隔线
   */
  private createDivider(): HTMLElement {
    const divider = document.createElement('div')
    divider.style.position = 'absolute'
    divider.style.backgroundColor = '#ffffff'
    divider.style.cursor = this.config.mode === 'slider' ? 'ew-resize' : 'default'
    divider.style.zIndex = '100'

    if (this.config.mode === 'split-vertical' || this.config.mode === 'slider') {
      divider.style.width = '4px'
      divider.style.height = '100%'
      divider.style.left = `${this.config.splitPosition * 100}%`
      divider.style.top = '0'
    }
    else {
      divider.style.width = '100%'
      divider.style.height = '4px'
      divider.style.left = '0'
      divider.style.top = `${this.config.splitPosition * 100}%`
    }

    this.container.appendChild(divider)

    if (this.config.mode === 'slider') {
      this.setupDividerDrag()
    }

    return divider
  }

  /**
   * 设置布局
   */
  private setupLayout(): void {
    const leftContainer = this.leftViewer.container
    const rightContainer = this.rightViewer.container

    leftContainer.style.position = 'absolute'
    rightContainer.style.position = 'absolute'

    this.updateLayout()
  }

  /**
   * 更新布局
   */
  private updateLayout(): void {
    const leftContainer = this.leftViewer.container
    const rightContainer = this.rightViewer.container
    const split = this.config.splitPosition

    if (this.config.mode === 'split-vertical' || this.config.mode === 'slider') {
      // 垂直分割
      leftContainer.style.left = '0'
      leftContainer.style.top = '0'
      leftContainer.style.width = `${split * 100}%`
      leftContainer.style.height = '100%'

      rightContainer.style.left = `${split * 100}%`
      rightContainer.style.top = '0'
      rightContainer.style.width = `${(1 - split) * 100}%`
      rightContainer.style.height = '100%'

      this.divider.style.left = `${split * 100}%`
      this.divider.style.top = '0'
    }
    else {
      // 水平分割
      leftContainer.style.left = '0'
      leftContainer.style.top = '0'
      leftContainer.style.width = '100%'
      leftContainer.style.height = `${split * 100}%`

      rightContainer.style.left = '0'
      rightContainer.style.top = `${split * 100}%`
      rightContainer.style.width = '100%'
      rightContainer.style.height = `${(1 - split) * 100}%`

      this.divider.style.left = '0'
      this.divider.style.top = `${split * 100}%`
    }

    // 触发viewer的resize
    this.leftViewer.resize?.()
    this.rightViewer.resize?.()
  }

  /**
   * 设置分隔线拖拽
   */
  private setupDividerDrag(): void {
    this.divider.addEventListener('mousedown', (e) => {
      this.isDragging = true
      e.preventDefault()
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging)
        return

      const rect = this.container.getBoundingClientRect()

      if (this.config.mode === 'split-vertical' || this.config.mode === 'slider') {
        const x = e.clientX - rect.left
        this.config.splitPosition = THREE.MathUtils.clamp(x / rect.width, 0.1, 0.9)
      }
      else {
        const y = e.clientY - rect.top
        this.config.splitPosition = THREE.MathUtils.clamp(y / rect.height, 0.1, 0.9)
      }

      this.updateLayout()
    })

    window.addEventListener('mouseup', () => {
      this.isDragging = false
    })
  }

  /**
   * 设置同步控制
   */
  private setupSyncControls(): void {
    if (!this.config.syncCamera)
      return

    // 同步相机旋转
    // 注意：这需要viewer暴露相机旋转事件
    // 简化实现：定期同步
    setInterval(() => {
      if (this.config.syncCamera) {
        const leftRotation = this.leftViewer.getRotation?.()
        if (leftRotation) {
          this.rightViewer.setRotation?.(leftRotation.x, leftRotation.y, leftRotation.z)
        }
      }

      if (this.config.syncZoom) {
        const leftFov = this.leftViewer.camera?.fov
        if (leftFov && this.rightViewer.camera) {
          this.rightViewer.camera.fov = leftFov
          this.rightViewer.camera.updateProjectionMatrix()
        }
      }
    }, 50)
  }

  /**
   * 设置分割位置
   */
  public setSplitPosition(position: number): void {
    this.config.splitPosition = THREE.MathUtils.clamp(position, 0, 1)
    this.updateLayout()
  }

  /**
   * 设置同步模式
   */
  public setSyncCamera(enabled: boolean): void {
    this.config.syncCamera = enabled
  }

  /**
   * 设置缩放同步
   */
  public setSyncZoom(enabled: boolean): void {
    this.config.syncZoom = enabled
  }

  /**
   * 切换左右图像
   */
  public swap(): void {
    const leftImage = this.leftViewer.getCurrentImage?.()
    const rightImage = this.rightViewer.getCurrentImage?.()

    if (leftImage && rightImage) {
      this.leftViewer.loadImage?.(rightImage)
      this.rightViewer.loadImage?.(leftImage)
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.divider.remove()
  }
}
