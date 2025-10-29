/**
 * 环境映射系统
 * 实现实时环境映射和反射效果
 */

import * as THREE from 'three'

export interface EnvironmentMappingOptions {
  resolution: number
  refreshRate: number // Hz
  intensity: number // 0-1
  roughness: number // 0-1
  metalness: number // 0-1
}

export class EnvironmentMapping {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private cubeRenderTarget: THREE.WebGLCubeRenderTarget
  private cubeCamera: THREE.CubeCamera
  private envMap: THREE.Texture | null = null
  private options: Required<EnvironmentMappingOptions>
  private reflectionObjects: Set<THREE.Mesh> = new Set()

  private lastUpdate = 0
  private updateInterval = 0

  private defaultOptions: EnvironmentMappingOptions = {
    resolution: 256,
    refreshRate: 30,
    intensity: 1.0,
    roughness: 0.1,
    metalness: 1.0,
  }

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    options?: Partial<EnvironmentMappingOptions>,
  ) {
    this.scene = scene
    this.renderer = renderer
    this.options = { ...this.defaultOptions, ...options }
    this.updateInterval = 1000 / this.options.refreshRate

    // 创建立方体渲染目标
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(this.options.resolution, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    })

    // 创建立方体相机
    this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget)
  }

  /**
   * 初始化环境贴图
   */
  public initialize(): void {
    this.envMap = this.cubeRenderTarget.texture
  }

  /**
   * 添加反射物体
   */
  public addReflectionObject(mesh: THREE.Mesh): void {
    this.reflectionObjects.add(mesh)

    // 配置材质
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.envMap = this.envMap
      mesh.material.envMapIntensity = this.options.intensity
      mesh.material.roughness = this.options.roughness
      mesh.material.metalness = this.options.metalness
      mesh.material.needsUpdate = true
    }
  }

  /**
   * 移除反射物体
   */
  public removeReflectionObject(mesh: THREE.Mesh): void {
    this.reflectionObjects.delete(mesh)

    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      mesh.material.envMap = null
      mesh.material.needsUpdate = true
    }
  }

  /**
   * 更新环境贴图
   */
  public update(deltaTime: number): void {
    this.lastUpdate += deltaTime

    if (this.lastUpdate < this.updateInterval)
      return

    this.lastUpdate = 0

    // 隐藏反射物体（避免自反射）
    this.reflectionObjects.forEach((obj) => {
      obj.visible = false
    })

    // 更新立方体相机
    this.cubeCamera.update(this.renderer, this.scene)

    // 恢复反射物体
    this.reflectionObjects.forEach((obj) => {
      obj.visible = true
    })
  }

  /**
   * 设置强度
   */
  public setIntensity(intensity: number): void {
    this.options.intensity = THREE.MathUtils.clamp(intensity, 0, 1)

    this.reflectionObjects.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.envMapIntensity = this.options.intensity
        mesh.material.needsUpdate = true
      }
    })
  }

  /**
   * 设置粗糙度
   */
  public setRoughness(roughness: number): void {
    this.options.roughness = THREE.MathUtils.clamp(roughness, 0, 1)

    this.reflectionObjects.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.roughness = this.options.roughness
        mesh.material.needsUpdate = true
      }
    })
  }

  /**
   * 设置金属度
   */
  public setMetalness(metalness: number): void {
    this.options.metalness = THREE.MathUtils.clamp(metalness, 0, 1)

    this.reflectionObjects.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.metalness = this.options.metalness
        mesh.material.needsUpdate = true
      }
    })
  }

  /**
   * 从全景纹理创建环境贴图
   */
  public setEnvironmentFromPanorama(texture: THREE.Texture): void {
    // 使用PMREMGenerator生成预滤波环境贴图
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    pmremGenerator.compileEquirectangularShader()

    const envMap = pmremGenerator.fromEquirectangular(texture).texture
    this.envMap = envMap

    // 更新所有反射物体
    this.reflectionObjects.forEach((mesh) => {
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.envMap = envMap
        mesh.material.needsUpdate = true
      }
    })

    pmremGenerator.dispose()
  }

  /**
   * 获取环境贴图
   */
  public getEnvironmentMap(): THREE.Texture | null {
    return this.envMap
  }

  /**
   * 获取反射物体数量
   */
  public getReflectionObjectCount(): number {
    return this.reflectionObjects.size
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.cubeRenderTarget.dispose()
    this.reflectionObjects.clear()

    if (this.envMap) {
      this.envMap.dispose()
    }
  }
}
