/**
 * 视角书签管理器 - 保存和恢复用户的视角位置
 * 支持本地存储、导入导出、缩略图预览等功能
 */
export class SnapshotManager {
    constructor(eventBus, config = {}) {
        // Camera control callbacks
        this.onGetCameraState = null;
        this.onSetCameraState = null;
        this.onCaptureThumbnail = null;
        this.eventBus = eventBus;
        this.config = {
            maxSnapshots: config.maxSnapshots ?? 50,
            autoSaveThumbnail: config.autoSaveThumbnail ?? true,
            thumbnailWidth: config.thumbnailWidth ?? 200,
            thumbnailHeight: config.thumbnailHeight ?? 150,
            storageKey: config.storageKey ?? 'panorama-viewer-snapshots',
            enableLocalStorage: config.enableLocalStorage ?? true,
        };
        this.snapshots = new Map();
        // 从本地存储加载
        if (this.config.enableLocalStorage) {
            this.loadFromLocalStorage();
        }
    }
    /**
     * 设置相机状态控制器
     */
    setCameraController(getter, setter) {
        this.onGetCameraState = getter;
        this.onSetCameraState = setter;
    }
    /**
     * 设置缩略图捕获器
     */
    setThumbnailCapture(capture) {
        this.onCaptureThumbnail = capture;
    }
    /**
     * 创建快照
     */
    createSnapshot(options) {
        if (!this.onGetCameraState) {
            console.error('Camera state getter not set');
            return null;
        }
        // 检查快照数量限制
        if (this.snapshots.size >= this.config.maxSnapshots) {
            // 删除最旧的快照
            const oldest = Array.from(this.snapshots.values())
                .sort((a, b) => a.timestamp - b.timestamp)[0];
            if (oldest) {
                this.deleteSnapshot(oldest.id);
            }
        }
        const cameraState = this.onGetCameraState();
        const id = this.generateId();
        const snapshot = {
            id,
            name: options.name,
            position: { ...cameraState.position },
            fov: cameraState.fov,
            timestamp: Date.now(),
            description: options.description,
            tags: options.tags,
            metadata: options.metadata,
        };
        // 自动捕获缩略图
        if (this.config.autoSaveThumbnail && this.onCaptureThumbnail) {
            snapshot.thumbnail = this.onCaptureThumbnail(this.config.thumbnailWidth, this.config.thumbnailHeight);
        }
        this.snapshots.set(id, snapshot);
        this.saveToLocalStorage();
        this.eventBus.emit('snapshot:created', { snapshot });
        return snapshot;
    }
    /**
     * 恢复快照
     */
    restoreSnapshot(id, transitionDuration = 1000) {
        if (!this.onSetCameraState) {
            console.error('Camera state setter not set');
            return false;
        }
        const snapshot = this.snapshots.get(id);
        if (!snapshot) {
            console.error(`Snapshot '${id}' not found`);
            return false;
        }
        this.onSetCameraState(snapshot.position, snapshot.fov, transitionDuration);
        this.eventBus.emit('snapshot:restored', { snapshot });
        return true;
    }
    /**
     * 更新快照
     */
    updateSnapshot(id, updates) {
        const snapshot = this.snapshots.get(id);
        if (!snapshot) {
            console.error(`Snapshot '${id}' not found`);
            return false;
        }
        Object.assign(snapshot, updates);
        this.saveToLocalStorage();
        this.eventBus.emit('snapshot:updated', { snapshot });
        return true;
    }
    /**
     * 删除快照
     */
    deleteSnapshot(id) {
        const snapshot = this.snapshots.get(id);
        if (!snapshot) {
            return false;
        }
        this.snapshots.delete(id);
        this.saveToLocalStorage();
        this.eventBus.emit('snapshot:deleted', { id, snapshot });
        return true;
    }
    /**
     * 获取快照
     */
    getSnapshot(id) {
        return this.snapshots.get(id);
    }
    /**
     * 获取所有快照
     */
    getAllSnapshots() {
        return Array.from(this.snapshots.values())
            .sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序
    }
    /**
     * 按标签获取快照
     */
    getSnapshotsByTag(tag) {
        return this.getAllSnapshots().filter(snapshot => snapshot.tags?.includes(tag));
    }
    /**
     * 搜索快照
     */
    searchSnapshots(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllSnapshots().filter(snapshot => snapshot.name.toLowerCase().includes(lowerQuery)
            || snapshot.description?.toLowerCase().includes(lowerQuery)
            || snapshot.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
    /**
     * 清空所有快照
     */
    clearAll() {
        this.snapshots.clear();
        this.saveToLocalStorage();
        this.eventBus.emit('snapshot:cleared', {});
    }
    /**
     * 导出快照为JSON
     */
    exportSnapshots(ids) {
        let snapshotsToExport;
        if (ids) {
            snapshotsToExport = ids
                .map(id => this.snapshots.get(id))
                .filter((s) => s !== undefined);
        }
        else {
            snapshotsToExport = this.getAllSnapshots();
        }
        return JSON.stringify({
            version: '1.0',
            timestamp: Date.now(),
            snapshots: snapshotsToExport,
        }, null, 2);
    }
    /**
     * 从JSON导入快照
     */
    importSnapshots(json, options = {}) {
        try {
            const data = JSON.parse(json);
            if (!data.snapshots || !Array.isArray(data.snapshots)) {
                throw new Error('Invalid snapshot data format');
            }
            if (options.replace) {
                this.clearAll();
            }
            let imported = 0;
            let skipped = 0;
            let errors = 0;
            for (const snapshot of data.snapshots) {
                try {
                    // 检查是否重复
                    if (options.skipDuplicates && this.snapshots.has(snapshot.id)) {
                        skipped++;
                        continue;
                    }
                    // 生成新ID以避免冲突
                    const newSnapshot = {
                        ...snapshot,
                        id: this.generateId(),
                        timestamp: Date.now(),
                    };
                    this.snapshots.set(newSnapshot.id, newSnapshot);
                    imported++;
                }
                catch (error) {
                    console.error('Error importing snapshot:', error);
                    errors++;
                }
            }
            this.saveToLocalStorage();
            this.eventBus.emit('snapshot:imported', { imported, skipped, errors });
            return { imported, skipped, errors };
        }
        catch (error) {
            console.error('Error parsing snapshot data:', error);
            return { imported: 0, skipped: 0, errors: 1 };
        }
    }
    /**
     * 保存到本地存储
     */
    saveToLocalStorage() {
        if (!this.config.enableLocalStorage)
            return;
        try {
            const data = {
                version: '1.0',
                snapshots: Array.from(this.snapshots.values()),
            };
            localStorage.setItem(this.config.storageKey, JSON.stringify(data));
        }
        catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    /**
     * 从本地存储加载
     */
    loadFromLocalStorage() {
        if (!this.config.enableLocalStorage)
            return;
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (!stored)
                return;
            const data = JSON.parse(stored);
            if (data.snapshots && Array.isArray(data.snapshots)) {
                data.snapshots.forEach((snapshot) => {
                    this.snapshots.set(snapshot.id, snapshot);
                });
                this.eventBus.emit('snapshot:loaded', {
                    count: this.snapshots.size,
                });
            }
        }
        catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    /**
     * 生成唯一ID
     */
    generateId() {
        return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const snapshots = this.getAllSnapshots();
        const tags = new Set();
        snapshots.forEach((s) => {
            s.tags?.forEach(tag => tags.add(tag));
        });
        return {
            total: snapshots.length,
            withThumbnails: snapshots.filter(s => s.thumbnail).length,
            tags: Array.from(tags),
            oldestTimestamp: snapshots.length > 0 ? Math.min(...snapshots.map(s => s.timestamp)) : 0,
            newestTimestamp: snapshots.length > 0 ? Math.max(...snapshots.map(s => s.timestamp)) : 0,
        };
    }
    /**
     * 销毁管理器
     */
    dispose() {
        this.saveToLocalStorage();
        this.snapshots.clear();
    }
}
//# sourceMappingURL=SnapshotManager.js.map