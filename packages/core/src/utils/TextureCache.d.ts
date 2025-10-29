import * as THREE from 'three';
/**
 * Texture cache for better performance with LRU strategy
 */
export declare class TextureCache {
    private static instance;
    private cache;
    private loader;
    private maxSize;
    private currentSize;
    private constructor();
    static getInstance(): TextureCache;
    /**
     * 设置最大缓存大小
     */
    setMaxSize(bytes: number): void;
    /**
     * 计算纹理大小（估算）
     */
    private estimateTextureSize;
    /**
     * LRU 驱逐策略
     */
    private evictIfNeeded;
    load(url: string, onProgress?: (progress: number) => void): Promise<THREE.Texture>;
    get(url: string): THREE.Texture | undefined;
    has(url: string): boolean;
    remove(url: string): void;
    /**
     * unload方法，与remove相同（别名）
     */
    unload(url: string): void;
    clear(): void;
    getSize(): number;
    /**
     * 获取缓存统计
     */
    getStats(): {
        count: number;
        totalSize: number;
        maxSize: number;
        utilization: number;
    };
    /**
     * 预加载多个纹理
     */
    preload(urls: string[]): Promise<void>;
}
//# sourceMappingURL=TextureCache.d.ts.map