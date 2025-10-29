import { LitElement } from 'lit';
import '@panorama-viewer/lit';
export declare class AppComponent extends LitElement {
    static styles: import("lit").CSSResult;
    private autoRotate;
    private showMiniMap;
    private isFullscreen;
    private viewLimits;
    private loadingProgress;
    private hotspots;
    private lastHotspotClick;
    private currentImageIndex;
    private hotspotCounter;
    private deviceInfo;
    private performanceMode;
    private supportedFormats;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private get viewerElement();
    private toggleAutoRotate;
    private reset;
    private enableGyroscope;
    private toggleFullscreen;
    private toggleMiniMapVisibility;
    private takeScreenshot;
    private addDemoHotspot;
    private removeAllHotspots;
    private setHorizontalLimit;
    private setVerticalLimit;
    private clearLimits;
    private changeImage;
    private handleReady;
    private handleError;
    private handleProgress;
    private handleHotspotClick;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'app-component': AppComponent;
    }
}
//# sourceMappingURL=app-component.d.ts.map