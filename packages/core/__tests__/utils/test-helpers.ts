/**
 * 测试工具类库
 * 提供通用的测试辅助函数
 */

import * as THREE from 'three'
import { vi } from 'vitest'

/**
 * 创建mock的Three.js相机
 */
export function createMockCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.set(0, 0, 0)
  return camera
}

/**
 * 创建mock的Three.js场景
 */
export function createMockScene(): THREE.Scene {
  return new THREE.Scene()
}

/**
 * 创建mock的WebGL渲染器
 */
export function createMockRenderer() {
  return {
    xr: {
      enabled: false,
      setSession: vi.fn(),
      getController: vi.fn(() => {
        const group = new THREE.Group()
        group.addEventListener = vi.fn()
        return group
      }),
      getControllerGrip: vi.fn(() => new THREE.Group()),
    },
    getContext: vi.fn(() => ({})),
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  } as any
}

/**
 * 创建mock的触摸事件
 */
export function createMockTouch(identifier: number, clientX: number, clientY: number): Touch {
  return {
    identifier,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    pageX: clientX,
    pageY: clientY,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
    target: document.createElement('div'),
  } as Touch
}

/**
 * 创建mock的触摸事件对象
 */
export function createMockTouchEvent(
  type: string,
  touches: Touch[],
  changedTouches: Touch[] = touches,
): TouchEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent

  Object.defineProperty(event, 'touches', {
    value: touches,
    writable: false,
  })

  Object.defineProperty(event, 'changedTouches', {
    value: changedTouches,
    writable: false,
  })

  Object.defineProperty(event, 'targetTouches', {
    value: touches,
    writable: false,
  })

  return event
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 等待条件满足
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50,
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await wait(interval)
  }
}

/**
 * 创建mock的视频元素
 */
export function createMockVideoElement() {
  const mockVideo = {
    src: '',
    currentTime: 0,
    duration: 100,
    paused: true,
    ended: false,
    seeking: false,
    volume: 1,
    muted: false,
    playbackRate: 1,
    loop: false,
    videoWidth: 1920,
    videoHeight: 1080,
    crossOrigin: 'anonymous',
    playsInline: true,
    preload: 'metadata',
    error: null as MediaError | null,
    buffered: {
      length: 0,
      start: () => 0,
      end: () => 0,
    } as TimeRanges,
    listeners: new Map<string, Set<Function>>(),

    addEventListener(type: string, listener: Function) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set())
      }
      this.listeners.get(type)!.add(listener)
    },

    removeEventListener(type: string, listener: Function) {
      this.listeners.get(type)?.delete(listener)
    },

    dispatchEvent(event: any) {
      const type = typeof event === 'string' ? event : event.type
      this.listeners.get(type)?.forEach(fn => fn(event))
      return true
    },

    async play() {
      this.paused = false
      this.dispatchEvent({ type: 'play' })
      return Promise.resolve()
    },

    pause() {
      this.paused = true
      this.dispatchEvent({ type: 'pause' })
    },

    load() {
      // Simulate loading
    },
  }

  return mockVideo
}

/**
 * 创建mock的XR会话
 */
export function createMockXRSession() {
  return {
    ended: false,
    listeners: new Map<string, Set<Function>>(),

    addEventListener(type: string, listener: Function) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set())
      }
      this.listeners.get(type)!.add(listener)
    },

    removeEventListener(type: string, listener: Function) {
      this.listeners.get(type)?.delete(listener)
    },

    async end() {
      this.ended = true
      this.listeners.get('end')?.forEach(fn => fn())
      return Promise.resolve()
    },

    async updateRenderState(_state: any) {
      return Promise.resolve()
    },

    async requestReferenceSpace(_type: string): Promise<any> {
      return Promise.resolve({})
    },
  }
}

/**
 * Mock MediaError (如果环境不支持)
 */
export function setupMediaErrorMock() {
  if (typeof (globalThis as any).MediaError === 'undefined') {
    (globalThis as any).MediaError = {
      MEDIA_ERR_ABORTED: 1,
      MEDIA_ERR_NETWORK: 2,
      MEDIA_ERR_DECODE: 3,
      MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
    }
  }
}

/**
 * 测量函数执行时间
 */
export async function measureTime(fn: () => void | Promise<void>): Promise<number> {
  const start = performance.now()
  await fn()
  return performance.now() - start
}

/**
 * 批量创建测试数据
 */
export function createTestData<T>(count: number, factory: (index: number) => T): T[] {
  return Array.from({ length: count }, (_, i) => factory(i))
}

/**
 * 验证对象是否已被dispose
 */
export function expectDisposed(obj: any) {
  // 常见的dispose标志
  const disposeFlags = [
    obj.disposed,
    obj._disposed,
    obj.isDisposed,
    obj.isDisposed?.(),
  ]

  return disposeFlags.some(flag => flag === true)
}
