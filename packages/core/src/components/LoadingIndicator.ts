export interface LoadingIndicatorOptions {
  enabled?: boolean
  style?: 'circular' | 'bar' | 'minimal'
  size?: number
  color?: string
  backgroundColor?: string
  textColor?: string
  showPercentage?: boolean
  showText?: boolean
  text?: string
  blurBackground?: boolean
}

const DEFAULT_OPTIONS: Required<LoadingIndicatorOptions> = {
  enabled: true,
  style: 'circular',
  size: 80,
  color: '#3b82f6',
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  textColor: 'rgba(255, 255, 255, 0.9)',
  showPercentage: true,
  showText: true,
  text: '加载中',
  blurBackground: true,
}

/**
 * 加载进度指示器 - 显示图片加载进度
 */
export class LoadingIndicator {
  private container: HTMLElement
  private element: HTMLElement | null = null
  private options: Required<LoadingIndicatorOptions>
  private progress: number = 0
  private visible: boolean = false

  constructor(container: HTMLElement, options?: LoadingIndicatorOptions) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * 显示加载指示器
   */
  public show(initialProgress: number = 0): void {
    if (!this.options.enabled)
      return

    this.progress = initialProgress
    this.visible = true

    if (!this.element) {
      this.element = this.createElement()
      this.container.appendChild(this.element)
    }

    this.element.style.display = 'flex'
    this.element.style.opacity = '1'
    this.updateProgress(initialProgress)
  }

  /**
   * 隐藏加载指示器
   */
  public hide(): void {
    this.visible = false
    if (this.element) {
      this.element.style.opacity = '0'
      setTimeout(() => {
        if (this.element && !this.visible) {
          this.element.style.display = 'none'
        }
      }, 300)
    }
  }

  /**
   * 更新进度
   */
  public updateProgress(progress: number): void {
    this.progress = Math.min(100, Math.max(0, progress))

    if (!this.element || !this.visible)
      return

    // 更新百分比文本
    const percentEl = this.element.querySelector('.loading-percent') as HTMLElement
    if (percentEl && this.options.showPercentage) {
      percentEl.textContent = `${Math.round(this.progress)}%`
    }

    if (this.options.style === 'circular') {
      // 更新圆形进度
      const circle = this.element.querySelector('.loading-progress') as SVGCircleElement
      if (circle) {
        const radius = (this.options.size - 10) / 2
        const circumference = 2 * Math.PI * radius
        const offset = circumference - (this.progress / 100) * circumference
        circle.setAttribute('stroke-dashoffset', String(offset))
      }
    }
    else if (this.options.style === 'bar') {
      // 更新条形进度
      const progressEl = this.element.querySelector('.loading-progress') as HTMLElement
      if (progressEl) {
        progressEl.style.width = `${this.progress}%`
      }
    }
  }

  private createElement(): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${this.options.backgroundColor};
      ${this.options.blurBackground ? 'backdrop-filter: blur(10px);' : ''}
      z-index: 9999;
      transition: opacity 0.3s;
    `

    if (this.options.style === 'circular') {
      wrapper.innerHTML = this.createCircularLoader()
    }
    else if (this.options.style === 'bar') {
      wrapper.innerHTML = this.createBarLoader()
    }
    else {
      wrapper.innerHTML = this.createMinimalLoader()
    }

    return wrapper
  }

  private createCircularLoader(): string {
    const { size, color, textColor, showPercentage, showText, text } = this.options
    const radius = (size - 10) / 2
    const circumference = 2 * Math.PI * radius
    const glowColor = this.hexToRgba(color, 0.5)

    return `
      <style>
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 8px ${glowColor}); }
          50% { filter: drop-shadow(0 0 20px ${glowColor}); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes text-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      </style>
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" style="transform: rotate(-90deg); animation: pulse-glow 2s ease-in-out infinite;">
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            stroke-width="4"
          />
          <circle
            class="loading-progress"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            fill="none"
            stroke="url(#gradient-${size})"
            stroke-width="4"
            stroke-linecap="round"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            style="transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1);"
          />
          <defs>
            <linearGradient id="gradient-${size}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="${color}" />
              <stop offset="100%" stop-color="${this.lightenColor(color, 30)}" />
            </linearGradient>
          </defs>
        </svg>
        ${showPercentage ? `
          <div class="loading-percent" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            font-weight: 600;
            color: ${textColor};
            font-family: system-ui, -apple-system, sans-serif;
            letter-spacing: -0.5px;
            animation: fade-in-up 0.5s ease-out;
          ">0%</div>
        ` : ''}
      </div>
      ${showText ? `
        <div style="
          margin-top: 20px;
          font-size: 14px;
          color: ${textColor};
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          gap: 2px;
        ">
          <span style="animation: text-pulse 2s ease-in-out infinite;">${text}</span>
          <span style="display: inline-flex; gap: 2px; margin-left: 2px;">
            <span style="animation: dot-bounce 1.4s ease-in-out infinite;">.</span>
            <span style="animation: dot-bounce 1.4s ease-in-out 0.2s infinite;">.</span>
            <span style="animation: dot-bounce 1.4s ease-in-out 0.4s infinite;">.</span>
          </span>
        </div>
      ` : ''}
    `
  }

  private createBarLoader(): string {
    const { color, textColor, showPercentage, showText, text } = this.options
    const lighterColor = this.lightenColor(color, 30)

    return `
      <style>
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bar-glow {
          0%, 100% { box-shadow: 0 0 10px ${this.hexToRgba(color, 0.3)}; }
          50% { box-shadow: 0 0 20px ${this.hexToRgba(color, 0.6)}; }
        }
      </style>
      <div style="width: 260px;">
        ${showText ? `
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
            font-size: 14px;
            color: ${textColor};
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <span>${text}</span>
            ${showPercentage ? '<span class="loading-percent" style="font-weight: 600; font-variant-numeric: tabular-nums;">0%</span>' : ''}
          </div>
        ` : ''}
        <div style="
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        ">
          <div class="loading-progress" style="
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, ${color}, ${lighterColor});
            border-radius: 3px;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            animation: bar-glow 2s ease-in-out infinite;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
              animation: shimmer 1.5s infinite;
            "></div>
          </div>
        </div>
      </div>
    `
  }

  private createMinimalLoader(): string {
    const { color, textColor, showPercentage } = this.options

    return `
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes minimal-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      </style>
      <div style="display: flex; align-items: center; gap: 12px; animation: minimal-pulse 2s ease-in-out infinite;">
        <div style="
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: ${color};
          border-right-color: ${color};
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        "></div>
        ${showPercentage ? `
          <span class="loading-percent" style="
            font-size: 14px;
            font-weight: 500;
            color: ${textColor};
            font-family: system-ui, -apple-system, sans-serif;
            font-variant-numeric: tabular-nums;
          ">0%</span>
        ` : ''}
      </div>
    `
  }

  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return `#${(
      0x1000000
      + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000
      + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100
      + (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`
  }

  private hexToRgba(hex: string, alpha: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const R = (num >> 16) & 0xff
    const G = (num >> 8) & 0xff
    const B = num & 0xff
    return `rgba(${R}, ${G}, ${B}, ${alpha})`
  }

  /**
   * 设置选项
   */
  public setOptions(options: Partial<LoadingIndicatorOptions>): void {
    this.options = { ...this.options, ...options }

    // 如果正在显示，重新创建元素
    if (this.visible && this.element) {
      const progress = this.progress
      this.container.removeChild(this.element)
      this.element = null
      this.show(progress)
    }
  }

  /**
   * 获取选项
   */
  public getOptions(): Required<LoadingIndicatorOptions> {
    return { ...this.options }
  }

  /**
   * 获取当前进度
   */
  public getProgress(): number {
    return this.progress
  }

  /**
   * 是否正在显示
   */
  public isVisible(): boolean {
    return this.visible
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.element && this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
    this.element = null
  }
}
