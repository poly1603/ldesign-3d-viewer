/**
 * Color adjustment system
 * Adjust brightness, contrast, saturation, hue, etc.
 */
import * as THREE from 'three';
export interface ColorSettings {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    exposure: number;
    temperature: number;
}
export declare class ColorAdjustment {
    private settings;
    private material;
    constructor();
    private createMaterial;
    /**
     * Apply settings to material
     */
    applyToMaterial(material: THREE.Material): void;
    /**
     * Set brightness (-1 to 1)
     */
    setBrightness(value: number): void;
    /**
     * Set contrast (-1 to 1)
     */
    setContrast(value: number): void;
    /**
     * Set saturation (-1 to 1)
     */
    setSaturation(value: number): void;
    /**
     * Set hue (0 to 360)
     */
    setHue(value: number): void;
    /**
     * Set exposure (-2 to 2)
     */
    setExposure(value: number): void;
    /**
     * Set temperature (-1 to 1, cool to warm)
     */
    setTemperature(value: number): void;
    /**
     * Reset all settings to default
     */
    reset(): void;
    /**
     * Get current settings
     */
    getSettings(): ColorSettings;
    /**
     * Set all settings at once
     */
    setSettings(settings: Partial<ColorSettings>): void;
    private updateUniforms;
    dispose(): void;
}
//# sourceMappingURL=ColorAdjustment.d.ts.map