/**
 * 渐进式纹理加载器
 * 先加载低分辨率预览，然后逐步加载高清版本
 */
import * as THREE from 'three';
import type { CancellationToken } from './helpers';
export interface ProgressiveLoadOptions {
    /** 预览图 URL（低分辨率） */
    previewUrl?: string;
    /** 主图 URL（高分辨率） */
    fullUrl: string;
    /** 最大纹理尺寸 */
    maxSize?: number;
    /** 是否生成 mipmaps */
    generateMipmaps?: boolean;
    /** 加载进度回调 */
    onProgress?: (stage: 'preview' | 'full', progress: number) => void;
    /** 取消令牌 */
    cancellationToken?: CancellationToken;
}
export declare class ProgressiveTextureLoader {
    private loader;
    private currentTexture;
    constructor();
    /**
     * 加载纹理（渐进式）
     */
    load(options: ProgressiveLoadOptions): Promise<THREE.Texture>;
    /**
     * 加载单个纹理
     */
    private loadSingle;
    /**
     * 配置纹理属性
     */
    private configureTexture;
    /**
     * 生成预览 URL（如果服务器不提供）
     * 通过在 URL 中添加尺寸参数
     */
    static generatePreviewUrl(fullUrl: string, previewWidth?: number): string;
    /**
     * 从 Blob 创建纹理
     */
    loadFromBlob(blob: Blob): Promise<THREE.Texture>;
    /**
     * 使用 Canvas 缩放图像
     */
    static downscaleImage(image: HTMLImageElement | ImageBitmap, targetWidth: number, targetHeight: number): Promise<ImageBitmap>;
    /**
     * 清理当前纹理
     */
    dispose(): void;
}
/**
 * 多级纹理加载器（LOD）
 * 支持加载多个分辨率级别
 */
export declare class LODTextureLoader {
    private loader;
    private textures;
    constructor();
    /**
     * 加载多级纹理
     * @param levels - 纹理 URL 数组，按分辨率从低到高
     */
    loadLevels(levels: string[], options?: {
        onProgress?: (level: number, progress: number) => void;
        cancellationToken?: CancellationToken;
    }): Promise<Map<number, THREE.Texture>>;
    /**
     * 获取指定级别的纹理
     */
    getLevel(level: number): THREE.Texture | undefined;
    /**
     * 根据距离选择合适的LOD级别
     */
    selectLevel(distance: number, maxDistance: number): THREE.Texture | undefined;
    /**
     * 加载单个纹理
     */
    private loadSingle;
    /**
     * 清理所有纹理
     */
    dispose(): void;
}
//# sourceMappingURL=ProgressiveTextureLoader.d.ts.map