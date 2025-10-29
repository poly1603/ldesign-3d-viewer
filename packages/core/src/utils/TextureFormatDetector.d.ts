/**
 * 纹理格式检测器
 * 检测浏览器支持的图像格式和GPU压缩纹理格式
 * 自动选择最优格式以提升加载速度和降低内存占用
 */
export interface FormatSupport {
    webp: boolean;
    avif: boolean;
    basis: boolean;
    ktx2: boolean;
    astc: boolean;
    etc2: boolean;
    s3tc: boolean;
    pvrtc: boolean;
}
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png';
export type CompressedFormat = 'basis' | 'ktx2' | 'astc' | 'etc2' | 's3tc' | 'pvrtc' | 'none';
export declare class TextureFormatDetector {
    private static instance;
    private support;
    private gl;
    private constructor();
    static getInstance(): TextureFormatDetector;
    /**
     * 检测所有支持的格式
     */
    private detectFormats;
    /**
     * 检测 WebP 支持
     */
    private detectWebP;
    /**
     * 检测 AVIF 支持
     */
    private detectAVIF;
    /**
     * 检测 GPU 压缩纹理格式
     */
    private detectGPUFormats;
    /**
     * 获取最佳图像格式
     * 优先级: AVIF > WebP > JPEG
     */
    getBestImageFormat(): ImageFormat;
    /**
     * 获取最佳压缩格式
     */
    getBestCompressedFormat(): CompressedFormat;
    /**
     * 获取格式支持信息
     */
    getSupport(): FormatSupport;
    /**
     * 检查特定格式是否支持
     */
    isSupported(format: keyof FormatSupport): boolean;
    /**
     * 生成带格式后缀的URL
     * 例如: image.jpg -> image.webp
     */
    generateOptimalUrl(baseUrl: string): string;
    /**
     * 生成降级格式列表
     * 用于 <picture> 标签或多格式请求
     */
    getFallbackFormats(baseUrl: string): string[];
    /**
     * 获取设备能力摘要
     */
    getCapabilitySummary(): string;
    /**
     * 获取推荐的压缩比
     */
    getRecommendedCompressionRatio(): number;
    /**
     * 估算格式带来的文件大小节省
     */
    estimateSavings(originalSize: number, _fromFormat?: ImageFormat): {
        format: ImageFormat;
        estimatedSize: number;
        savingsPercent: number;
    };
}
export declare const formatDetector: TextureFormatDetector;
//# sourceMappingURL=TextureFormatDetector.d.ts.map