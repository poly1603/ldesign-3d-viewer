/**
 * 设备能力检测与性能评分系统
 * 自动检测设备性能并提供质量降级建议
 */

export interface DeviceInfo {
  // 设备类型
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  // 操作系统
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
  osVersion: string

  // 浏览器
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
  browserVersion: string

  // 硬件信息
  cpuCores: number
  memory: number // GB
  gpu: string

  // 屏幕信息
  screenWidth: number
  screenHeight: number
  pixelRatio: number

  // 网络
  connectionType: string
  effectiveType: string
}

export interface PerformanceScore {
  overall: number // 0-100
  cpu: number
  gpu: number
  memory: number
  network: number
  tier: 'high' | 'medium' | 'low'
}

export interface QualitySettings {
  textureSize: number
  pixelRatio: number
  enablePostProcessing: boolean
  enableShadows: boolean
  enableReflections: boolean
  antialiasing: 'none' | 'fxaa' | 'smaa' | 'msaa'
  maxFPS: number
  renderOnDemand: boolean
}

export class DeviceCapability {
  private static instance: DeviceCapability
  private deviceInfo: DeviceInfo
  private performanceScore: PerformanceScore
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null

  private constructor() {
    this.deviceInfo = this.detectDevice()
    this.performanceScore = this.calculatePerformance()
  }

  public static getInstance(): DeviceCapability {
    if (!DeviceCapability.instance) {
      DeviceCapability.instance = new DeviceCapability()
    }
    return DeviceCapability.instance
  }

  /**
   * 检测设备信息
   */
  private detectDevice(): DeviceInfo {
    const ua = navigator.userAgent

    // 检测设备类型
    const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua)
    const isDesktop = !isMobile && !isTablet

    // 检测操作系统
    let os: DeviceInfo['os'] = 'unknown'
    let osVersion = ''

    if (/iPhone|iPad|iPod/.test(ua)) {
      os = 'ios'
      const match = ua.match(/OS (\d+)_(\d+)/)
      if (match)
        osVersion = `${match[1]}.${match[2]}`
    }
    else if (/Android/.test(ua)) {
      os = 'android'
      const match = ua.match(/Android (\d+\.?\d*)/)
      if (match)
        osVersion = match[1]
    }
    else if (/Windows/.test(ua)) {
      os = 'windows'
    }
    else if (/Mac OS X/.test(ua)) {
      os = 'macos'
    }
    else if (/Linux/.test(ua)) {
      os = 'linux'
    }

    // 检测浏览器
    let browser: DeviceInfo['browser'] = 'unknown'
    let browserVersion = ''

    if (/Edg\//.test(ua)) {
      browser = 'edge'
      const match = ua.match(/Edg\/(\d+)/)
      if (match)
        browserVersion = match[1]
    }
    else if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
      browser = 'chrome'
      const match = ua.match(/Chrome\/(\d+)/)
      if (match)
        browserVersion = match[1]
    }
    else if (/Firefox/.test(ua)) {
      browser = 'firefox'
      const match = ua.match(/Firefox\/(\d+)/)
      if (match)
        browserVersion = match[1]
    }
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      browser = 'safari'
      const match = ua.match(/Version\/(\d+)/)
      if (match)
        browserVersion = match[1]
    }

    // 硬件信息
    const cpuCores = navigator.hardwareConcurrency || 4
    const memory = (navigator as any).deviceMemory || 4

    // GPU 信息
    let gpu = 'unknown'
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      this.gl = gl as WebGLRenderingContext
      const glCtx = gl as WebGLRenderingContext
      const debugInfo = glCtx.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        gpu = glCtx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
      }
    }

    // 屏幕信息
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    const pixelRatio = window.devicePixelRatio || 1

    // 网络信息
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    const connectionType = connection?.type || 'unknown'
    const effectiveType = connection?.effectiveType || 'unknown'

    return {
      isMobile,
      isTablet,
      isDesktop,
      os,
      osVersion,
      browser,
      browserVersion,
      cpuCores,
      memory,
      gpu,
      screenWidth,
      screenHeight,
      pixelRatio,
      connectionType,
      effectiveType,
    }
  }

  /**
   * 计算性能评分
   */
  private calculatePerformance(): PerformanceScore {
    const scores = {
      cpu: this.scoreCPU(),
      gpu: this.scoreGPU(),
      memory: this.scoreMemory(),
      network: this.scoreNetwork(),
    }

    // 加权平均
    const overall = Math.round(
      scores.cpu * 0.3
      + scores.gpu * 0.4
      + scores.memory * 0.2
      + scores.network * 0.1,
    )

    let tier: PerformanceScore['tier']
    if (overall >= 70)
      tier = 'high'
    else if (overall >= 40)
      tier = 'medium'
    else tier = 'low'

    return {
      overall,
      ...scores,
      tier,
    }
  }

  /**
   * CPU 评分 (0-100)
   */
  private scoreCPU(): number {
    const cores = this.deviceInfo.cpuCores

    // 基于核心数评分
    let score = Math.min((cores / 8) * 100, 100)

    // 移动设备降级
    if (this.deviceInfo.isMobile) {
      score *= 0.7
    }

    return Math.round(score)
  }

  /**
   * GPU 评分 (0-100)
   */
  private scoreGPU(): number {
    if (!this.gl)
      return 30

    let score = 50 // 基础分

    // 检测 WebGL 2
    if (this.gl instanceof WebGL2RenderingContext) {
      score += 20
    }

    // 检测最大纹理尺寸
    const maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE)
    if (maxTextureSize >= 16384)
      score += 15
    else if (maxTextureSize >= 8192)
      score += 10
    else if (maxTextureSize >= 4096)
      score += 5

    // 检测最大渲染缓冲区大小
    const maxRenderbufferSize = this.gl.getParameter(this.gl.MAX_RENDERBUFFER_SIZE)
    if (maxRenderbufferSize >= 8192)
      score += 10
    else if (maxRenderbufferSize >= 4096)
      score += 5

    // GPU 型号判断
    const gpu = this.deviceInfo.gpu.toLowerCase()
    if (gpu.includes('nvidia') || gpu.includes('rtx') || gpu.includes('gtx')) {
      score += 10 // 独立显卡加分
    }
    else if (gpu.includes('intel') && gpu.includes('hd')) {
      score -= 10 // 集成显卡减分
    }

    // 移动设备降级
    if (this.deviceInfo.isMobile) {
      score *= 0.6
    }

    return Math.round(Math.min(score, 100))
  }

  /**
   * 内存评分 (0-100)
   */
  private scoreMemory(): number {
    const memory = this.deviceInfo.memory

    // 8GB+ = 100分
    const score = Math.min((memory / 8) * 100, 100)

    return Math.round(score)
  }

  /**
   * 网络评分 (0-100)
   */
  private scoreNetwork(): number {
    const effectiveType = this.deviceInfo.effectiveType

    const scoreMap: Record<string, number> = {
      '4g': 100,
      '3g': 60,
      '2g': 30,
      'slow-2g': 20,
      'unknown': 70, // 假设中等
    }

    return scoreMap[effectiveType] || 70
  }

  /**
   * 获取推荐的质量设置
   */
  public getRecommendedSettings(): QualitySettings {
    const tier = this.performanceScore.tier
    const isMobile = this.deviceInfo.isMobile

    switch (tier) {
      case 'high':
        return {
          textureSize: isMobile ? 2048 : 4096,
          pixelRatio: Math.min(this.deviceInfo.pixelRatio, 2),
          enablePostProcessing: true,
          enableShadows: !isMobile,
          enableReflections: !isMobile,
          antialiasing: 'smaa',
          maxFPS: 60,
          renderOnDemand: false,
        }

      case 'medium':
        return {
          textureSize: isMobile ? 1024 : 2048,
          pixelRatio: Math.min(this.deviceInfo.pixelRatio, 1.5),
          enablePostProcessing: !isMobile,
          enableShadows: false,
          enableReflections: false,
          antialiasing: 'fxaa',
          maxFPS: isMobile ? 30 : 60,
          renderOnDemand: true,
        }

      case 'low':
        return {
          textureSize: 1024,
          pixelRatio: 1,
          enablePostProcessing: false,
          enableShadows: false,
          enableReflections: false,
          antialiasing: 'none',
          maxFPS: 30,
          renderOnDemand: true,
        }
    }
  }

  /**
   * 获取设备信息
   */
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  /**
   * 获取性能评分
   */
  public getPerformanceScore(): PerformanceScore {
    return { ...this.performanceScore }
  }

  /**
   * 是否为低端设备
   */
  public isLowEndDevice(): boolean {
    return this.performanceScore.tier === 'low'
  }

  /**
   * 是否为高端设备
   */
  public isHighEndDevice(): boolean {
    return this.performanceScore.tier === 'high'
  }

  /**
   * 获取推荐的纹理大小
   */
  public getRecommendedTextureSize(): number {
    return this.getRecommendedSettings().textureSize
  }

  /**
   * 获取推荐的像素比
   */
  public getRecommendedPixelRatio(): number {
    return this.getRecommendedSettings().pixelRatio
  }

  /**
   * 生成设备报告
   */
  public generateReport(): string {
    const info = this.deviceInfo
    const score = this.performanceScore
    const settings = this.getRecommendedSettings()

    return `
Device Capability Report
========================

Device Type: ${info.isMobile ? 'Mobile' : info.isTablet ? 'Tablet' : 'Desktop'}
OS: ${info.os} ${info.osVersion}
Browser: ${info.browser} ${info.browserVersion}

Hardware:
- CPU Cores: ${info.cpuCores}
- Memory: ${info.memory} GB
- GPU: ${info.gpu}
- Screen: ${info.screenWidth}x${info.screenHeight} @${info.pixelRatio}x

Performance Score: ${score.overall}/100 (${score.tier.toUpperCase()})
- CPU: ${score.cpu}/100
- GPU: ${score.gpu}/100
- Memory: ${score.memory}/100
- Network: ${score.network}/100

Recommended Settings:
- Texture Size: ${settings.textureSize}
- Pixel Ratio: ${settings.pixelRatio}
- Post Processing: ${settings.enablePostProcessing}
- Antialiasing: ${settings.antialiasing}
- Max FPS: ${settings.maxFPS}
- Render on Demand: ${settings.renderOnDemand}
    `.trim()
  }

  /**
   * 检测是否支持 WebGL 2
   */
  public supportsWebGL2(): boolean {
    return this.gl instanceof WebGL2RenderingContext
  }

  /**
   * 获取最大纹理尺寸
   */
  public getMaxTextureSize(): number {
    if (!this.gl)
      return 2048
    return this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE)
  }

  /**
   * 检测是否支持高分辨率纹理
   */
  public supportsHighResTextures(): boolean {
    return this.getMaxTextureSize() >= 8192
  }
}

// 导出单例
export const deviceCapability = DeviceCapability.getInstance()
