/**
 * Texture optimization and compression system
 * Automatically downgrades textures based on device capabilities
 */
import * as THREE from 'three';
export class TextureOptimizer {
    constructor(options = {}) {
        this.maxGPUTextureSize = 4096;
        this.options = {
            maxTextureSize: options.maxTextureSize || 4096,
            compressionQuality: options.compressionQuality ?? 0.85,
            enableMipmaps: options.enableMipmaps ?? true,
            autoDowngrade: options.autoDowngrade ?? true,
        };
        this.detectMaxTextureSize();
    }
    /**
     * Detect maximum GPU texture size
     */
    detectMaxTextureSize() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const glCtx = gl;
            this.maxGPUTextureSize = glCtx.getParameter(glCtx.MAX_TEXTURE_SIZE);
        }
    }
    /**
     * Optimize texture
     */
    async optimize(texture) {
        if (!this.options.autoDowngrade) {
            return texture;
        }
        const image = texture.image;
        if (!image || !image.width || !image.height) {
            return texture;
        }
        const width = image.width;
        const height = image.height;
        const maxSize = Math.min(this.options.maxTextureSize, this.maxGPUTextureSize);
        // Check if resize is needed
        if (width <= maxSize && height <= maxSize) {
            this.applyOptimizations(texture);
            return texture;
        }
        // Calculate new dimensions (maintain aspect ratio)
        const scale = Math.min(maxSize / width, maxSize / height);
        const newWidth = Math.floor(width * scale);
        const newHeight = Math.floor(height * scale);
        // Resize using canvas
        const optimizedTexture = await this.resizeTexture(texture, newWidth, newHeight);
        this.applyOptimizations(optimizedTexture);
        return optimizedTexture;
    }
    /**
     * Resize texture to specified dimensions
     */
    async resizeTexture(texture, width, height) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(texture.image, 0, 0, width, height);
            const newTexture = new THREE.CanvasTexture(canvas);
            newTexture.colorSpace = texture.colorSpace;
            newTexture.wrapS = texture.wrapS;
            newTexture.wrapT = texture.wrapT;
            newTexture.minFilter = texture.minFilter;
            newTexture.magFilter = texture.magFilter;
            resolve(newTexture);
        });
    }
    /**
     * Apply general optimizations to texture
     */
    applyOptimizations(texture) {
        // Enable mipmaps for better quality at distance
        if (this.options.enableMipmaps) {
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
        }
        // Set anisotropic filtering (improves quality at angles)
        texture.anisotropy = 4; // Conservative value for compatibility
    }
    /**
     * Get recommended texture size for device
     */
    getRecommendedSize() {
        // Mobile devices
        if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            return Math.min(2048, this.maxGPUTextureSize);
        }
        // Desktop with low-end GPU
        if (this.maxGPUTextureSize < 4096) {
            return this.maxGPUTextureSize;
        }
        // Desktop with good GPU
        return Math.min(4096, this.maxGPUTextureSize);
    }
    /**
     * Estimate memory usage for texture
     */
    estimateMemoryUsage(width, height, mipmaps = true) {
        const bytesPerPixel = 4; // RGBA
        let totalBytes = width * height * bytesPerPixel;
        if (mipmaps) {
            // Mipmaps add ~33% more memory
            totalBytes *= 1.33;
        }
        return totalBytes;
    }
    /**
     * Get optimization stats
     */
    getStats() {
        return {
            maxGPUSize: this.maxGPUTextureSize,
            maxConfiguredSize: this.options.maxTextureSize,
            recommendedSize: this.getRecommendedSize(),
        };
    }
}
//# sourceMappingURL=TextureOptimizer.js.map