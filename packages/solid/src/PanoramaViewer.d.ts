import type { Accessor, Component } from 'solid-js';
import type { Hotspot, ViewLimits, ViewerOptions } from '@panorama-viewer/core';
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core';
export interface PanoramaViewerProps {
    image: string;
    fov?: number;
    minFov?: number;
    maxFov?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    gyroscope?: boolean;
    width?: string;
    height?: string;
    hotspots?: Hotspot[];
    viewLimits?: ViewLimits | null;
    onReady?: (viewer: CoreViewer) => void;
    onError?: (error: Error) => void;
}
export declare const PanoramaViewer: Component<PanoramaViewerProps>;
export declare function createPanoramaViewer(container: HTMLElement, options: ViewerOptions): CoreViewer;
export declare function usePanoramaViewer(): {
    viewer: Accessor<CoreViewer | null>;
    setViewer: (v: CoreViewer | null) => void;
};
//# sourceMappingURL=PanoramaViewer.d.ts.map