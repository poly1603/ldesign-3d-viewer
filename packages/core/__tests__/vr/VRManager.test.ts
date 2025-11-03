import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { EventBus } from '../../src/core/EventBus'
import { VRManager } from '../../src/vr/VRManager'

// Mock WebXR API
class MockXRSession {
  ended = false
  listeners: Map<string, Set<Function>> = new Map()

  addEventListener(type: string, listener: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  removeEventListener(type: string, listener: Function) {
    this.listeners.get(type)?.delete(listener)
  }

  async end() {
    this.ended = true
    this.listeners.get('end')?.forEach(fn => fn())
    return Promise.resolve()
  }

  async updateRenderState(_state: any) {
    return Promise.resolve()
  }

  async requestReferenceSpace(_type: string): Promise<any> {
    return Promise.resolve({})
  }
}

class MockXRWebGLLayer {
  constructor(_session: any, _gl: any) {}
}

describe('VRManager', () => {
  let renderer: THREE.WebGLRenderer
  let camera: THREE.PerspectiveCamera
  let scene: THREE.Scene
  let eventBus: EventBus
  let vrManager: VRManager
  let mockXRSession: MockXRSession

  beforeEach(() => {
    // 创建基本的 Three.js 对象（不实际创建 WebGLRenderer）
    camera = new THREE.PerspectiveCamera()
    scene = new THREE.Scene()
    eventBus = new EventBus()

    // Mock WebXR API
    mockXRSession = new MockXRSession()
    
    ;(globalThis as any).navigator = {
      xr: {
        isSessionSupported: vi.fn().mockResolvedValue(true),
        requestSession: vi.fn().mockResolvedValue(mockXRSession),
      },
    }

    ;(globalThis as any).XRWebGLLayer = MockXRWebGLLayer

    // Mock renderer - 不使用真实的 WebGLRenderer
    renderer = {
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
    } as any

    vrManager = new VRManager(renderer, camera, scene, {}, eventBus)
  })

  describe('基本功能', () => {
    it('应该能够创建 VRManager', () => {
      expect(vrManager).toBeDefined()
    })

    it('应该能够创建不带 EventBus 的 VRManager', () => {
      const vr = new VRManager(renderer, camera, scene)
      expect(vr).toBeDefined()
    })

    it('应该能够接受自定义选项', () => {
      const vr = new VRManager(renderer, camera, scene, {
        referenceSpaceType: 'bounded-floor',
        floorLevel: false,
        controllers: false,
        teleport: true,
      })
      expect(vr).toBeDefined()
    })

    it('初始状态应该不在 VR 中', () => {
      expect(vrManager.isActive()).toBe(false)
    })
  })

  describe('VR 支持检测', () => {
    it('应该能够检测 VR 支持', async () => {
      const supported = await VRManager.isVRSupported()
      expect(supported).toBe(true)
    })

    it('navigator.xr 不存在时应该返回 false', async () => {
      delete (globalThis as any).navigator.xr
      
      const supported = await VRManager.isVRSupported()
      expect(supported).toBe(false)

      // 恢复
      ;(globalThis as any).navigator.xr = {
        isSessionSupported: vi.fn().mockResolvedValue(true),
      }
    })

    it('isSessionSupported 抛出错误时应该返回 false', async () => {
      ;(globalThis as any).navigator.xr.isSessionSupported = vi.fn().mockRejectedValue(new Error('Not supported'))
      
      const supported = await VRManager.isVRSupported()
      expect(supported).toBe(false)
    })

    it('不支持 immersive-vr 时应该返回 false', async () => {
      ;(globalThis as any).navigator.xr.isSessionSupported = vi.fn().mockResolvedValue(false)
      
      const supported = await VRManager.isVRSupported()
      expect(supported).toBe(false)
    })
  })

  describe('初始化', () => {
    it('应该能够初始化 VR', async () => {
      await vrManager.initialize()
      
      expect(renderer.xr.enabled).toBe(true)
    })

    it('不支持 VR 时初始化应该抛出错误', async () => {
      ;(globalThis as any).navigator.xr.isSessionSupported = vi.fn().mockResolvedValue(false)
      
      await expect(vrManager.initialize()).rejects.toThrow('VR not supported')
    })
  })

  describe('进入 VR 模式', () => {
    beforeEach(async () => {
      await vrManager.initialize()
    })

    it('应该能够进入 VR 模式', async () => {
      await vrManager.enterVR()
      
      expect(vrManager.isActive()).toBe(true)
      expect(renderer.xr.setSession).toHaveBeenCalled()
    })

    it('进入 VR 时应该触发事件', async () => {
      const handler = vi.fn()
      eventBus.on('xr:sessionstart', handler)
      
      await vrManager.enterVR()
      
      expect(handler).toHaveBeenCalledWith({ mode: 'vr' })
    })

    it('WebXR 不可用时应该抛出错误', async () => {
      delete (globalThis as any).navigator.xr
      
      await expect(vrManager.enterVR()).rejects.toThrow('WebXR not available')

      // 恢复
      ;(globalThis as any).navigator.xr = {
        isSessionSupported: vi.fn().mockResolvedValue(true),
        requestSession: vi.fn().mockResolvedValue(mockXRSession),
      }
    })

    it('已经在 VR 中时应该直接返回', async () => {
      await vrManager.enterVR()
      
      const requestSessionSpy = vi.spyOn((globalThis as any).navigator.xr, 'requestSession')
      await vrManager.enterVR()
      
      // 不应该再次请求会话
      expect(requestSessionSpy).not.toHaveBeenCalled()
    })

    it('请求会话失败时应该抛出错误', async () => {
      ;(globalThis as any).navigator.xr.requestSession = vi.fn().mockRejectedValue(new Error('Session request failed'))
      
      await expect(vrManager.enterVR()).rejects.toThrow()
    })

    it('启用控制器时应该设置控制器', async () => {
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      
      await vr.enterVR()
      
      expect(renderer.xr.getController).toHaveBeenCalled()
      expect(vr.getController(0)).toBeDefined()
      expect(vr.getController(1)).toBeDefined()
    })

    it('禁用控制器时不应该设置控制器', async () => {
      const vr = new VRManager(renderer, camera, scene, { controllers: false }, eventBus)
      await vr.initialize()
      
      await vr.enterVR()
      
      expect(vr.getController(0)).toBeUndefined()
      expect(vr.getController(1)).toBeUndefined()
    })
  })

  describe('退出 VR 模式', () => {
    beforeEach(async () => {
      await vrManager.initialize()
      await vrManager.enterVR()
    })

    it('应该能够退出 VR 模式', async () => {
      await vrManager.exitVR()
      
      // 会话应该已结束
      expect(mockXRSession.ended).toBe(true)
    })

    it('退出 VR 时应该触发事件', async () => {
      const handler = vi.fn()
      eventBus.on('xr:sessionend', handler)
      
      await vrManager.exitVR()
      
      expect(handler).toHaveBeenCalled()
    })

    it('未在 VR 中时退出应该不做任何事', async () => {
      await vrManager.exitVR()
      const sessionEndSpy = vi.spyOn(mockXRSession, 'end')
      
      await vrManager.exitVR()
      
      expect(sessionEndSpy).not.toHaveBeenCalled()
    })

    it('会话结束失败时不应该抛出错误', async () => {
      mockXRSession.end = vi.fn().mockRejectedValue(new Error('End failed'))
      
      await expect(vrManager.exitVR()).resolves.toBeUndefined()
    })
  })

  describe('会话结束处理', () => {
    beforeEach(async () => {
      await vrManager.initialize()
    })

    it('会话结束时应该清理状态', async () => {
      await vrManager.enterVR()
      expect(vrManager.isActive()).toBe(true)
      
      // 触发会话结束
      await mockXRSession.end()
      
      expect(vrManager.isActive()).toBe(false)
      expect(vrManager.getSession()).toBeNull()
    })

    it('会话结束时应该清理控制器', async () => {
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      await vr.enterVR()
      
      const controller0 = vr.getController(0)
      expect(controller0).toBeDefined()
      
      await mockXRSession.end()
      
      // 控制器应该被移除
      expect(scene.children).not.toContain(controller0)
    })

    it('会话结束时应该触发事件', async () => {
      const handler = vi.fn()
      eventBus.on('xr:sessionend', handler)
      
      await vrManager.enterVR()
      await mockXRSession.end()
      
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('控制器管理', () => {
    it('应该能够获取控制器', async () => {
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      await vr.enterVR()
      
      const controller0 = vr.getController(0)
      const controller1 = vr.getController(1)
      
      expect(controller0).toBeDefined()
      expect(controller1).toBeDefined()
      expect(controller0).toBeInstanceOf(THREE.Group)
      expect(controller1).toBeInstanceOf(THREE.Group)
    })

    it('无效索引应该返回 undefined', async () => {
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      await vr.enterVR()
      
      expect(vr.getController(2)).toBeUndefined()
      expect(vr.getController(-1)).toBeUndefined()
    })

    it('控制器事件应该被正确设置', async () => {
      const mockController = new THREE.Group()
      const addEventListenerSpy = vi.fn()
      mockController.addEventListener = addEventListenerSpy

      renderer.xr.getController = vi.fn(() => mockController) as any
      
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      await vr.enterVR()
      
      // 应该为每个控制器添加4个事件监听器
      expect(addEventListenerSpy).toHaveBeenCalledWith('selectstart', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('selectend', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('connected', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('disconnected', expect.any(Function))
    })
  })

  describe('会话信息', () => {
    it('应该能够获取 XR 会话', async () => {
      await vrManager.initialize()
      
      expect(vrManager.getSession()).toBeNull()
      
      await vrManager.enterVR()
      
      expect(vrManager.getSession()).toBe(mockXRSession)
    })

    it('退出 VR 后会话应该为 null', async () => {
      await vrManager.initialize()
      await vrManager.enterVR()
      
      expect(vrManager.getSession()).toBe(mockXRSession)
      
      await vrManager.exitVR()
      
      expect(vrManager.getSession()).toBeNull()
    })
  })

  describe('销毁', () => {
    it('应该能够销毁 VR 管理器', () => {
      vrManager.dispose()
      
      expect(renderer.xr.enabled).toBe(false)
    })

    it('在 VR 中时销毁应该先退出 VR', async () => {
      await vrManager.initialize()
      await vrManager.enterVR()
      
      expect(vrManager.isActive()).toBe(true)
      
      vrManager.dispose()
      
      // 由于 dispose 会调用 exitVR，最终状态应该不在 VR 中
      expect(mockXRSession.ended).toBe(true)
    })

    it('销毁时应该清空控制器', async () => {
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      await vr.enterVR()
      
      const controller0 = vr.getController(0)
      expect(controller0).toBeDefined()
      
      vr.dispose()
      
      expect(scene.children).not.toContain(controller0)
    })

    it('多次调用 dispose 不应该出错', () => {
      expect(() => {
        vrManager.dispose()
        vrManager.dispose()
        vrManager.dispose()
      }).not.toThrow()
    })
  })

  describe('选项配置', () => {
    it('应该使用默认选项', () => {
      const vr = new VRManager(renderer, camera, scene)
      expect(vr).toBeDefined()
      // 默认选项在内部使用，无法直接测试，但不应该报错
    })

    it('应该接受自定义参考空间类型', async () => {
      const requestRefSpy = vi.spyOn(mockXRSession, 'requestReferenceSpace')
      
      const vr = new VRManager(renderer, camera, scene, {
        referenceSpaceType: 'bounded-floor',
      })
      await vr.initialize()
      
      await vr.enterVR()
      
      expect(requestRefSpy).toHaveBeenCalledWith('bounded-floor')
    })

    it('应该接受所有选项', async () => {
      const vr = new VRManager(renderer, camera, scene, {
        referenceSpaceType: 'local',
        floorLevel: false,
        controllers: false,
        teleport: true,
      })
      
      await vr.initialize()
      await vr.enterVR()
      
      expect(vr.getController(0)).toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理会话更新失败', async () => {
      mockXRSession.updateRenderState = vi.fn().mockRejectedValue(new Error('Update failed'))
      
      await vrManager.initialize()
      
      await expect(vrManager.enterVR()).rejects.toThrow()
    })

    it('应该处理参考空间请求失败', async () => {
      mockXRSession.requestReferenceSpace = vi.fn().mockRejectedValue(new Error('Reference space failed'))
      
      await vrManager.initialize()
      
      await expect(vrManager.enterVR()).rejects.toThrow()
    })

    it('应该能够处理没有 XRControllerModelFactory 的情况', async () => {
      // 确保 THREE 没有 XRControllerModelFactory
      const originalFactory = (THREE as any).XRControllerModelFactory
      delete (THREE as any).XRControllerModelFactory
      
      const vr = new VRManager(renderer, camera, scene, { controllers: true }, eventBus)
      await vr.initialize()
      
      // 应该不抛出错误
      await expect(vr.enterVR()).resolves.toBeUndefined()
      
      // 恢复
      if (originalFactory) {
        (THREE as any).XRControllerModelFactory = originalFactory
      }
    })

    it('未初始化时应该能够进入 VR', async () => {
      // 不调用 initialize
      await expect(vrManager.enterVR()).resolves.toBeUndefined()
    })
  })

  describe('性能', () => {
    it('应该快速检查 VR 支持', async () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 10; i++) {
        await VRManager.isVRSupported()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 10次检查应该在50ms内完成
      expect(duration).toBeLessThan(50)
    })

    it('应该快速查询状态', () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        vrManager.isActive()
        vrManager.getSession()
        vrManager.getController(0)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 3000次查询应该在10ms内完成
      expect(duration).toBeLessThan(10)
    })
  })
})
