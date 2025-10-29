/**
 * 离线管理器
 * 使用 Service Worker 和 IndexedDB 实现离线支持
 */
export interface OfflineConfig {
    cacheName: string;
    version: string;
    maxCacheSize: number;
    cacheStrategy: 'cache-first' | 'network-first' | 'cache-only';
    excludeUrls?: string[];
}
export interface CacheEntry {
    url: string;
    timestamp: number;
    size: number;
    type: 'image' | 'audio' | 'video' | 'data';
}
export declare class OfflineManager {
    private static instance;
    private config;
    private db;
    private swRegistration;
    private isOnline;
    private constructor();
    static getInstance(config?: Partial<OfflineConfig>): OfflineManager;
    /**
     * 初始化离线支持
     */
    initialize(): Promise<void>;
    /**
     * 初始化 IndexedDB
     */
    private initIndexedDB;
    /**
     * 注册 Service Worker
     */
    private registerServiceWorker;
    /**
     * 缓存资源
     */
    cacheResource(url: string, type?: CacheEntry['type']): Promise<void>;
    /**
     * 批量缓存资源
     */
    cacheResources(urls: string[]): Promise<void>;
    /**
     * 获取缓存的资源
     */
    getCachedResource(url: string): Promise<Response | null>;
    /**
     * 检查资源是否已缓存
     */
    isCached(url: string): Promise<boolean>;
    /**
     * 删除缓存的资源
     */
    removeCached(url: string): Promise<void>;
    /**
     * 清理旧缓存
     */
    private cleanOldCache;
    /**
     * 获取总缓存大小
     */
    private getTotalCacheSize;
    /**
     * 获取所有缓存条目
     */
    getAllCached(): Promise<CacheEntry[]>;
    /**
     * 清除所有缓存
     */
    clearCache(): Promise<void>;
    /**
     * 设置在线/离线监听
     */
    private setupOnlineListener;
    /**
     * 检查是否在线
     */
    isOnlineMode(): boolean;
    /**
     * 获取缓存名称
     */
    private getCacheName;
    /**
     * 获取缓存统计
     */
    getStats(): Promise<{
        totalEntries: number;
        totalSize: number;
        byType: Record<string, number>;
    }>;
    /**
     * 预加载关键资源
     */
    preloadCriticalResources(urls: string[]): Promise<void>;
    /**
     * 事件分发（简单实现）
     */
    private listeners;
    private dispatchEvent;
    on(event: 'online' | 'offline' | 'cached', handler: (data?: any) => void): () => void;
    /**
     * 生成报告
     */
    generateReport(): Promise<string>;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=OfflineManager.d.ts.map