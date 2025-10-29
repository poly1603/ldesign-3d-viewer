/**
 * 状态机管理器 - 管理 Viewer 的各种状态
 */

import type { EventBus } from './EventBus'
import { logger } from './Logger'

export enum ViewerState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  DISPOSED = 'disposed',
  TRANSITIONING = 'transitioning',
}

export enum ControlState {
  MOUSE = 'mouse',
  TOUCH = 'touch',
  GYROSCOPE = 'gyroscope',
  KEYBOARD = 'keyboard',
  VR = 'vr',
  AR = 'ar',
}

export enum RenderMode {
  CONTINUOUS = 'continuous',
  ON_DEMAND = 'on_demand',
}

export enum InteractionMode {
  NAVIGATE = 'navigate',
  MEASURE = 'measure',
  ANNOTATE = 'annotate',
  EDIT_HOTSPOT = 'edit_hotspot',
}

export interface ViewerStateData {
  viewer: ViewerState
  controls: Set<ControlState>
  renderMode: RenderMode
  interactionMode: InteractionMode
  isAutoRotating: boolean
  isFullscreen: boolean
  isDragging: boolean
  isTransitioning: boolean
  quality: 'ultra' | 'high' | 'medium' | 'low'
}

export class StateManager {
  private state: ViewerStateData
  private eventBus: EventBus
  private stateHistory: Array<{ state: Partial<ViewerStateData>, timestamp: number }> = []
  private maxHistorySize: number = 50

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
    this.state = {
      viewer: ViewerState.IDLE,
      controls: new Set(),
      renderMode: RenderMode.ON_DEMAND,
      interactionMode: InteractionMode.NAVIGATE,
      isAutoRotating: false,
      isFullscreen: false,
      isDragging: false,
      isTransitioning: false,
      quality: 'high',
    }
  }

  /**
   * 获取当前状态
   */
  public getState(): Readonly<ViewerStateData> {
    return { ...this.state, controls: new Set(this.state.controls) }
  }

  /**
   * 获取 Viewer 状态
   */
  public getViewerState(): ViewerState {
    return this.state.viewer
  }

  /**
   * 设置 Viewer 状态
   */
  public setViewerState(newState: ViewerState): void {
    if (this.state.viewer === newState) {
      return
    }

    const oldState = this.state.viewer
    this.state.viewer = newState

    this.recordStateChange({ viewer: newState })
    logger.debug(`Viewer state changed: ${oldState} -> ${newState}`)

    // 触发相应事件
    if (newState === ViewerState.READY) {
      this.eventBus.emit('viewer:ready')
    }
    else if (newState === ViewerState.ERROR) {
      this.eventBus.emit('error', new Error('Viewer entered error state'))
    }
  }

  /**
   * 检查是否可以执行操作
   */
  public canInteract(): boolean {
    return (
      this.state.viewer === ViewerState.READY
      && !this.state.isTransitioning
      // @ts-expect-error - 类型比较已经在前面的条件中检查
      && this.state.viewer !== ViewerState.DISPOSED
    )
  }

  /**
   * 检查是否正在加载
   */
  public isLoading(): boolean {
    return this.state.viewer === ViewerState.LOADING
  }

  /**
   * 检查是否就绪
   */
  public isReady(): boolean {
    return this.state.viewer === ViewerState.READY
  }

  /**
   * 检查是否已销毁
   */
  public isDisposed(): boolean {
    return this.state.viewer === ViewerState.DISPOSED
  }

  /**
   * 启用控制
   */
  public enableControl(control: ControlState): void {
    if (!this.state.controls.has(control)) {
      this.state.controls.add(control)
      this.recordStateChange({ controls: new Set(this.state.controls) })
      this.eventBus.emit('controls:enable', { type: control })
      logger.debug(`Control enabled: ${control}`)
    }
  }

  /**
   * 禁用控制
   */
  public disableControl(control: ControlState): void {
    if (this.state.controls.has(control)) {
      this.state.controls.delete(control)
      this.recordStateChange({ controls: new Set(this.state.controls) })
      this.eventBus.emit('controls:disable', { type: control })
      logger.debug(`Control disabled: ${control}`)
    }
  }

  /**
   * 检查控制是否启用
   */
  public isControlEnabled(control: ControlState): boolean {
    return this.state.controls.has(control)
  }

  /**
   * 设置渲染模式
   */
  public setRenderMode(mode: RenderMode): void {
    if (this.state.renderMode !== mode) {
      this.state.renderMode = mode
      this.recordStateChange({ renderMode: mode })
      logger.debug(`Render mode changed to: ${mode}`)
    }
  }

  /**
   * 获取渲染模式
   */
  public getRenderMode(): RenderMode {
    return this.state.renderMode
  }

  /**
   * 设置交互模式
   */
  public setInteractionMode(mode: InteractionMode): void {
    if (this.state.interactionMode !== mode) {
      const oldMode = this.state.interactionMode
      this.state.interactionMode = mode
      this.recordStateChange({ interactionMode: mode })
      logger.debug(`Interaction mode changed: ${oldMode} -> ${mode}`)
    }
  }

  /**
   * 获取交互模式
   */
  public getInteractionMode(): InteractionMode {
    return this.state.interactionMode
  }

  /**
   * 设置自动旋转状态
   */
  public setAutoRotating(value: boolean): void {
    if (this.state.isAutoRotating !== value) {
      this.state.isAutoRotating = value
      this.recordStateChange({ isAutoRotating: value })
      logger.debug(`Auto-rotating: ${value}`)
    }
  }

  /**
   * 检查是否自动旋转
   */
  public isAutoRotating(): boolean {
    return this.state.isAutoRotating
  }

  /**
   * 设置全屏状态
   */
  public setFullscreen(value: boolean): void {
    if (this.state.isFullscreen !== value) {
      this.state.isFullscreen = value
      this.recordStateChange({ isFullscreen: value })
      logger.debug(`Fullscreen: ${value}`)
    }
  }

  /**
   * 检查是否全屏
   */
  public isFullscreen(): boolean {
    return this.state.isFullscreen
  }

  /**
   * 设置拖拽状态
   */
  public setDragging(value: boolean): void {
    if (this.state.isDragging !== value) {
      this.state.isDragging = value
      this.recordStateChange({ isDragging: value })

      if (value) {
        this.eventBus.emit('interaction:dragstart', { x: 0, y: 0 })
      }
      else {
        this.eventBus.emit('interaction:dragend', { x: 0, y: 0 })
      }
    }
  }

  /**
   * 检查是否正在拖拽
   */
  public isDragging(): boolean {
    return this.state.isDragging
  }

  /**
   * 设置过渡状态
   */
  public setTransitioning(value: boolean): void {
    if (this.state.isTransitioning !== value) {
      this.state.isTransitioning = value
      this.recordStateChange({ isTransitioning: value })
      logger.debug(`Transitioning: ${value}`)
    }
  }

  /**
   * 检查是否正在过渡
   */
  public isTransitioning(): boolean {
    return this.state.isTransitioning
  }

  /**
   * 设置质量级别
   */
  public setQuality(quality: 'ultra' | 'high' | 'medium' | 'low'): void {
    if (this.state.quality !== quality) {
      this.state.quality = quality
      this.recordStateChange({ quality })
      this.eventBus.emit('quality:change', { preset: quality, settings: {} })
      logger.info(`Quality changed to: ${quality}`)
    }
  }

  /**
   * 获取质量级别
   */
  public getQuality(): 'ultra' | 'high' | 'medium' | 'low' {
    return this.state.quality
  }

  /**
   * 记录状态变更
   */
  private recordStateChange(changes: Partial<ViewerStateData>): void {
    this.stateHistory.push({
      state: changes,
      timestamp: Date.now(),
    })

    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift()
    }
  }

  /**
   * 获取状态历史
   */
  public getStateHistory(): Array<{ state: Partial<ViewerStateData>, timestamp: number }> {
    return [...this.stateHistory]
  }

  /**
   * 重置状态
   */
  public reset(): void {
    this.state = {
      viewer: ViewerState.IDLE,
      controls: new Set(),
      renderMode: RenderMode.ON_DEMAND,
      interactionMode: InteractionMode.NAVIGATE,
      isAutoRotating: false,
      isFullscreen: false,
      isDragging: false,
      isTransitioning: false,
      quality: 'high',
    }
    this.stateHistory = []
    logger.debug('State manager reset')
  }

  /**
   * 销毁状态管理器
   */
  public dispose(): void {
    this.setViewerState(ViewerState.DISPOSED)
    this.state.controls.clear()
    this.stateHistory = []
  }
}
