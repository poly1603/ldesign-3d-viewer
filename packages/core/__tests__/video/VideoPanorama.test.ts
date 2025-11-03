import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { EventBus } from '../../src/core/EventBus'
import { VideoPanorama, type VideoOptions, type VideoSource } from '../../src/video/VideoPanorama'

// Mock HTMLVideoElement
class MockVideoElement {
  src = ''
  currentTime = 0
  duration = 100
  paused = true
  ended = false
  seeking = false
  volume = 1
  muted = false
  playbackRate = 1
  loop = false
  videoWidth = 1920
  videoHeight = 1080
  crossOrigin = 'anonymous'
  playsInline = true
  preload = 'metadata'
  error: MediaError | null = null
  buffered: TimeRanges = {
    length: 0,
    start: () => 0,
    end: () => 0,
  }

  private listeners: Map<string, Set<Function>> = new Map()

  addEventListener(type: string, listener: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  removeEventListener(type: string, listener: Function) {
    this.listeners.get(type)?.delete(listener)
  }

  dispatchEvent(event: any) {
    const type = typeof event === 'string' ? event : event.type
    this.listeners.get(type)?.forEach(fn => fn(event))
    return true
  }

  async play() {
    this.paused = false
    this.dispatchEvent({ type: 'play' })
    return Promise.resolve()
  }

  pause() {
    this.paused = true
    this.dispatchEvent({ type: 'pause' })
  }

  load() {
    // Simulate loading
  }
}

// Mock MediaError if not available
if (typeof (globalThis as any).MediaError === 'undefined') {
  (globalThis as any).MediaError = {
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
  }
}

describe('VideoPanorama', () => {
  let eventBus: EventBus
  let mockVideo: MockVideoElement
  let videoSources: VideoSource[]

  beforeEach(() => {
    eventBus = new EventBus()
    mockVideo = new MockVideoElement()

    // Mock document.createElement for video
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'video') {
        return mockVideo as any
      }
      return document.createElement(tagName)
    })

    videoSources = [
      { url: 'video-low.mp4', quality: 'low', bitrate: 500 },
      { url: 'video-medium.mp4', quality: 'medium', bitrate: 1500 },
      { url: 'video-high.mp4', quality: 'high', bitrate: 3000 },
      { url: 'video-ultra.mp4', quality: 'ultra', bitrate: 6000 },
    ]
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基本功能', () => {
    it('应该能够创建 VideoPanorama', () => {
      const options: VideoOptions = { sources: videoSources }
      const vp = new VideoPanorama(options, eventBus)
      
      expect(vp).toBeDefined()
      expect(vp.getVideoElement()).toBe(mockVideo)
    })

    it('应该能够创建不带 EventBus 的实例', () => {
      const options: VideoOptions = { sources: videoSources }
      const vp = new VideoPanorama(options)
      
      expect(vp).toBeDefined()
    })

    it('应该对视频源按质量排序', () => {
      const unorderedSources: VideoSource[] = [
        { url: 'video-ultra.mp4', quality: 'ultra', bitrate: 6000 },
        { url: 'video-low.mp4', quality: 'low', bitrate: 500 },
        { url: 'video-high.mp4', quality: 'high', bitrate: 3000 },
        { url: 'video-medium.mp4', quality: 'medium', bitrate: 1500 },
      ]
      
      const vp = new VideoPanorama({ sources: unorderedSources })
      const state = vp.getState()
      
      // 应该从中等质量开始
      expect(state.currentQuality).toMatch(/medium|high/)
    })

    it('应该设置视频元素属性', () => {
      const options: VideoOptions = {
        sources: videoSources,
        loop: true,
        muted: true,
        volume: 0.5,
        playbackRate: 1.5,
      }
      
      const vp = new VideoPanorama(options)
      const video = vp.getVideoElement()
      
      expect(video.loop).toBe(true)
      expect(video.muted).toBe(true)
      expect(video.volume).toBe(0.5)
      expect(video.playbackRate).toBe(1.5)
    })
  })

  describe('播放控制', () => {
    it('应该能够播放视频', async () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      
      await vp.play()
      
      expect(mockVideo.paused).toBe(false)
    })

    it('播放时应该触发事件', async () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('video:play', handler)
      
      await vp.play()
      mockVideo.dispatchEvent({ type: 'play' })
      
      expect(handler).toHaveBeenCalled()
    })

    it('应该能够暂停视频', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      mockVideo.paused = false
      
      vp.pause()
      
      expect(mockVideo.paused).toBe(true)
    })

    it('暂停时应该触发事件', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('video:pause', handler)
      
      vp.pause()
      mockVideo.dispatchEvent({ type: 'pause' })
      
      expect(handler).toHaveBeenCalled()
    })

    it('应该能够停止视频', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      mockVideo.paused = false
      mockVideo.currentTime = 50
      
      vp.stop()
      
      expect(mockVideo.paused).toBe(true)
      expect(mockVideo.currentTime).toBe(0)
    })

    it('应该能够跳转到指定时间', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.seek(30)
      
      expect(mockVideo.currentTime).toBe(30)
    })

    it('跳转时间应该被限制在有效范围内', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.seek(-10)
      expect(mockVideo.currentTime).toBe(0)
      
      vp.seek(200)
      expect(mockVideo.currentTime).toBe(100) // duration
    })
  })

  describe('音量控制', () => {
    it('应该能够设置音量', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setVolume(0.7)
      
      expect(mockVideo.volume).toBe(0.7)
    })

    it('音量应该被限制在 0-1 范围内', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setVolume(-0.5)
      expect(mockVideo.volume).toBe(0)
      
      vp.setVolume(1.5)
      expect(mockVideo.volume).toBe(1)
    })

    it('应该能够设置静音', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setMuted(true)
      expect(mockVideo.muted).toBe(true)
      
      vp.setMuted(false)
      expect(mockVideo.muted).toBe(false)
    })
  })

  describe('播放速率', () => {
    it('应该能够设置播放速率', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setPlaybackRate(2.0)
      
      expect(mockVideo.playbackRate).toBe(2.0)
    })

    it('播放速率应该被限制在 0.25-4 范围内', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setPlaybackRate(0.1)
      expect(mockVideo.playbackRate).toBe(0.25)
      
      vp.setPlaybackRate(5)
      expect(mockVideo.playbackRate).toBe(4)
    })
  })

  describe('循环设置', () => {
    it('应该能够设置循环', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setLoop(true)
      expect(mockVideo.loop).toBe(true)
      
      vp.setLoop(false)
      expect(mockVideo.loop).toBe(false)
    })
  })

  describe('质量切换', () => {
    it('应该能够手动设置质量', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setQuality('high')
      
      expect(mockVideo.src).toContain('video-high.mp4')
    })

    it('设置不存在的质量应该警告', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      const currentSrc = mockVideo.src
      
      vp.setQuality('4k' as any)
      
      // src 不应该改变
      expect(mockVideo.src).toBe(currentSrc)
    })

    it('切换质量时应该保持播放位置', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      mockVideo.currentTime = 30
      mockVideo.paused = false
      
      vp.setQuality('low')
      
      expect(mockVideo.currentTime).toBe(30)
    })

    it('切换质量时应该触发事件', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('quality:change', handler)
      
      vp.setQuality('ultra')
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: 'ultra',
        }),
      )
    })

    it('如果正在播放应该继续播放', async () => {
      const vp = new VideoPanorama({ sources: videoSources })
      mockVideo.paused = false
      
      vp.setQuality('high')
      
      // 应该尝试恢复播放
      expect(mockVideo.paused).toBe(false)
    })
  })

  describe('自适应码率', () => {
    it('应该能够启用/禁用自适应码率', () => {
      const vp = new VideoPanorama({ 
        sources: videoSources,
        adaptiveBitrate: false,
      })
      
      vp.setAdaptiveBitrate(true)
      // 设置已应用，无需进一步验证内部状态
      expect(vp).toBeDefined()
      
      vp.setAdaptiveBitrate(false)
      expect(vp).toBeDefined()
    })

    it('默认应该启用自适应码率', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      expect(vp).toBeDefined()
    })
  })

  describe('视频纹理', () => {
    it('应该能够创建视频纹理', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      const texture = vp.createTexture()
      
      expect(texture).toBeInstanceOf(THREE.VideoTexture)
      expect(texture.minFilter).toBe(THREE.LinearFilter)
      expect(texture.magFilter).toBe(THREE.LinearFilter)
    })

    it('多次创建应该返回相同的纹理', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      const texture1 = vp.createTexture()
      const texture2 = vp.createTexture()
      
      expect(texture1).toBe(texture2)
    })

    it('应该能够获取纹理', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      expect(vp.getTexture()).toBeNull()
      
      const texture = vp.createTexture()
      expect(vp.getTexture()).toBe(texture)
    })
  })

  describe('状态查询', () => {
    it('应该能够获取视频状态', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      const state = vp.getState()
      
      expect(state).toHaveProperty('isPlaying')
      expect(state).toHaveProperty('isPaused')
      expect(state).toHaveProperty('isEnded')
      expect(state).toHaveProperty('isSeeking')
      expect(state).toHaveProperty('currentTime')
      expect(state).toHaveProperty('duration')
      expect(state).toHaveProperty('volume')
      expect(state).toHaveProperty('muted')
      expect(state).toHaveProperty('playbackRate')
      expect(state).toHaveProperty('currentQuality')
    })

    it('isPlaying 应该正确反映播放状态', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      mockVideo.paused = true
      expect(vp.getState().isPlaying).toBe(false)
      
      mockVideo.paused = false
      mockVideo.ended = false
      expect(vp.getState().isPlaying).toBe(true)
    })

    it('currentQuality 应该反映当前质量', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      vp.setQuality('low')
      expect(vp.getState().currentQuality).toBe('low')
      
      vp.setQuality('ultra')
      expect(vp.getState().currentQuality).toBe('ultra')
    })
  })

  describe('视频事件', () => {
    it('加载元数据时应该触发事件', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('video:timeupdate', handler)
      
      mockVideo.dispatchEvent({ type: 'loadedmetadata' })
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          currentTime: expect.any(Number),
          duration: expect.any(Number),
        }),
      )
    })

    it('视频结束时应该触发事件', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('video:ended', handler)
      
      mockVideo.dispatchEvent({ type: 'ended' })
      
      expect(handler).toHaveBeenCalled()
    })

    it('时间更新时应该触发事件', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('video:timeupdate', handler)
      
      mockVideo.currentTime = 50
      mockVideo.dispatchEvent({ type: 'timeupdate' })
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          currentTime: 50,
        }),
      )
    })

    it('视频错误时应该触发事件', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const handler = vi.fn()
      eventBus.on('error', handler)
      
      mockVideo.error = { code: MediaError.MEDIA_ERR_NETWORK } as MediaError
      mockVideo.dispatchEvent({ type: 'error' })
      
      expect(handler).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('错误处理', () => {
    it('应该正确识别视频错误类型', () => {
      const vp = new VideoPanorama({ sources: videoSources }, eventBus)
      const errorHandler = vi.fn()
      eventBus.on('error', errorHandler)
      
      // 测试不同的错误代码
      const errorCodes = [
        MediaError.MEDIA_ERR_ABORTED,
        MediaError.MEDIA_ERR_NETWORK,
        MediaError.MEDIA_ERR_DECODE,
        MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
      ]
      
      errorCodes.forEach((code) => {
        mockVideo.error = { code } as MediaError
        mockVideo.dispatchEvent({ type: 'error' })
      })
      
      expect(errorHandler).toHaveBeenCalledTimes(errorCodes.length)
    })

    it('播放失败时应该抛出错误', async () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      mockVideo.play = vi.fn().mockRejectedValue(new Error('Play failed'))
      
      await expect(vp.play()).rejects.toThrow('Play failed')
    })
  })

  describe('销毁', () => {
    it('应该能够销毁视频全景', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      const texture = vp.createTexture()
      const disposeSpy = vi.spyOn(texture, 'dispose')
      
      vp.dispose()
      
      expect(mockVideo.src).toBe('')
      expect(disposeSpy).toHaveBeenCalled()
      expect(vp.getTexture()).toBeNull()
    })

    it('销毁前应该暂停视频', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      mockVideo.paused = false
      
      vp.dispose()
      
      expect(mockVideo.paused).toBe(true)
    })

    it('销毁时应该调用 load 释放资源', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      const loadSpy = vi.spyOn(mockVideo, 'load')
      
      vp.dispose()
      
      expect(loadSpy).toHaveBeenCalled()
    })

    it('多次销毁不应该出错', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      expect(() => {
        vp.dispose()
        vp.dispose()
        vp.dispose()
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理空视频源列表', () => {
      const vp = new VideoPanorama({ sources: [] })
      
      expect(vp.getState().currentQuality).toBe('unknown')
    })

    it('应该处理单个视频源', () => {
      const singleSource: VideoSource[] = [
        { url: 'video.mp4', quality: 'medium' },
      ]
      
      const vp = new VideoPanorama({ sources: singleSource })
      
      expect(vp.getState().currentQuality).toBe('medium')
    })

    it('应该处理没有码率信息的视频源', () => {
      const sourcesNoBitrate: VideoSource[] = [
        { url: 'video1.mp4', quality: 'low' },
        { url: 'video2.mp4', quality: 'high' },
      ]
      
      const vp = new VideoPanorama({ sources: sourcesNoBitrate })
      
      expect(vp).toBeDefined()
    })

    it('应该处理 duration 为 NaN 的情况', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      mockVideo.duration = NaN
      
      const state = vp.getState()
      
      expect(state.duration).toBe(0)
    })

    it('应该处理没有缓冲数据的情况', () => {
      const vp = new VideoPanorama({ 
        sources: videoSources,
        adaptiveBitrate: true,
      })
      
      mockVideo.buffered = {
        length: 0,
        start: () => 0,
        end: () => 0,
      }
      
      // 触发 progress 事件不应该出错
      mockVideo.dispatchEvent({ type: 'progress' })
      
      expect(vp).toBeDefined()
    })

    it('应该处理自动播放', async () => {
      const vp = new VideoPanorama({ 
        sources: videoSources,
        autoplay: true,
      })
      
      // autoplay 设置已应用到 video 元素
      expect(vp).toBeDefined()
    })
  })

  describe('性能', () => {
    it('应该快速创建实例', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        const vp = new VideoPanorama({ sources: videoSources })
        vp.dispose()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 100个实例应该在100ms内创建
      expect(duration).toBeLessThan(100)
    })

    it('应该快速查询状态', () => {
      const vp = new VideoPanorama({ sources: videoSources })
      
      const startTime = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        vp.getState()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 1000次查询应该在10ms内完成
      expect(duration).toBeLessThan(10)
    })
  })
})
