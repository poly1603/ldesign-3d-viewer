import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfflineManager } from '../../src/offline/OfflineManager';
// Mock APIs
const mockCache = {
    match: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
};
const mockCaches = {
    open: vi.fn(() => Promise.resolve(mockCache)),
};
const mockIndexedDB = {
    open: vi.fn(),
};
const mockServiceWorker = {
    register: vi.fn(),
};
describe('OfflineManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.caches = mockCaches;
        globalThis.indexedDB = mockIndexedDB;
        globalThis.navigator = {
            onLine: true,
            serviceWorker: mockServiceWorker,
        };
    });
    describe('单例模式', () => {
        it('应该返回相同的实例', () => {
            const instance1 = OfflineManager.getInstance();
            const instance2 = OfflineManager.getInstance();
            expect(instance1).toBe(instance2);
        });
        it('应该能够使用配置创建实例', () => {
            const om = OfflineManager.getInstance({
                cacheName: 'custom-cache',
                version: 'v2',
            });
            expect(om).toBeDefined();
        });
    });
    describe('初始化', () => {
        it('不支持 Service Worker 时应该抛出错误', async () => {
            delete globalThis.navigator.serviceWorker;
            const om = OfflineManager.getInstance();
            await expect(om.initialize()).rejects.toThrow('Service Worker not supported');
        });
        it('不支持 IndexedDB 时应该抛出错误', async () => {
            delete globalThis.indexedDB;
            const om = OfflineManager.getInstance();
            await expect(om.initialize()).rejects.toThrow('IndexedDB not supported');
        });
    });
    describe('缓存检查', () => {
        it('应该能够检查资源是否已缓存', async () => {
            mockCache.match.mockResolvedValue(new Response());
            const om = OfflineManager.getInstance();
            const cached = await om.isCached('test.jpg');
            expect(cached).toBe(true);
        });
        it('未缓存的资源应该返回 false', async () => {
            mockCache.match.mockResolvedValue(undefined);
            const om = OfflineManager.getInstance();
            const cached = await om.isCached('missing.jpg');
            expect(cached).toBe(false);
        });
    });
    describe('获取缓存资源', () => {
        it('应该能够获取已缓存的资源', async () => {
            const mockResponse = new Response();
            mockCache.match.mockResolvedValue(mockResponse);
            const om = OfflineManager.getInstance();
            const response = await om.getCachedResource('test.jpg');
            expect(response).toBe(mockResponse);
        });
        it('未缓存的资源应该返回 null', async () => {
            mockCache.match.mockResolvedValue(undefined);
            const om = OfflineManager.getInstance();
            const response = await om.getCachedResource('missing.jpg');
            expect(response).toBeNull();
        });
    });
});
//# sourceMappingURL=OfflineManager.test.js.map