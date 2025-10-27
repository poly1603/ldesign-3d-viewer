/**
 * 视角书签管理器 - 保存和恢复用户的视角位置
 * 支持本地存储、导入导出、缩略图预览等功能
 */

import { EventBus } from '../core/EventBus';
import type { SphericalPosition } from '../types';

export interface ViewSnapshot {
  id: string;
  name: string;
  position: SphericalPosition;
  fov: number;
  timestamp: number;
  thumbnail?: string; // Base64编码的缩略图
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

export class SnapshotManager {
  private eventBus: EventBus;
  private config: Required<SnapshotManagerConfig>;
  private snapshots: Map<string, ViewSnapshot>;
  
  // Camera control callbacks
  private onGetCameraState: (() => { position: SphericalPosition; fov: number }) | null = null;
  private onSetCameraState: ((position: SphericalPosition, fov: number, duration?: number) => void) | null = null;
  private onCaptureThumbnail: ((width: number, height: number) => string) | null = null;

  constructor(eventBus: EventBus, config: SnapshotManagerConfig = {}) {
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
  public setCameraController(
    getter: () => { position: SphericalPosition; fov: number },
    setter: (position: SphericalPosition, fov: number, duration?: number) => void
  ): void {
    this.onGetCameraState = getter;
    this.onSetCameraState = setter;
  }

  /**
   * 设置缩略图捕获器
   */
  public setThumbnailCapture(capture: (width: number, height: number) => string): void {
    this.onCaptureThumbnail = capture;
  }

  /**
   * 创建快照
   */
  public createSnapshot(options: {
    name: string;
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }): ViewSnapshot | null {
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

    const snapshot: ViewSnapshot = {
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
      snapshot.thumbnail = this.onCaptureThumbnail(
        this.config.thumbnailWidth,
        this.config.thumbnailHeight
      );
    }

    this.snapshots.set(id, snapshot);
    this.saveToLocalStorage();
    
    this.eventBus.emit('snapshot:created', { snapshot });
    
    return snapshot;
  }

  /**
   * 恢复快照
   */
  public restoreSnapshot(id: string, transitionDuration: number = 1000): boolean {
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
  public updateSnapshot(id: string, updates: Partial<Omit<ViewSnapshot, 'id' | 'timestamp'>>): boolean {
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
  public deleteSnapshot(id: string): boolean {
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
  public getSnapshot(id: string): ViewSnapshot | undefined {
    return this.snapshots.get(id);
  }

  /**
   * 获取所有快照
   */
  public getAllSnapshots(): ViewSnapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) => b.timestamp - a.timestamp); // 按时间倒序
  }

  /**
   * 按标签获取快照
   */
  public getSnapshotsByTag(tag: string): ViewSnapshot[] {
    return this.getAllSnapshots().filter(
      snapshot => snapshot.tags?.includes(tag)
    );
  }

  /**
   * 搜索快照
   */
  public searchSnapshots(query: string): ViewSnapshot[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllSnapshots().filter(snapshot => 
      snapshot.name.toLowerCase().includes(lowerQuery) ||
      snapshot.description?.toLowerCase().includes(lowerQuery) ||
      snapshot.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 清空所有快照
   */
  public clearAll(): void {
    this.snapshots.clear();
    this.saveToLocalStorage();
    this.eventBus.emit('snapshot:cleared', {});
  }

  /**
   * 导出快照为JSON
   */
  public exportSnapshots(ids?: string[]): string {
    let snapshotsToExport: ViewSnapshot[];
    
    if (ids) {
      snapshotsToExport = ids
        .map(id => this.snapshots.get(id))
        .filter((s): s is ViewSnapshot => s !== undefined);
    } else {
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
  public importSnapshots(json: string, options: { 
    replace?: boolean;
    skipDuplicates?: boolean;
  } = {}): { imported: number; skipped: number; errors: number } {
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
          const newSnapshot: ViewSnapshot = {
            ...snapshot,
            id: this.generateId(),
            timestamp: Date.now(),
          };

          this.snapshots.set(newSnapshot.id, newSnapshot);
          imported++;
        } catch (error) {
          console.error('Error importing snapshot:', error);
          errors++;
        }
      }

      this.saveToLocalStorage();
      this.eventBus.emit('snapshot:imported', { imported, skipped, errors });

      return { imported, skipped, errors };
    } catch (error) {
      console.error('Error parsing snapshot data:', error);
      return { imported: 0, skipped: 0, errors: 1 };
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const data = {
        version: '1.0',
        snapshots: Array.from(this.snapshots.values()),
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromLocalStorage(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      if (data.snapshots && Array.isArray(data.snapshots)) {
        data.snapshots.forEach((snapshot: ViewSnapshot) => {
          this.snapshots.set(snapshot.id, snapshot);
        });
        
        this.eventBus.emit('snapshot:loaded', { 
          count: this.snapshots.size 
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  public getStats(): {
    total: number;
    withThumbnails: number;
    tags: string[];
    oldestTimestamp: number;
    newestTimestamp: number;
  } {
    const snapshots = this.getAllSnapshots();
    const tags = new Set<string>();
    
    snapshots.forEach(s => {
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
  public dispose(): void {
    this.saveToLocalStorage();
    this.snapshots.clear();
  }
}

