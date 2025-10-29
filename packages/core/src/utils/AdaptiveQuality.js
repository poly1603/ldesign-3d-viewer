/**
 * Adaptive quality system
 * Automatically adjusts rendering quality based on performance
 */
import { logger } from '../core/Logger';
export class AdaptiveQuality {
    constructor(performanceMonitor, initialQuality = 'high', onChange) {
        this.targetFps = 55;
        this.enabled = true;
        this.adjustmentInterval = 2000; // Check every 2 seconds
        this.lastAdjustment = 0;
        this.performanceMonitor = performanceMonitor;
        this.currentSettings = { ...AdaptiveQuality.PRESETS[initialQuality] };
        this.onChange = onChange;
    }
    /**
     * Update adaptive quality (call every frame)
     */
    update() {
        if (!this.enabled)
            return;
        const now = Date.now();
        if (now - this.lastAdjustment < this.adjustmentInterval) {
            return;
        }
        this.lastAdjustment = now;
        const stats = this.performanceMonitor.getStats();
        const fps = stats.fps;
        // Adjust quality based on FPS
        if (fps < this.targetFps - 10) {
            // Performance is poor, reduce quality
            this.decreaseQuality();
        }
        else if (fps > this.targetFps + 5) {
            // Performance is good, try to increase quality
            this.increaseQuality();
        }
    }
    /**
     * Decrease rendering quality
     */
    decreaseQuality() {
        let changed = false;
        // Reduce in order of impact on performance
        if (this.currentSettings.pixelRatio > 1.0) {
            this.currentSettings.pixelRatio = Math.max(1.0, this.currentSettings.pixelRatio - 0.25);
            changed = true;
        }
        else if (this.currentSettings.renderScale > 0.75) {
            this.currentSettings.renderScale = Math.max(0.75, this.currentSettings.renderScale - 0.1);
            changed = true;
        }
        else if (this.currentSettings.antialiasing) {
            this.currentSettings.antialiasing = false;
            changed = true;
        }
        else if (this.currentSettings.textureQuality > 0.5) {
            this.currentSettings.textureQuality = Math.max(0.5, this.currentSettings.textureQuality - 0.1);
            changed = true;
        }
        if (changed) {
            logger.debug('[AdaptiveQuality] Quality decreased', this.currentSettings);
            this.onChange?.(this.currentSettings);
        }
    }
    /**
     * Increase rendering quality
     */
    increaseQuality() {
        let changed = false;
        // Increase in reverse order
        if (this.currentSettings.textureQuality < 1.0) {
            this.currentSettings.textureQuality = Math.min(1.0, this.currentSettings.textureQuality + 0.1);
            changed = true;
        }
        else if (!this.currentSettings.antialiasing) {
            this.currentSettings.antialiasing = true;
            changed = true;
        }
        else if (this.currentSettings.renderScale < 1.0) {
            this.currentSettings.renderScale = Math.min(1.0, this.currentSettings.renderScale + 0.1);
            changed = true;
        }
        else if (this.currentSettings.pixelRatio < 2.0) {
            this.currentSettings.pixelRatio = Math.min(2.0, this.currentSettings.pixelRatio + 0.25);
            changed = true;
        }
        if (changed) {
            logger.debug('[AdaptiveQuality] Quality increased', this.currentSettings);
            this.onChange?.(this.currentSettings);
        }
    }
    /**
     * Get current quality settings
     */
    getSettings() {
        return { ...this.currentSettings };
    }
    /**
     * Set quality preset
     */
    setPreset(preset) {
        this.currentSettings = { ...AdaptiveQuality.PRESETS[preset] };
        this.onChange?.(this.currentSettings);
    }
    /**
     * Enable/disable adaptive quality
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Check if adaptive quality is enabled
     */
    isEnabled() {
        return this.enabled;
    }
}
// Quality presets
AdaptiveQuality.PRESETS = {
    ultra: {
        pixelRatio: 2,
        textureQuality: 1.0,
        shadowQuality: 'high',
        antialiasing: true,
        renderScale: 1.0,
    },
    high: {
        pixelRatio: 1.5,
        textureQuality: 0.9,
        shadowQuality: 'medium',
        antialiasing: true,
        renderScale: 1.0,
    },
    medium: {
        pixelRatio: 1.0,
        textureQuality: 0.75,
        shadowQuality: 'low',
        antialiasing: true,
        renderScale: 0.9,
    },
    low: {
        pixelRatio: 1.0,
        textureQuality: 0.5,
        shadowQuality: 'off',
        antialiasing: false,
        renderScale: 0.75,
    },
};
//# sourceMappingURL=AdaptiveQuality.js.map