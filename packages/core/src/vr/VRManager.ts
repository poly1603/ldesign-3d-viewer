/**
 * VR 管理器
 * 使用 WebXR API 实现 VR 头显支持
 */

import * as THREE from 'three'
import { logger } from '../core/Logger'
import type { EventBus } from '../core/EventBus'

export interface VROptions {
  /** 参考空间类型 */
  referenceSpaceType?: XRReferenceSpaceType
  /** 启用地板级别追踪 */
  floorLevel?: boolean
  /** 启用控制器 */
  controllers?: boolean
  /** 传送控制 */
  teleport?: boolean
}

export class VRManager {
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private eventBus: EventBus | null
  private xrSession: XRSession | null = null
  private xrRefSpace: XRReferenceSpace | null = null
  private controllers: THREE.Group[] = []
  private isInVR: boolean = false
  private options: Required<VROptions>

  constructor(
    renderer: THREE.WebGLRenderer,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    options: VROptions = {},
    eventBus?: EventBus,
  ) {
    this.renderer = renderer
    this.camera = camera
    this.scene = scene
    this.eventBus = eventBus || null

    this.options = {
      referenceSpaceType: options.referenceSpaceType ?? 'local-floor',
      floorLevel: options.floorLevel ?? true,
      controllers: options.controllers ?? true,
      teleport: options.teleport ?? false,
    }
  }

  /**
   * 检查 VR 支持
   */
  public static async isVRSupported(): Promise<boolean> {
    if (!navigator.xr) {
      return false
    }

    try {
      return await navigator.xr.isSessionSupported('immersive-vr')
    }
    catch (error) {
      logger.error('Error checking VR support', error)
      return false
    }
  }

  /**
   * 初始化 VR
   */
  public async initialize(): Promise<void> {
    const supported = await VRManager.isVRSupported()

    if (!supported) {
      throw new Error('VR not supported on this device')
    }

    // 启用 WebXR
    this.renderer.xr.enabled = true

    logger.info('VR initialized')
  }

  /**
   * 进入 VR 模式
   */
  public async enterVR(): Promise<void> {
    if (!navigator.xr) {
      throw new Error('WebXR not available')
    }

    if (this.isInVR) {
      logger.warn('Already in VR mode')
      return
    }

    try {
      // 请求 VR 会话
      const sessionInit: XRSessionInit = {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      }

      this.xrSession = await navigator.xr.requestSession('immersive-vr', sessionInit)

      // 设置会话的基础层
      const gl = this.renderer.getContext() as WebGLRenderingContext
      await this.xrSession.updateRenderState({
        baseLayer: new XRWebGLLayer(this.xrSession, gl),
      })

      // 获取参考空间
      this.xrRefSpace = await this.xrSession.requestReferenceSpace(
        this.options.referenceSpaceType,
      )

      // 设置 Three.js 渲染器的 XR 会话
      this.renderer.xr.setSession(this.xrSession)

      // 设置控制器
      if (this.options.controllers) {
        this.setupControllers()
      }

      // 监听会话结束
      this.xrSession.addEventListener('end', () => {
        this.onSessionEnd()
      })

      this.isInVR = true
      this.eventBus?.emit('xr:sessionstart', { mode: 'vr' })
      logger.info('Entered VR mode')
    }
    catch (error) {
      logger.error('Failed to enter VR', error)
      throw error
    }
  }

  /**
   * 退出 VR 模式
   */
  public async exitVR(): Promise<void> {
    if (!this.isInVR || !this.xrSession) {
      return
    }

    try {
      await this.xrSession.end()
    }
    catch (error) {
      logger.error('Error exiting VR', error)
    }
  }

  /**
   * 会话结束处理
   */
  private onSessionEnd(): void {
    this.isInVR = false
    this.xrSession = null
    this.xrRefSpace = null

    // 清理控制器
    this.controllers.forEach((controller) => {
      this.scene.remove(controller)
    })
    this.controllers = []

    this.eventBus?.emit('xr:sessionend')
    logger.info('VR session ended')
  }

  /**
   * 设置 VR 控制器
   */
  private setupControllers(): void {
    // 控制器 0 (左手)
    const controller0 = this.renderer.xr.getController(0)
    controller0.addEventListener('selectstart', () => this.onSelectStart(0))
    controller0.addEventListener('selectend', () => this.onSelectEnd(0))
    controller0.addEventListener('connected', event => this.onControllerConnected(event, 0))
    controller0.addEventListener('disconnected', () => this.onControllerDisconnected(0))
    this.scene.add(controller0)
    this.controllers.push(controller0)

    // 控制器 1 (右手)
    const controller1 = this.renderer.xr.getController(1)
    controller1.addEventListener('selectstart', () => this.onSelectStart(1))
    controller1.addEventListener('selectend', () => this.onSelectEnd(1))
    controller1.addEventListener('connected', event => this.onControllerConnected(event, 1))
    controller1.addEventListener('disconnected', () => this.onControllerDisconnected(1))
    this.scene.add(controller1)
    this.controllers.push(controller1)

    // 添加控制器模型
    const controllerModelFactory = (THREE as any).XRControllerModelFactory
      ? new (THREE as any).XRControllerModelFactory()
      : null

    if (controllerModelFactory) {
      const controllerGrip0 = this.renderer.xr.getControllerGrip(0)
      controllerGrip0.add(controllerModelFactory.createControllerModel(controllerGrip0))
      this.scene.add(controllerGrip0)

      const controllerGrip1 = this.renderer.xr.getControllerGrip(1)
      controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
      this.scene.add(controllerGrip1)
    }

    logger.debug('VR controllers setup complete')
  }

  /**
   * 控制器选择开始
   */
  private onSelectStart(controllerIndex: number): void {
    logger.debug(`Controller ${controllerIndex} select start`)
    // 这里可以添加选择逻辑，例如射线投射选择热点
  }

  /**
   * 控制器选择结束
   */
  private onSelectEnd(_controllerIndex: number): void {
    // logger.debug(`Controller ${_controllerIndex} select end`)
  }

  /**
   * 控制器连接
   */
  private onControllerConnected(event: any, controllerIndex: number): void {
    const data = event.data
    // @ts-expect-error - XRInputSource类型
    logger.info(`Controller ${controllerIndex} connected:`, data.handedness, data.targetRayMode)
  }

  /**
   * 控制器断开
   */
  private onControllerDisconnected(controllerIndex: number): void {
    logger.info(`Controller ${controllerIndex} disconnected`)
  }

  /**
   * 获取控制器
   */
  public getController(index: number): THREE.Group | undefined {
    return this.controllers[index]
  }

  /**
   * 检查是否在 VR 中
   */
  public isActive(): boolean {
    return this.isInVR
  }

  /**
   * 获取 XR 会话
   */
  public getSession(): XRSession | null {
    return this.xrSession
  }

  /**
   * 销毁 VR 管理器
   */
  public dispose(): void {
    if (this.isInVR) {
      this.exitVR()
    }

    this.controllers.forEach((controller) => {
      this.scene.remove(controller)
    })
    this.controllers = []

    this.renderer.xr.enabled = false
    this.eventBus = null

    logger.debug('VR manager disposed')
  }
}

/**
 * XR 控制器模型工厂（简化版）
 */
class _XRControllerModelFactory {
  public createControllerModel(_controller: THREE.Group): THREE.Object3D {
    // 创建简单的控制器视觉表示
    const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.1, 8)
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2

    // 添加射线指示器
    const rayGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ])
    const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00FF00 })
    const ray = new THREE.Line(rayGeometry, rayMaterial)
    mesh.add(ray)

    return mesh
  }
}
