/**
 * 实时滤镜系统 - 为全景图像添加各种视觉滤镜效果
 * 支持：黑白、复古、暖色、冷色、高对比度等多种预设滤镜
 */
import * as THREE from 'three';
export declare enum FilterPreset {
    NONE = "none",
    GRAYSCALE = "grayscale",
    SEPIA = "sepia",
    WARM = "warm",
    COOL = "cool",
    VINTAGE = "vintage",
    HIGH_CONTRAST = "highContrast",
    SOFT = "soft",
    VIVID = "vivid",
    NOIR = "noir",
    SUNSET = "sunset",
    MOONLIGHT = "moonlight"
}
export interface FilterSettings {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    temperature?: number;
    tint?: number;
    vignette?: number;
    grain?: number;
}
export declare class Filters {
    private material;
    private settings;
    private currentPreset;
    constructor();
    /**
     * 创建滤镜材质
     */
    private createFilterMaterial;
    /**
     * 应用滤镜到材质
     */
    applyToMaterial(material: THREE.Material): void;
    /**
     * 应用预设滤镜
     */
    applyPreset(preset: FilterPreset): void;
    /**
     * 设置滤镜参数
     */
    setSettings(settings: Partial<FilterSettings>): void;
    /**
     * 获取当前设置
     */
    getSettings(): Readonly<FilterSettings>;
    /**
     * 获取当前预设
     */
    getCurrentPreset(): FilterPreset;
    /**
     * 更新着色器uniforms
     */
    private updateUniforms;
    /**
     * 更新时间（用于动画效果，如胶片颗粒）
     */
    updateTime(time: number): void;
    /**
     * 重置所有滤镜
     */
    reset(): void;
    /**
     * 获取滤镜材质
     */
    getMaterial(): THREE.ShaderMaterial;
    /**
     * 获取所有可用的预设
     */
    static getAvailablePresets(): FilterPreset[];
    /**
     * 获取预设的描述
     */
    static getPresetDescription(preset: FilterPreset): string;
    /**
     * 销毁滤镜
     */
    dispose(): void;
}
//# sourceMappingURL=Filters.d.ts.map