/**
 * Performance monitoring system
 * Tracks FPS, frame time, memory usage, and provides adaptive quality recommendations
 */
export interface PerformanceStats {
    fps: number;
    frameTime: number;
    memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
    renderCalls: number;
    triangles: number;
}
export interface PerformanceWarning {
    type: 'low_fps' | 'high_memory' | 'slow_frame';
    message: string;
    value: number;
    threshold: number;
}
export declare class PerformanceMonitor {
    private fps;
    private frameTime;
    private lastTime;
    private frames;
    private fpsUpdateInterval;
    private lastFpsUpdate;
    private frameTimeHistory;
    private historySize;
    private fpsThreshold;
    private frameTimeThreshold;
    private memoryThreshold;
    private onWarning?;
    private renderCalls;
    private triangles;
    constructor(options?: {
        fpsThreshold?: number;
        onWarning?: (warning: PerformanceWarning) => void;
    });
    /**
     * Update performance metrics
     * Should be called every frame
     */
    update(): void;
    /**
     * Get current performance statistics
     */
    getStats(): PerformanceStats;
    /**
     * Get average frame time from history
     */
    private getAverageFrameTime;
    /**
     * Check for performance issues and trigger warnings
     */
    private checkPerformance;
    /**
     * Update render statistics
     */
    updateRenderStats(renderCalls: number, triangles: number): void;
    /**
     * Get recommended quality level based on performance
     * Returns a value between 0 (lowest) and 1 (highest)
     */
    getRecommendedQuality(): number;
    /**
     * Check if performance is good
     */
    isPerformanceGood(): boolean;
    /**
     * Reset statistics
     */
    reset(): void;
    /**
     * Create a visual performance overlay
     */
    createOverlay(container: HTMLElement): HTMLElement;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map