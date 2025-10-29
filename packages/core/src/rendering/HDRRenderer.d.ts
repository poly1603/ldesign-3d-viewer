/**
 * HDR 渲染器
 * 支持 HDR 纹理、Tone Mapping 和高级色彩处理
 */
import * as THREE from 'three';
export type ToneMappingType = 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces' | 'custom';
export interface HDROptions {
    /** Tone mapping 类型 */
    toneMapping?: ToneMappingType;
    /** 曝光度 */
    exposure?: number;
    /** 白点 */
    whitePoint?: number;
    /** 启用 Bloom 效果 */
    enableBloom?: boolean;
    /** Bloom 强度 */
    bloomStrength?: number;
    /** Bloom 半径 */
    bloomRadius?: number;
    /** Bloom 阈值 */
    bloomThreshold?: number;
}
export declare class HDRRenderer {
    private renderer;
    private scene;
    private options;
    private rgbeLoader;
    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, options?: HDROptions);
    /**
     * 加载 HDR 纹理（RGBE 格式）
     */
    loadHDR(url: string): Promise<THREE.DataTexture>;
    /**
     * 应用 Tone Mapping
     */
    private applyToneMapping;
    /**
     * 设置 Tone Mapping 类型
     */
    setToneMapping(type: ToneMappingType): void;
    /**
     * 设置曝光度
     */
    setExposure(exposure: number): void;
    /**
     * 获取当前曝光度
     */
    getExposure(): number;
    /**
     * 创建自定义 Tone Mapping Shader
     */
    static createCustomToneMappingShader(): string;
    /**
     * 应用 HDR 环境贴图
     */
    applyEnvironmentMap(texture: THREE.Texture): void;
    /**
     * 移除环境贴图
     */
    removeEnvironmentMap(): void;
    /**
     * 创建 PBR 材质（用于 HDR 环境）
     */
    static createPBRMaterial(options?: {
        color?: THREE.ColorRepresentation;
        metalness?: number;
        roughness?: number;
        envMapIntensity?: number;
    }): THREE.MeshStandardMaterial;
    /**
     * 获取选项
     */
    getOptions(): Readonly<Required<HDROptions>>;
    /**
     * 更新选项
     */
    updateOptions(options: Partial<HDROptions>): void;
    /**
     * 销毁
     */
    dispose(): void;
}
/**
 * 色彩分级（Color Grading）
 */
export declare class ColorGrading {
    private material;
    constructor();
    /**
     * 创建色彩分级着色器材质
     */
    createMaterial(options?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        hue?: number;
        temperature?: number;
        tint?: number;
    }): THREE.ShaderMaterial;
    /**
     * 顶点着色器
     */
    private getVertexShader;
    /**
     * 片元着色器
     */
    private getFragmentShader;
    /**
     * 更新参数
     */
    updateParameter(name: string, value: number): void;
    /**
     * 销毁
     */
    dispose(): void;
}
//# sourceMappingURL=HDRRenderer.d.ts.map