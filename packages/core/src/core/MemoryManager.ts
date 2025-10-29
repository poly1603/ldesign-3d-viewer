/**
 * 内存管理器 - 监控和优化内存使用
 */

import * as THREE from 'three'
import { logger } from './Logger'
import type { EventBus } from './EventBus'

export interface MemoryStats {
  textures: {
    count: number
    bytes: number
  }
  geometries: {
    count: number
    bytes: number
  }
  jsHeap?: {
    used: number
    total: number
    limit: number
    usagePercent: number
  }
  total: number
}

export interface MemoryOptions {
  maxTextureMemory?: number // bytes
  maxGeometryMemory?: number // bytes
  autoCleanup?: boolean
  cleanupThreshold?: number // 0-1, percentage
  onMemoryWarning?: (stats: MemoryStats) => void
}

export class MemoryManager {
  private textures: Set<THREE.Texture> = new Set()
  private geometries: Set<THREE.BufferGeometry> = new Set()
  private materials: Set<THREE.Material> = new Set()
  private options: Required<MemoryOptions>
  private eventBus: EventBus | null
  private monitorInterval: NodeJS.Timeout | null = null

  constructor(options: MemoryOptions = {}, eventBus?: EventBus) {
    this.options = {
      maxTextureMemory: options.maxTextureMemory ?? 512 * 1024 * 1024, // 512MB
      maxGeometryMemory: options.maxGeometryMemory ?? 256 * 1024 * 1024, // 256MB
      autoCleanup: options.autoCleanup ?? true,
      cleanupThreshold: options.cleanupThreshold ?? 0.8, // 80%
      onMemoryWarning: options.onMemoryWarning ?? (() => { }),
    }
    this.eventBus = eventBus || null
  }

  /**
   * 注册纹理以进行追踪
   */
  public registerTexture(texture: THREE.Texture): void {
    this.textures.add(texture)
    logger.debug(`Texture registered. Total: ${this.textures.size}`)
    this.checkMemory()
  }

  /**
   * 取消注册纹理
   */
  public unregisterTexture(texture: THREE.Texture): void {
    this.textures.delete(texture)
    logger.debug(`Texture unregistered. Total: ${this.textures.size}`)
  }

  /**
   * 注册几何体
   */
  public registerGeometry(geometry: THREE.BufferGeometry): void {
    this.geometries.add(geometry)
    logger.debug(`Geometry registered. Total: ${this.geometries.size}`)
    this.checkMemory()
  }

  /**
   * 取消注册几何体
   */
  public unregisterGeometry(geometry: THREE.BufferGeometry): void {
    this.geometries.delete(geometry)
    logger.debug(`Geometry unregistered. Total: ${this.geometries.size}`)
  }

  /**
   * 注册材质
   */
  public registerMaterial(material: THREE.Material): void {
    this.materials.add(material)
  }

  /**
   * 取消注册材质
   */
  public unregisterMaterial(material: THREE.Material): void {
    this.materials.delete(material)
  }

  /**
   * 计算纹理内存使用
   */
  private calculateTextureMemory(): number {
    let totalBytes = 0

    this.textures.forEach((texture) => {
      if (texture.image) {
        const image = texture.image
        const width = image.width || 0
        const height = image.height || 0

        // 假设 RGBA 格式，每像素 4 字节
        let bytesPerPixel = 4

        // 考虑纹理格式
        if (texture.format === THREE.RGBAFormat) {
          bytesPerPixel = 4
        }
        else if (texture.format === THREE.LuminanceFormat) {
          bytesPerPixel = 1
        }

        let textureBytes = width * height * bytesPerPixel

        // 如果有 mipmaps，增加 33% 内存
        if (texture.generateMipmaps) {
          textureBytes *= 1.33
        }

        totalBytes += textureBytes
      }
    })

    return totalBytes
  }

  /**
   * 计算几何体内存使用
   */
  private calculateGeometryMemory(): number {
    let totalBytes = 0

    this.geometries.forEach((geometry) => {
      // 计算所有 buffer attributes 的大小
      const attributes = geometry.attributes
      for (const key in attributes) {
        const attribute = attributes[key]
        if (attribute && attribute.array) {
          totalBytes += attribute.array.byteLength
        }
      }

      // 计算 index
      if (geometry.index && geometry.index.array) {
        totalBytes += geometry.index.array.byteLength
      }
    })

    return totalBytes
  }

  /**
   * 获取 JS 堆内存信息
   */
  private getJSHeapStats() {
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      }
    }
    return undefined
  }

  /**
   * 获取内存统计
   */
  public getStats(): MemoryStats {
    const textureBytes = this.calculateTextureMemory()
    const geometryBytes = this.calculateGeometryMemory()

    return {
      textures: {
        count: this.textures.size,
        bytes: textureBytes,
      },
      geometries: {
        count: this.geometries.size,
        bytes: geometryBytes,
      },
      jsHeap: this.getJSHeapStats(),
      total: textureBytes + geometryBytes,
    }
  }

  /**
   * 检查内存使用并触发警告
   */
  private checkMemory(): void {
    const stats = this.getStats()
    const textureUsage = stats.textures.bytes / this.options.maxTextureMemory
    const geometryUsage = stats.geometries.bytes / this.options.maxGeometryMemory

    // 纹理内存警告
    if (textureUsage > this.options.cleanupThreshold) {
      const message = `Texture memory usage high: ${(textureUsage * 100).toFixed(1)}%`
      logger.warn(message, stats.textures)
      this.options.onMemoryWarning(stats)

      if (this.eventBus) {
        this.eventBus.emit('performance:warning', {
          type: 'high_texture_memory',
          message,
          value: textureUsage,
        })
      }

      if (this.options.autoCleanup) {
        this.cleanupTextures()
      }
    }

    // 几何体内存警告
    if (geometryUsage > this.options.cleanupThreshold) {
      const message = `Geometry memory usage high: ${(geometryUsage * 100).toFixed(1)}%`
      logger.warn(message, stats.geometries)
      this.options.onMemoryWarning(stats)

      if (this.eventBus) {
        this.eventBus.emit('performance:warning', {
          type: 'high_geometry_memory',
          message,
          value: geometryUsage,
        })
      }

      if (this.options.autoCleanup) {
        this.cleanupGeometries()
      }
    }

    // JS 堆内存警告
    if (stats.jsHeap && stats.jsHeap.usagePercent > 85) {
      const message = `JS Heap usage high: ${stats.jsHeap.usagePercent.toFixed(1)}%`
      logger.warn(message, stats.jsHeap)

      if (this.eventBus) {
        this.eventBus.emit('performance:warning', {
          type: 'high_js_heap',
          message,
          value: stats.jsHeap.usagePercent / 100,
        })
      }

      // 触发垃圾回收（如果可用）
      this.suggestGC()
    }
  }

  /**
   * 清理未使用的纹理
   */
  private cleanupTextures(): void {
    let cleaned = 0
    const texturesToRemove: THREE.Texture[] = []

    this.textures.forEach((texture) => {
      // 简单策略：如果纹理没有被引用或已经 disposed，清理它
      if (!texture.image || (texture as any)._disposed) {
        texturesToRemove.push(texture)
      }
    })

    texturesToRemove.forEach((texture) => {
      texture.dispose()
      this.textures.delete(texture)
      cleaned++
    })

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} unused textures`)
    }
  }

  /**
   * 清理未使用的几何体
   */
  private cleanupGeometries(): void {
    let cleaned = 0
    const geometriesToRemove: THREE.BufferGeometry[] = []

    this.geometries.forEach((geometry) => {
      // 简单策略：清理已 disposed 的几何体
      if ((geometry as any)._disposed) {
        geometriesToRemove.push(geometry)
      }
    })

    geometriesToRemove.forEach((geometry) => {
      geometry.dispose()
      this.geometries.delete(geometry)
      cleaned++
    })

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} unused geometries`)
    }
  }

  /**
   * 建议垃圾回收
   */
  private suggestGC(): void {
    // 在某些环境中，可以手动触发 GC
    if ((globalThis as any).gc) {
      (globalThis as any).gc()
      logger.debug('Manual GC triggered')
    }
    else {
      // 创建大量短期对象来触发 GC
      const temp: any[] = []
      for (let i = 0; i < 1000; i++) {
        temp.push({ data: Array.from({ length: 1000 }) })
      }
      temp.length = 0
    }
  }

  /**
   * 强制清理所有资源
   */
  public forceCleanup(): void {
    logger.info('Force cleanup started')

    // 清理纹理
    this.textures.forEach((texture) => {
      texture.dispose()
    })
    this.textures.clear()

    // 清理几何体
    this.geometries.forEach((geometry) => {
      geometry.dispose()
    })
    this.geometries.clear()

    // 清理材质
    this.materials.forEach((material) => {
      material.dispose()
    })
    this.materials.clear()

    this.suggestGC()
    logger.info('Force cleanup completed')
  }

  /**
   * 开始内存监控
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.monitorInterval) {
      return
    }

    this.monitorInterval = setInterval(() => {
      const stats = this.getStats()
      logger.debug('Memory stats', {
        textures: `${(stats.textures.bytes / 1024 / 1024).toFixed(2)} MB`,
        geometries: `${(stats.geometries.bytes / 1024 / 1024).toFixed(2)} MB`,
        total: `${(stats.total / 1024 / 1024).toFixed(2)} MB`,
      })

      this.checkMemory()
    }, intervalMs)

    logger.info(`Memory monitoring started (interval: ${intervalMs}ms)`)
  }

  /**
   * 停止内存监控
   */
  public stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
      logger.info('Memory monitoring stopped')
    }
  }

  /**
   * 销毁内存管理器
   */
  public dispose(): void {
    this.stopMonitoring()
    this.forceCleanup()
    this.eventBus = null
  }
}
