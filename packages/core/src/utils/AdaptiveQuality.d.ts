import type { PerformanceMonitor } from './PerformanceMonitor';
export interface QualitySettings {
    pixelRatio: number;
    textureQuality: number;
    shadowQuality: 'off' | 'low' | 'medium' | 'high';
    antialiasing: boolean;
    renderScale: number;
}
export declare class AdaptiveQuality {
    private performanceMonitor;
    private currentSettings;
    private targetFps;
    private enabled;
    private adjustmentInterval;
    private lastAdjustment;
    private onChange?;
    private static readonly PRESETS;
    constructor(performanceMonitor: PerformanceMonitor, initialQuality?: 'ultra' | 'high' | 'medium' | 'low', onChange?: (settings: QualitySettings) => void);
    /**
     * Update adaptive quality (call every frame)
     */
    update(): void;
    /**
     * Decrease rendering quality
     */
    private decreaseQuality;
    /**
     * Increase rendering quality
     */
    private increaseQuality;
    /**
     * Get current quality settings
     */
    getSettings(): QualitySettings;
    /**
     * Set quality preset
     */
    setPreset(preset: 'ultra' | 'high' | 'medium' | 'low'): void;
    /**
     * Enable/disable adaptive quality
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if adaptive quality is enabled
     */
    isEnabled(): boolean;
}
//# sourceMappingURL=AdaptiveQuality.d.ts.map