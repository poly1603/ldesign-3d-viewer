import * as THREE from 'three'
import type { CompassOptions } from '../types'

const DEFAULT_OPTIONS: Required<CompassOptions> = {
  enabled: true,
  size: 100,
  position: 'bottom-right',
  margin: 16,
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  pointerColor: '#3b82f6',
  northColor: '#ef4444',
  textColor: 'rgba(255, 255, 255, 0.9)',
  showCardinals: true,
  showDegrees: false,
  style: 'modern',
}

export class MiniMap {
  private container: HTMLElement
  private miniMapElement: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private camera: THREE.PerspectiveCamera
  private options: Required<CompassOptions>
  private visible: boolean = true
  private dpr: number = 1

  constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, options?: CompassOptions) {
    this.container = container
    this.camera = camera
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.visible = this.options.enabled

    // Create mini map container
    this.miniMapElement = document.createElement('div')
    this.applyContainerStyles()

    // Create canvas with high DPI support
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.options.size * this.dpr
    this.canvas.height = this.options.size * this.dpr
    this.canvas.style.width = `${this.options.size}px`
    this.canvas.style.height = `${this.options.size}px`
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.scale(this.dpr, this.dpr)

    this.miniMapElement.appendChild(this.canvas)
    this.container.appendChild(this.miniMapElement)

    if (!this.options.enabled) {
      this.hide()
    }
  }

  private applyContainerStyles(): void {
    const { size, position, margin, backgroundColor } = this.options
    const positions: Record<string, string> = {
      'top-left': `top: ${margin}px; left: ${margin}px;`,
      'top-right': `top: ${margin}px; right: ${margin}px;`,
      'bottom-left': `bottom: ${margin}px; left: ${margin}px;`,
      'bottom-right': `bottom: ${margin}px; right: ${margin}px;`,
    }

    this.miniMapElement.style.cssText = `
      position: absolute;
      ${positions[position]}
      width: ${size}px;
      height: ${size}px;
      background: ${backgroundColor};
      border-radius: 50%;
      overflow: hidden;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      transition: opacity 0.2s, transform 0.2s;
    `
  }

  public update(): void {
    if (!this.visible) return

    const ctx = this.ctx
    const size = this.options.size
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 4

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Get camera rotation
    const euler = new THREE.Euler()
    euler.setFromQuaternion(this.camera.quaternion, 'YXZ')
    const yaw = -euler.y

    // Draw based on style
    if (this.options.style === 'modern') {
      this.drawModernCompass(ctx, centerX, centerY, radius, yaw)
    } else if (this.options.style === 'minimal') {
      this.drawMinimalCompass(ctx, centerX, centerY, radius, yaw)
    } else {
      this.drawClassicCompass(ctx, centerX, centerY, radius, yaw)
    }
  }

  private drawModernCompass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, yaw: number): void {
    const { pointerColor, northColor, textColor, showCardinals, showDegrees } = this.options

    // Outer ring gradient
    const gradient = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0.3)')
    ctx.strokeStyle = gradient
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
    ctx.stroke()

    // Inner circle
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)'
    ctx.beginPath()
    ctx.arc(cx, cy, r - 8, 0, Math.PI * 2)
    ctx.fill()

    // Tick marks
    for (let i = 0; i < 36; i++) {
      const angle = (i * 10 * Math.PI) / 180 - yaw
      const isMain = i % 9 === 0
      const innerR = isMain ? r - 20 : r - 14
      const outerR = r - 8

      ctx.strokeStyle = isMain ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = isMain ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(cx + Math.sin(angle) * innerR, cy - Math.cos(angle) * innerR)
      ctx.lineTo(cx + Math.sin(angle) * outerR, cy - Math.cos(angle) * outerR)
      ctx.stroke()
    }

    // Cardinal directions
    if (showCardinals) {
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const cardinals = [
        { label: 'N', angle: 0, color: northColor },
        { label: 'E', angle: Math.PI / 2, color: textColor },
        { label: 'S', angle: Math.PI, color: textColor },
        { label: 'W', angle: -Math.PI / 2, color: textColor },
      ]

      cardinals.forEach(({ label, angle, color }) => {
        const actualAngle = angle - yaw
        const x = cx + Math.sin(actualAngle) * (r - 28)
        const y = cy - Math.cos(actualAngle) * (r - 28)
        ctx.fillStyle = color
        ctx.fillText(label, x, y)
      })
    }

    // Center pointer (direction indicator)
    ctx.save()
    ctx.translate(cx, cy)

    // Glow effect
    ctx.shadowColor = pointerColor
    ctx.shadowBlur = 10

    // Pointer shape
    ctx.fillStyle = pointerColor
    ctx.beginPath()
    ctx.moveTo(0, -r + 24)
    ctx.lineTo(-6, -4)
    ctx.lineTo(0, 4)
    ctx.lineTo(6, -4)
    ctx.closePath()
    ctx.fill()

    ctx.shadowBlur = 0

    // Center dot
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(0, 0, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Degree display
    if (showDegrees) {
      const degrees = Math.round(((yaw * 180) / Math.PI + 360) % 360)
      ctx.fillStyle = textColor
      ctx.font = '10px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${degrees}\u00b0`, cx, cy + r - 16)
    }
  }

  private drawMinimalCompass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, yaw: number): void {
    const { pointerColor, northColor, textColor } = this.options

    // Simple ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, r - 4, 0, Math.PI * 2)
    ctx.stroke()

    // North indicator
    const northAngle = -yaw
    ctx.fillStyle = northColor
    ctx.beginPath()
    ctx.arc(cx + Math.sin(northAngle) * (r - 12), cy - Math.cos(northAngle) * (r - 12), 4, 0, Math.PI * 2)
    ctx.fill()

    // Direction pointer
    ctx.fillStyle = pointerColor
    ctx.beginPath()
    ctx.moveTo(cx, cy - r + 16)
    ctx.lineTo(cx - 5, cy)
    ctx.lineTo(cx + 5, cy)
    ctx.closePath()
    ctx.fill()

    // Center
    ctx.fillStyle = textColor
    ctx.beginPath()
    ctx.arc(cx, cy, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawClassicCompass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, yaw: number): void {
    const { northColor, textColor, showCardinals } = this.options

    // Outer border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
    ctx.stroke()

    // Inner circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(cx, cy, r - 20, 0, Math.PI * 2)
    ctx.stroke()

    // Cardinals
    if (showCardinals) {
      ctx.font = '12px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const cardinals = [
        { label: 'N', angle: 0, color: northColor },
        { label: 'E', angle: Math.PI / 2, color: textColor },
        { label: 'S', angle: Math.PI, color: textColor },
        { label: 'W', angle: -Math.PI / 2, color: textColor },
      ]

      cardinals.forEach(({ label, angle, color }) => {
        const actualAngle = angle - yaw
        const x = cx + Math.sin(actualAngle) * (r - 12)
        const y = cy - Math.cos(actualAngle) * (r - 12)
        ctx.fillStyle = color
        ctx.fillText(label, x, y)
      })
    }

    // Classic needle
    ctx.save()
    ctx.translate(cx, cy)

    // Red half (north)
    ctx.fillStyle = northColor
    ctx.beginPath()
    ctx.moveTo(0, -r + 24)
    ctx.lineTo(-4, 0)
    ctx.lineTo(4, 0)
    ctx.closePath()
    ctx.fill()

    // White half (south)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.moveTo(0, r - 24)
    ctx.lineTo(-4, 0)
    ctx.lineTo(4, 0)
    ctx.closePath()
    ctx.fill()

    // Center pin
    ctx.fillStyle = '#888'
    ctx.beginPath()
    ctx.arc(0, 0, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#aaa'
    ctx.beginPath()
    ctx.arc(0, 0, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  public setOptions(options: Partial<CompassOptions>): void {
    this.options = { ...this.options, ...options }
    this.applyContainerStyles()

    // Resize canvas if size changed
    if (options.size) {
      this.canvas.width = this.options.size * this.dpr
      this.canvas.height = this.options.size * this.dpr
      this.canvas.style.width = `${this.options.size}px`
      this.canvas.style.height = `${this.options.size}px`
      this.ctx.scale(this.dpr, this.dpr)
    }

    if (options.enabled !== undefined) {
      options.enabled ? this.show() : this.hide()
    }

    this.update()
  }

  public getOptions(): Required<CompassOptions> {
    return { ...this.options }
  }

  public show(): void {
    this.visible = true
    this.miniMapElement.style.display = 'block'
    this.miniMapElement.style.opacity = '1'
  }

  public hide(): void {
    this.visible = false
    this.miniMapElement.style.opacity = '0'
    setTimeout(() => {
      if (!this.visible) {
        this.miniMapElement.style.display = 'none'
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
    if (this.container.contains(this.miniMapElement)) {
      this.container.removeChild(this.miniMapElement)
    }
  }
}
