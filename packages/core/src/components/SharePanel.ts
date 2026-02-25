export interface SharePanelOptions {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  margin?: number
  backgroundColor?: string
  buttonColor?: string
  activeColor?: string
  textColor?: string
  showQRCode?: boolean
  copyNotification?: boolean
}

const DEFAULT_OPTIONS: Required<SharePanelOptions> = {
  enabled: true,
  position: 'top-right',
  margin: 16,
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  buttonColor: 'rgba(255, 255, 255, 0.9)',
  activeColor: '#3b82f6',
  textColor: 'rgba(255, 255, 255, 0.9)',
  showQRCode: true,
  copyNotification: true,
}

/**
 * 分享面板 - 生成分享链接和二维码
 */
export class SharePanel {
  private container: HTMLElement
  private options: Required<SharePanelOptions>
  private element: HTMLElement | null = null
  private panelElement: HTMLElement | null = null
  private visible: boolean = true
  private panelOpen: boolean = false
  private getShareUrl?: () => string
  private onShare?: (platform: string, url: string) => void

  constructor(
    container: HTMLElement,
    options?: SharePanelOptions & {
      getShareUrl?: () => string
      onShare?: (platform: string, url: string) => void
    },
  ) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.visible = this.options.enabled
    this.getShareUrl = options?.getShareUrl
    this.onShare = options?.onShare

    if (this.options.enabled) {
      this.createElement()
    }
  }

  private createElement(): void {
    this.element = document.createElement('div')
    const { position, margin, backgroundColor, buttonColor } = this.options

    const [vertical, horizontal] = position.split('-')

    this.element.style.cssText = `
      position: absolute;
      ${vertical}: ${margin}px;
      ${horizontal}: ${margin}px;
      z-index: 1000;
      user-select: none;
    `

    // Share button
    const button = document.createElement('button')
    button.className = 'share-trigger'
    button.style.cssText = `
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
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    `
    button.innerHTML = this.getShareIcon()
    button.addEventListener('click', () => this.togglePanel())
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)'
    })
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)'
    })

    this.element.appendChild(button)
    this.container.appendChild(this.element)
  }

  private getShareIcon(): string {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    `
  }

  private togglePanel(): void {
    this.panelOpen ? this.closePanel() : this.openPanel()
  }

  private openPanel(): void {
    if (this.panelElement) return
    this.panelOpen = true

    const { position, backgroundColor, textColor, activeColor, showQRCode } = this.options
    const [vertical, horizontal] = position.split('-')
    const shareUrl = this.getShareUrl ? this.getShareUrl() : window.location.href

    this.panelElement = document.createElement('div')
    this.panelElement.style.cssText = `
      position: absolute;
      ${vertical === 'top' ? 'top' : 'bottom'}: 56px;
      ${horizontal}: 0;
      background: ${backgroundColor};
      border-radius: 12px;
      padding: 16px;
      min-width: 280px;
      backdrop-filter: blur(8px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: sharePanel-fade-in 0.2s ease;
    `

    // Add animation keyframes
    if (!document.getElementById('share-panel-styles')) {
      const style = document.createElement('style')
      style.id = 'share-panel-styles'
      style.textContent = `
        @keyframes sharePanel-fade-in {
          from { opacity: 0; transform: translateY(${vertical === 'top' ? '-10px' : '10px'}); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
      document.head.appendChild(style)
    }

    this.panelElement.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 14px; font-weight: 600; color: ${textColor}; margin-bottom: 4px;">分享链接</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.5);">复制链接或扫描二维码</div>
      </div>

      <div style="
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      ">
        <input class="share-url-input" type="text" value="${shareUrl}" readonly style="
          flex: 1;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: ${textColor};
          font-size: 12px;
          outline: none;
        "/>
        <button class="share-copy-btn" style="
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          background: ${activeColor};
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        ">复制</button>
      </div>

      <div style="
        display: flex;
        gap: 12px;
        margin-bottom: ${showQRCode ? '16px' : '0'};
      ">
        <button class="share-social-btn" data-platform="weibo" style="
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #E6162D;
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        ">微博</button>
        <button class="share-social-btn" data-platform="twitter" style="
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #1DA1F2;
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        ">Twitter</button>
        <button class="share-social-btn" data-platform="facebook" style="
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #4267B2;
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        ">Facebook</button>
      </div>

      ${showQRCode ? `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 8px;
        ">
          <div class="share-qrcode" style="
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #666;
          ">
            ${this.generateSimpleQRPlaceholder(shareUrl)}
          </div>
          <div style="
            margin-top: 8px;
            font-size: 11px;
            color: #666;
          ">扫描二维码分享</div>
        </div>
      ` : ''}

      <button class="share-close-btn" style="
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.6);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    `

    this.element?.appendChild(this.panelElement)
    this.bindPanelEvents()
  }

  private generateSimpleQRPlaceholder(url: string): string {
    // 简单的 QR 码占位符 - 实际项目中可以使用 qrcode 库
    const size = 120
    const cellSize = 4
    const cells = Math.floor(size / cellSize)

    // 简单的伪随机模式基于 URL
    let pattern = ''
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        // 边框
        const isBorder = x < 2 || x >= cells - 2 || y < 2 || y >= cells - 2
        // 定位图案
        const isPositionPattern =
          (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7)
        // 内部随机
        const hash = (x * 31 + y * 17 + url.charCodeAt(x % url.length)) % 3
        const isFilled = isPositionPattern || (hash === 0 && !isBorder)

        if (isFilled) {
          pattern += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>`
        }
      }
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="white"/>
        ${pattern}
      </svg>
    `
  }

  private bindPanelEvents(): void {
    if (!this.panelElement) return

    // Copy button
    const copyBtn = this.panelElement.querySelector('.share-copy-btn')
    const urlInput = this.panelElement.querySelector('.share-url-input') as HTMLInputElement
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(urlInput.value)
        if (this.options.copyNotification) {
          this.showNotification('链接已复制')
        }
        this.onShare?.('copy', urlInput.value)
      } catch {
        urlInput.select()
        document.execCommand('copy')
        if (this.options.copyNotification) {
          this.showNotification('链接已复制')
        }
      }
    })

    // Social buttons
    this.panelElement.querySelectorAll('.share-social-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.getAttribute('data-platform')
        const url = urlInput.value
        this.shareToSocial(platform!, url)
      })
    })

    // Close button
    const closeBtn = this.panelElement.querySelector('.share-close-btn')
    closeBtn?.addEventListener('click', () => this.closePanel())

    // Click outside to close
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick)
    }, 0)
  }

  private handleOutsideClick = (e: MouseEvent): void => {
    if (this.element && !this.element.contains(e.target as Node)) {
      this.closePanel()
    }
  }

  private shareToSocial(platform: string, url: string): void {
    let shareUrl = ''
    const encodedUrl = encodeURIComponent(url)
    const title = encodeURIComponent(document.title || '全景图分享')

    switch (platform) {
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${title}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=500')
      this.onShare?.(platform, url)
    }
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 12px 24px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: notification-fade 2s ease forwards;
    `
    notification.textContent = message

    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style')
      style.id = 'notification-styles'
      style.textContent = `
        @keyframes notification-fade {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 2000)
  }

  private closePanel(): void {
    this.panelOpen = false
    document.removeEventListener('click', this.handleOutsideClick)
    if (this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
    }
  }

  public setShareUrlGetter(getter: () => string): void {
    this.getShareUrl = getter
  }

  public show(): void {
    this.visible = true
    if (!this.element) {
      this.createElement()
    } else {
      this.element.style.display = 'block'
    }
  }

  public hide(): void {
    this.visible = false
    this.closePanel()
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  public toggle(): void {
    this.visible ? this.hide() : this.show()
  }

  public isOpen(): boolean {
    return this.panelOpen
  }

  public dispose(): void {
    this.closePanel()
    if (this.element && this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
    this.element = null
  }
}
