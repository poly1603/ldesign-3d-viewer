export class PerformanceMonitor {
    constructor(options) {
        this.fps = 60;
        this.frameTime = 0;
        this.lastTime = performance.now();
        this.frames = 0;
        this.fpsUpdateInterval = 1000; // Update FPS every second
        this.lastFpsUpdate = performance.now();
        // Frame time history for smoothing
        this.frameTimeHistory = [];
        this.historySize = 60;
        // Performance thresholds
        this.fpsThreshold = 30;
        this.frameTimeThreshold = 33; // ~30fps
        this.memoryThreshold = 0.9; // 90% of heap limit
        // Stats tracking
        this.renderCalls = 0;
        this.triangles = 0;
        if (options?.fpsThreshold) {
            this.fpsThreshold = options.fpsThreshold;
            this.frameTimeThreshold = 1000 / options.fpsThreshold;
        }
        this.onWarning = options?.onWarning;
    }
    /**
     * Update performance metrics
     * Should be called every frame
     */
    update() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        // Update frame time
        this.frameTime = delta;
        this.frameTimeHistory.push(delta);
        if (this.frameTimeHistory.length > this.historySize) {
            this.frameTimeHistory.shift();
        }
        // Update FPS
        this.frames++;
        const timeSinceLastUpdate = now - this.lastFpsUpdate;
        if (timeSinceLastUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frames * 1000) / timeSinceLastUpdate);
            this.frames = 0;
            this.lastFpsUpdate = now;
            // Check for performance warnings
            this.checkPerformance();
        }
    }
    /**
     * Get current performance statistics
     */
    getStats() {
        const stats = {
            fps: this.fps,
            frameTime: this.getAverageFrameTime(),
            renderCalls: this.renderCalls,
            triangles: this.triangles,
        };
        // Add memory stats if available
        if (performance.memory) {
            const memory = performance.memory;
            stats.memory = {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit,
            };
        }
        return stats;
    }
    /**
     * Get average frame time from history
     */
    getAverageFrameTime() {
        if (this.frameTimeHistory.length === 0)
            return 0;
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeHistory.length;
    }
    /**
     * Check for performance issues and trigger warnings
     */
    checkPerformance() {
        if (!this.onWarning)
            return;
        // Check FPS
        if (this.fps < this.fpsThreshold) {
            this.onWarning({
                type: 'low_fps',
                message: `FPS below threshold (${this.fps} < ${this.fpsThreshold})`,
                value: this.fps,
                threshold: this.fpsThreshold,
            });
        }
        // Check frame time
        const avgFrameTime = this.getAverageFrameTime();
        if (avgFrameTime > this.frameTimeThreshold) {
            this.onWarning({
                type: 'slow_frame',
                message: `Frame time too high (${avgFrameTime.toFixed(2)}ms > ${this.frameTimeThreshold}ms)`,
                value: avgFrameTime,
                threshold: this.frameTimeThreshold,
            });
        }
        // Check memory if available
        if (performance.memory) {
            const memory = performance.memory;
            const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            if (memoryUsage > this.memoryThreshold) {
                this.onWarning({
                    type: 'high_memory',
                    message: `Memory usage high (${(memoryUsage * 100).toFixed(1)}%)`,
                    value: memoryUsage,
                    threshold: this.memoryThreshold,
                });
            }
        }
    }
    /**
     * Update render statistics
     */
    updateRenderStats(renderCalls, triangles) {
        this.renderCalls = renderCalls;
        this.triangles = triangles;
    }
    /**
     * Get recommended quality level based on performance
     * Returns a value between 0 (lowest) and 1 (highest)
     */
    getRecommendedQuality() {
        const targetFps = 60;
        const minFps = 30;
        // Quality based on FPS
        if (this.fps >= targetFps) {
            return 1.0;
        }
        else if (this.fps <= minFps) {
            return 0.5;
        }
        else {
            // Linear interpolation between min and target FPS
            return 0.5 + ((this.fps - minFps) / (targetFps - minFps)) * 0.5;
        }
    }
    /**
     * Check if performance is good
     */
    isPerformanceGood() {
        return this.fps >= this.fpsThreshold
            && this.getAverageFrameTime() <= this.frameTimeThreshold;
    }
    /**
     * Reset statistics
     */
    reset() {
        this.fps = 60;
        this.frameTime = 0;
        this.frames = 0;
        this.frameTimeHistory = [];
        this.lastTime = performance.now();
        this.lastFpsUpdate = performance.now();
    }
    /**
     * Create a visual performance overlay
     */
    createOverlay(container) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      min-width: 200px;
      pointer-events: none;
    `;
        const update = () => {
            const stats = this.getStats();
            const fpsColor = stats.fps >= 50 ? '#0f0' : stats.fps >= 30 ? '#ff0' : '#f00';
            let html = `
        <div style="color: ${fpsColor}">FPS: ${stats.fps}</div>
        <div>Frame: ${stats.frameTime.toFixed(2)}ms</div>
        <div>Calls: ${stats.renderCalls}</div>
        <div>Triangles: ${stats.triangles}</div>
      `;
            if (stats.memory) {
                const usedMB = (stats.memory.usedJSHeapSize / 1048576).toFixed(1);
                const limitMB = (stats.memory.jsHeapSizeLimit / 1048576).toFixed(1);
                html += `<div>Memory: ${usedMB}MB / ${limitMB}MB</div>`;
            }
            overlay.innerHTML = html;
            requestAnimationFrame(update);
        };
        update();
        container.appendChild(overlay);
        return overlay;
    }
}
//# sourceMappingURL=PerformanceMonitor.js.map