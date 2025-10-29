/**
 * 多分辨率瓦片管理系统
 * 支持四叉树管理、动态加载、多格式支持
 */

import * as THREE from 'three'
import { logger } from '../core/Logger'
import { TextureCache } from '../utils/TextureCache'

export interface TileCoordinate {
  level: number
  x: number
  y: number
}

export interface TileFormat {
  type: 'google' | 'marzipano' | 'krpano' | 'custom'
  /** URL 模板，例如: '/tiles/{l}/{x}_{y}.jpg' */
  urlTemplate: string
  /** 最大层级 */
  maxLevel: number
  /** 瓦片大小 */
  tileSize: number
  /** 每层的列数和行数 */
  dimensions?: { cols: number, rows: number }[]
}

export interface TileNode {
  coordinate: TileCoordinate
  texture: THREE.Texture | null
  mesh: THREE.Mesh | null
  children: TileNode[]
  isLoading: boolean
  isVisible: boolean
  lastAccessTime: number
}

export class TileManager {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private format: TileFormat
  private textureCache: TextureCache
  private rootNodes: TileNode[] = []
  private visibleTiles: Set<TileNode> = new Set()
  private loadingTiles: Set<string> = new Set()
  private maxConcurrentLoads: number = 4
  private maxCachedTiles: number = 100
  private cacheCleanupInterval: number = 5000 // ms
  private lastCleanupTime: number = 0

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    format: TileFormat,
  ) {
    this.scene = scene
    this.camera = camera
    this.format = format
    this.textureCache = TextureCache.getInstance()

    this.initializeRootNodes()
    logger.info(`TileManager initialized with format: ${format.type}`)
  }

  /**
   * 初始化根节点（level 0）
   */
  private initializeRootNodes(): void {
    // 对于球形全景，通常 level 0 有 1-2 个瓦片
    const level0Tiles = this.getTilesForLevel(0)

    level0Tiles.forEach((coord) => {
      const node: TileNode = {
        coordinate: coord,
        texture: null,
        mesh: null,
        children: [],
        isLoading: false,
        isVisible: false,
        lastAccessTime: Date.now(),
      }

      this.rootNodes.push(node)
    })

    logger.debug(`Created ${this.rootNodes.length} root nodes`)
  }

  /**
   * 获取指定层级的所有瓦片坐标
   */
  private getTilesForLevel(level: number): TileCoordinate[] {
    const tiles: TileCoordinate[] = []

    // 根据格式类型计算瓦片数量
    if (this.format.dimensions && this.format.dimensions[level]) {
      const { cols, rows } = this.format.dimensions[level]
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          tiles.push({ level, x, y })
        }
      }
    }
    else {
      // 默认：2^level x 2^level
      const size = 2 ** level
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          tiles.push({ level, x, y })
        }
      }
    }

    return tiles
  }

  /**
   * 更新可见瓦片（在动画循环中调用）
   */
  public update(): void {
    // 清理缓存
    const now = Date.now()
    if (now - this.lastCleanupTime > this.cacheCleanupInterval) {
      this.cleanupCache()
      this.lastCleanupTime = now
    }

    // 更新可见性
    this.updateVisibility()

    // 加载可见瓦片
    this.loadVisibleTiles()
  }

  /**
   * 更新瓦片可见性
   */
  private updateVisibility(): void {
    this.visibleTiles.clear()

    // 遍历根节点
    this.rootNodes.forEach((node) => {
      this.updateNodeVisibility(node)
    })
  }

  /**
   * 递归更新节点可见性
   */
  private updateNodeVisibility(node: TileNode): void {
    // 检查是否在视锥体内
    if (!this.isTileVisible(node)) {
      node.isVisible = false
      return
    }

    node.isVisible = true
    node.lastAccessTime = Date.now()

    // 计算到相机的距离，决定是否需要细分
    const distance = this.getTileDistance(node)
    const shouldSubdivide = this.shouldSubdivideTile(node, distance)

    if (shouldSubdivide && node.coordinate.level < this.format.maxLevel) {
      // 需要细分，加载子节点
      if (node.children.length === 0) {
        this.createChildNodes(node)
      }

      // 递归更新子节点
      node.children.forEach((child) => {
        this.updateNodeVisibility(child)
      })
    }
    else {
      // 不需要细分，显示当前节点
      this.visibleTiles.add(node)
    }
  }

  /**
   * 检查瓦片是否可见
   */
  private isTileVisible(node: TileNode): boolean {
    if (!node.mesh)
      return true // 还未创建 mesh，假设可见

    // 使用视锥体剔除
    const frustum = new THREE.Frustum()
    const matrix = new THREE.Matrix4().multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse,
    )
    frustum.setFromProjectionMatrix(matrix)

    return frustum.intersectsObject(node.mesh)
  }

  /**
   * 计算瓦片到相机的距离
   */
  private getTileDistance(node: TileNode): number {
    if (!node.mesh)
      return Infinity

    const tilePosition = new THREE.Vector3()
    node.mesh.getWorldPosition(tilePosition)
    return this.camera.position.distanceTo(tilePosition)
  }

  /**
   * 判断是否应该细分瓦片
   */
  private shouldSubdivideTile(node: TileNode, distance: number): boolean {
    // 基于距离的 LOD 策略
    const threshold = 500 / 2 ** node.coordinate.level
    return distance < threshold
  }

  /**
   * 创建子节点
   */
  private createChildNodes(parent: TileNode): void {
    const { level, x, y } = parent.coordinate
    const childLevel = level + 1

    // 每个瓦片分为 4 个子瓦片
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const childNode: TileNode = {
          coordinate: {
            level: childLevel,
            x: x * 2 + dx,
            y: y * 2 + dy,
          },
          texture: null,
          mesh: null,
          children: [],
          isLoading: false,
          isVisible: false,
          lastAccessTime: Date.now(),
        }

        parent.children.push(childNode)
      }
    }

    logger.debug(`Created 4 child nodes for tile ${level}/${x}/${y}`)
  }

  /**
   * 加载可见瓦片
   */
  private async loadVisibleTiles(): Promise<void> {
    const tilesToLoad: TileNode[] = []

    this.visibleTiles.forEach((node) => {
      if (!node.texture && !node.isLoading) {
        tilesToLoad.push(node)
      }
    })

    // 按距离排序，优先加载近处的瓦片
    tilesToLoad.sort((a, b) => {
      const distA = this.getTileDistance(a)
      const distB = this.getTileDistance(b)
      return distA - distB
    })

    // 限制并发加载数量
    const toLoad = tilesToLoad.slice(0, this.maxConcurrentLoads - this.loadingTiles.size)

    toLoad.forEach((node) => {
      this.loadTile(node)
    })
  }

  /**
   * 加载单个瓦片
   */
  private async loadTile(node: TileNode): Promise<void> {
    const tileKey = this.getTileKey(node.coordinate)

    if (this.loadingTiles.has(tileKey)) {
      return
    }

    node.isLoading = true
    this.loadingTiles.add(tileKey)

    try {
      const url = this.getTileUrl(node.coordinate)
      const texture = await this.textureCache.load(url)

      node.texture = texture
      node.mesh = this.createTileMesh(node)
      this.scene.add(node.mesh)

      logger.debug(`Tile loaded: ${tileKey}`)
    }
    catch (error) {
      logger.error(`Failed to load tile ${tileKey}`, error)
    }
    finally {
      node.isLoading = false
      this.loadingTiles.delete(tileKey)
    }
  }

  /**
   * 生成瓦片 URL
   */
  private getTileUrl(coord: TileCoordinate): string {
    return this.format.urlTemplate
      .replace('{l}', coord.level.toString())
      .replace('{level}', coord.level.toString())
      .replace('{x}', coord.x.toString())
      .replace('{y}', coord.y.toString())
  }

  /**
   * 生成瓦片唯一键
   */
  private getTileKey(coord: TileCoordinate): string {
    return `${coord.level}/${coord.x}/${coord.y}`
  }

  /**
   * 创建瓦片网格
   */
  private createTileMesh(node: TileNode): THREE.Mesh {
    const { level, x, y } = node.coordinate

    // 计算瓦片在球面上的位置和大小
    const tilesPerRow = 2 ** level
    const thetaStart = (x / tilesPerRow) * Math.PI * 2
    const thetaEnd = ((x + 1) / tilesPerRow) * Math.PI * 2
    const phiStart = (y / tilesPerRow) * Math.PI
    const phiEnd = ((y + 1) / tilesPerRow) * Math.PI

    // 创建球面几何体片段
    const geometry = new THREE.SphereGeometry(
      500, // 半径
      32, // 宽度分段
      32, // 高度分段
      thetaStart,
      thetaEnd - thetaStart,
      phiStart,
      phiEnd - phiStart,
    )

    geometry.scale(-1, 1, 1) // 反转以显示内部

    const material = new THREE.MeshBasicMaterial({
      map: node.texture,
      side: THREE.DoubleSide,
    })

    return new THREE.Mesh(geometry, material)
  }

  /**
   * 清理缓存
   */
  private cleanupCache(): void {
    const allNodes: TileNode[] = []
    this.collectAllNodes(this.rootNodes, allNodes)

    // 找出不可见且超过缓存限制的瓦片
    const invisibleNodes = allNodes.filter(node => !node.isVisible && node.texture)

    if (invisibleNodes.length > this.maxCachedTiles) {
      // 按最后访问时间排序
      invisibleNodes.sort((a, b) => a.lastAccessTime - b.lastAccessTime)

      // 移除最旧的瓦片
      const toRemove = invisibleNodes.slice(0, invisibleNodes.length - this.maxCachedTiles)

      toRemove.forEach((node) => {
        this.unloadTile(node)
      })

      logger.debug(`Cleaned up ${toRemove.length} tiles from cache`)
    }
  }

  /**
   * 收集所有节点
   */
  private collectAllNodes(nodes: TileNode[], result: TileNode[]): void {
    nodes.forEach((node) => {
      result.push(node)
      if (node.children.length > 0) {
        this.collectAllNodes(node.children, result)
      }
    })
  }

  /**
   * 卸载瓦片
   */
  private unloadTile(node: TileNode): void {
    if (node.mesh) {
      this.scene.remove(node.mesh)
      node.mesh.geometry.dispose();
      (node.mesh.material as THREE.Material).dispose()
      node.mesh = null
    }

    if (node.texture) {
      // 注意：不要 dispose 纹理，因为它可能被 TextureCache 管理
      node.texture = null
    }
  }

  /**
   * 获取统计信息
   */
  public getStats(): {
    visibleTiles: number
    loadedTiles: number
    loadingTiles: number
    totalNodes: number
  } {
    const allNodes: TileNode[] = []
    this.collectAllNodes(this.rootNodes, allNodes)

    const loadedTiles = allNodes.filter(node => node.texture !== null).length

    return {
      visibleTiles: this.visibleTiles.size,
      loadedTiles,
      loadingTiles: this.loadingTiles.size,
      totalNodes: allNodes.length,
    }
  }

  /**
   * 预加载指定层级的所有瓦片
   */
  public async preloadLevel(level: number): Promise<void> {
    const tiles = this.getTilesForLevel(level)
    logger.info(`Preloading ${tiles.length} tiles for level ${level}`)

    const promises = tiles.map((coord) => {
      const url = this.getTileUrl(coord)
      return this.textureCache.load(url)
    })

    await Promise.all(promises)
    logger.info(`Preload complete for level ${level}`)
  }

  /**
   * 销毁
   */
  public dispose(): void {
    const allNodes: TileNode[] = []
    this.collectAllNodes(this.rootNodes, allNodes)

    allNodes.forEach((node) => {
      this.unloadTile(node)
    })

    this.rootNodes = []
    this.visibleTiles.clear()
    this.loadingTiles.clear()

    logger.info('TileManager disposed')
  }
}
