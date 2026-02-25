import * as THREE from 'three'

export interface ViewIndicatorOptions {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  margin?: number
  showPitch?: boolean
  showYaw?: boolean
  showFov?: boolean
  showCoordinates?: boolean
  fontSize?: number
  textColor?: string
  backgroundColor?: string
  style?: 'compact' | 'detailed' | 'minimal'
}

const DEFAULT_OPTIONS: Required<ViewIndicatorOptions> = {
  enabled: true,
  position: 'top-left',
  margin: 16,
  showPitch: true,
  showYaw: true,
  showFov: true,
  showCoordinates: false,
  fontSize: 12,
  textColor: 'rgba(255, 255, 255, 0.9)',
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  style: 'compact',
}

/**
 * 视角指示器 - 显示当前视角的俯仰角、方位角、视场角信息
 */
export class ViewIndicator {
  private container: HTMLElement
  private camera: THREE.PerspectiveCamera
  private options: Required<ViewIndicatorOptions>
  private element: HTMLElement
  private visible: boolean = true

  constructor(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    options?: ViewIndicatorOptions,
  ) {
    this.container = container
    this.camera = camera
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.visible = this.options.enabled

    this.element = this.createElement()
    this.container.appendChild(this.element)

    if (!this.options.enabled) {
      this.hide()
    }
  }

  private createElement(): HTMLElement {
    const element = document.createElement('div')
    this.applyStyles(element)
    return element
  }

  private applyStyles(element: HTMLElement): void {
    const { position, margin, fontSize, textColor, backgroundColor, style } = this.options
    const positions: Record<string, string> = {
      'top-left': `top: ${margin}px; left: ${margin}px;`,
      'top-right': `top: ${margin}px; right: ${margin}px;`,
      'bottom-left': `bottom: ${margin}px; left: ${margin}px;`,
      'bottom-right': `bottom: ${margin}px; right: ${margin}px;`,
    }

    const baseStyle = `
      position: absolute;
      ${positions[position]}
      background: ${backgroundColor};
      color: ${textColor};
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: ${fontSize}px;
      z-index: 1000;
      backdrop-filter: blur(8px);
      transition: opacity 0.2s;
      user-select: none;
    `

    if (style === 'minimal') {
      element.style.cssText = `
        ${baseStyle}
        padding: 6px 10px;
        border-radius: 4px;
      `
    }
    else if (style === 'detailed') {
      element.style.cssText = `
        ${baseStyle}
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `
    }
    else {
      element.style.cssText = `
        ${baseStyle}
        padding: 8px 12px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      `
    }
  }

  /**
   * 更新显示信息
   */
  public update(): void {
    if (!this.visible)
      return

    const euler = new THREE.Euler()
    euler.setFromQuaternion(this.camera.quaternion, 'YXZ')

    // 计算角度（转换为度数）
    const pitch = THREE.MathUtils.radToDeg(euler.x)
    const yaw = THREE.MathUtils.radToDeg(euler.y)
    const fov = this.camera.fov

    // 计算方位方向
    const direction = this.getDirection(yaw)

    let html = ''

    if (this.options.style === 'detailed') {
      html = this.renderDetailed(pitch, yaw, fov, direction)
    }
    else if (this.options.style === 'minimal') {
      html = this.renderMinimal(pitch, yaw, direction)
    }
    else {
      html = this.renderCompact(pitch, yaw, fov, direction)
    }

    this.element.innerHTML = html
  }

  private getDirection(yaw: number): string {
    // Normalize yaw to 0-360
    let normalizedYaw = ((yaw % 360) + 360) % 360

    if (normalizedYaw >= 337.5 || normalizedYaw < 22.5)
      return 'N'
    if (normalizedYaw >= 22.5 && normalizedYaw < 67.5)
      return 'NW'
    if (normalizedYaw >= 67.5 && normalizedYaw < 112.5)
      return 'W'
    if (normalizedYaw >= 112.5 && normalizedYaw < 157.5)
      return 'SW'
    if (normalizedYaw >= 157.5 && normalizedYaw < 202.5)
      return 'S'
    if (normalizedYaw >= 202.5 && normalizedYaw < 247.5)
      return 'SE'
    if (normalizedYaw >= 247.5 && normalizedYaw < 292.5)
      return 'E'
    return 'NE'
  }

  private renderCompact(pitch: number, yaw: number, fov: number, direction: string): string {
    const items: string[] = []

    if (this.options.showYaw) {
      items.push(`<span style="color: #60a5fa;">${direction}</span>`)
    }

    if (this.options.showPitch) {
      const pitchIcon = pitch > 0 ? '↑' : pitch < 0 ? '↓' : '→'
      items.push(`${pitchIcon} ${Math.abs(pitch).toFixed(1)}°`)
    }

    if (this.options.showFov) {
      items.push(`<span style="opacity: 0.7;">FOV ${fov.toFixed(0)}°</span>`)
    }

    return `<div style="display: flex; gap: 12px; align-items: center;">${items.join('')}</div>`
  }

  private renderDetailed(pitch: number, yaw: number, fov: number, direction: string): string {
    let html = '<div style="display: flex; flex-direction: column; gap: 6px;">'

    if (this.options.showYaw) {
      const normalizedYaw = ((Math.round(-yaw) % 360) + 360) % 360
      html += `
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <span style="opacity: 0.7;">方位</span>
          <span><span style="color: #60a5fa; font-weight: 600;">${direction}</span> ${normalizedYaw}°</span>
        </div>
      `
    }

    if (this.options.showPitch) {
      const pitchLabel = pitch > 10 ? '仰视' : pitch < -10 ? '俯视' : '平视'
      html += `
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <span style="opacity: 0.7;">俯仰</span>
          <span>${pitchLabel} ${pitch.toFixed(1)}°</span>
        </div>
      `
    }

    if (this.options.showFov) {
      const zoomLevel = 75 / fov
      html += `
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <span style="opacity: 0.7;">视角</span>
          <span>FOV ${fov.toFixed(0)}° (${zoomLevel.toFixed(1)}x)</span>
        </div>
      `
    }

    if (this.options.showCoordinates) {
      const pos = this.camera.position
      html += `
        <div style="display: flex; justify-content: space-between; gap: 20px; opacity: 0.6; font-size: 10px; margin-top: 4px;">
          <span>坐标</span>
          <span>x:${pos.x.toFixed(2)} y:${pos.y.toFixed(2)} z:${pos.z.toFixed(2)}</span>
        </div>
      `
    }

    html += '</div>'
    return html
  }

  private renderMinimal(pitch: number, yaw: number, direction: string): string {
    const normalizedYaw = ((Math.round(-yaw) % 360) + 360) % 360
    return `<span style="color: #60a5fa;">${direction}</span> ${normalizedYaw}°`
  }

  /**
   * 设置选项
   */
  public setOptions(options: Partial<ViewIndicatorOptions>): void {
    this.options = { ...this.options, ...options }
    this.applyStyles(this.element)

    if (options.enabled !== undefined) {
      options.enabled ? this.show() : this.hide()
    }

    this.update()
  }

  /**
   * 获取选项
   */
  public getOptions(): Required<ViewIndicatorOptions> {
    return { ...this.options }
  }

  public show(): void {
    this.visible = true
    this.element.style.display = 'block'
    this.element.style.opacity = '1'
  }

  public hide(): void {
    this.visible = false
    this.element.style.opacity = '0'
    setTimeout(() => {
      if (!this.visible) {
        this.element.style.display = 'none'
      }
    }, 200)
  }

  public toggle(): void {
    this.visible ? this.hide() : this.show()
  }

  public isVisible(): boolean {
    return this.visible
  }

  public dispose(): void {
    if (this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
  }
}
