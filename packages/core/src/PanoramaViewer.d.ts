import type { CubemapImages, Hotspot, IPanoramaViewer, ViewLimits, ViewerOptions } from './types';
export declare class PanoramaViewer implements IPanoramaViewer {
    private container;
    private scene;
    private camera;
    private renderer;
    private sphere;
    private texture;
    private touchControls;
    private gyroscopeControls;
    private keyboardControls;
    private advancedGestureControls;
    private hotspotManager;
    private textureCache;
    private miniMap;
    private performanceMonitor;
    private adaptiveQuality;
    private imagePreloader;
    private colorAdjustment;
    private watermarkSystem;
    private cameraPathAnimation;
    private webWorkerLoader;
    private textureOptimizer;
    private performanceOverlay;
    private animationFrameId;
    private options;
    private isDisposed;
    private needsRender;
    private viewLimits;
    private isDragging;
    private previousMousePosition;
    private autoRotateAngle;
    private isTransitioning;
    private transitionOpacity;
    constructor(options: ViewerOptions);
    private setupEventListeners;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private onWheel;
    private rotateCamera;
    private onWindowResize;
    private onFullscreenChange;
    loadImage(url: string | CubemapImages, transition?: boolean): Promise<void>;
    private loadDirect;
    private loadWithTransition;
    private fadeTransition;
    private loadCubemap;
    private updateGeometry;
    enableAutoRotate(): void;
    disableAutoRotate(): void;
    reset(): void;
    enableGyroscope(): Promise<boolean>;
    disableGyroscope(): void;
    getRotation(): {
        x: number;
        y: number;
        z: number;
    };
    setRotation(x: number, y: number, z: number): void;
    addHotspot(hotspot: Hotspot): void;
    removeHotspot(id: string): void;
    getHotspots(): Hotspot[];
    enterFullscreen(): Promise<void>;
    exitFullscreen(): void;
    isFullscreen(): boolean;
    screenshot(width?: number, height?: number): string;
    setViewLimits(limits: ViewLimits | null): void;
    render(): void;
    showMiniMap(): void;
    hideMiniMap(): void;
    toggleMiniMap(): void;
    private requestRender;
    private animate;
    private animateOnDemand;
    private updateControls;
    private isMobileDevice;
    /**
     * Preload images for faster switching
     */
    preloadImages(urls: string[]): Promise<void>;
    /**
     * Animate camera along path
     */
    animateCameraPath(path: any[]): void;
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
     * Set exposure (-2 to 2)
     */
    setExposure(value: number): void;
    /**
     * Reset color adjustments
     */
    resetColorAdjustments(): void;
    /**
     * Show watermark
     */
    showWatermark(options?: any): void;
    /**
     * Hide watermark
     */
    hideWatermark(): void;
    /**
     * Get performance stats
     */
    getPerformanceStats(): any;
    /**
     * Toggle performance overlay
     */
    togglePerformanceOverlay(): void;
    /**
     * Set quality preset
     */
    setQualityPreset(preset: 'ultra' | 'high' | 'medium' | 'low'): void;
    dispose(): void;
}
//# sourceMappingURL=PanoramaViewer.d.ts.map