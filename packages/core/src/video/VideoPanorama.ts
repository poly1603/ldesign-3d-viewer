/**
 * 视频全景播放器
 * 支持 360° 视频播放、流式传输和自适应码率
 */

import * as THREE from 'three'
import { logger } from '../core/Logger'
import type { EventBus } from '../core/EventBus'

export interface VideoOptions {
  /** 视频源 URL（可以是单个或多个质量级别） */
  sources: VideoSource[]
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 是否静音 */
  muted?: boolean
  /** 初始音量 (0-1) */
  volume?: number
  /** 播放速率 */
  playbackRate?: number
  /** 是否启用自适应码率 */
  adaptiveBitrate?: boolean
  /** 跨域设置 */
  crossOrigin?: string
}

export interface VideoSource {
  url: string
  quality: 'low' | 'medium' | 'high' | 'ultra'
  bitrate?: number // kbps
  resolution?: { width: number, height: number }
}

export interface VideoState {
  isPlaying: boolean
  isPaused: boolean
  isEnded: boolean
  isSeeking: boolean
  currentTime: number
  duration: number
  buffered: TimeRanges | null
  volume: number
  muted: boolean
  playbackRate: number
  currentQuality: string
}

export class VideoPanorama {
  private video: HTMLVideoElement
  private videoTexture: THREE.VideoTexture | null = null
  private sources: VideoSource[]
  private currentSourceIndex: number = -1
  private eventBus: EventBus | null
  private options: Required<Omit<VideoOptions, 'sources'>>
  private adaptiveBitrateEnabled: boolean = false
  private bandwidthEstimate: number = 0 // kbps
  private lastBandwidthCheck: number = 0

  constructor(options: VideoOptions, eventBus?: EventBus) {
    this.sources = options.sources.sort((a, b) => {
      const qualityOrder = { low: 0, medium: 1, high: 2, ultra: 3 }
      return qualityOrder[a.quality] - qualityOrder[b.quality]
    })

    this.options = {
      autoplay: options.autoplay ?? false,
      loop: options.loop ?? false,
      muted: options.muted ?? false,
      volume: options.volume ?? 1.0,
      playbackRate: options.playbackRate ?? 1.0,
      adaptiveBitrate: options.adaptiveBitrate ?? true,
      crossOrigin: options.crossOrigin ?? 'anonymous',
    }

    this.eventBus = eventBus || null
    this.video = this.createVideoElement()
    this.setupEventListeners()
    this.adaptiveBitrateEnabled = this.options.adaptiveBitrate

    // 从中等质量开始
    const startIndex = Math.floor(this.sources.length / 2)
    this.selectSource(startIndex)
  }

  /**
   * 创建 video 元素
   */
  private createVideoElement(): HTMLVideoElement {
    const video = document.createElement('video')
    video.crossOrigin = this.options.crossOrigin
    video.loop = this.options.loop
    video.muted = this.options.muted
    video.volume = this.options.volume
    video.playbackRate = this.options.playbackRate
    video.playsInline = true // 移动端内联播放
    video.preload = 'metadata'

    return video
  }

  /**
   * 设置视频事件监听器
   */
  private setupEventListeners(): void {
    this.video.addEventListener('loadedmetadata', () => {
      logger.info(`Video loaded: ${this.video.videoWidth}x${this.video.videoHeight}`)
      this.eventBus?.emit('video:timeupdate', {
        currentTime: this.video.currentTime,
        duration: this.video.duration,
      })
    })

    this.video.addEventListener('play', () => {
      logger.debug('Video playing')
      this.eventBus?.emit('video:play')
    })

    this.video.addEventListener('pause', () => {
      logger.debug('Video paused')
      this.eventBus?.emit('video:pause')
    })

    this.video.addEventListener('ended', () => {
      logger.debug('Video ended')
      this.eventBus?.emit('video:ended')
    })

    this.video.addEventListener('timeupdate', () => {
      this.eventBus?.emit('video:timeupdate', {
        currentTime: this.video.currentTime,
        duration: this.video.duration,
      })

      // 定期检查带宽并调整质量
      if (this.adaptiveBitrateEnabled) {
        this.checkAdaptiveBitrate()
      }
    })

    this.video.addEventListener('progress', () => {
      this.updateBandwidthEstimate()
    })

    this.video.addEventListener('error', (_event) => {
      const error = this.video.error
      const message = error ? this.getVideoErrorMessage(error.code) : 'Unknown error'
      logger.error(`Video error: ${message}`, error)
      this.eventBus?.emit('error', new Error(message))
    })

    this.video.addEventListener('waiting', () => {
      logger.debug('Video buffering')
    })

    this.video.addEventListener('canplay', () => {
      logger.debug('Video can play')
    })
  }

  /**
   * 获取视频错误消息
   */
  private getVideoErrorMessage(code: number): string {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Video playback was aborted'
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error occurred while loading video'
      case MediaError.MEDIA_ERR_DECODE:
        return 'Video decoding failed'
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Video format not supported'
      default:
        return 'Unknown video error'
    }
  }

  /**
   * 选择视频源
   */
  private selectSource(index: number): void {
    if (index < 0 || index >= this.sources.length) {
      logger.warn(`Invalid source index: ${index}`)
      return
    }

    if (index === this.currentSourceIndex) {
      return
    }

    const source = this.sources[index]
    const wasPlaying = !this.video.paused
    const currentTime = this.video.currentTime

    logger.info(`Switching to ${source.quality} quality (${source.url})`)

    this.video.src = source.url
    this.video.currentTime = currentTime
    this.currentSourceIndex = index

    if (wasPlaying) {
      this.video.play().catch((error) => {
        logger.error('Failed to resume playback after quality switch', error)
      })
    }

    this.eventBus?.emit('quality:change', {
      preset: source.quality,
      settings: { bitrate: source.bitrate, resolution: source.resolution },
    })
  }

  /**
   * 更新带宽估算
   */
  private updateBandwidthEstimate(): void {
    if (!this.video.buffered.length)
      return

    const now = Date.now()
    const timeSinceLastCheck = now - this.lastBandwidthCheck

    if (timeSinceLastCheck < 2000)
      return // 每2秒检查一次

    const buffered = this.video.buffered
    const currentTime = this.video.currentTime

    // 计算缓冲的数据量
    let bufferedAhead = 0
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime) {
        bufferedAhead = buffered.end(i) - currentTime
        break
      }
    }

    // 估算带宽（非常简化的算法）
    if (bufferedAhead > 0 && this.currentSourceIndex >= 0) {
      const source = this.sources[this.currentSourceIndex]
      if (source.bitrate) {
        // 如果缓冲很快，带宽可能更高
        const bufferRatio = bufferedAhead / 5 // 5秒为目标缓冲
        this.bandwidthEstimate = source.bitrate * Math.max(bufferRatio, 0.5)
      }
    }

    this.lastBandwidthCheck = now
  }

  /**
   * 检查并调整自适应码率
   */
  private checkAdaptiveBitrate(): void {
    if (!this.adaptiveBitrateEnabled || this.sources.length <= 1) {
      return
    }

    const now = Date.now()
    if (now - this.lastBandwidthCheck < 5000)
      return // 每5秒最多切换一次

    // 基于带宽估算选择合适的质量
    let targetIndex = this.currentSourceIndex

    for (let i = this.sources.length - 1; i >= 0; i--) {
      const source = this.sources[i]
      if (source.bitrate && this.bandwidthEstimate >= source.bitrate * 1.2) {
        // 需要 1.2x 的带宽余量
        targetIndex = i
        break
      }
    }

    if (targetIndex !== this.currentSourceIndex) {
      logger.info(`Adaptive bitrate: switching quality based on bandwidth (${this.bandwidthEstimate.toFixed(0)} kbps)`)
      this.selectSource(targetIndex)
    }
  }

  /**
   * 创建视频纹理
   */
  public createTexture(): THREE.VideoTexture {
    if (this.videoTexture) {
      return this.videoTexture
    }

    this.videoTexture = new THREE.VideoTexture(this.video)
    this.videoTexture.minFilter = THREE.LinearFilter
    this.videoTexture.magFilter = THREE.LinearFilter
    this.videoTexture.format = THREE.RGBAFormat
    this.videoTexture.colorSpace = THREE.SRGBColorSpace

    logger.debug('Video texture created')
    return this.videoTexture
  }

  /**
   * 播放
   */
  public async play(): Promise<void> {
    try {
      await this.video.play()
    }
    catch (error) {
      logger.error('Failed to play video', error)
      throw error
    }
  }

  /**
   * 暂停
   */
  public pause(): void {
    this.video.pause()
  }

  /**
   * 停止
   */
  public stop(): void {
    this.video.pause()
    this.video.currentTime = 0
  }

  /**
   * 跳转到指定时间
   */
  public seek(time: number): void {
    this.video.currentTime = Math.max(0, Math.min(time, this.video.duration || 0))
  }

  /**
   * 设置音量
   */
  public setVolume(volume: number): void {
    this.video.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 设置静音
   */
  public setMuted(muted: boolean): void {
    this.video.muted = muted
  }

  /**
   * 设置播放速率
   */
  public setPlaybackRate(rate: number): void {
    this.video.playbackRate = Math.max(0.25, Math.min(4, rate))
  }

  /**
   * 设置循环
   */
  public setLoop(loop: boolean): void {
    this.video.loop = loop
  }

  /**
   * 手动设置质量
   */
  public setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void {
    const index = this.sources.findIndex(s => s.quality === quality)
    if (index >= 0) {
      this.selectSource(index)
    }
    else {
      logger.warn(`Quality level "${quality}" not available`)
    }
  }

  /**
   * 启用/禁用自适应码率
   */
  public setAdaptiveBitrate(enabled: boolean): void {
    this.adaptiveBitrateEnabled = enabled
    logger.info(`Adaptive bitrate ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * 获取当前状态
   */
  public getState(): VideoState {
    return {
      isPlaying: !this.video.paused && !this.video.ended,
      isPaused: this.video.paused,
      isEnded: this.video.ended,
      isSeeking: this.video.seeking,
      currentTime: this.video.currentTime,
      duration: this.video.duration || 0,
      buffered: this.video.buffered,
      volume: this.video.volume,
      muted: this.video.muted,
      playbackRate: this.video.playbackRate,
      currentQuality: this.currentSourceIndex >= 0
        ? this.sources[this.currentSourceIndex].quality
        : 'unknown',
    }
  }

  /**
   * 获取视频元素（用于高级用途）
   */
  public getVideoElement(): HTMLVideoElement {
    return this.video
  }

  /**
   * 获取视频纹理
   */
  public getTexture(): THREE.VideoTexture | null {
    return this.videoTexture
  }

  /**
   * 销毁
   */
  public dispose(): void {
    this.video.pause()
    this.video.src = ''
    this.video.load() // 释放资源

    if (this.videoTexture) {
      this.videoTexture.dispose()
      this.videoTexture = null
    }

    this.eventBus = null
    logger.debug('Video panorama disposed')
  }
}
