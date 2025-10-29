/**
 * 导览模式 - 自动引导用户浏览全景场景
 * 支持预设路径、自动播放、暂停、跳转等功能
 */

import type { EventBus } from '../core/EventBus'
import type { SphericalPosition } from '../types'

export interface TourWaypoint {
  id: string
  position: SphericalPosition
  duration: number // 停留时间（毫秒）
  fov?: number // 可选的视野角度
  title?: string
  description?: string
  onEnter?: () => void
  onLeave?: () => void
}

export interface TourPath {
  id: string
  name: string
  waypoints: TourWaypoint[]
  loop?: boolean // 是否循环播放
  autoStart?: boolean
}

export interface TourConfig {
  transitionDuration?: number // 转场时间（毫秒）
  autoAdvance?: boolean // 自动前进
  showProgress?: boolean // 显示进度
  pauseOnInteraction?: boolean // 用户交互时暂停
}

export interface TourState {
  isPlaying: boolean
  isPaused: boolean
  currentWaypointIndex: number
  currentPath: TourPath | null
  progress: number // 0-1
}

export class TourGuide {
  private eventBus: EventBus
  private config: Required<TourConfig>
  private state: TourState
  private paths: Map<string, TourPath>
  private currentTimer: number | null = null
  private transitionStartTime: number = 0
  private animationFrameId: number | null = null

  // Camera control callback
  private onSetCameraPosition: ((position: SphericalPosition, fov?: number, duration?: number) => void) | null = null

  constructor(eventBus: EventBus, config: TourConfig = {}) {
    this.eventBus = eventBus
    this.config = {
      transitionDuration: config.transitionDuration ?? 2000,
      autoAdvance: config.autoAdvance ?? true,
      showProgress: config.showProgress ?? true,
      pauseOnInteraction: config.pauseOnInteraction ?? true,
    }

    this.state = {
      isPlaying: false,
      isPaused: false,
      currentWaypointIndex: -1,
      currentPath: null,
      progress: 0,
    }

    this.paths = new Map()
  }

  /**
   * 设置相机位置控制回调
   */
  public setCameraController(
    callback: (position: SphericalPosition, fov?: number, duration?: number) => void,
  ): void {
    this.onSetCameraPosition = callback
  }

  /**
   * 添加导览路径
   */
  public addPath(path: TourPath): void {
    this.paths.set(path.id, path)
    this.eventBus.emit('tour:pathAdded', { path })
  }

  /**
   * 移除导览路径
   */
  public removePath(pathId: string): void {
    const path = this.paths.get(pathId)
    if (path) {
      if (this.state.currentPath?.id === pathId) {
        this.stop()
      }
      this.paths.delete(pathId)
      this.eventBus.emit('tour:pathRemoved', { pathId })
    }
  }

  /**
   * 获取所有路径
   */
  public getPaths(): TourPath[] {
    return Array.from(this.paths.values())
  }

  /**
   * 获取路径
   */
  public getPath(pathId: string): TourPath | undefined {
    return this.paths.get(pathId)
  }

  /**
   * 开始导览
   */
  public start(pathId: string, fromWaypoint: number = 0): void {
    const path = this.paths.get(pathId)
    if (!path) {
      console.error(`Tour path '${pathId}' not found`)
      return
    }

    if (path.waypoints.length === 0) {
      console.error('Tour path has no waypoints')
      return
    }

    this.stop() // 停止当前导览

    this.state.currentPath = path
    this.state.currentWaypointIndex = fromWaypoint
    this.state.isPlaying = true
    this.state.isPaused = false
    this.state.progress = 0

    this.eventBus.emit('tour:started', { path, waypointIndex: fromWaypoint })
    this.navigateToWaypoint(fromWaypoint)
  }

  /**
   * 暂停导览
   */
  public pause(): void {
    if (!this.state.isPlaying || this.state.isPaused)
      return

    this.state.isPaused = true
    this.clearTimers()
    this.eventBus.emit('tour:paused', {})
  }

  /**
   * 恢复导览
   */
  public resume(): void {
    if (!this.state.isPlaying || !this.state.isPaused)
      return

    this.state.isPaused = false
    this.eventBus.emit('tour:resumed', {})

    // 继续当前航点的停留时间
    const waypoint = this.getCurrentWaypoint()
    if (waypoint) {
      this.scheduleNextWaypoint(waypoint.duration)
    }
  }

  /**
   * 停止导览
   */
  public stop(): void {
    if (!this.state.isPlaying)
      return

    const currentPath = this.state.currentPath

    this.clearTimers()
    this.state.isPlaying = false
    this.state.isPaused = false
    this.state.currentWaypointIndex = -1
    this.state.currentPath = null
    this.state.progress = 0

    this.eventBus.emit('tour:stopped', { path: currentPath })
  }

  /**
   * 跳转到指定航点
   */
  public goToWaypoint(index: number): void {
    if (!this.state.currentPath)
      return

    const waypoints = this.state.currentPath.waypoints
    if (index < 0 || index >= waypoints.length) {
      console.error(`Waypoint index ${index} out of bounds`)
      return
    }

    this.state.currentWaypointIndex = index
    this.navigateToWaypoint(index)
  }

  /**
   * 下一个航点
   */
  public next(): void {
    if (!this.state.currentPath)
      return

    const nextIndex = this.state.currentWaypointIndex + 1
    const waypoints = this.state.currentPath.waypoints

    if (nextIndex < waypoints.length) {
      this.goToWaypoint(nextIndex)
    }
    else if (this.state.currentPath.loop) {
      this.goToWaypoint(0)
    }
    else {
      this.stop()
    }
  }

  /**
   * 上一个航点
   */
  public previous(): void {
    if (!this.state.currentPath)
      return

    const prevIndex = this.state.currentWaypointIndex - 1
    if (prevIndex >= 0) {
      this.goToWaypoint(prevIndex)
    }
    else if (this.state.currentPath.loop) {
      this.goToWaypoint(this.state.currentPath.waypoints.length - 1)
    }
  }

  /**
   * 导航到指定航点
   */
  private navigateToWaypoint(index: number): void {
    if (!this.state.currentPath)
      return

    const waypoint = this.state.currentPath.waypoints[index]
    if (!waypoint)
      return

    // 调用上一个航点的离开回调
    const prevWaypoint = this.getCurrentWaypoint()
    if (prevWaypoint && prevWaypoint.onLeave) {
      prevWaypoint.onLeave()
    }

    // 设置相机位置
    if (this.onSetCameraPosition) {
      this.onSetCameraPosition(
        waypoint.position,
        waypoint.fov,
        this.config.transitionDuration,
      )
    }

    // 调用进入回调
    if (waypoint.onEnter) {
      waypoint.onEnter()
    }

    this.eventBus.emit('tour:waypointReached', { waypoint, index })

    // 更新进度
    this.updateProgress()

    // 如果启用自动前进，安排下一个航点
    if (this.config.autoAdvance && !this.state.isPaused) {
      this.scheduleNextWaypoint(waypoint.duration)
    }
  }

  /**
   * 安排下一个航点
   */
  private scheduleNextWaypoint(delay: number): void {
    this.clearTimers()

    this.currentTimer = window.setTimeout(() => {
      if (this.state.isPlaying && !this.state.isPaused) {
        this.next()
      }
    }, delay)
  }

  /**
   * 清除定时器
   */
  private clearTimers(): void {
    if (this.currentTimer !== null) {
      clearTimeout(this.currentTimer)
      this.currentTimer = null
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 更新进度
   */
  private updateProgress(): void {
    if (!this.state.currentPath)
      return

    const waypoints = this.state.currentPath.waypoints
    this.state.progress = waypoints.length > 0
      ? (this.state.currentWaypointIndex + 1) / waypoints.length
      : 0

    if (this.config.showProgress) {
      this.eventBus.emit('tour:progressUpdated', {
        progress: this.state.progress,
        currentIndex: this.state.currentWaypointIndex,
        totalWaypoints: waypoints.length,
      })
    }
  }

  /**
   * 获取当前航点
   */
  public getCurrentWaypoint(): TourWaypoint | null {
    if (!this.state.currentPath)
      return null
    return this.state.currentPath.waypoints[this.state.currentWaypointIndex] || null
  }

  /**
   * 获取状态
   */
  public getState(): Readonly<TourState> {
    return { ...this.state }
  }

  /**
   * 是否正在播放
   */
  public isPlaying(): boolean {
    return this.state.isPlaying
  }

  /**
   * 是否暂停
   */
  public isPaused(): boolean {
    return this.state.isPaused
  }

  /**
   * 获取进度
   */
  public getProgress(): number {
    return this.state.progress
  }

  /**
   * 销毁导览
   */
  public dispose(): void {
    this.stop()
    this.paths.clear()
  }
}
