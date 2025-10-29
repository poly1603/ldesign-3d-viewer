/**
 * 渐进式纹理加载器
 * 先加载低分辨率预览，然后逐步加载高清版本
 */
import * as THREE from 'three';
import { logger } from '../core/Logger';
export class ProgressiveTextureLoader {
    constructor() {
        this.currentTexture = null;
        this.loader = new THREE.TextureLoader();
    }
    /**
     * 加载纹理（渐进式）
     */
    async load(options) {
        const { previewUrl, fullUrl, maxSize = 4096, generateMipmaps = true, onProgress, cancellationToken, } = options;
        try {
            // 如果有预览图，先加载预览图
            if (previewUrl) {
                logger.debug('Loading preview texture');
                const previewTexture = await this.loadSingle(previewUrl, {
                    onProgress: progress => onProgress?.('preview', progress),
                    cancellationToken,
                });
                cancellationToken?.throwIfCancelled();
                // 配置预览纹理
                this.configureTexture(previewTexture, maxSize, generateMipmaps);
                this.currentTexture = previewTexture;
                logger.debug('Preview texture loaded, loading full resolution');
            }
            // 加载完整分辨率
            const fullTexture = await this.loadSingle(fullUrl, {
                onProgress: progress => onProgress?.('full', progress),
                cancellationToken,
            });
            cancellationToken?.throwIfCancelled();
            // 配置完整纹理
            this.configureTexture(fullTexture, maxSize, generateMipmaps);
            // 如果之前有预览纹理，释放它
            if (this.currentTexture && this.currentTexture !== fullTexture) {
                this.currentTexture.dispose();
            }
            this.currentTexture = fullTexture;
            logger.info('Full resolution texture loaded');
            return fullTexture;
        }
        catch (error) {
            logger.error('Progressive texture loading failed', error);
            throw error;
        }
    }
    /**
     * 加载单个纹理
     */
    loadSingle(url, options) {
        return new Promise((resolve, reject) => {
            const { onProgress, cancellationToken } = options;
            // 检查取消
            if (cancellationToken?.isCancelled) {
                reject(new Error('Loading cancelled'));
                return;
            }
            const xhr = new XMLHttpRequest();
            let texture;
            const cleanup = () => {
                xhr.abort();
            };
            // 注册取消回调
            cancellationToken?.onCancel(cleanup);
            this.loader.load(url, (loadedTexture) => {
                texture = loadedTexture;
                resolve(texture);
            }, (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress?.(progress);
                }
            }, (error) => {
                reject(new Error(`Failed to load texture: ${error}`));
            });
        });
    }
    /**
     * 配置纹理属性
     */
    configureTexture(texture, maxSize, generateMipmaps) {
        texture.generateMipmaps = generateMipmaps;
        texture.minFilter = generateMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        // 如果图像超过最大尺寸，降级
        if (texture.image) {
            const width = texture.image.width || 0;
            const height = texture.image.height || 0;
            if (width > maxSize || height > maxSize) {
                logger.warn(`Texture size (${width}x${height}) exceeds max size (${maxSize})`);
                // 这里可以添加图像缩放逻辑
            }
        }
    }
    /**
     * 生成预览 URL（如果服务器不提供）
     * 通过在 URL 中添加尺寸参数
     */
    static generatePreviewUrl(fullUrl, previewWidth = 256) {
        const url = new URL(fullUrl, window.location.href);
        // 尝试常见的图片服务参数模式
        // 这需要根据实际的图片服务调整
        // 示例: ?width=256
        url.searchParams.set('width', previewWidth.toString());
        return url.toString();
    }
    /**
     * 从 Blob 创建纹理
     */
    async loadFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            this.loader.load(url, (texture) => {
                URL.revokeObjectURL(url);
                resolve(texture);
            }, undefined, (error) => {
                URL.revokeObjectURL(url);
                reject(error);
            });
        });
    }
    /**
     * 使用 Canvas 缩放图像
     */
    static async downscaleImage(image, targetWidth, targetHeight) {
        // 使用 createImageBitmap 进行高质量缩放
        return createImageBitmap(image, {
            resizeWidth: targetWidth,
            resizeHeight: targetHeight,
            resizeQuality: 'high',
        });
    }
    /**
     * 清理当前纹理
     */
    dispose() {
        if (this.currentTexture) {
            this.currentTexture.dispose();
            this.currentTexture = null;
        }
    }
}
/**
 * 多级纹理加载器（LOD）
 * 支持加载多个分辨率级别
 */
export class LODTextureLoader {
    constructor() {
        this.textures = new Map();
        this.loader = new THREE.TextureLoader();
    }
    /**
     * 加载多级纹理
     * @param levels - 纹理 URL 数组，按分辨率从低到高
     */
    async loadLevels(levels, options = {}) {
        const { onProgress, cancellationToken } = options;
        for (let i = 0; i < levels.length; i++) {
            cancellationToken?.throwIfCancelled();
            logger.debug(`Loading LOD level ${i}`);
            const texture = await this.loadSingle(levels[i], {
                onProgress: progress => onProgress?.(i, progress),
                cancellationToken,
            });
            this.textures.set(i, texture);
        }
        logger.info(`Loaded ${levels.length} LOD levels`);
        return this.textures;
    }
    /**
     * 获取指定级别的纹理
     */
    getLevel(level) {
        return this.textures.get(level);
    }
    /**
     * 根据距离选择合适的LOD级别
     */
    selectLevel(distance, maxDistance) {
        const normalizedDistance = distance / maxDistance;
        const level = Math.floor(normalizedDistance * (this.textures.size - 1));
        return this.textures.get(Math.min(level, this.textures.size - 1));
    }
    /**
     * 加载单个纹理
     */
    loadSingle(url, options) {
        return new Promise((resolve, reject) => {
            const { onProgress, cancellationToken } = options;
            if (cancellationToken?.isCancelled) {
                reject(new Error('Loading cancelled'));
                return;
            }
            this.loader.load(url, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                resolve(texture);
            }, (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress?.(progress);
                }
            }, error => reject(error));
        });
    }
    /**
     * 清理所有纹理
     */
    dispose() {
        this.textures.forEach(texture => texture.dispose());
        this.textures.clear();
    }
}
//# sourceMappingURL=ProgressiveTextureLoader.js.map