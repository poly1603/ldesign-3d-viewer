/**
 * 访问控制系统
 * 基于角色的权限管理和水印保护
 */

import { logger } from '../core/Logger'

export type Permission =
  | 'view'
  | 'zoom'
  | 'rotate'
  | 'screenshot'
  | 'fullscreen'
  | 'hotspot-click'
  | 'download'
  | 'share'

export type Role = 'guest' | 'user' | 'premium' | 'admin'

export interface AccessControlConfig {
  defaultRole: Role
  rolePermissions: Record<Role, Permission[]>
  watermark?: WatermarkConfig
  preventScreenshot?: boolean
  preventRightClick?: boolean
}

export interface WatermarkConfig {
  enabled: boolean
  text: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  fontSize: number
  color: string
}

export class AccessControl {
  private currentRole: Role
  private config: Required<AccessControlConfig>
  private watermarkElement: HTMLElement | null = null
  private container: HTMLElement

  private defaultPermissions: Record<Role, Permission[]> = {
    guest: ['view'],
    user: ['view', 'zoom', 'rotate', 'hotspot-click'],
    premium: ['view', 'zoom', 'rotate', 'hotspot-click', 'screenshot', 'fullscreen', 'share'],
    admin: ['view', 'zoom', 'rotate', 'hotspot-click', 'screenshot', 'fullscreen', 'share', 'download'],
  }

  constructor(container: HTMLElement, config?: Partial<AccessControlConfig>) {
    this.container = container
    this.config = {
      defaultRole: config?.defaultRole || 'user',
      rolePermissions: config?.rolePermissions || this.defaultPermissions,
      watermark: config?.watermark || {
        enabled: false,
        text: '',
        position: 'bottom-right',
        opacity: 0.5,
        fontSize: 14,
        color: '#ffffff',
      },
      preventScreenshot: config?.preventScreenshot ?? false,
      preventRightClick: config?.preventRightClick ?? false,
    }

    this.currentRole = this.config.defaultRole

    this.initialize()
  }

  /**
   * 初始化
   */
  private initialize(): void {
    // 应用水印
    if (this.config.watermark.enabled) {
      this.applyWatermark()
    }

    // 防止截图
    if (this.config.preventScreenshot) {
      this.preventScreenshots()
    }

    // 防止右键
    if (this.config.preventRightClick) {
      this.preventRightClicks()
    }
  }

  /**
   * 设置角色
   */
  public setRole(role: Role): void {
    this.currentRole = role
  }

  /**
   * 获取当前角色
   */
  public getRole(): Role {
    return this.currentRole
  }

  /**
   * 检查权限
   */
  public hasPermission(permission: Permission): boolean {
    const permissions = this.config.rolePermissions[this.currentRole] || []
    return permissions.includes(permission)
  }

  /**
   * 要求权限
   */
  public requirePermission(permission: Permission): void {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission} (Current role: ${this.currentRole})`)
    }
  }

  /**
   * 获取所有权限
   */
  public getPermissions(): Permission[] {
    return this.config.rolePermissions[this.currentRole] || []
  }

  /**
   * 应用水印
   */
  private applyWatermark(): void {
    const watermark = this.config.watermark

    this.watermarkElement = document.createElement('div')
    this.watermarkElement.textContent = watermark.text
    this.watermarkElement.style.position = 'absolute'
    this.watermarkElement.style.color = watermark.color
    this.watermarkElement.style.fontSize = `${watermark.fontSize}px`
    this.watermarkElement.style.opacity = String(watermark.opacity)
    this.watermarkElement.style.pointerEvents = 'none'
    this.watermarkElement.style.userSelect = 'none'
    this.watermarkElement.style.zIndex = '9999'
    this.watermarkElement.style.padding = '10px'
    this.watermarkElement.style.fontFamily = 'Arial, sans-serif'
    this.watermarkElement.style.textShadow = '0 0 4px rgba(0,0,0,0.5)'

    // 设置位置
    switch (watermark.position) {
      case 'top-left':
        this.watermarkElement.style.top = '0'
        this.watermarkElement.style.left = '0'
        break
      case 'top-right':
        this.watermarkElement.style.top = '0'
        this.watermarkElement.style.right = '0'
        break
      case 'bottom-left':
        this.watermarkElement.style.bottom = '0'
        this.watermarkElement.style.left = '0'
        break
      case 'bottom-right':
        this.watermarkElement.style.bottom = '0'
        this.watermarkElement.style.right = '0'
        break
      case 'center':
        this.watermarkElement.style.top = '50%'
        this.watermarkElement.style.left = '50%'
        this.watermarkElement.style.transform = 'translate(-50%, -50%)'
        break
    }

    this.container.appendChild(this.watermarkElement)
  }

  /**
   * 更新水印
   */
  public updateWatermark(config: Partial<WatermarkConfig>): void {
    Object.assign(this.config.watermark, config)

    if (this.watermarkElement) {
      this.watermarkElement.remove()
    }

    if (this.config.watermark.enabled) {
      this.applyWatermark()
    }
  }

  /**
   * 防止截图
   */
  private preventScreenshots(): void {
    // 防止Print Screen键
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('')
        logger.warn('截图已禁用')
      }
    })

    // 防止浏览器截图快捷键
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        logger.warn('截图已禁用')
      }
    })
  }

  /**
   * 防止右键菜单
   */
  private preventRightClicks(): void {
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
  }

  /**
   * 添加自定义权限
   */
  public addPermission(role: Role, permission: Permission): void {
    const permissions = this.config.rolePermissions[role] || []
    if (!permissions.includes(permission)) {
      permissions.push(permission)
      this.config.rolePermissions[role] = permissions
    }
  }

  /**
   * 移除权限
   */
  public removePermission(role: Role, permission: Permission): void {
    const permissions = this.config.rolePermissions[role] || []
    const index = permissions.indexOf(permission)
    if (index > -1) {
      permissions.splice(index, 1)
    }
  }

  /**
   * 获取角色权限
   */
  public getRolePermissions(role: Role): Permission[] {
    return this.config.rolePermissions[role] || []
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.watermarkElement) {
      this.watermarkElement.remove()
    }
  }
}
