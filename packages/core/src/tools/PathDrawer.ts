/**
 * 路径绘制工具
 * 在全景中绘制导览路径和轨迹
 */

import * as THREE from 'three'
import { EventBus } from '../core/EventBus'

export interface PathPoint {
  theta: number
  phi: number
  timestamp: number
  cameraFov?: number
  duration?: number // 在此点停留时间
}

export interface Path {
  id: string
  name: string
  points: PathPoint[]
  color: string
  lineWidth: number
  closed: boolean
  animated: boolean
  speed: number // 播放速度
}

export class PathDrawer {
  private paths: Map<string, Path> = new Map()
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private container: HTMLElement
  private camera: THREE.PerspectiveCamera
  private eventBus: EventBus

  // 绘制状态
  private isDrawing = false
  private currentPath: Path | null = null
  private tempPoints: PathPoint[] = []

  // 播放状态
  private isPlaying = false
  private playingPathId: string | null = null
  private playbackProgress = 0

  constructor(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    eventBus?: EventBus,
  ) {
    this.container = container
    this.camera = camera
    this.eventBus = eventBus || new EventBus()

    // 创建画布
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = 'auto'
    this.canvas.style.zIndex = '9'

    this.ctx = this.canvas.getContext('2d')!
    this.container.appendChild(this.canvas)

    this.resize()
    this.setupEventListeners()
  }

  /**
   * 调整大小
   */
  private resize(): void {
    const rect = this.container.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.render()
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => {
      if (!this.isDrawing)
        return

      const { theta, phi } = this.getSphericalFromMouse(e)

      this.tempPoints.push({
        theta,
        phi,
        timestamp: Date.now(),
      })

      this.render()
    })

    window.addEventListener('resize', () => this.resize())
  }

  /**
   * 从鼠标获取球面坐标
   */
  private getSphericalFromMouse(event: MouseEvent): { theta: number, phi: number } {
    const rect = this.canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)

    const direction = raycaster.ray.direction
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(direction)

    return { theta: spherical.theta, phi: spherical.phi }
  }

  /**
   * 开始绘制
   */
  public startDrawing(name: string = 'Path'): void {
    this.isDrawing = true
    this.tempPoints = []
    this.canvas.style.cursor = 'crosshair'
    this.eventBus.emit('path:drawing-started', { name })
  }

  /**
   * 完成绘制
   */
  public finishDrawing(name: string = 'Path', closed: boolean = false): void {
    if (this.tempPoints.length < 2) {
      this.cancelDrawing()
      return
    }

    const path: Path = {
      id: `path-${Date.now()}`,
      name,
      points: [...this.tempPoints],
      color: '#00ff00',
      lineWidth: 3,
      closed,
      animated: false,
      speed: 1,
    }

    this.addPath(path)

    this.isDrawing = false
    this.tempPoints = []
    this.canvas.style.cursor = 'default'

    this.eventBus.emit('path:drawing-finished', { path })
  }

  /**
   * 取消绘制
   */
  public cancelDrawing(): void {
    this.isDrawing = false
    this.tempPoints = []
    this.canvas.style.cursor = 'default'
    this.render()
    this.eventBus.emit('path:drawing-cancelled', {})
  }

  /**
   * 添加路径
   */
  public addPath(path: Path): void {
    this.paths.set(path.id, path)
    this.render()
  }

  /**
   * 移除路径
   */
  public removePath(id: string): void {
    this.paths.delete(id)
    this.render()
  }

  /**
   * 球面坐标转画布坐标
   */
  private sphericalToCanvas(theta: number, phi: number): { x: number, y: number } {
    const x = ((theta / (Math.PI * 2) + 0.5) % 1) * this.canvas.width
    const y = (phi / Math.PI) * this.canvas.height
    return { x, y }
  }

  /**
   * 渲染所有路径
   */
  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 渲染已保存的路径
    this.paths.forEach((path) => {
      this.renderPath(path)
    })

    // 渲染临时路径
    if (this.isDrawing && this.tempPoints.length > 0) {
      this.renderTempPath()
    }

    // 渲染播放进度
    if (this.isPlaying && this.playingPathId) {
      const path = this.paths.get(this.playingPathId)
      if (path) {
        this.renderPlaybackProgress(path)
      }
    }
  }

  /**
   * 渲染路径
   */
  private renderPath(path: Path): void {
    if (path.points.length < 2)
      return

    const ctx = this.ctx
    ctx.strokeStyle = path.color
    ctx.lineWidth = path.lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()

    path.points.forEach((point, index) => {
      const { x, y } = this.sphericalToCanvas(point.theta, point.phi)

      if (index === 0) {
        ctx.moveTo(x, y)
      }
      else {
        ctx.lineTo(x, y)
      }

      // 绘制点
      ctx.save()
      ctx.fillStyle = path.color
      ctx.beginPath()
      ctx.arc(x, y, path.lineWidth * 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    if (path.closed && path.points.length > 2) {
      ctx.closePath()
    }

    ctx.stroke()
  }

  /**
   * 渲染临时路径
   */
  private renderTempPath(): void {
    const ctx = this.ctx
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])

    ctx.beginPath()

    this.tempPoints.forEach((point, index) => {
      const { x, y } = this.sphericalToCanvas(point.theta, point.phi)

      if (index === 0) {
        ctx.moveTo(x, y)
      }
      else {
        ctx.lineTo(x, y)
      }

      // 绘制点
      ctx.save()
      ctx.fillStyle = '#ffff00'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    ctx.stroke()
    ctx.setLineDash([])
  }

  /**
   * 渲染播放进度
   */
  private renderPlaybackProgress(path: Path): void {
    const index = Math.floor(this.playbackProgress * (path.points.length - 1))
    if (index < 0 || index >= path.points.length)
      return

    const point = path.points[index]
    const { x, y } = this.sphericalToCanvas(point.theta, point.phi)

    // 绘制当前位置
    this.ctx.save()
    this.ctx.fillStyle = '#ff0000'
    this.ctx.beginPath()
    this.ctx.arc(x, y, 8, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
  }

  /**
   * 播放路径
   */
  public playPath(
    pathId: string,
    onProgress?: (point: PathPoint, index: number) => void,
  ): Promise<void> {
    return new Promise((resolve) => {
      const path = this.paths.get(pathId)
      if (!path) {
        resolve()
        return
      }

      this.isPlaying = true
      this.playingPathId = pathId
      this.playbackProgress = 0

      const totalPoints = path.points.length
      let currentIndex = 0

      const animate = () => {
        if (!this.isPlaying || currentIndex >= totalPoints) {
          this.isPlaying = false
          this.playingPathId = null
          this.render()
          resolve()
          return
        }

        const point = path.points[currentIndex]
        this.playbackProgress = currentIndex / (totalPoints - 1)

        if (onProgress) {
          onProgress(point, currentIndex)
        }

        this.render()

        const duration = point.duration || 1000 / path.speed
        setTimeout(() => {
          currentIndex++
          animate()
        }, duration)
      }

      animate()
    })
  }

  /**
   * 停止播放
   */
  public stopPlayback(): void {
    this.isPlaying = false
    this.playingPathId = null
    this.playbackProgress = 0
    this.render()
  }

  /**
   * 导出路径
   */
  public exportPaths(): Path[] {
    return Array.from(this.paths.values())
  }

  /**
   * 导入路径
   */
  public importPaths(paths: Path[]): void {
    this.paths.clear()
    paths.forEach(path => this.addPath(path))
  }

  /**
   * 清除所有路径
   */
  public clear(): void {
    this.paths.clear()
    this.render()
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.stopPlayback()
    this.canvas.remove()
    this.paths.clear()
  }
}
