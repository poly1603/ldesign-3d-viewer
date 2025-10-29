import { WebWorkerTextureLoader } from './WebWorkerTextureLoader';
export class ImagePreloader {
    constructor(maxCacheSize = 5) {
        this.cache = new Map();
        this.loading = new Set();
        this.maxCacheSize = 5;
        this.loadQueue = [];
        this.maxCacheSize = maxCacheSize;
        this.loader = new WebWorkerTextureLoader();
    }
    /**
     * Preload an image
     */
    async preload(url) {
        // Return from cache if available
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        // Return if already loading
        if (this.loading.has(url)) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.cache.has(url)) {
                        clearInterval(checkInterval);
                        resolve(this.cache.get(url));
                    }
                }, 100);
            });
        }
        // Start loading
        this.loading.add(url);
        try {
            const texture = await this.loader.load(url);
            this.loading.delete(url);
            // Add to cache
            this.addToCache(url, texture);
            return texture;
        }
        catch (error) {
            this.loading.delete(url);
            throw error;
        }
    }
    /**
     * Preload multiple images
     */
    async preloadMultiple(urls) {
        const promises = urls.map(url => this.preload(url).catch((e) => {
            console.warn(`Failed to preload ${url}:`, e);
            return null;
        }));
        await Promise.all(promises);
    }
    /**
     * Get texture from cache
     */
    get(url) {
        return this.cache.get(url) || null;
    }
    /**
     * Check if image is cached
     */
    has(url) {
        return this.cache.has(url);
    }
    /**
     * Add texture to cache with size management
     */
    addToCache(url, texture) {
        // Remove oldest if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            const oldTexture = this.cache.get(firstKey);
            if (oldTexture) {
                oldTexture.dispose();
            }
            this.cache.delete(firstKey);
        }
        this.cache.set(url, texture);
    }
    /**
     * Clear specific image from cache
     */
    clear(url) {
        const texture = this.cache.get(url);
        if (texture) {
            texture.dispose();
            this.cache.delete(url);
        }
    }
    /**
     * Clear all cache
     */
    clearAll() {
        this.cache.forEach(texture => texture.dispose());
        this.cache.clear();
        this.loading.clear();
    }
    /**
     * Get cache stats
     */
    getStats() {
        return {
            cached: this.cache.size,
            loading: this.loading.size,
            maxSize: this.maxCacheSize,
        };
    }
    /**
     * Dispose preloader
     */
    dispose() {
        this.clearAll();
        this.loader.dispose();
    }
}
//# sourceMappingURL=ImagePreloader.js.map