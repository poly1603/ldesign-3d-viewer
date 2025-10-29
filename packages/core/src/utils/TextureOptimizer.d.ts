/**
 * Texture optimization and compression system
 * Automatically downgrades textures based on device capabilities
 */
import * as THREE from 'three';
export interface TextureOptimizationOptions {
    maxTextureSize?: number;
    compressionQuality?: number;
    enableMipmaps?: boolean;
    autoDowngrade?: boolean;
}
export declare class TextureOptimizer {
    private options;
    private maxGPUTextureSize;
    constructor(options?: TextureOptimizationOptions);
    /**
     * Detect maximum GPU texture size
     */
    private detectMaxTextureSize;
    /**
     * Optimize texture
     */
    optimize(texture: THREE.Texture): Promise<THREE.Texture>;
    /**
     * Resize texture to specified dimensions
     */
    private resizeTexture;
    /**
     * Apply general optimizations to texture
     */
    private applyOptimizations;
    /**
     * Get recommended texture size for device
     */
    getRecommendedSize(): number;
    /**
     * Estimate memory usage for texture
     */
    estimateMemoryUsage(width: number, height: number, mipmaps?: boolean): number;
    /**
     * Get optimization stats
     */
    getStats(): {
        maxGPUSize: number;
        maxConfiguredSize: number;
        recommendedSize: number;
    };
}
//# sourceMappingURL=TextureOptimizer.d.ts.map