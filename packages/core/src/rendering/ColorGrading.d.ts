/**
 * 色彩分级系统
 * 提供电影级调色预设和自定义LUT支持
 */
import * as THREE from 'three';
export interface ColorGradingSettings {
    brightness: number;
    contrast: number;
    saturation: number;
    exposure: number;
    temperature: number;
    tint: number;
    highlights: number;
    shadows: number;
    whites: number;
    blacks: number;
    hue: number;
    vignetteAmount: number;
    vignetteSmoothing: number;
}
export type ColorGradingPreset = 'natural' | 'vivid' | 'warm' | 'cool' | 'cinematic' | 'vintage' | 'dramatic' | 'sunset' | 'moonlight' | 'noir';
export declare class ColorGrading {
    private settings;
    private lutTexture;
    private uniforms;
    private static readonly defaultSettings;
    constructor(settings?: Partial<ColorGradingSettings>);
    /**
     * 创建 uniforms
     */
    private createUniforms;
    /**
     * 获取 shader 代码
     */
    getShaderCode(): string;
    /**
     * 应用预设
     */
    applyPreset(preset: ColorGradingPreset): void;
    /**
     * 更新设置
     */
    updateSettings(settings: Partial<ColorGradingSettings>): void;
    /**
     * 更新 uniforms
     */
    private updateUniforms;
    /**
     * 获取当前设置
     */
    getSettings(): ColorGradingSettings;
    /**
     * 获取 uniforms
     */
    getUniforms(): Record<string, THREE.IUniform>;
    /**
     * 加载 LUT 纹理
     */
    loadLUT(url: string): Promise<void>;
    /**
     * 创建 3D LUT
     */
    create3DLUT(size?: number): THREE.DataTexture;
    /**
     * 重置为默认值
     */
    reset(): void;
    /**
     * 导出设置
     */
    exportSettings(): ColorGradingSettings;
    /**
     * 导入设置
     */
    importSettings(settings: ColorGradingSettings): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=ColorGrading.d.ts.map