/**
 * 设备能力检测与性能评分系统
 * 自动检测设备性能并提供质量降级建议
 */
export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
    osVersion: string;
    browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
    browserVersion: string;
    cpuCores: number;
    memory: number;
    gpu: string;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    connectionType: string;
    effectiveType: string;
}
export interface PerformanceScore {
    overall: number;
    cpu: number;
    gpu: number;
    memory: number;
    network: number;
    tier: 'high' | 'medium' | 'low';
}
export interface QualitySettings {
    textureSize: number;
    pixelRatio: number;
    enablePostProcessing: boolean;
    enableShadows: boolean;
    enableReflections: boolean;
    antialiasing: 'none' | 'fxaa' | 'smaa' | 'msaa';
    maxFPS: number;
    renderOnDemand: boolean;
}
export declare class DeviceCapability {
    private static instance;
    private deviceInfo;
    private performanceScore;
    private gl;
    private constructor();
    static getInstance(): DeviceCapability;
    /**
     * 检测设备信息
     */
    private detectDevice;
    /**
     * 计算性能评分
     */
    private calculatePerformance;
    /**
     * CPU 评分 (0-100)
     */
    private scoreCPU;
    /**
     * GPU 评分 (0-100)
     */
    private scoreGPU;
    /**
     * 内存评分 (0-100)
     */
    private scoreMemory;
    /**
     * 网络评分 (0-100)
     */
    private scoreNetwork;
    /**
     * 获取推荐的质量设置
     */
    getRecommendedSettings(): QualitySettings;
    /**
     * 获取设备信息
     */
    getDeviceInfo(): DeviceInfo;
    /**
     * 获取性能评分
     */
    getPerformanceScore(): PerformanceScore;
    /**
     * 是否为低端设备
     */
    isLowEndDevice(): boolean;
    /**
     * 是否为高端设备
     */
    isHighEndDevice(): boolean;
    /**
     * 获取推荐的纹理大小
     */
    getRecommendedTextureSize(): number;
    /**
     * 获取推荐的像素比
     */
    getRecommendedPixelRatio(): number;
    /**
     * 生成设备报告
     */
    generateReport(): string;
    /**
     * 检测是否支持 WebGL 2
     */
    supportsWebGL2(): boolean;
    /**
     * 获取最大纹理尺寸
     */
    getMaxTextureSize(): number;
    /**
     * 检测是否支持高分辨率纹理
     */
    supportsHighResTextures(): boolean;
}
export declare const deviceCapability: DeviceCapability;
//# sourceMappingURL=DeviceCapability.d.ts.map