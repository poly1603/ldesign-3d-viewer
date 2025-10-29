/**
 * 纹理格式检测器
 * 检测浏览器支持的图像格式和GPU压缩纹理格式
 * 自动选择最优格式以提升加载速度和降低内存占用
 */
export class TextureFormatDetector {
    constructor() {
        this.gl = null;
        this.support = {
            webp: false,
            avif: false,
            basis: false,
            ktx2: false,
            astc: false,
            etc2: false,
            s3tc: false,
            pvrtc: false,
        };
        this.detectFormats();
    }
    static getInstance() {
        if (!TextureFormatDetector.instance) {
            TextureFormatDetector.instance = new TextureFormatDetector();
        }
        return TextureFormatDetector.instance;
    }
    /**
     * 检测所有支持的格式
     */
    async detectFormats() {
        // 检测图像格式
        await Promise.all([
            this.detectWebP(),
            this.detectAVIF(),
        ]);
        // 检测GPU压缩格式
        this.detectGPUFormats();
    }
    /**
     * 检测 WebP 支持
     */
    async detectWebP() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.support.webp = img.width > 0 && img.height > 0;
                resolve();
            };
            img.onerror = () => {
                this.support.webp = false;
                resolve();
            };
            img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
        });
    }
    /**
     * 检测 AVIF 支持
     */
    async detectAVIF() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.support.avif = img.width > 0 && img.height > 0;
                resolve();
            };
            img.onerror = () => {
                this.support.avif = false;
                resolve();
            };
            img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
    }
    /**
     * 检测 GPU 压缩纹理格式
     */
    detectGPUFormats() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl)
            return;
        this.gl = gl;
        const glCtx = gl;
        // S3TC (DXT) - 桌面常见
        const s3tc = glCtx.getExtension('WEBGL_compressed_texture_s3tc')
            || glCtx.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc')
            || glCtx.getExtension('MOZ_WEBGL_compressed_texture_s3tc');
        this.support.s3tc = !!s3tc;
        // PVRTC - iOS 设备
        const pvrtc = glCtx.getExtension('WEBGL_compressed_texture_pvrtc')
            || glCtx.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        this.support.pvrtc = !!pvrtc;
        // ETC2 - Android 设备（WebGL 2.0）
        if (gl instanceof WebGL2RenderingContext) {
            this.support.etc2 = true; // WebGL 2.0 强制支持
        }
        else {
            const etc = glCtx.getExtension('WEBGL_compressed_texture_etc');
            this.support.etc2 = !!etc;
        }
        // ASTC - 现代移动设备
        const astc = glCtx.getExtension('WEBGL_compressed_texture_astc');
        this.support.astc = !!astc;
        // Basis Universal 和 KTX2 需要额外的库支持
        // 这里只标记为潜在支持
        this.support.basis = true; // Basis 可以在运行时转码到其他格式
        this.support.ktx2 = true;
    }
    /**
     * 获取最佳图像格式
     * 优先级: AVIF > WebP > JPEG
     */
    getBestImageFormat() {
        if (this.support.avif)
            return 'avif';
        if (this.support.webp)
            return 'webp';
        return 'jpeg';
    }
    /**
     * 获取最佳压缩格式
     */
    getBestCompressedFormat() {
        // 优先使用 Basis Universal (可以转码到任何格式)
        if (this.support.basis)
            return 'basis';
        // 根据平台选择
        if (this.support.astc)
            return 'astc'; // 最佳质量
        if (this.support.etc2)
            return 'etc2'; // Android
        if (this.support.s3tc)
            return 's3tc'; // 桌面
        if (this.support.pvrtc)
            return 'pvrtc'; // iOS
        return 'none';
    }
    /**
     * 获取格式支持信息
     */
    getSupport() {
        return { ...this.support };
    }
    /**
     * 检查特定格式是否支持
     */
    isSupported(format) {
        return this.support[format];
    }
    /**
     * 生成带格式后缀的URL
     * 例如: image.jpg -> image.webp
     */
    generateOptimalUrl(baseUrl) {
        const format = this.getBestImageFormat();
        // 如果已经是最优格式，直接返回
        if (baseUrl.endsWith(`.${format}`)) {
            return baseUrl;
        }
        // 替换扩展名
        const lastDotIndex = baseUrl.lastIndexOf('.');
        if (lastDotIndex === -1)
            return baseUrl;
        const baseWithoutExt = baseUrl.substring(0, lastDotIndex);
        return `${baseWithoutExt}.${format}`;
    }
    /**
     * 生成降级格式列表
     * 用于 <picture> 标签或多格式请求
     */
    getFallbackFormats(baseUrl) {
        const formats = [];
        if (this.support.avif)
            formats.push('avif');
        if (this.support.webp)
            formats.push('webp');
        formats.push('jpeg');
        const lastDotIndex = baseUrl.lastIndexOf('.');
        if (lastDotIndex === -1)
            return [baseUrl];
        const baseWithoutExt = baseUrl.substring(0, lastDotIndex);
        return formats.map(fmt => `${baseWithoutExt}.${fmt}`);
    }
    /**
     * 获取设备能力摘要
     */
    getCapabilitySummary() {
        const imageFormats = [];
        if (this.support.avif)
            imageFormats.push('AVIF');
        if (this.support.webp)
            imageFormats.push('WebP');
        const gpuFormats = [];
        if (this.support.astc)
            gpuFormats.push('ASTC');
        if (this.support.etc2)
            gpuFormats.push('ETC2');
        if (this.support.s3tc)
            gpuFormats.push('S3TC');
        if (this.support.pvrtc)
            gpuFormats.push('PVRTC');
        return `Images: ${imageFormats.join(', ') || 'JPEG/PNG only'} | GPU: ${gpuFormats.join(', ') || 'None'}`;
    }
    /**
     * 获取推荐的压缩比
     */
    getRecommendedCompressionRatio() {
        const format = this.getBestImageFormat();
        switch (format) {
            case 'avif':
                return 0.75; // AVIF 压缩效率最高
            case 'webp':
                return 0.85; // WebP 次之
            default:
                return 0.90; // JPEG 保守一些
        }
    }
    /**
     * 估算格式带来的文件大小节省
     */
    estimateSavings(originalSize, _fromFormat = 'jpeg') {
        const bestFormat = this.getBestImageFormat();
        const compressionRatios = {
            avif: 0.40, // AVIF 通常可压缩到 40% 原大小
            webp: 0.65, // WebP 约 65%
            jpeg: 1.00, // JPEG 基准
            png: 1.20, // PNG 通常比 JPEG 大
        };
        const estimatedSize = originalSize * compressionRatios[bestFormat];
        const savingsPercent = ((originalSize - estimatedSize) / originalSize) * 100;
        return {
            format: bestFormat,
            estimatedSize,
            savingsPercent,
        };
    }
}
// 导出单例实例
export const formatDetector = TextureFormatDetector.getInstance();
//# sourceMappingURL=TextureFormatDetector.js.map