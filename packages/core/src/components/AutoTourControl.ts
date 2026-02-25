export interface AutoTourOptions {
  enabled?: boolean
  position?: 'top' | 'bottom'
  margin?: number
  interval?: number // 轮播间隔（毫秒）
  autoStart?: boolean
  showProgress?: boolean
  backgroundColor?: string
  buttonColor?: string
  activeColor?: string
  textColor?: string
}

const DEFAULT_OPTIONS: Required<AutoTourOptions> = {
  enabled: true,
  position: 'bottom',
  margin: 16,
  interval: 5000,
  autoStart: false,
  showProgress: true,
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  buttonColor: 'rgba(255, 255, 255, 0.9)',
  activeColor: '#3b82f6',
  textColor: 'rgba(255, 255, 255, 0.9)',
}

export interface TourScene {
  id: string
  name: string
  thumbnail?: string
}

/**
 * 自动播放控制 - 场景自动轮播
 */
export class AutoTourControl {
  private container: HTMLElement
  private options: Required<AutoTourOptions>
  private element: HTMLElement | null = null
  private visible: boolean = true
  private isPlaying: boolean = false
  private currentIndex: number = 0
  private scenes: TourScene[] = []
  private timer: number | null = null
  private progressTimer: number | null = null
  private progress: number = 0
  private onSceneChange?: (index: number, scene: TourScene) => void

  constructor(
    container: HTMLElement,
    options?: AutoTourOptions & { onSceneChange?: (index: number, scene: TourScene) => void },
  ) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.visible = this.options.enabled
    this.onSceneChange = options?.onSceneChange

    if (this.options.enabled) {
      this.createElement()
    }
  }

  private createElement(): void {
    this.element = document.createElement('div')
    const { position, margin, backgroundColor } = this.options

    this.element.style.cssText = `
      position: absolute;
      ${position === 'top' ? 'top' : 'bottom'}: ${margin}px;
      left: 50%;
      transform: translateX(-50%);
      background: ${backgroundColor};
      border-radius: 12px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      user-select: none;
    `

    this.element.innerHTML = this.render()
    this.container.appendChild(this.element)
    this.bindEvents()

    if (this.options.autoStart && this.scenes.length > 0) {
      this.play()
    }
  }

  private render(): string {
    const { buttonColor, activeColor, textColor, showProgress } = this.options
    const sceneName = this.scenes[this.currentIndex]?.name || '无场景'

    return `
      <button class="tour-btn tour-prev" style="
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s;
      ">◀</button>

      <button class="tour-btn tour-play" style="
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: ${this.isPlaying ? activeColor : 'rgba(255, 255, 255, 0.1)'};
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s;
      ">${this.isPlaying ? '⏸' : '▶'}</button>

      <button class="tour-btn tour-next" style="
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: ${buttonColor};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s;
      ">▶</button>

      <div class="tour-info" style="
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 100px;
      ">
        <div class="tour-scene-name" style="
          font-size: 12px;
          color: ${textColor};
          font-family: system-ui, -apple-system, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${sceneName}</div>
        <div class="tour-counter" style="
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
        ">${this.currentIndex + 1} / ${this.scenes.length || 1}</div>
        ${showProgress ? `
          <div class="tour-progress-track" style="
            height: 3px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
          ">
            <div class="tour-progress-bar" style="
              height: 100%;
              width: ${this.progress}%;
              background: ${activeColor};
              transition: width 0.1s linear;
            "></div>
          </div>
        ` : ''}
      </div>
    `
  }

  private bindEvents(): void {
    if (!this.element) return

    const prevBtn = this.element.querySelector('.tour-prev')
    prevBtn?.addEventListener('click', () => this.prev())

    const playBtn = this.element.querySelector('.tour-play')
    playBtn?.addEventListener('click', () => this.togglePlay())

    const nextBtn = this.element.querySelector('.tour-next')
    nextBtn?.addEventListener('click', () => this.next())

    // Hover effects
    this.element.querySelectorAll('.tour-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (!btn.classList.contains('tour-play') || !this.isPlaying) {
          (btn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'
        }
      })
      btn.addEventListener('mouseleave', () => {
        if (btn.classList.contains('tour-play') && this.isPlaying) {
          (btn as HTMLElement).style.background = this.options.activeColor
        } else {
          (btn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
        }
      })
    })
  }

  public setScenes(scenes: TourScene[]): void {
    this.scenes = scenes
    this.currentIndex = Math.min(this.currentIndex, scenes.length - 1)
    this.updateUI()
  }

  public play(): void {
    if (this.scenes.length === 0) return

    this.isPlaying = true
    this.progress = 0
    this.startProgressTimer()
    this.updateUI()
  }

  public pause(): void {
    this.isPlaying = false
    this.stopTimers()
    this.updateUI()
  }

  public togglePlay(): void {
    this.isPlaying ? this.pause() : this.play()
  }

  public next(): void {
    if (this.scenes.length === 0) return
    this.currentIndex = (this.currentIndex + 1) % this.scenes.length
    this.progress = 0
    this.triggerSceneChange()
    this.updateUI()

    // 不立即启动计时器，等待 onSceneLoaded 调用
    if (this.isPlaying) {
      this.stopTimers() // 停止计时，等待加载完成
    }
  }

  public prev(): void {
    if (this.scenes.length === 0) return
    this.currentIndex = (this.currentIndex - 1 + this.scenes.length) % this.scenes.length
    this.progress = 0
    this.triggerSceneChange()
    this.updateUI()

    // 不立即启动计时器，等待 onSceneLoaded 调用
    if (this.isPlaying) {
      this.stopTimers() // 停止计时，等待加载完成
    }
  }

  public goTo(index: number): void {
    if (index < 0 || index >= this.scenes.length) return
    this.currentIndex = index
    this.progress = 0
    this.triggerSceneChange()
    this.updateUI()

    // 不立即启动计时器，等待 onSceneLoaded 调用
    if (this.isPlaying) {
      this.stopTimers() // 停止计时，等待加载完成
    }
  }

  /**
   * 场景加载完成后调用，开始计时
   */
  public onSceneLoaded(): void {
    if (this.isPlaying) {
      this.progress = 0
      this.restartProgressTimer()
    }
  }

  private startProgressTimer(): void {
    const intervalMs = 50
    const totalSteps = this.options.interval / intervalMs

    this.progressTimer = window.setInterval(() => {
      this.progress += 100 / totalSteps

      if (this.progress >= 100) {
        this.next()
      } else {
        this.updateProgressBar()
      }
    }, intervalMs)
  }

  private restartProgressTimer(): void {
    this.stopTimers()
    if (this.isPlaying) {
      this.startProgressTimer()
    }
  }

  private stopTimers(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  }

  private triggerSceneChange(): void {
    if (this.onSceneChange && this.scenes[this.currentIndex]) {
      this.onSceneChange(this.currentIndex, this.scenes[this.currentIndex])
    }
  }

  private updateProgressBar(): void {
    if (!this.element) return
    const bar = this.element.querySelector('.tour-progress-bar') as HTMLElement
    if (bar) {
      bar.style.width = `${this.progress}%`
    }
  }

  private updateUI(): void {
    if (!this.element) return
    this.element.innerHTML = this.render()
    this.bindEvents()
  }

  public getCurrentIndex(): number {
    return this.currentIndex
  }

  public isAutoPlaying(): boolean {
    return this.isPlaying
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
    this.pause()
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  public toggle(): void {
    this.visible ? this.hide() : this.show()
  }

  public dispose(): void {
    this.stopTimers()
    if (this.element && this.container.contains(this.element)) {
      this.container.removeChild(this.element)
    }
    this.element = null
  }
}
