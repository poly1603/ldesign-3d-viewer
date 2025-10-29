/**
 * Intelligent image preloader
 * Preloads next images in the background for seamless transitions
 */
import type * as THREE from 'three';
export declare class ImagePreloader {
    private cache;
    private loading;
    private loader;
    private maxCacheSize;
    private loadQueue;
    constructor(maxCacheSize?: number);
    /**
     * Preload an image
     */
    preload(url: string): Promise<THREE.Texture>;
    /**
     * Preload multiple images
     */
    preloadMultiple(urls: string[]): Promise<void>;
    /**
     * Get texture from cache
     */
    get(url: string): THREE.Texture | null;
    /**
     * Check if image is cached
     */
    has(url: string): boolean;
    /**
     * Add texture to cache with size management
     */
    private addToCache;
    /**
     * Clear specific image from cache
     */
    clear(url: string): void;
    /**
     * Clear all cache
     */
    clearAll(): void;
    /**
     * Get cache stats
     */
    getStats(): {
        cached: number;
        loading: number;
        maxSize: number;
    };
    /**
     * Dispose preloader
     */
    dispose(): void;
}
//# sourceMappingURL=ImagePreloader.d.ts.map