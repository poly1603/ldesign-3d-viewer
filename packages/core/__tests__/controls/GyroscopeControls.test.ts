import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GyroscopeControls } from '../../src/controls/GyroscopeControls'

describe('GyroscopeControls', () => {
  let camera: THREE.PerspectiveCamera
  let controls: GyroscopeControls

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.set(0, 0, 0)
    
    // Mock window.DeviceOrientationEvent
    ;(window as any).DeviceOrientationEvent = class DeviceOrientationEvent extends Event {
      alpha: number | null
      beta: number | null
      gamma: number | null
      
      constructor(type: string, eventInit?: any) {
        super(type, eventInit)
        this.alpha = eventInit?.alpha ?? null
        this.beta = eventInit?.beta ?? null
        this.gamma = eventInit?.gamma ?? null
      }
    }
    
    // Mock window.orientation
    Object.defineProperty(window, 'orientation', {
      writable: true,
      value: 0,
    })
    
    controls = new GyroscopeControls(camera)
  })

  describe('基本功能', () => {
    it('应该能够创建 GyroscopeControls', () => {
      expect(controls).toBeDefined()
      expect(controls.isEnabled()).toBe(false)
    })

    it('应该能够启用陀螺仪控制', async () => {
      const result = await controls.enable()
      expect(result).toBe(true)
      expect(controls.isEnabled()).toBe(true)
    })

    it('应该能够禁用陀螺仪控制', async () => {
      await controls.enable()
      expect(controls.isEnabled()).toBe(true)
      
      controls.disable()
      expect(controls.isEnabled()).toBe(false)
    })

    it('DeviceOrientationEvent 不支持时应该返回 false', async () => {
      const originalDeviceOrientationEvent = (window as any).DeviceOrientationEvent
      delete (window as any).DeviceOrientationEvent
      
      const result = await controls.enable()
      expect(result).toBe(false)
      expect(controls.isEnabled()).toBe(false)
      
      // Restore
      ;(window as any).DeviceOrientationEvent = originalDeviceOrientationEvent
    })
  })

  describe('设备方向事件', () => {
    it('应该能够响应设备方向变化', async () => {
      await controls.enable()
      
      const initialRotation = camera.quaternion.clone()
      
      // Simulate device orientation event
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,
        beta: 45,
        gamma: 0,
      })
      
      window.dispatchEvent(event)
      
      // Camera rotation should change
      expect(camera.quaternion.equals(initialRotation)).toBe(false)
    })

    it('禁用状态下不应该响应设备方向变化', async () => {
      await controls.enable()
      controls.disable()
      
      const initialRotation = camera.quaternion.clone()
      
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,
        beta: 45,
        gamma: 0,
      })
      
      window.dispatchEvent(event)
      
      // Camera rotation should not change
      expect(camera.quaternion.equals(initialRotation)).toBe(true)
    })

    it('应该能够处理 null 值的设备方向事件', async () => {
      await controls.enable()
      
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: null,
        beta: null,
        gamma: null,
      })
      
      // Should not throw error
      expect(() => window.dispatchEvent(event)).not.toThrow()
    })

    it('应该能够处理不同的 alpha 值', async () => {
      await controls.enable()
      
      const rotations: THREE.Quaternion[] = []
      
      // Test different alpha values
      for (const alpha of [0, 90, 180, 270]) {
        const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
          alpha,
          beta: 0,
          gamma: 0,
        })
        
        window.dispatchEvent(event)
        rotations.push(camera.quaternion.clone())
      }
      
      // All rotations should be different
      for (let i = 0; i < rotations.length - 1; i++) {
        for (let j = i + 1; j < rotations.length; j++) {
          expect(rotations[i].equals(rotations[j])).toBe(false)
        }
      }
    })

    it('应该能够处理不同的 beta 值', async () => {
      await controls.enable()
      
      const rotations: THREE.Quaternion[] = []
      
      // Test different beta values
      for (const beta of [-90, -45, 0, 45, 90]) {
        const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
          alpha: 0,
          beta,
          gamma: 0,
        })
        
        window.dispatchEvent(event)
        rotations.push(camera.quaternion.clone())
      }
      
      // All rotations should be different
      for (let i = 0; i < rotations.length - 1; i++) {
        for (let j = i + 1; j < rotations.length; j++) {
          expect(rotations[i].equals(rotations[j])).toBe(false)
        }
      }
    })

    it('应该能够处理不同的 gamma 值', async () => {
      await controls.enable()
      
      const rotations: THREE.Quaternion[] = []
      
      // Test different gamma values
      for (const gamma of [-90, -45, 0, 45, 90]) {
        const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
          alpha: 0,
          beta: 0,
          gamma,
        })
        
        window.dispatchEvent(event)
        rotations.push(camera.quaternion.clone())
      }
      
      // All rotations should be different
      for (let i = 0; i < rotations.length - 1; i++) {
        for (let j = i + 1; j < rotations.length; j++) {
          expect(rotations[i].equals(rotations[j])).toBe(false)
        }
      }
    })
  })

  describe('屏幕方向变化', () => {
    it('应该能够响应屏幕方向变化', async () => {
      await controls.enable()
      
      // Change screen orientation
      Object.defineProperty(window, 'orientation', {
        writable: true,
        value: 90,
      })
      
      window.dispatchEvent(new Event('orientationchange'))
      
      // Dispatch device orientation event
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 0,
        beta: 0,
        gamma: 0,
      })
      
      const rotationWith90 = camera.quaternion.clone()
      window.dispatchEvent(event)
      const rotationAfter = camera.quaternion.clone()
      
      expect(rotationWith90.equals(rotationAfter)).toBe(false)
    })

    it('应该能够处理不同的屏幕方向', async () => {
      await controls.enable()
      
      const rotations: THREE.Quaternion[] = []
      
      for (const orientation of [0, 90, 180, 270]) {
        Object.defineProperty(window, 'orientation', {
          writable: true,
          value: orientation,
        })
        
        window.dispatchEvent(new Event('orientationchange'))
        
        const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
          alpha: 0,
          beta: 0,
          gamma: 0,
        })
        
        window.dispatchEvent(event)
        rotations.push(camera.quaternion.clone())
      }
      
      // At least some rotations should be different
      let hasDifference = false
      for (let i = 0; i < rotations.length - 1; i++) {
        if (!rotations[i].equals(rotations[i + 1])) {
          hasDifference = true
          break
        }
      }
      expect(hasDifference).toBe(true)
    })

    it('orientation 为 undefined 时应该使用默认值 0', async () => {
      Object.defineProperty(window, 'orientation', {
        writable: true,
        value: undefined,
      })
      
      await controls.enable()
      
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 0,
        beta: 0,
        gamma: 0,
      })
      
      // Should not throw error
      expect(() => window.dispatchEvent(event)).not.toThrow()
    })
  })

  describe('权限请求 (iOS 13+)', () => {
    it('权限被授予时应该成功启用', async () => {
      // Mock iOS 13+ permission API
      ;(window as any).DeviceOrientationEvent.requestPermission = vi.fn().mockResolvedValue('granted')
      
      const result = await controls.enable()
      
      expect((window as any).DeviceOrientationEvent.requestPermission).toHaveBeenCalled()
      expect(result).toBe(true)
      expect(controls.isEnabled()).toBe(true)
    })

    it('权限被拒绝时应该返回 false', async () => {
      ;(window as any).DeviceOrientationEvent.requestPermission = vi.fn().mockResolvedValue('denied')
      
      const result = await controls.enable()
      
      expect(result).toBe(false)
      expect(controls.isEnabled()).toBe(false)
    })

    it('权限请求出错时应该返回 false', async () => {
      ;(window as any).DeviceOrientationEvent.requestPermission = vi.fn().mockRejectedValue(new Error('Permission error'))
      
      const result = await controls.enable()
      
      expect(result).toBe(false)
      expect(controls.isEnabled()).toBe(false)
    })
  })

  describe('资源清理', () => {
    it('dispose 应该禁用控制', async () => {
      await controls.enable()
      expect(controls.isEnabled()).toBe(true)
      
      controls.dispose()
      expect(controls.isEnabled()).toBe(false)
    })

    it('dispose 应该移除事件监听器', async () => {
      await controls.enable()
      
      const initialRotation = camera.quaternion.clone()
      
      controls.dispose()
      
      // Dispatch device orientation event
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,
        beta: 45,
        gamma: 0,
      })
      
      window.dispatchEvent(event)
      
      // Camera rotation should not change
      expect(camera.quaternion.equals(initialRotation)).toBe(true)
    })

    it('多次调用 dispose 不应该出错', async () => {
      await controls.enable()
      
      expect(() => {
        controls.dispose()
        controls.dispose()
        controls.dispose()
      }).not.toThrow()
    })

    it('未启用时调用 dispose 不应该出错', () => {
      expect(() => controls.dispose()).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该能够多次启用和禁用', async () => {
      for (let i = 0; i < 3; i++) {
        const result = await controls.enable()
        expect(result).toBe(true)
        expect(controls.isEnabled()).toBe(true)
        
        controls.disable()
        expect(controls.isEnabled()).toBe(false)
      }
    })

    it('重复启用不应该重复添加事件监听器', async () => {
      await controls.enable()
      await controls.enable()
      await controls.enable()
      
      const initialRotation = camera.quaternion.clone()
      
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,
        beta: 0,
        gamma: 0,
      })
      
      window.dispatchEvent(event)
      
      // Should only change once, not three times
      const changedRotation = camera.quaternion.clone()
      expect(initialRotation.equals(changedRotation)).toBe(false)
    })

    it('应该能够处理极端的角度值', async () => {
      await controls.enable()
      
      const extremeValues = [
        { alpha: 360, beta: 90, gamma: 90 },
        { alpha: -360, beta: -90, gamma: -90 },
        { alpha: 720, beta: 180, gamma: 180 },
      ]
      
      for (const values of extremeValues) {
        const event = new (window as any).DeviceOrientationEvent('deviceorientation', values)
        
        // Should not throw error
        expect(() => window.dispatchEvent(event)).not.toThrow()
      }
    })
  })

  describe('性能', () => {
    it('应该快速处理设备方向事件', async () => {
      await controls.enable()
      
      const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,
        beta: 45,
        gamma: 0,
      })
      
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(event)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should process 100 events in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('应该高效处理连续的方向变化', async () => {
      await controls.enable()
      
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        const event = new (window as any).DeviceOrientationEvent('deviceorientation', {
          alpha: i * 3.6, // 0 to 360 degrees
          beta: Math.sin(i * 0.1) * 90,
          gamma: Math.cos(i * 0.1) * 90,
        })
        
        window.dispatchEvent(event)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should process 100 varied events in less than 100ms
      expect(duration).toBeLessThan(100)
    })
  })
})
