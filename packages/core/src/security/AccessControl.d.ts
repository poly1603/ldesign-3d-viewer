/**
 * 访问控制系统
 * 基于角色的权限管理和水印保护
 */
export type Permission = 'view' | 'zoom' | 'rotate' | 'screenshot' | 'fullscreen' | 'hotspot-click' | 'download' | 'share';
export type Role = 'guest' | 'user' | 'premium' | 'admin';
export interface AccessControlConfig {
    defaultRole: Role;
    rolePermissions: Record<Role, Permission[]>;
    watermark?: WatermarkConfig;
    preventScreenshot?: boolean;
    preventRightClick?: boolean;
}
export interface WatermarkConfig {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    fontSize: number;
    color: string;
}
export declare class AccessControl {
    private currentRole;
    private config;
    private watermarkElement;
    private container;
    private defaultPermissions;
    constructor(container: HTMLElement, config?: Partial<AccessControlConfig>);
    /**
     * 初始化
     */
    private initialize;
    /**
     * 设置角色
     */
    setRole(role: Role): void;
    /**
     * 获取当前角色
     */
    getRole(): Role;
    /**
     * 检查权限
     */
    hasPermission(permission: Permission): boolean;
    /**
     * 要求权限
     */
    requirePermission(permission: Permission): void;
    /**
     * 获取所有权限
     */
    getPermissions(): Permission[];
    /**
     * 应用水印
     */
    private applyWatermark;
    /**
     * 更新水印
     */
    updateWatermark(config: Partial<WatermarkConfig>): void;
    /**
     * 防止截图
     */
    private preventScreenshots;
    /**
     * 防止右键菜单
     */
    private preventRightClicks;
    /**
     * 添加自定义权限
     */
    addPermission(role: Role, permission: Permission): void;
    /**
     * 移除权限
     */
    removePermission(role: Role, permission: Permission): void;
    /**
     * 获取角色权限
     */
    getRolePermissions(role: Role): Permission[];
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=AccessControl.d.ts.map