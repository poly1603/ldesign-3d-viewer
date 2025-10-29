import { LitElement } from 'lit';
import type { CubemapImages, Hotspot, ViewLimits } from '@panorama-viewer/core';
/**
 * Panorama Viewer Web Component
 *
 * @element panorama-viewer
 *
 * @attr {string} image - URL or path to the panorama image
 * @attr {string} format - Image format: 'equirectangular' or 'cubemap'
 * @attr {number} fov - Field of view in degrees (default: 75)
 * @attr {number} min-fov - Minimum field of view for zoom (default: 30)
 * @attr {number} max-fov - Maximum field of view for zoom (default: 100)
 * @attr {boolean} auto-rotate - Enable auto rotation (default: false)
 * @attr {number} auto-rotate-speed - Auto rotation speed (default: 0.5)
 * @attr {boolean} gyroscope - Enable gyroscope controls on mobile (default: true)
 * @attr {boolean} keyboard-controls - Enable keyboard controls (default: true)
 * @attr {boolean} render-on-demand - Enable render on demand (default: true)
 * @attr {boolean} show-mini-map - Show mini map (default: true)
 * @attr {string} width - Container width (default: 100%)
 * @attr {string} height - Container height (default: 500px)
 *
 * @fires ready - Fired when the viewer is initialized
 * @fires error - Fired when an error occurs
 * @fires progress - Fired during image loading
 * @fires hotspotclick - Fired when a hotspot is clicked
 */
export declare class PanoramaViewerElement extends LitElement {
    static styles: import("lit").CSSResult;
    image: string;
    format: 'equirectangular' | 'cubemap';
    fov: number;
    minFov: number;
    maxFov: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    gyroscope: boolean;
    keyboardControls: boolean;
    renderOnDemand: boolean;
    showMiniMap: boolean;
    width: string;
    height: string;
    viewLimits: ViewLimits | undefined;
    private viewer;
    private containerElement;
    render(): import("lit").TemplateResult<1>;
    firstUpdated(): void;
    private initializeViewer;
    updated(changedProperties: Map<string, any>): void;
    disconnectedCallback(): void;
    /**
     * Load a new panorama image
     */
    loadImage(url: string | CubemapImages, transition?: boolean): Promise<void>;
    /**
     * Reset camera to initial position
     */
    reset(): void;
    /**
     * Enable auto rotation
     */
    enableAutoRotate(): void;
    /**
     * Disable auto rotation
     */
    disableAutoRotate(): void;
    /**
     * Enable gyroscope controls (mobile only)
     */
    enableGyroscope(): Promise<boolean>;
    /**
     * Disable gyroscope controls
     */
    disableGyroscope(): void;
    /**
     * Get the current camera rotation
     */
    getRotation(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Set the camera rotation
     */
    setRotation(x: number, y: number, z: number): void;
    /**
     * Add a hotspot marker
     */
    addHotspot(hotspot: Hotspot): void;
    /**
     * Remove a hotspot by ID
     */
    removeHotspot(id: string): void;
    /**
     * Get all hotspots
     */
    getHotspots(): Hotspot[];
    /**
     * Enter fullscreen mode
     */
    enterFullscreen(): Promise<void>;
    /**
     * Exit fullscreen mode
     */
    exitFullscreen(): void;
    /**
     * Check if in fullscreen
     */
    isFullscreen(): boolean;
    /**
     * Take a screenshot
     */
    screenshot(width?: number, height?: number): string;
    /**
     * Set view limits
     */
    setViewLimits(limits: ViewLimits | undefined): void;
    /**
     * Show mini map
     */
    showMiniMapView(): void;
    /**
     * Hide mini map
     */
    hideMiniMapView(): void;
    /**
     * Toggle mini map visibility
     */
    toggleMiniMapView(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'panorama-viewer': PanoramaViewerElement;
    }
}
//# sourceMappingURL=panorama-viewer.d.ts.map