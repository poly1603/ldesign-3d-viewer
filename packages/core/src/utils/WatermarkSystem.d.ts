/**
 * Watermark system
 * Add customizable watermarks to the panorama viewer
 */
export interface WatermarkOptions {
    text?: string;
    imageUrl?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
    fontSize?: number;
    color?: string;
    offset?: {
        x: number;
        y: number;
    };
}
export declare class WatermarkSystem {
    private container;
    private watermarkElement;
    private options;
    constructor(container: HTMLElement, options?: WatermarkOptions);
    /**
     * Show watermark
     */
    show(): void;
    /**
     * Hide watermark
     */
    hide(): void;
    /**
     * Update watermark content
     */
    private updateContent;
    /**
     * Update watermark styles
     */
    private updateStyles;
    /**
     * Update watermark options
     */
    updateOptions(options: Partial<WatermarkOptions>): void;
    /**
     * Dispose watermark
     */
    dispose(): void;
}
//# sourceMappingURL=WatermarkSystem.d.ts.map