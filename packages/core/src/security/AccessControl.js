/**
 * 访问控制系统
 * 基于角色的权限管理和水印保护
 */
import { logger } from '../core/Logger';
export class AccessControl {
    constructor(container, config) {
        this.watermarkElement = null;
        this.defaultPermissions = {
            guest: ['view'],
            user: ['view', 'zoom', 'rotate', 'hotspot-click'],
            premium: ['view', 'zoom', 'rotate', 'hotspot-click', 'screenshot', 'fullscreen', 'share'],
            admin: ['view', 'zoom', 'rotate', 'hotspot-click', 'screenshot', 'fullscreen', 'share', 'download'],
        };
        this.container = container;
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
        };
        this.currentRole = this.config.defaultRole;
        this.initialize();
    }
    /**
     * 初始化
     */
    initialize() {
        // 应用水印
        if (this.config.watermark.enabled) {
            this.applyWatermark();
        }
        // 防止截图
        if (this.config.preventScreenshot) {
            this.preventScreenshots();
        }
        // 防止右键
        if (this.config.preventRightClick) {
            this.preventRightClicks();
        }
    }
    /**
     * 设置角色
     */
    setRole(role) {
        this.currentRole = role;
    }
    /**
     * 获取当前角色
     */
    getRole() {
        return this.currentRole;
    }
    /**
     * 检查权限
     */
    hasPermission(permission) {
        const permissions = this.config.rolePermissions[this.currentRole] || [];
        return permissions.includes(permission);
    }
    /**
     * 要求权限
     */
    requirePermission(permission) {
        if (!this.hasPermission(permission)) {
            throw new Error(`Permission denied: ${permission} (Current role: ${this.currentRole})`);
        }
    }
    /**
     * 获取所有权限
     */
    getPermissions() {
        return this.config.rolePermissions[this.currentRole] || [];
    }
    /**
     * 应用水印
     */
    applyWatermark() {
        const watermark = this.config.watermark;
        this.watermarkElement = document.createElement('div');
        this.watermarkElement.textContent = watermark.text;
        this.watermarkElement.style.position = 'absolute';
        this.watermarkElement.style.color = watermark.color;
        this.watermarkElement.style.fontSize = `${watermark.fontSize}px`;
        this.watermarkElement.style.opacity = String(watermark.opacity);
        this.watermarkElement.style.pointerEvents = 'none';
        this.watermarkElement.style.userSelect = 'none';
        this.watermarkElement.style.zIndex = '9999';
        this.watermarkElement.style.padding = '10px';
        this.watermarkElement.style.fontFamily = 'Arial, sans-serif';
        this.watermarkElement.style.textShadow = '0 0 4px rgba(0,0,0,0.5)';
        // 设置位置
        switch (watermark.position) {
            case 'top-left':
                this.watermarkElement.style.top = '0';
                this.watermarkElement.style.left = '0';
                break;
            case 'top-right':
                this.watermarkElement.style.top = '0';
                this.watermarkElement.style.right = '0';
                break;
            case 'bottom-left':
                this.watermarkElement.style.bottom = '0';
                this.watermarkElement.style.left = '0';
                break;
            case 'bottom-right':
                this.watermarkElement.style.bottom = '0';
                this.watermarkElement.style.right = '0';
                break;
            case 'center':
                this.watermarkElement.style.top = '50%';
                this.watermarkElement.style.left = '50%';
                this.watermarkElement.style.transform = 'translate(-50%, -50%)';
                break;
        }
        this.container.appendChild(this.watermarkElement);
    }
    /**
     * 更新水印
     */
    updateWatermark(config) {
        Object.assign(this.config.watermark, config);
        if (this.watermarkElement) {
            this.watermarkElement.remove();
        }
        if (this.config.watermark.enabled) {
            this.applyWatermark();
        }
    }
    /**
     * 防止截图
     */
    preventScreenshots() {
        // 防止Print Screen键
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText('');
                logger.warn('截图已禁用');
            }
        });
        // 防止浏览器截图快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                logger.warn('截图已禁用');
            }
        });
    }
    /**
     * 防止右键菜单
     */
    preventRightClicks() {
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }
    /**
     * 添加自定义权限
     */
    addPermission(role, permission) {
        const permissions = this.config.rolePermissions[role] || [];
        if (!permissions.includes(permission)) {
            permissions.push(permission);
            this.config.rolePermissions[role] = permissions;
        }
    }
    /**
     * 移除权限
     */
    removePermission(role, permission) {
        const permissions = this.config.rolePermissions[role] || [];
        const index = permissions.indexOf(permission);
        if (index > -1) {
            permissions.splice(index, 1);
        }
    }
    /**
     * 获取角色权限
     */
    getRolePermissions(role) {
        return this.config.rolePermissions[role] || [];
    }
    /**
     * 清理资源
     */
    dispose() {
        if (this.watermarkElement) {
            this.watermarkElement.remove();
        }
    }
}
//# sourceMappingURL=AccessControl.js.map