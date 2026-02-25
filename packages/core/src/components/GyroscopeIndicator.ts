export interface GyroscopeIndicatorOptions {
  enabled?: boolean
  /** @deprecated Use UIToolbar instead */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** @deprecated Use UIToolbar instead */
  margin?: number
  /** Use slot container instead of absolute positioning */
  useSlot?: boolean
  backgroundColor?: string
  activeColor?: string
  inactiveColor?: string
  textColor?: string
  autoEnable?: boolean
}

const DEFAULT_OPTIONS: Required<GyroscopeIndicatorOptions> = {
  enabled: true,
  position: 'bottom-right',
  margin: 16,
  useSlot: false,
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  activeColor: '#22c55e',
  inactiveColor: 'rgba(255, 255, 255, 0.3)',
  textColor: 'rgba(255, 255, 255, 0.9)',
  autoEnable: false,
}

interface DeviceOrientation {
  alpha: number | null // Z轴旋转 (0-360)
  beta: number | null // X轴旋转 (-180 to 180)
  gamma: number | null // Y轴旋转 (-90 to 90)
}

/**
 * 陀螺仪状态指示器 - 显示设备方向传感器状态
 */
export class GyroscopeIndicator {
  private container: HTMLElement
  private options: Required<GyroscopeIndicatorOptions>
  private element: HTMLElement | null = null
  private visible: boolean = true
  private gyroEnabled: boolean = false
  private gyroSupported: boolean = false
  private orientation: DeviceOrientation = { alpha: null, beta: null, gamma: null }
  private onGyroToggle?: (enabled: boolean) => void
  private onOrientationChange?: (orientation: DeviceOrientation) => void
  private boundHandleOrientation: (e: DeviceOrientationEvent) => void

  constructor(
    container: HTMLElement,
    options?: GyroscopeIndicatorOptions & {
      onGyroToggle?: (enabled: boolean) => void
      onOrientationChange?: (orientation: DeviceOrientation) => void
    },
  ) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.visible = this.options.enabled
    this.onGyroToggle = options?.onGyroToggle
    this.onOrientationChange = options?.onOrientationChange
    this.boundHandleOrientation = this.handleOrientation.bind(this)

    this.checkGyroscopeSupport()

    if (this.options.enabled) {
      this.createElement()
      if (this.options.autoEnable && this.gyroSupported) {
        this.enableGyroscope()
      }
    }
  }

  private checkGyroscopeSupport(): void {
    // Check if DeviceOrientationEvent is supported
    this.gyroSupported =
      typeof DeviceOrientationEvent !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }

  private createElement(): void {
    this.element = document.createElement('div')
    const { position, margin, backgroundColor, useSlot } = this.options

    if (useSlot) {
      // 在槽位中使用，不需要绝对定位
      this.element.style.cssText = `
        background: ${backgroundColor};
        border-radius: 12px;
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        user-select: none;
        cursor: pointer;
        transition: all 0.2s;
      `
    } else {
      const [vertical, horizontal] = position.split('-')
      this.element.style.cssText = `
        position: absolute;
        ${vertical}: ${margin}px;
        ${horizontal}: ${margin}px;
        background: ${backgroundColor};
        border-radius: 12px;
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        user-select: none;
        cursor: pointer;
        transition: all 0.2s;
      `
    }

    this.element.innerHTML = this.render()
    this.element.addEventListener('click', () => this.toggleGyroscope())
    this.element.addEventListener('mouseenter', () => {
      this.element!.style.transform = 'scale(1.02)'
    })
    this.element.addEventListener('mouseleave', () => {
      this.element!.style.transform = 'scale(1)'
    })

    this.container.appendChild(this.element)
  }

  private render(): string {
    const { activeColor, inactiveColor, textColor } = this.options
    const statusColor = this.gyroEnabled ? activeColor : inactiveColor
    const statusText = !this.gyroSupported
      ? '不支持'
      : this.gyroEnabled
        ? '已启用'
        : '已禁用'

    return `
      <div class="gyro-icon" style="
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" style="
          transition: stroke 0.3s;
          ${this.gyroEnabled ? 'animation: gyro-pulse 2s infinite;' : ''}
        ">
          <circle cx="12" cy="12" r="3"/>
          <circle cx="12" cy="12" r="8" stroke-dasharray="4 2"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
        </svg>
      </div>
      <div class="gyro-info" style="
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 60px;
      ">
        <div style="
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          font-family: system-ui, -apple-system, sans-serif;
        ">陀螺仪</div>
        <div style="
          font-size: 12px;
          font-weight: 500;
          color: ${statusColor};
          transition: color 0.3s;
        ">${statusText}</div>
      </div>
      ${this.gyroEnabled ? this.renderOrientationData() : ''}
    `
  }

  private renderOrientationData(): string {
    const { alpha, beta, gamma } = this.orientation
    const { textColor } = this.options

    if (alpha === null) return ''

    return `
      <div class="gyro-data" style="
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-left: 8px;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        font-family: 'SF Mono', 'Consolas', monospace;
      ">
        <div style="font-size: 9px; color: ${textColor};">
          α: ${alpha?.toFixed(0) ?? '--'}°
        </div>
        <div style="font-size: 9px; color: ${textColor};">
          β: ${beta?.toFixed(0) ?? '--'}°
        </div>
        <div style="font-size: 9px; color: ${textColor};">
          γ: ${gamma?.toFixed(0) ?? '--'}°
        </div>
      </div>
    `
  }

  private handleOrientation(event: DeviceOrientationEvent): void {
    this.orientation = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    }
    this.onOrientationChange?.(this.orientation)
    this.updateUI()
  }

  public async enableGyroscope(): Promise<boolean> {
    if (!this.gyroSupported) return false

    // iOS 13+ requires permission request
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission()
        if (permission !== 'granted') {
          console.warn('Gyroscope permission denied')
          return false
        }
      } catch (error) {
        console.warn('Failed to request gyroscope permission:', error)
        return false
      }
    }

    window.addEventListener('deviceorientation', this.boundHandleOrientation)
    this.gyroEnabled = true
    this.onGyroToggle?.(true)

    // Add animation styles
    if (!document.getElementById('gyro-indicator-styles')) {
      const style = document.createElement('style')
      style.id = 'gyro-indicator-styles'
      style.textContent = `
        @keyframes gyro-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `
      document.head.appendChild(style)
    }

    this.updateUI()
    return true
  }

  public disableGyroscope(): void {
    window.removeEventListener('deviceorientation', this.boundHandleOrientation)
    this.gyroEnabled = false
    this.orientation = { alpha: null, beta: null, gamma: null }
    this.onGyroToggle?.(false)
    this.updateUI()
  }

  public toggleGyroscope(): void {
    if (this.gyroEnabled) {
      this.disableGyroscope()
    } else {
      this.enableGyroscope()
    }
  }

  public isGyroscopeEnabled(): boolean {
    return this.gyroEnabled
  }

  public isGyroscopeSupported(): boolean {
    return this.gyroSupported
  }

  public getOrientation(): DeviceOrientation {
    return { ...this.orientation }
  }

  private updateUI(): void {
    if (!this.element) return
    this.element.innerHTML = this.render()
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

  public dispose(): void {
    this.disableGyroscope()
    if (this.element && this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
    this.element = null
  }
}
