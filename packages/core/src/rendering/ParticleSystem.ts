/**
 * 粒子系统
 * 实现雨、雪、烟雾等粒子效果
 */

import * as THREE from 'three'

export type ParticleEffect = 'rain' | 'snow' | 'fog' | 'dust' | 'sparkles'

export interface ParticleConfig {
  count: number
  size: number
  color: THREE.Color | string
  opacity: number
  velocity: THREE.Vector3
  spread: number
  lifetime: number // 秒
  gravity: number
}

export class ParticleSystem {
  private scene: THREE.Scene
  private particleSystem: THREE.Points | null = null
  private geometry: THREE.BufferGeometry | null = null
  private material: THREE.PointsMaterial | null = null
  private config: Required<ParticleConfig>

  // 粒子状态
  private velocities: Float32Array | null = null
  private lifetimes: Float32Array | null = null
  private ages: Float32Array | null = null

  private defaultConfig: ParticleConfig = {
    count: 1000,
    size: 0.1,
    color: new THREE.Color(0xFFFFFF),
    opacity: 0.8,
    velocity: new THREE.Vector3(0, -1, 0),
    spread: 10,
    lifetime: 5,
    gravity: -9.8,
  }

  constructor(scene: THREE.Scene, config?: Partial<ParticleConfig>) {
    this.scene = scene
    this.config = { ...this.defaultConfig, ...config }
  }

  /**
   * 初始化粒子系统
   */
  public initialize(): void {
    const count = this.config.count

    // 创建几何体
    this.geometry = new THREE.BufferGeometry()

    // 位置
    const positions = new Float32Array(count * 3)
    // 速度
    this.velocities = new Float32Array(count * 3)
    // 生命周期
    this.lifetimes = new Float32Array(count)
    this.ages = new Float32Array(count)

    // 初始化粒子
    for (let i = 0; i < count; i++) {
      this.resetParticle(i)
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // 创建材质
    const color = typeof this.config.color === 'string'
      ? new THREE.Color(this.config.color)
      : this.config.color

    this.material = new THREE.PointsMaterial({
      size: this.config.size,
      color,
      transparent: true,
      opacity: this.config.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    // 创建粒子系统
    this.particleSystem = new THREE.Points(this.geometry, this.material)
    this.scene.add(this.particleSystem)
  }

  /**
   * 重置单个粒子
   */
  private resetParticle(index: number): void {
    if (!this.geometry || !this.velocities || !this.lifetimes || !this.ages)
      return

    const positions = this.geometry.attributes.position.array as Float32Array
    const spread = this.config.spread

    // 随机位置
    positions[index * 3] = (Math.random() - 0.5) * spread
    positions[index * 3 + 1] = Math.random() * spread
    positions[index * 3 + 2] = (Math.random() - 0.5) * spread

    // 随机速度
    this.velocities[index * 3] = this.config.velocity.x + (Math.random() - 0.5) * 0.5
    this.velocities[index * 3 + 1] = this.config.velocity.y + (Math.random() - 0.5) * 0.5
    this.velocities[index * 3 + 2] = this.config.velocity.z + (Math.random() - 0.5) * 0.5

    // 随机生命周期
    this.lifetimes[index] = this.config.lifetime * (0.5 + Math.random() * 0.5)
    this.ages[index] = 0
  }

  /**
   * 更新粒子
   */
  public update(deltaTime: number): void {
    if (!this.geometry || !this.velocities || !this.lifetimes || !this.ages)
      return

    const positions = this.geometry.attributes.position.array as Float32Array
    const count = this.config.count
    const dt = deltaTime / 1000 // 转换为秒

    for (let i = 0; i < count; i++) {
      // 更新年龄
      this.ages[i] += dt

      // 如果超过生命周期，重置
      if (this.ages[i] >= this.lifetimes[i]) {
        this.resetParticle(i)
        continue
      }

      // 应用速度
      positions[i * 3] += this.velocities[i * 3] * dt
      positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt
      positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt

      // 应用重力
      this.velocities[i * 3 + 1] += this.config.gravity * dt

      // 边界检查
      if (Math.abs(positions[i * 3]) > this.config.spread
        || Math.abs(positions[i * 3 + 2]) > this.config.spread
        || positions[i * 3 + 1] < -this.config.spread) {
        this.resetParticle(i)
      }
    }

    this.geometry.attributes.position.needsUpdate = true
  }

  /**
   * 应用预设效果
   */
  public applyEffect(effect: ParticleEffect): void {
    switch (effect) {
      case 'rain':
        this.applyRainEffect()
        break
      case 'snow':
        this.applySnowEffect()
        break
      case 'fog':
        this.applyFogEffect()
        break
      case 'dust':
        this.applyDustEffect()
        break
      case 'sparkles':
        this.applySparklesEffect()
        break
    }
  }

  /**
   * 雨效果
   */
  private applyRainEffect(): void {
    this.config.count = 2000
    this.config.size = 0.05
    this.config.color = new THREE.Color(0xAAAAFF)
    this.config.velocity = new THREE.Vector3(0, -15, 0)
    this.config.gravity = -20
    this.config.spread = 15
    this.config.lifetime = 2
    this.initialize()
  }

  /**
   * 雪效果
   */
  private applySnowEffect(): void {
    this.config.count = 1500
    this.config.size = 0.15
    this.config.color = new THREE.Color(0xFFFFFF)
    this.config.velocity = new THREE.Vector3(0, -2, 0)
    this.config.gravity = -0.5
    this.config.spread = 20
    this.config.lifetime = 8
    this.initialize()
  }

  /**
   * 雾效果
   */
  private applyFogEffect(): void {
    this.config.count = 500
    this.config.size = 2.0
    this.config.color = new THREE.Color(0xCCCCCC)
    this.config.velocity = new THREE.Vector3(0.1, 0, 0)
    this.config.gravity = 0
    this.config.spread = 30
    this.config.lifetime = 20
    this.config.opacity = 0.3
    this.initialize()
  }

  /**
   * 灰尘效果
   */
  private applyDustEffect(): void {
    this.config.count = 800
    this.config.size = 0.08
    this.config.color = new THREE.Color(0xCCAA88)
    this.config.velocity = new THREE.Vector3(0, 0.5, 0)
    this.config.gravity = 0.1
    this.config.spread = 15
    this.config.lifetime = 10
    this.config.opacity = 0.5
    this.initialize()
  }

  /**
   * 闪光效果
   */
  private applySparklesEffect(): void {
    this.config.count = 1000
    this.config.size = 0.2
    this.config.color = new THREE.Color(0xFFFF00)
    this.config.velocity = new THREE.Vector3(0, 0, 0)
    this.config.gravity = 0
    this.config.spread = 10
    this.config.lifetime = 3
    this.config.opacity = 0.9
    this.initialize()
  }

  /**
   * 设置粒子数量
   */
  public setCount(count: number): void {
    this.config.count = count
    this.initialize()
  }

  /**
   * 设置粒子大小
   */
  public setSize(size: number): void {
    this.config.size = size
    if (this.material) {
      this.material.size = size
    }
  }

  /**
   * 设置颜色
   */
  public setColor(color: THREE.Color | string): void {
    this.config.color = typeof color === 'string' ? new THREE.Color(color) : color
    if (this.material) {
      this.material.color = this.config.color instanceof THREE.Color
        ? this.config.color
        : new THREE.Color(this.config.color)
    }
  }

  /**
   * 设置透明度
   */
  public setOpacity(opacity: number): void {
    this.config.opacity = THREE.MathUtils.clamp(opacity, 0, 1)
    if (this.material) {
      this.material.opacity = this.config.opacity
    }
  }

  /**
   * 启用/禁用
   */
  public setVisible(visible: boolean): void {
    if (this.particleSystem) {
      this.particleSystem.visible = visible
    }
  }

  /**
   * 获取统计
   */
  public getStats(): {
    particleCount: number
    activeParticles: number
    averageAge: number
  } {
    if (!this.ages || !this.lifetimes) {
      return {
        particleCount: 0,
        activeParticles: 0,
        averageAge: 0,
      }
    }

    let activeCount = 0
    let totalAge = 0

    for (let i = 0; i < this.config.count; i++) {
      if (this.ages[i] < this.lifetimes[i]) {
        activeCount++
        totalAge += this.ages[i]
      }
    }

    return {
      particleCount: this.config.count,
      activeParticles: activeCount,
      averageAge: activeCount > 0 ? totalAge / activeCount : 0,
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem)
    }

    if (this.geometry) {
      this.geometry.dispose()
    }

    if (this.material) {
      this.material.dispose()
    }

    // @ts-expect-error - 可选属性，可能不存在
    this.cubeRenderTarget?.dispose()
    // @ts-expect-error - 可选属性，可能不存在
    this.reflectionObjects?.clear()
  }
}
