/**
 * 事件总线系统 - 用于组件间解耦通信
 */

export type EventHandler<T = any> = (data: T) => void

export interface EventMap {
  // 索引签名 - 允许任意事件名
  [key: string]: any
  
  // 生命周期事件
  'viewer:ready': void
  'viewer:dispose': void

  // 加载事件
  'image:loading': { url: string, progress: number }
  'image:loaded': { url: string }
  'image:error': { url: string, error: Error }

  // 相机事件
  'camera:change': { rotation: { x: number, y: number, z: number }, fov: number }
  'camera:move': { rotation: { x: number, y: number, z: number } }
  'camera:zoom': { fov: number }

  // 渲染事件
  'render:before': void
  'render:after': void
  'render:requested': void

  // 交互事件
  'interaction:dragstart': { x: number, y: number }
  'interaction:drag': { x: number, y: number, deltaX: number, deltaY: number }
  'interaction:dragend': { x: number, y: number }
  'interaction:zoom': { delta: number, fov: number }

  // 热点事件
  'hotspot:add': { id: string }
  'hotspot:remove': { id: string }
  'hotspot:click': { id: string, data: any }
  'hotspot:hover': { id: string, data: any }

  // 性能事件
  'performance:warning': { type: string, message: string, value: number }
  'performance:stats': { fps: number, frameTime: number }

  // 控制事件
  'controls:enable': { type: string }
  'controls:disable': { type: string }

  // 质量事件
  'quality:change': { preset: string, settings: any }

  // VR/AR 事件
  'xr:sessionstart': { mode: 'vr' | 'ar' }
  'xr:sessionend': void

  // 视频事件
  'video:play': void
  'video:pause': void
  'video:ended': void
  'video:timeupdate': { currentTime: number, duration: number }

  // 通用错误事件
  'error': Error
}

export class EventBus {
  private listeners: Map<keyof EventMap, Set<EventHandler>> = new Map()
  private onceListeners: Map<keyof EventMap, Set<EventHandler>> = new Map()
  private eventHistory: Array<{ event: string, data: any, timestamp: number }> = []
  private maxHistorySize: number = 100

  /**
   * 订阅事件
   */
  public on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    // 返回取消订阅函数
    return () => this.off(event, handler)
  }

  /**
   * 订阅一次性事件
   */
  public once<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }
    this.onceListeners.get(event)!.add(handler)

    return () => this.offOnce(event, handler)
  }

  /**
   * 取消订阅
   */
  public off<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 取消一次性订阅
   */
  private offOnce<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): void {
    const handlers = this.onceListeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.onceListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  public emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void {
    // 记录事件历史
    if (this.eventHistory.length >= this.maxHistorySize) {
      this.eventHistory.shift()
    }
    this.eventHistory.push({
      event: event as string,
      data,
      timestamp: Date.now(),
    })

    // 触发普通监听器
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data as any)
        }
        catch (error) {
          console.error(`Error in event handler for "${event as string}":`, error)
        }
      })
    }

    // 触发一次性监听器
    const onceHandlers = this.onceListeners.get(event)
    if (onceHandlers) {
      const handlersArray = Array.from(onceHandlers)
      onceHandlers.clear()
      this.onceListeners.delete(event)

      handlersArray.forEach((handler) => {
        try {
          handler(data as any)
        }
        catch (error) {
          console.error(`Error in once event handler for "${event as string}":`, error)
        }
      })
    }
  }

  /**
   * 等待事件触发（Promise 方式）
   */
  public waitFor<K extends keyof EventMap>(
    event: K,
    timeout?: number,
  ): Promise<EventMap[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null

      const handler = (data: EventMap[K]) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        resolve(data)
      }

      this.once(event, handler)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.offOnce(event, handler)
          reject(new Error(`Timeout waiting for event "${event as string}"`))
        }, timeout)
      }
    })
  }

  /**
   * 清除所有监听器
   */
  public clear(event?: keyof EventMap): void {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    }
    else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * 获取事件历史
   */
  public getHistory(): Array<{ event: string, data: any, timestamp: number }> {
    return [...this.eventHistory]
  }

  /**
   * 获取监听器数量
   */
  public getListenerCount(event?: keyof EventMap): number {
    if (event) {
      const regular = this.listeners.get(event)?.size || 0
      const once = this.onceListeners.get(event)?.size || 0
      return regular + once
    }

    let total = 0
    this.listeners.forEach(handlers => (total += handlers.size))
    this.onceListeners.forEach(handlers => (total += handlers.size))
    return total
  }

  /**
   * 销毁事件总线
   */
  public dispose(): void {
    this.clear()
    this.eventHistory = []
  }
}
