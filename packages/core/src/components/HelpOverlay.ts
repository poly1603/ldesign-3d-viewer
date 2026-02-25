export interface HelpOverlayOptions {
  enabled?: boolean
  /** @deprecated Use UIToolbar instead */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** @deprecated Use UIToolbar instead */
  margin?: number
  /** Use slot container instead of absolute positioning */
  useSlot?: boolean
  /** Container for overlay (defaults to button container) */
  overlayContainer?: HTMLElement
  backgroundColor?: string
  buttonColor?: string
  textColor?: string
  showOnFirstVisit?: boolean
}

const DEFAULT_OPTIONS: Omit<Required<HelpOverlayOptions>, 'overlayContainer'> = {
  enabled: true,
  position: 'bottom-left',
  margin: 16,
  useSlot: false,
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  buttonColor: 'rgba(255, 255, 255, 0.9)',
  textColor: 'rgba(255, 255, 255, 0.9)',
  showOnFirstVisit: false,
}

interface HelpItem {
  icon: string
  title: string
  description: string
}

/**
 * 帮助提示覆盖层 - 显示操作说明
 */
export class HelpOverlay {
  private container: HTMLElement
  private overlayContainer: HTMLElement
  private options: Omit<Required<HelpOverlayOptions>, 'overlayContainer'>
  private buttonElement: HTMLElement | null = null
  private overlayElement: HTMLElement | null = null
  private visible: boolean = true
  private overlayOpen: boolean = false
  private customHelpItems: HelpItem[] = []

  constructor(container: HTMLElement, options?: HelpOverlayOptions) {
    this.container = container
    this.overlayContainer = options?.overlayContainer || container
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.visible = this.options.enabled

    if (this.options.enabled) {
      this.createButton()
      if (this.options.showOnFirstVisit && !this.hasVisited()) {
        setTimeout(() => this.showOverlay(), 500)
      }
    }
  }

  private hasVisited(): boolean {
    try {
      return localStorage.getItem('panorama-help-visited') === 'true'
    } catch {
      return false
    }
  }

  private markVisited(): void {
    try {
      localStorage.setItem('panorama-help-visited', 'true')
    } catch {
      // ignore
    }
  }

  private createButton(): void {
    this.buttonElement = document.createElement('button')
    const { position, margin, backgroundColor, buttonColor, useSlot } = this.options

    if (useSlot) {
      // 在槽位中使用，不需要绝对定位
      this.buttonElement.style.cssText = `
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: ${backgroundColor};
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.2s;
        user-select: none;
      `
    } else {
      const [vertical, horizontal] = position.split('-')
      this.buttonElement.style.cssText = `
        position: absolute;
        ${vertical}: ${margin}px;
        ${horizontal}: ${margin}px;
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: ${backgroundColor};
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.2s;
        z-index: 1000;
        user-select: none;
      `
    }
    this.buttonElement.innerHTML = '?'
    this.buttonElement.addEventListener('click', () => this.toggleOverlay())
    this.buttonElement.addEventListener('mouseenter', () => {
      this.buttonElement!.style.transform = 'scale(1.1)'
    })
    this.buttonElement.addEventListener('mouseleave', () => {
      this.buttonElement!.style.transform = 'scale(1)'
    })

    this.container.appendChild(this.buttonElement)
  }

  private getDefaultHelpItems(): HelpItem[] {
    return [
      {
        icon: '🖱️',
        title: '鼠标拖拽',
        description: '按住鼠标左键拖动可旋转视角',
      },
      {
        icon: '🔍',
        title: '滚轮缩放',
        description: '滚动鼠标滚轮可放大或缩小画面',
      },
      {
        icon: '👆',
        title: '触屏滑动',
        description: '在触屏设备上滑动可旋转视角',
      },
      {
        icon: '👌',
        title: '双指缩放',
        description: '在触屏设备上双指捏合可缩放',
      },
      {
        icon: '📍',
        title: '热点标记',
        description: '点击热点可查看详情或跳转场景',
      },
      {
        icon: '🧭',
        title: '罗盘导航',
        description: '点击罗盘可快速定位到指定方向',
      },
    ]
  }

  private getAllHelpItems(): HelpItem[] {
    return [...this.getDefaultHelpItems(), ...this.customHelpItems]
  }

  public showOverlay(): void {
    if (this.overlayElement) return
    this.overlayOpen = true

    const { backgroundColor, textColor } = this.options
    const helpItems = this.getAllHelpItems()

    this.overlayElement = document.createElement('div')
    this.overlayElement.style.cssText = `
      position: absolute;
      inset: 0;
      background: ${backgroundColor};
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: help-overlay-fade-in 0.3s ease;
    `

    // Add animation
    if (!document.getElementById('help-overlay-styles')) {
      const style = document.createElement('style')
      style.id = 'help-overlay-styles'
      style.textContent = `
        @keyframes help-overlay-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes help-item-slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
      document.head.appendChild(style)
    }

    this.overlayElement.innerHTML = `
      <div style="
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h2 style="
          text-align: center;
          color: ${textColor};
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          font-family: system-ui, -apple-system, sans-serif;
        ">操作说明</h2>
        <p style="
          text-align: center;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          margin-bottom: 32px;
        ">了解如何操作全景查看器</p>

        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        ">
          ${helpItems.map((item, index) => `
            <div style="
              background: rgba(255,255,255,0.05);
              border-radius: 12px;
              padding: 20px;
              display: flex;
              gap: 16px;
              align-items: flex-start;
              animation: help-item-slide-in 0.4s ease ${index * 0.05}s both;
            ">
              <div style="
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                flex-shrink: 0;
              ">${item.icon}</div>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 600;
                  color: ${textColor};
                  margin-bottom: 4px;
                ">${item.title}</div>
                <div style="
                  font-size: 12px;
                  color: rgba(255,255,255,0.6);
                  line-height: 1.5;
                ">${item.description}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="
          text-align: center;
          margin-top: 32px;
        ">
          <button class="help-close-btn" style="
            padding: 12px 48px;
            border: none;
            border-radius: 8px;
            background: #3b82f6;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">开始探索</button>
        </div>
      </div>

      <button class="help-dismiss-btn" style="
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.6);
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">×</button>
    `

    this.overlayContainer.appendChild(this.overlayElement)
    this.bindOverlayEvents()
    this.markVisited()
  }

  private bindOverlayEvents(): void {
    if (!this.overlayElement) return

    const closeBtn = this.overlayElement.querySelector('.help-close-btn')
    closeBtn?.addEventListener('click', () => this.hideOverlay())

    const dismissBtn = this.overlayElement.querySelector('.help-dismiss-btn')
    dismissBtn?.addEventListener('click', () => this.hideOverlay())

    // ESC to close
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hideOverlay()
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    document.addEventListener('keydown', handleKeydown)
  }

  public hideOverlay(): void {
    this.overlayOpen = false
    if (this.overlayElement) {
      this.overlayElement.style.animation = 'help-overlay-fade-in 0.2s ease reverse'
      setTimeout(() => {
        this.overlayElement?.remove()
        this.overlayElement = null
      }, 200)
    }
  }

  public toggleOverlay(): void {
    this.overlayOpen ? this.hideOverlay() : this.showOverlay()
  }

  public addHelpItem(item: HelpItem): void {
    this.customHelpItems.push(item)
  }

  public setHelpItems(items: HelpItem[]): void {
    this.customHelpItems = items
  }

  public clearCustomHelpItems(): void {
    this.customHelpItems = []
  }

  public show(): void {
    this.visible = true
    if (!this.buttonElement) {
      this.createButton()
    } else {
      this.buttonElement.style.display = 'flex'
    }
  }

  public hide(): void {
    this.visible = false
    this.hideOverlay()
    if (this.buttonElement) {
      this.buttonElement.style.display = 'none'
    }
  }

  public toggle(): void {
    this.visible ? this.hide() : this.show()
  }

  public isOverlayOpen(): boolean {
    return this.overlayOpen
  }

  public dispose(): void {
    this.hideOverlay()
    if (this.buttonElement && this.container.contains(this.buttonElement)) {
      this.container.removeChild(this.buttonElement)
    }
    this.buttonElement = null
  }
}
