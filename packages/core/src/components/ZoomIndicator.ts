export interface ZoomIndicatorOptions {
  enabled?: boolean
  /** @deprecated Use UIToolbar instead */
  position?: 'left' | 'right'
  /** @deprecated Use UIToolbar instead */
  margin?: number
  /** Use slot container instead of absolute positioning */
  useSlot?: boolean
  showLevel?: boolean
  backgroundColor?: string
  buttonColor?: string
  textColor?: string
  minZoom?: number
  maxZoom?: number
  defaultZoom?: number
  onZoomChange?: (zoom: number) => void
}

const DEFAULT_OPTIONS: Required<Omit<ZoomIndicatorOptions, 'onZoomChange'>> = {
  enabled: true,
  position: 'right',
  margin: 16,
  useSlot: false,
  showLevel: true,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  buttonColor: 'rgba(255, 255, 255, 0.9)',
  textColor: 'rgba(255, 255, 255, 0.85)',
  minZoom: 30,
  maxZoom: 100,
  defaultZoom: 75,
}

/**
 * 缩放指示器 - 显示当前缩放级别，支持滑块控制
 */
export class ZoomIndicator {
  private container: HTMLElement
  private options: Required<Omit<ZoomIndicatorOptions, 'onZoomChange'>>
  private element: HTMLElement | null = null
  private visible: boolean = true
  private currentZoom: number = 75
  private onZoomChange?: (zoom: number) => void

  constructor(container: HTMLElement, options?: ZoomIndicatorOptions) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.visible = this.options.enabled
    this.currentZoom = this.options.defaultZoom
    this.onZoomChange = options?.onZoomChange

    if (this.options.enabled) {
      this.createElement()
    }
  }

  private createElement(): void {
    this.element = document.createElement('div')
    const { position, margin, backgroundColor, useSlot } = this.options

    const baseStyle = `
      background: ${backgroundColor};
      border-radius: 16px;
      padding: 4px 6px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      backdrop-filter: blur(8px);
      user-select: none;
      font-family: system-ui, -apple-system, sans-serif;
    `

    if (useSlot) {
      this.element.style.cssText = baseStyle
    } else {
      this.element.style.cssText = `
        position: absolute;
        ${position === 'left' ? 'left' : 'right'}: ${margin}px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1000;
        ${baseStyle}
      `
    }

    this.element.innerHTML = this.render()
    this.container.appendChild(this.element)
    this.bindEvents()
  }

  private render(): string {
    const { showLevel, buttonColor, textColor } = this.options
    const zoomLevel = this.getZoomLevel()

    return `
      <button class="zoom-btn zoom-in" style="
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        line-height: 1;
        transition: background 0.15s;
      ">+</button>
      <button class="zoom-btn zoom-out" style="
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        line-height: 1;
        transition: background 0.15s;
      ">−</button>
      ${showLevel ? `
        <span class="zoom-level" style="
          font-size: 11px;
          color: ${textColor};
          min-width: 28px;
          text-align: center;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        ">${zoomLevel.toFixed(1)}x</span>
      ` : ''}
    `
  }

  private bindEvents(): void {
    if (!this.element) return

    const zoomInBtn = this.element.querySelector('.zoom-in')
    const zoomOutBtn = this.element.querySelector('.zoom-out')

    zoomInBtn?.addEventListener('click', () => this.zoomIn())
    zoomOutBtn?.addEventListener('click', () => this.zoomOut())

    // Hover effects
    this.element.querySelectorAll('.zoom-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        (btn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.15)'
      })
      btn.addEventListener('mouseleave', () => {
        (btn as HTMLElement).style.background = 'transparent'
      })
    })
  }

  private getZoomLevel(): number {
    const { defaultZoom } = this.options
    return defaultZoom / this.currentZoom
  }

  public setZoom(zoom: number): void {
    const { minZoom, maxZoom } = this.options
    this.currentZoom = Math.max(minZoom, Math.min(maxZoom, zoom))
    this.updateUI()
    this.onZoomChange?.(this.currentZoom)
  }

  public zoomIn(): void {
    this.setZoom(this.currentZoom - 10)
  }

  public zoomOut(): void {
    this.setZoom(this.currentZoom + 10)
  }

  public resetZoom(): void {
    this.setZoom(this.options.defaultZoom)
  }

  public getZoom(): number {
    return this.currentZoom
  }

  private updateUI(): void {
    if (!this.element || !this.visible) return

    const levelEl = this.element.querySelector('.zoom-level')
    if (levelEl) {
      levelEl.textContent = `${this.getZoomLevel().toFixed(1)}x`
    }
  }

  public show(): void {
    this.visible = true
    if (!this.element) {
      this.createElement()
    } else {
      this.element.style.display = 'flex'
    }
  }

  public hide(): void {
    this.visible = false
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  public toggle(): void {
    this.visible ? this.hide() : this.show()
  }

  public isVisible(): boolean {
    return this.visible
  }

  public dispose(): void {
    if (this.element && this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
    this.element = null
  }
}
