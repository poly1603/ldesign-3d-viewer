/**
 * 内存管理器 - 监控和优化内存使用
 */
import * as THREE from 'three';
import type { EventBus } from './EventBus';
export interface MemoryStats {
    textures: {
        count: number;
        bytes: number;
    };
    geometries: {
        count: number;
        bytes: number;
    };
    jsHeap?: {
        used: number;
        total: number;
        limit: number;
        usagePercent: number;
    };
    total: number;
}
export interface MemoryOptions {
    maxTextureMemory?: number;
    maxGeometryMemory?: number;
    autoCleanup?: boolean;
    cleanupThreshold?: number;
    onMemoryWarning?: (stats: MemoryStats) => void;
}
export declare class MemoryManager {
    private textures;
    private geometries;
    private materials;
    private options;
    private eventBus;
    private monitorInterval;
    constructor(options?: MemoryOptions, eventBus?: EventBus);
    /**
     * 注册纹理以进行追踪
     */
    registerTexture(texture: THREE.Texture): void;
    /**
     * 取消注册纹理
     */
    unregisterTexture(texture: THREE.Texture): void;
    /**
     * 注册几何体
     */
    registerGeometry(geometry: THREE.BufferGeometry): void;
    /**
     * 取消注册几何体
     */
    unregisterGeometry(geometry: THREE.BufferGeometry): void;
    /**
     * 注册材质
     */
    registerMaterial(material: THREE.Material): void;
    /**
     * 取消注册材质
     */
    unregisterMaterial(material: THREE.Material): void;
    /**
     * 计算纹理内存使用
     */
    private calculateTextureMemory;
    /**
     * 计算几何体内存使用
     */
    private calculateGeometryMemory;
    /**
     * 获取 JS 堆内存信息
     */
    private getJSHeapStats;
    /**
     * 获取内存统计
     */
    getStats(): MemoryStats;
    /**
     * 检查内存使用并触发警告
     */
    private checkMemory;
    /**
     * 清理未使用的纹理
     */
    private cleanupTextures;
    /**
     * 清理未使用的几何体
     */
    private cleanupGeometries;
    /**
     * 建议垃圾回收
     */
    private suggestGC;
    /**
     * 强制清理所有资源
     */
    forceCleanup(): void;
    /**
     * 开始内存监控
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * 停止内存监控
     */
    stopMonitoring(): void;
    /**
     * 销毁内存管理器
     */
    dispose(): void;
}
//# sourceMappingURL=MemoryManager.d.ts.map