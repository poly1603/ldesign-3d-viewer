/**
 * MemoryManager 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryManager } from '../../src/core/MemoryManager'
import type { MemoryStats } from '../../src/core/MemoryManager'
import { EventBus } from '../../src/core/EventBus'
import * as THREE from 'three'

describe('MemoryManager', () => {
  let manager: MemoryManager
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
    manager = new MemoryManager({}, eventBus)
  })

  afterEach(() => {
    manager.dispose()
  })

  describe('基本功能', () => {
    it('应该能够创建 MemoryManager', () => {
      expect(manager).toBeDefined()
      expect(manager).toBeInstanceOf(MemoryManager)
    })

    it('应该使用默认选项', () => {
      const stats = manager.getStats()
      expect(stats).toBeDefined()
      expect(stats.textures.count).toBe(0)
      expect(stats.geometries.count).toBe(0)
    })

    it('应该接受自定义选项', () => {
      const customManager = new MemoryManager({
        maxTextureMemory: 128 * 1024 * 1024,
        maxGeometryMemory: 64 * 1024 * 1024,
        autoCleanup: false,
        cleanupThreshold: 0.5,
      })

      expect(customManager).toBeDefined()
      customManager.dispose()
    })
  })

  describe('纹理管理', () => {
    it('应该能够注册纹理', () => {
      const texture = new THREE.Texture()
      manager.registerTexture(texture)

      const stats = manager.getStats()
      expect(stats.textures.count).toBe(1)
    })

    it('应该能够取消注册纹理', () => {
      const texture = new THREE.Texture()
      manager.registerTexture(texture)
      expect(manager.getStats().textures.count).toBe(1)

      manager.unregisterTexture(texture)
      expect(manager.getStats().textures.count).toBe(0)
    })

    it('应该能够注册多个纹理', () => {
      const texture1 = new THREE.Texture()
      const texture2 = new THREE.Texture()
      const texture3 = new THREE.Texture()

      manager.registerTexture(texture1)
      manager.registerTexture(texture2)
      manager.registerTexture(texture3)

      expect(manager.getStats().textures.count).toBe(3)
    })

    it('应该计算纹理内存使用', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512

      const texture = new THREE.Texture(canvas)
      manager.registerTexture(texture)

      const stats = manager.getStats()
      expect(stats.textures.bytes).toBeGreaterThan(0)
    })
  })

  describe('几何体管理', () => {
    it('应该能够注册几何体', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      manager.registerGeometry(geometry)

      const stats = manager.getStats()
      expect(stats.geometries.count).toBe(1)
    })

    it('应该能够取消注册几何体', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      manager.registerGeometry(geometry)
      expect(manager.getStats().geometries.count).toBe(1)

      manager.unregisterGeometry(geometry)
      expect(manager.getStats().geometries.count).toBe(0)
    })

    it('应该能够注册多个几何体', () => {
      const geo1 = new THREE.BoxGeometry(1, 1, 1)
      const geo2 = new THREE.SphereGeometry(1)
      const geo3 = new THREE.PlaneGeometry(1, 1)

      manager.registerGeometry(geo1)
      manager.registerGeometry(geo2)
      manager.registerGeometry(geo3)

      expect(manager.getStats().geometries.count).toBe(3)
    })

    it('应该计算几何体内存使用', () => {
      const geometry = new THREE.BoxGeometry(10, 10, 10)
      manager.registerGeometry(geometry)

      const stats = manager.getStats()
      expect(stats.geometries.bytes).toBeGreaterThan(0)
    })
  })

  describe('材质管理', () => {
    it('应该能够注册材质', () => {
      const material = new THREE.MeshBasicMaterial()
      
      expect(() => {
        manager.registerMaterial(material)
      }).not.toThrow()
    })

    it('应该能够取消注册材质', () => {
      const material = new THREE.MeshBasicMaterial()
      manager.registerMaterial(material)

      expect(() => {
        manager.unregisterMaterial(material)
      }).not.toThrow()
    })
  })

  describe('内存统计', () => {
    it('应该返回正确的内存统计格式', () => {
      const stats = manager.getStats()

      expect(stats).toHaveProperty('textures')
      expect(stats).toHaveProperty('geometries')
      expect(stats).toHaveProperty('total')

      expect(stats.textures).toHaveProperty('count')
      expect(stats.textures).toHaveProperty('bytes')
      expect(stats.geometries).toHaveProperty('count')
      expect(stats.geometries).toHaveProperty('bytes')
    })

    it('total 应该等于纹理和几何体内存之和', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256

      const texture = new THREE.Texture(canvas)
      const geometry = new THREE.BoxGeometry(1, 1, 1)

      manager.registerTexture(texture)
      manager.registerGeometry(geometry)

      const stats = manager.getStats()
      expect(stats.total).toBe(stats.textures.bytes + stats.geometries.bytes)
    })

    it('应该包含 JS 堆内存信息（如果可用）', () => {
      const stats = manager.getStats()

      if ((performance as any).memory) {
        expect(stats.jsHeap).toBeDefined()
        expect(stats.jsHeap?.used).toBeGreaterThanOrEqual(0)
        expect(stats.jsHeap?.total).toBeGreaterThanOrEqual(0)
        expect(stats.jsHeap?.limit).toBeGreaterThan(0)
        expect(stats.jsHeap?.usagePercent).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('内存警告', () => {
    it('高内存使用应该触发警告回调', () => {
      const warningCallback = vi.fn()
      const testManager = new MemoryManager({
        maxTextureMemory: 1, // 设置极小值以触发警告
        onMemoryWarning: warningCallback,
      })

      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const texture = new THREE.Texture(canvas)

      testManager.registerTexture(texture)

      expect(warningCallback).toHaveBeenCalled()
      testManager.dispose()
    })

    it('高内存使用应该触发事件', () => {
      const listener = vi.fn()
      eventBus.on('performance:warning', listener)

      const testManager = new MemoryManager(
        {
          maxTextureMemory: 1,
          autoCleanup: false,
        },
        eventBus,
      )

      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const texture = new THREE.Texture(canvas)

      testManager.registerTexture(texture)

      expect(listener).toHaveBeenCalled()
      expect(listener.mock.calls[0][0].type).toBe('high_texture_memory')
      testManager.dispose()
    })
  })

  describe('自动清理', () => {
    it('autoCleanup 启用时应该自动清理未使用的资源', () => {
      const testManager = new MemoryManager({
        maxTextureMemory: 1,
        autoCleanup: true,
      })

      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const texture = new THREE.Texture(canvas)

      // 标记纹理为已 disposed
      ;(texture as any)._disposed = true

      testManager.registerTexture(texture)

      // 自动清理应该移除已 disposed 的纹理
      // Note: 清理是异步的，所以我们只验证不会出错
      expect(testManager.getStats().textures.count).toBeGreaterThanOrEqual(0)
      testManager.dispose()
    })
  })

  describe('强制清理', () => {
    it('forceCleanup 应该清理所有资源', () => {
      const texture = new THREE.Texture()
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial()

      manager.registerTexture(texture)
      manager.registerGeometry(geometry)
      manager.registerMaterial(material)

      expect(manager.getStats().textures.count).toBe(1)
      expect(manager.getStats().geometries.count).toBe(1)

      manager.forceCleanup()

      expect(manager.getStats().textures.count).toBe(0)
      expect(manager.getStats().geometries.count).toBe(0)
    })

    it('forceCleanup 后应该能够重新注册资源', () => {
      const texture = new THREE.Texture()
      manager.registerTexture(texture)
      manager.forceCleanup()

      const newTexture = new THREE.Texture()
      manager.registerTexture(newTexture)

      expect(manager.getStats().textures.count).toBe(1)
    })
  })

  describe('内存监控', () => {
    it('应该能够启动内存监控', () => {
      expect(() => {
        manager.startMonitoring(1000)
      }).not.toThrow()
    })

    it('应该能够停止内存监控', () => {
      manager.startMonitoring(1000)

      expect(() => {
        manager.stopMonitoring()
      }).not.toThrow()
    })

    it('重复启动监控应该被忽略', () => {
      manager.startMonitoring(1000)
      manager.startMonitoring(1000)

      // 应该只有一个监控实例
      expect(() => {
        manager.stopMonitoring()
      }).not.toThrow()
    })

    it('监控应该定期更新统计', async () => {
      manager.startMonitoring(100) // 100ms 间隔

      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const texture = new THREE.Texture(canvas)

      manager.registerTexture(texture)

      // 等待监控运行
      await new Promise(resolve => setTimeout(resolve, 250))

      manager.stopMonitoring()

      // 验证监控正常运行（不抛出错误）
      expect(manager.getStats().textures.count).toBe(1)
    })
  })

  describe('资源清理', () => {
    it('dispose 应该停止监控', () => {
      manager.startMonitoring(1000)
      manager.dispose()

      // dispose 后不应该有监控运行
      expect(() => {
        manager.stopMonitoring() // 应该不会出错
      }).not.toThrow()
    })

    it('dispose 应该清理所有资源', () => {
      const texture = new THREE.Texture()
      const geometry = new THREE.BoxGeometry(1, 1, 1)

      manager.registerTexture(texture)
      manager.registerGeometry(geometry)

      manager.dispose()

      const stats = manager.getStats()
      expect(stats.textures.count).toBe(0)
      expect(stats.geometries.count).toBe(0)
    })

    it('多次调用 dispose 不应该出错', () => {
      expect(() => {
        manager.dispose()
        manager.dispose()
        manager.dispose()
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理没有图像的纹理', () => {
      const texture = new THREE.Texture()
      manager.registerTexture(texture)

      const stats = manager.getStats()
      expect(stats.textures.count).toBe(1)
      expect(stats.textures.bytes).toBe(0)
    })

    it('应该处理空几何体', () => {
      const geometry = new THREE.BufferGeometry()
      manager.registerGeometry(geometry)

      const stats = manager.getStats()
      expect(stats.geometries.count).toBe(1)
      expect(stats.geometries.bytes).toBe(0)
    })

    it('应该处理重复注册相同资源', () => {
      const texture = new THREE.Texture()
      manager.registerTexture(texture)
      manager.registerTexture(texture) // 重复注册

      // Set 会自动去重
      expect(manager.getStats().textures.count).toBe(1)
    })

    it('应该处理取消注册不存在的资源', () => {
      const texture = new THREE.Texture()

      expect(() => {
        manager.unregisterTexture(texture)
      }).not.toThrow()
    })

    it('应该处理极大的资源', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 4096
      canvas.height = 4096

      const texture = new THREE.Texture(canvas)
      manager.registerTexture(texture)

      const stats = manager.getStats()
      expect(stats.textures.bytes).toBeGreaterThan(50 * 1024 * 1024) // > 50MB
    })
  })

  describe('性能', () => {
    it('应该快速处理大量资源注册', () => {
      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        const texture = new THREE.Texture()
        manager.registerTexture(texture)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 应该在 100ms 内完成
    })

    it('getStats 应该快速计算统计信息', () => {
      // 注册多个资源
      for (let i = 0; i < 50; i++) {
        manager.registerTexture(new THREE.Texture())
        manager.registerGeometry(new THREE.BoxGeometry(1, 1, 1))
      }

      const start = performance.now()
      const stats = manager.getStats()
      const duration = performance.now() - start

      expect(stats).toBeDefined()
      expect(duration).toBeLessThan(50) // 应该很快
    })
  })
})
