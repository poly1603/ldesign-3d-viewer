import type { QRL, Signal } from '@builder.io/qwik';
import type { Hotspot, ViewLimits } from '@panorama-viewer/core';
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
    onReady$?: QRL<(viewer: CoreViewer) => void>;
    onError$?: QRL<(error: Error) => void>;
}
export declare const PanoramaViewer: import("@builder.io/qwik").Component<PanoramaViewerProps>;
export declare function usePanoramaViewer(): {
    viewer: Signal<CoreViewer | null>;
    loadImage: QRL<(url: string) => Promise<void>>;
    reset: QRL<() => void>;
};
//# sourceMappingURL=PanoramaViewer.d.ts.map