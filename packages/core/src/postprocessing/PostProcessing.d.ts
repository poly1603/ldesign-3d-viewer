/**
 * 后处理效果系统
 * 使用 Three.js EffectComposer 实现各种后处理效果
 */
import * as THREE from 'three';
export interface PostProcessingOptions {
    /** 启用抗锯齿 */
    antialiasing?: 'none' | 'fxaa' | 'smaa';
    /** 启用 Bloom 光晕 */
    bloom?: {
        enabled: boolean;
        strength?: number;
        radius?: number;
        threshold?: number;
    };
    /** 启用景深 */
    depthOfField?: {
        enabled: boolean;
        focus?: number;
        aperture?: number;
        maxBlur?: number;
    };
    /** 启用色彩调整 */
    colorAdjustment?: {
        enabled: boolean;
        brightness?: number;
        contrast?: number;
        saturation?: number;
    };
    /** 启用晕影 */
    vignette?: {
        enabled: boolean;
        offset?: number;
        darkness?: number;
    };
}
export declare class PostProcessing {
    private renderer;
    private scene;
    private camera;
    private composer;
    private renderPass;
    private bloomPass;
    private bokehPass;
    private fxaaPass;
    private smaaPass;
    private colorAdjustmentPass;
    private vignettePass;
    private options;
    private enabled;
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, options?: PostProcessingOptions);
    /**
     * 初始化后处理
     */
    initialize(): void;
    /**
     * 添加 Bloom 效果
     */
    private addBloom;
    /**
     * 添加景深效果
     */
    private addDepthOfField;
    /**
     * 添加色彩调整
     */
    private addColorAdjustment;
    /**
     * 添加晕影效果
     */
    private addVignette;
    /**
     * 添加抗锯齿
     */
    private addAntialiasing;
    /**
     * 渲染
     */
    render(deltaTime?: number): void;
    /**
     * 启用/禁用后处理
     */
    setEnabled(enabled: boolean): void;
    /**
     * 是否启用
     */
    isEnabled(): boolean;
    /**
     * 设置 Bloom 参数
     */
    setBloomParams(params: {
        strength?: number;
        radius?: number;
        threshold?: number;
    }): void;
    /**
     * 设置景深参数
     */
    setDepthOfFieldParams(params: {
        focus?: number;
        aperture?: number;
        maxBlur?: number;
    }): void;
    /**
     * 设置色彩调整参数
     */
    setColorAdjustmentParams(params: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
    }): void;
    /**
     * 窗口大小变化时调用
     */
    resize(width: number, height: number): void;
    /**
     * 获取当前配置
     */
    getOptions(): Readonly<Required<PostProcessingOptions>>;
    /**
     * 销毁
     */
    dispose(): void;
}
//# sourceMappingURL=PostProcessing.d.ts.map