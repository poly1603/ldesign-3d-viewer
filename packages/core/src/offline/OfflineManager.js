/**
 * 离线管理器
 * 使用 Service Worker 和 IndexedDB 实现离线支持
 */
import { logger } from '../core/Logger';
export class OfflineManager {
    constructor(config) {
        this.db = null;
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        /**
         * 事件分发（简单实现）
         */
        this.listeners = new Map();
        this.config = {
            cacheName: config?.cacheName || '3d-viewer-cache',
            version: config?.version || 'v1',
            maxCacheSize: config?.maxCacheSize || 500,
            cacheStrategy: config?.cacheStrategy || 'cache-first',
            excludeUrls: config?.excludeUrls || [],
        };
        this.setupOnlineListener();
    }
    static getInstance(config) {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager(config);
        }
        return OfflineManager.instance;
    }
    /**
     * 初始化离线支持
     */
    async initialize() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker not supported');
        }
        if (!('indexedDB' in window)) {
            throw new Error('IndexedDB not supported');
        }
        // 初始化 IndexedDB
        await this.initIndexedDB();
        // 注册 Service Worker
        await this.registerServiceWorker();
    }
    /**
     * 初始化 IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('3d-viewer-offline', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // 创建缓存条目存储
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'url' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                }
                // 创建配置存储
                if (!db.objectStoreNames.contains('config')) {
                    db.createObjectStore('config', { keyPath: 'key' });
                }
            };
        });
    }
    /**
     * 注册 Service Worker
     */
    async registerServiceWorker() {
        // 注意: 实际 Service Worker 文件需要单独创建
        const swUrl = '/sw.js';
        try {
            this.swRegistration = await navigator.serviceWorker.register(swUrl);
            logger.info('Service Worker registered successfully');
            // 等待激活
            if (this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            // 监听更新
            this.swRegistration.addEventListener('updatefound', () => {
                logger.info('Service Worker update found');
            });
        }
        catch (error) {
            logger.error('Service Worker registration failed:', error);
            throw error;
        }
    }
    /**
     * 缓存资源
     */
    async cacheResource(url, type = 'image') {
        if (!this.db) {
            throw new Error('IndexedDB not initialized');
        }
        try {
            // 获取资源
            const response = await fetch(url);
            const blob = await response.blob();
            // 检查缓存大小
            const size = blob.size / 1024 / 1024; // MB
            const totalSize = await this.getTotalCacheSize();
            if (totalSize + size > this.config.maxCacheSize) {
                await this.cleanOldCache(size);
            }
            // 存储到 IndexedDB
            const entry = {
                url,
                timestamp: Date.now(),
                size,
                type,
            };
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            await new Promise((resolve, reject) => {
                const request = store.put(entry);
                request.onsuccess = () => resolve(undefined);
                request.onerror = () => reject(request.error);
            });
            // 使用 Cache API 存储实际内容
            const cache = await caches.open(this.getCacheName());
            await cache.put(url, response);
            logger.debug(`Cached: ${url}`);
        }
        catch (error) {
            logger.error(`Failed to cache ${url}:`, error);
            throw error;
        }
    }
    /**
     * 批量缓存资源
     */
    async cacheResources(urls) {
        const promises = urls.map(url => this.cacheResource(url));
        await Promise.allSettled(promises);
    }
    /**
     * 获取缓存的资源
     */
    async getCachedResource(url) {
        const cache = await caches.open(this.getCacheName());
        return await cache.match(url) || null;
    }
    /**
     * 检查资源是否已缓存
     */
    async isCached(url) {
        const cache = await caches.open(this.getCacheName());
        const response = await cache.match(url);
        return response !== undefined;
    }
    /**
     * 删除缓存的资源
     */
    async removeCached(url) {
        if (!this.db)
            return;
        // 从 IndexedDB 删除
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await new Promise((resolve, reject) => {
            const request = store.delete(url);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        // 从 Cache API 删除
        const cache = await caches.open(this.getCacheName());
        await cache.delete(url);
    }
    /**
     * 清理旧缓存
     */
    async cleanOldCache(neededSize) {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const index = store.index('timestamp');
        const entries = [];
        await new Promise((resolve, reject) => {
            const request = index.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    entries.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
        // 按时间排序（旧的在前）
        entries.sort((a, b) => a.timestamp - b.timestamp);
        // 删除旧条目直到有足够空间
        let freedSize = 0;
        for (const entry of entries) {
            if (freedSize >= neededSize)
                break;
            await this.removeCached(entry.url);
            freedSize += entry.size;
        }
    }
    /**
     * 获取总缓存大小
     */
    async getTotalCacheSize() {
        if (!this.db)
            return 0;
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        let totalSize = 0;
        await new Promise((resolve, reject) => {
            const request = store.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    totalSize += cursor.value.size;
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
        return totalSize;
    }
    /**
     * 获取所有缓存条目
     */
    async getAllCached() {
        if (!this.db)
            return [];
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const entries = [];
        await new Promise((resolve, reject) => {
            const request = store.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    entries.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
        return entries;
    }
    /**
     * 清除所有缓存
     */
    async clearCache() {
        // 清除 Cache API
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames
            .filter(name => name.startsWith(this.config.cacheName))
            .map(name => caches.delete(name)));
        // 清除 IndexedDB
        if (this.db) {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }
    /**
     * 设置在线/离线监听
     */
    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.dispatchEvent('online');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.dispatchEvent('offline');
        });
    }
    /**
     * 检查是否在线
     */
    isOnlineMode() {
        return this.isOnline;
    }
    /**
     * 获取缓存名称
     */
    getCacheName() {
        return `${this.config.cacheName}-${this.config.version}`;
    }
    /**
     * 获取缓存统计
     */
    async getStats() {
        const entries = await this.getAllCached();
        const totalSize = await this.getTotalCacheSize();
        const byType = {};
        entries.forEach((entry) => {
            byType[entry.type] = (byType[entry.type] || 0) + 1;
        });
        return {
            totalEntries: entries.length,
            totalSize,
            byType,
        };
    }
    /**
     * 预加载关键资源
     */
    async preloadCriticalResources(urls) {
        logger.info(`Preloading ${urls.length} critical resources...`);
        await this.cacheResources(urls);
    }
    dispatchEvent(event, data) {
        const handlers = this.listeners.get(event) || [];
        handlers.forEach(handler => handler(data));
    }
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        return () => {
            const handlers = this.listeners.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1)
                    handlers.splice(index, 1);
            }
        };
    }
    /**
     * 生成报告
     */
    async generateReport() {
        const stats = await this.getStats();
        const isOnline = this.isOnlineMode();
        const report = `
Offline Manager Report
=====================

Status: ${isOnline ? '🟢 Online' : '🔴 Offline'}
Cache Strategy: ${this.config.cacheStrategy}
Max Cache Size: ${this.config.maxCacheSize} MB

Cache Statistics:
- Total Entries: ${stats.totalEntries}
- Total Size: ${stats.totalSize.toFixed(2)} MB
- By Type:
${Object.entries(stats.byType).map(([type, count]) => `  - ${type}: ${count}`).join('\n')}

Service Worker: ${this.swRegistration ? '✅ Registered' : '❌ Not Registered'}
IndexedDB: ${this.db ? '✅ Connected' : '❌ Not Connected'}
    `.trim();
        return report;
    }
    /**
     * 清理资源
     */
    async dispose() {
        if (this.swRegistration) {
            await this.swRegistration.unregister();
        }
        if (this.db) {
            this.db.close();
        }
        this.listeners.clear();
    }
}
// 使用示例：
// const offlineManager = OfflineManager.getInstance({
//   cacheName: '3d-viewer',
//   version: 'v1',
//   maxCacheSize: 500,
//   cacheStrategy: 'cache-first',
// });
//
// await offlineManager.initialize();
// await offlineManager.cacheResource('panorama.jpg', 'image');
//# sourceMappingURL=OfflineManager.js.map