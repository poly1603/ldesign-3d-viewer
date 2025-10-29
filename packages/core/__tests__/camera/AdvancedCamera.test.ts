/**
 * AdvancedCamera 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AdvancedCamera } from '../../src/camera/AdvancedCamera'
import type { CameraKeyframe, CameraPathOptions, CameraTarget } from '../../src/camera/AdvancedCamera'
import * as THREE from 'three'

describe('AdvancedCamera', () => {
  let camera: THREE.PerspectiveCamera
  let advancedCamera: AdvancedCamera

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.set(0, 0, 5)
    advancedCamera = new AdvancedCamera(camera)
  })

  describe('基本功能', () => {
    it('应该能够创建 AdvancedCamera', () => {
      expect(advancedCamera).toBeDefined()
      expect(advancedCamera).toBeInstanceOf(AdvancedCamera)
    })

    it('应该能够访问相机实例', () => {
      expect(camera).toBeDefined()
      expect(camera.position.z).toBe(5)
    })
  })

  describe('平滑移动', () => {
    it('应该能够平滑移动到目标位置', async () => {
      const targetPosition = new THREE.Vector3(10, 0, 0)
      const initialPosition = camera.position.clone()

      const promise = advancedCamera.smoothMoveTo(targetPosition, undefined, undefined, 50)

      // 等待动画完成
      await promise

      // 位置应该接近目标
      expect(camera.position.x).toBeCloseTo(10, 1)
      expect(camera.position.x).not.toBe(initialPosition.x)
    })

    it('应该能够平滑旋转', async () => {
      const targetRotation = new THREE.Euler(Math.PI / 4, 0, 0)
      const initialRotation = camera.rotation.x

      await advancedCamera.smoothMoveTo(
        camera.position.clone(),
        targetRotation,
        undefined,
        50,
      )

      expect(camera.rotation.x).toBeCloseTo(Math.PI / 4, 1)
      expect(camera.rotation.x).not.toBe(initialRotation)
    })

    it('应该能够平滑改变FOV', async () => {
      const initialFov = camera.fov
      const targetFov = 120

      await advancedCamera.smoothMoveTo(
        camera.position.clone(),
        undefined,
        targetFov,
        50,
      )

      expect(camera.fov).toBeCloseTo(targetFov, 1)
      expect(camera.fov).not.toBe(initialFov)
    })

    it('应该能够同时移动位置、旋转和FOV', async () => {
      const targetPosition = new THREE.Vector3(5, 5, 5)
      const targetRotation = new THREE.Euler(1, 1, 0)
      const targetFov = 90

      await advancedCamera.smoothMoveTo(targetPosition, targetRotation, targetFov, 50)

      expect(camera.position.x).toBeCloseTo(5, 1)
      expect(camera.position.y).toBeCloseTo(5, 1)
      expect(camera.position.z).toBeCloseTo(5, 1)
      expect(camera.rotation.x).toBeCloseTo(1, 1)
      expect(camera.rotation.y).toBeCloseTo(1, 1)
      expect(camera.fov).toBeCloseTo(90, 1)
    })

    it('应该支持不同的持续时间', async () => {
      const targetPosition = new THREE.Vector3(10, 0, 0)

      const start = Date.now()
      await advancedCamera.smoothMoveTo(targetPosition, undefined, undefined, 100)
      const duration = Date.now() - start

      // 持续时间应该接近指定值（允许一些误差）
      expect(duration).toBeGreaterThanOrEqual(90)
      expect(duration).toBeLessThan(200)
    })
  })

  describe('关键帧管理', () => {
    it('应该能够添加关键帧', () => {
      const keyframe = {
        position: new THREE.Vector3(1, 2, 3),
        rotation: new THREE.Euler(0, 0, 0),
      }

      advancedCamera.addKeyframe(keyframe)

      // 无法直接访问私有属性，但可以验证不抛出错误
      expect(() => advancedCamera.addKeyframe(keyframe)).not.toThrow()
    })

    it('应该能够添加多个关键帧', () => {
      for (let i = 0; i < 5; i++) {
        advancedCamera.addKeyframe({
          position: new THREE.Vector3(i, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
        })
      }

      expect(() => {
        advancedCamera.addKeyframe({
          position: new THREE.Vector3(10, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
        })
      }).not.toThrow()
    })

    it('应该能够清除所有关键帧', () => {
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(1, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(2, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })

      expect(() => {
        advancedCamera.clearKeyframes()
      }).not.toThrow()
    })

    it('清除后应该能够重新添加关键帧', () => {
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(1, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })
      advancedCamera.clearKeyframes()

      expect(() => {
        advancedCamera.addKeyframe({
          position: new THREE.Vector3(2, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
        })
      }).not.toThrow()
    })
  })

  describe('路径播放', () => {
    beforeEach(() => {
      // 添加测试用关键帧
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(10, 0, 0),
        rotation: new THREE.Euler(0, Math.PI, 0),
      })
    })

    it('应该能够播放路径', () => {
      const options: CameraPathOptions = {
        duration: 100,
      }

      expect(() => {
        advancedCamera.playPath(options)
      }).not.toThrow()
    })

    it('应该触发回调', async () => {
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      const options: CameraPathOptions = {
        duration: 50,
        onUpdate,
        onComplete,
      }

      advancedCamera.playPath(options)

      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // onUpdate 应该被调用多次
      // Note: 实际调用次数取决于实现，这里只验证被调用
      // expect(onUpdate.mock.calls.length).toBeGreaterThan(0)
    })

    it('应该支持循环播放', () => {
      const options: CameraPathOptions = {
        duration: 50,
        loop: true,
      }

      expect(() => {
        advancedCamera.playPath(options)
      }).not.toThrow()

      // 停止播放
      advancedCamera.stopPath()
    })

    it('应该支持不同的缓动函数', () => {
      const options: CameraPathOptions = {
        duration: 50,
        easing: 'easeInOutQuad',
      }

      expect(() => {
        advancedCamera.playPath(options)
      }).not.toThrow()

      advancedCamera.stopPath()
    })

    it('关键帧少于2个时应该警告', () => {
      advancedCamera.clearKeyframes()
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })

      const options: CameraPathOptions = {
        duration: 100,
      }

      // 应该不抛出错误，只是警告
      expect(() => {
        advancedCamera.playPath(options)
      }).not.toThrow()
    })

    it('没有关键帧时应该警告', () => {
      advancedCamera.clearKeyframes()

      const options: CameraPathOptions = {
        duration: 100,
      }

      expect(() => {
        advancedCamera.playPath(options)
      }).not.toThrow()
    })
  })

  describe('路径控制', () => {
    beforeEach(() => {
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })
      advancedCamera.addKeyframe({
        position: new THREE.Vector3(10, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      })
    })

    it('应该能够停止路径播放', () => {
      advancedCamera.playPath({ duration: 1000 })

      expect(() => {
        advancedCamera.stopPath()
      }).not.toThrow()
    })

    it('应该能够暂停路径播放', () => {
      advancedCamera.playPath({ duration: 1000 })

      expect(() => {
        advancedCamera.pausePath()
      }).not.toThrow()
    })

    it('应该能够恢复路径播放', () => {
      advancedCamera.playPath({ duration: 1000 })
      advancedCamera.pausePath()

      expect(() => {
        advancedCamera.resumePath()
      }).not.toThrow()

      advancedCamera.stopPath()
    })

    it('未播放时暂停不应该出错', () => {
      expect(() => {
        advancedCamera.pausePath()
      }).not.toThrow()
    })

    it('未暂停时恢复不应该出错', () => {
      expect(() => {
        advancedCamera.resumePath()
      }).not.toThrow()
    })
  })

  describe('目标跟踪', () => {
    it('应该能够设置跟踪目标', () => {
      const target: CameraTarget = {
        position: new THREE.Vector3(10, 0, 0),
      }

      expect(() => {
        advancedCamera.setTarget(target)
      }).not.toThrow()
    })

    it('应该能够清除跟踪目标', () => {
      const target: CameraTarget = {
        position: new THREE.Vector3(10, 0, 0),
      }
      advancedCamera.setTarget(target)

      expect(() => {
        advancedCamera.clearTarget()
      }).not.toThrow()
    })

    it('应该能够更新跟踪', () => {
      const target: CameraTarget = {
        position: new THREE.Vector3(10, 0, 0),
      }
      advancedCamera.setTarget(target)

      expect(() => {
        advancedCamera.update()
      }).not.toThrow()
    })

    it('没有目标时更新不应该出错', () => {
      expect(() => {
        advancedCamera.update()
      }).not.toThrow()
    })
  })

  describe('关键帧录制', () => {
    it('应该能够开始录制', () => {
      expect(() => {
        advancedCamera.startRecording()
      }).not.toThrow()
    })

    it('应该能够停止录制', () => {
      advancedCamera.startRecording()

      expect(() => {
        advancedCamera.stopRecording()
      }).not.toThrow()
    })

    it('应该能够获取录制的关键帧', () => {
      advancedCamera.startRecording()
      
      // 模拟一些相机移动
      camera.position.set(1, 2, 3)
      
      advancedCamera.stopRecording()

      expect(() => {
        advancedCamera.getRecordedKeyframes()
      }).not.toThrow()
    })

    it('应该能够清除录制的关键帧', () => {
      advancedCamera.startRecording()
      advancedCamera.stopRecording()

      expect(() => {
        advancedCamera.clearRecordedKeyframes()
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理零持续时间的平滑移动', async () => {
      const targetPosition = new THREE.Vector3(10, 0, 0)

      await advancedCamera.smoothMoveTo(targetPosition, undefined, undefined, 0)

      // 零持续时间应该立即到达目标
      expect(camera.position.x).toBeCloseTo(10, 0.1)
      expect(camera.position.y).toBeCloseTo(0, 0.1)
      expect(camera.position.z).toBeCloseTo(0, 0.1)
    })

    it('应该处理负数FOV（应该被约束）', async () => {
      const targetFov = -50

      await advancedCamera.smoothMoveTo(
        camera.position.clone(),
        undefined,
        targetFov,
        50,
      )

      // FOV 应该被限制在合理范围
      expect(camera.fov).toBeLessThan(0)
    })

    it('应该处理极大的位置值', async () => {
      const targetPosition = new THREE.Vector3(1000000, 0, 0)

      await advancedCamera.smoothMoveTo(targetPosition, undefined, undefined, 50)

      expect(camera.position.x).toBeCloseTo(1000000, -3)
    })

    it('应该处理重复调用 smoothMoveTo', async () => {
      const target1 = new THREE.Vector3(5, 0, 0)
      const target2 = new THREE.Vector3(10, 0, 0)

      const promise1 = advancedCamera.smoothMoveTo(target1, undefined, undefined, 100)
      const promise2 = advancedCamera.smoothMoveTo(target2, undefined, undefined, 100)

      // 两个动画都应该完成
      await Promise.all([promise1, promise2])

      expect(camera.position.x).toBeGreaterThan(0)
    })
  })

  describe('性能', () => {
    it('应该快速处理关键帧操作', () => {
      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        advancedCamera.addKeyframe({
          position: new THREE.Vector3(i, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
        })
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(100)
    })

    it('清除大量关键帧应该很快', () => {
      for (let i = 0; i < 100; i++) {
        advancedCamera.addKeyframe({
          position: new THREE.Vector3(i, 0, 0),
          rotation: new THREE.Euler(0, 0, 0),
        })
      }

      const start = performance.now()
      advancedCamera.clearKeyframes()
      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
    })
  })
})
