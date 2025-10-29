import type { CSSProperties } from 'react';
import React from 'react';
import { type CubemapImages, type Hotspot, type ViewLimits } from '@panorama-viewer/core';
export interface PanoramaViewerProps {
    image: string | CubemapImages;
    format?: 'equirectangular' | 'cubemap';
    fov?: number;
    minFov?: number;
    maxFov?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    gyroscope?: boolean;
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: CSSProperties;
    viewLimits?: ViewLimits | null;
    keyboardControls?: boolean;
    renderOnDemand?: boolean;
    showMiniMap?: boolean;
    onReady?: () => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: number) => void;
    onHotspotClick?: (hotspot: Hotspot) => void;
}
export interface PanoramaViewerRef {
    loadImage: (url: string | CubemapImages, transition?: boolean) => Promise<void>;
    reset: () => void;
    enableAutoRotate: () => void;
    disableAutoRotate: () => void;
    enableGyroscope: () => Promise<boolean>;
    disableGyroscope: () => void;
    getRotation: () => {
        x: number;
        y: number;
        z: number;
    };
    setRotation: (x: number, y: number, z: number) => void;
    addHotspot: (hotspot: Hotspot) => void;
    removeHotspot: (id: string) => void;
    getHotspots: () => Hotspot[];
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => void;
    isFullscreen: () => boolean;
    screenshot: (width?: number, height?: number) => string;
    setViewLimits: (limits: ViewLimits | null) => void;
    showMiniMap: () => void;
    hideMiniMap: () => void;
    toggleMiniMap: () => void;
}
export declare const PanoramaViewer: React.ForwardRefExoticComponent<PanoramaViewerProps & React.RefAttributes<PanoramaViewerRef>>;
export default PanoramaViewer;
//# sourceMappingURL=PanoramaViewer.d.ts.map