/**
 * 视角书签管理器 - 保存和恢复用户的视角位置
 * 支持本地存储、导入导出、缩略图预览等功能
 */
import type { EventBus } from '../core/EventBus';
import type { SphericalPosition } from '../types';
export interface ViewSnapshot {
    id: string;
    name: string;
    position: SphericalPosition;
    fov: number;
    timestamp: number;
    thumbnail?: string;
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface SnapshotManagerConfig {
    maxSnapshots?: number;
    autoSaveThumbnail?: boolean;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    storageKey?: string;
    enableLocalStorage?: boolean;
}
export declare class SnapshotManager {
    private eventBus;
    private config;
    private snapshots;
    private onGetCameraState;
    private onSetCameraState;
    private onCaptureThumbnail;
    constructor(eventBus: EventBus, config?: SnapshotManagerConfig);
    /**
     * 设置相机状态控制器
     */
    setCameraController(getter: () => {
        position: SphericalPosition;
        fov: number;
    }, setter: (position: SphericalPosition, fov: number, duration?: number) => void): void;
    /**
     * 设置缩略图捕获器
     */
    setThumbnailCapture(capture: (width: number, height: number) => string): void;
    /**
     * 创建快照
     */
    createSnapshot(options: {
        name: string;
        description?: string;
        tags?: string[];
        metadata?: Record<string, any>;
    }): ViewSnapshot | null;
    /**
     * 恢复快照
     */
    restoreSnapshot(id: string, transitionDuration?: number): boolean;
    /**
     * 更新快照
     */
    updateSnapshot(id: string, updates: Partial<Omit<ViewSnapshot, 'id' | 'timestamp'>>): boolean;
    /**
     * 删除快照
     */
    deleteSnapshot(id: string): boolean;
    /**
     * 获取快照
     */
    getSnapshot(id: string): ViewSnapshot | undefined;
    /**
     * 获取所有快照
     */
    getAllSnapshots(): ViewSnapshot[];
    /**
     * 按标签获取快照
     */
    getSnapshotsByTag(tag: string): ViewSnapshot[];
    /**
     * 搜索快照
     */
    searchSnapshots(query: string): ViewSnapshot[];
    /**
     * 清空所有快照
     */
    clearAll(): void;
    /**
     * 导出快照为JSON
     */
    exportSnapshots(ids?: string[]): string;
    /**
     * 从JSON导入快照
     */
    importSnapshots(json: string, options?: {
        replace?: boolean;
        skipDuplicates?: boolean;
    }): {
        imported: number;
        skipped: number;
        errors: number;
    };
    /**
     * 保存到本地存储
     */
    private saveToLocalStorage;
    /**
     * 从本地存储加载
     */
    private loadFromLocalStorage;
    /**
     * 生成唯一ID
     */
    private generateId;
    /**
     * 获取统计信息
     */
    getStats(): {
        total: number;
        withThumbnails: number;
        tags: string[];
        oldestTimestamp: number;
        newestTimestamp: number;
    };
    /**
     * 销毁管理器
     */
    dispose(): void;
}
//# sourceMappingURL=SnapshotManager.d.ts.map