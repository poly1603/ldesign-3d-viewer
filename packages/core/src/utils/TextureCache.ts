import * as THREE from 'three'
import { logger } from '../core/Logger'

/**
 * LRU 缓存节点
 */
interface CacheNode {
  texture: THREE.Texture
  lastAccessed: number
  size: number // bytes
}

/**
 * Texture cache for better performance with LRU strategy
 */
export class TextureCache {
  private static instance: TextureCache
  private cache: Map<string, CacheNode> = new Map()
  private loader: THREE.TextureLoader = new THREE.TextureLoader()
  private maxSize: number = 512 * 1024 * 1024 // 512MB default
  private currentSize: number = 0

  private constructor() { }

  public static getInstance(): TextureCache {
    if (!TextureCache.instance) {
      TextureCache.instance = new TextureCache()
    }
    return TextureCache.instance
  }

  /**
   * 设置最大缓存大小
   */
  public setMaxSize(bytes: number): void {
    this.maxSize = bytes
    this.evictIfNeeded()
  }

  /**
   * 计算纹理大小（估算）
   */
  private estimateTextureSize(texture: THREE.Texture): number {
    if (!texture.image)
      return 0

    const width = texture.image.width || 0
    const height = texture.image.height || 0
    let bytesPerPixel = 4 // RGBA

    if (texture.format === THREE.RGBAFormat) {
      bytesPerPixel = 4
    }
    else if (texture.format === THREE.LuminanceFormat) {
      bytesPerPixel = 1
    }

    let size = width * height * bytesPerPixel

    // Mipmaps 增加约 33%
    if (texture.generateMipmaps) {
      size *= 1.33
    }

    return size
  }

  /**
   * LRU 驱逐策略
   */
  private evictIfNeeded(): void {
    while (this.currentSize > this.maxSize && this.cache.size > 0) {
      // 找到最久未使用的纹理
      let oldestUrl: string | null = null
      let oldestTime = Infinity

      this.cache.forEach((node, url) => {
        if (node.lastAccessed < oldestTime) {
          oldestTime = node.lastAccessed
          oldestUrl = url
        }
      })

      if (oldestUrl) {
        logger.debug(`Evicting texture from cache: ${oldestUrl}`)
        this.remove(oldestUrl)
      }
      else {
        break
      }
    }
  }

  public async load(
    url: string,
    onProgress?: (progress: number) => void,
  ): Promise<THREE.Texture> {
    // Check cache first
    if (this.cache.has(url)) {
      const node = this.cache.get(url)!
      node.lastAccessed = Date.now()
      logger.debug(`Texture cache hit: ${url}`)
      return node.texture
    }

    logger.debug(`Loading texture: ${url}`)

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          const size = this.estimateTextureSize(texture)
          this.currentSize += size

          this.cache.set(url, {
            texture,
            lastAccessed: Date.now(),
            size,
          })

          // 检查是否需要驱逐
          this.evictIfNeeded()

          logger.debug(`Texture loaded: ${url} (${(size / 1024 / 1024).toFixed(2)} MB)`)
          resolve(texture)
        },
        (event) => {
          if (onProgress && event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        },
        (error) => {
          logger.error(`Failed to load texture: ${url}`, error)
          reject(new Error(`Failed to load texture: ${error}`))
        },
      )
    })
  }

  public get(url: string): THREE.Texture | undefined {
    const node = this.cache.get(url)
    if (node) {
      node.lastAccessed = Date.now()
      return node.texture
    }
    return undefined
  }

  public has(url: string): boolean {
    return this.cache.has(url)
  }

  public remove(url: string): void {
    const node = this.cache.get(url)
    if (node) {
      node.texture.dispose()
      this.currentSize -= node.size
      this.cache.delete(url)
      logger.debug(`Texture removed from cache: ${url}`)
    }
  }

  /**
   * unload方法，与remove相同（别名）
   */
  public unload(url: string): void {
    this.remove(url)
  }

  public clear(): void {
    this.cache.forEach((node) => {
      node.texture.dispose()
    })
    this.cache.clear()
    this.currentSize = 0
    logger.info('Texture cache cleared')
  }

  public getSize(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计
   */
  public getStats(): {
    count: number
    totalSize: number
    maxSize: number
    utilization: number
  } {
    return {
      count: this.cache.size,
      totalSize: this.currentSize,
      maxSize: this.maxSize,
      utilization: this.maxSize > 0 ? this.currentSize / this.maxSize : 0,
    }
  }

  /**
   * 预加载多个纹理
   */
  public async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.load(url))
    await Promise.all(promises)
    logger.info(`Preloaded ${urls.length} textures`)
  }
}
