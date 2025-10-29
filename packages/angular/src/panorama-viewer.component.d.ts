import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import type { Hotspot, ViewLimits } from '@panorama-viewer/core';
import { PanoramaViewer } from '@panorama-viewer/core';
export declare class PanoramaViewerComponent implements OnInit, OnDestroy {
    containerRef: ElementRef<HTMLDivElement>;
    image: string;
    fov: number;
    minFov: number;
    maxFov: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    gyroscope: boolean;
    width: string;
    height: string;
    hotspots: Hotspot[];
    viewLimits?: ViewLimits | null;
    viewerReady: EventEmitter<PanoramaViewer>;
    viewerError: EventEmitter<Error>;
    rotationChange: EventEmitter<{
        x: number;
        y: number;
        z: number;
    }>;
    private viewer;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private initViewer;
    private destroyViewer;
    loadImage(url: string): Promise<void>;
    reset(): void;
    enableAutoRotate(): void;
    disableAutoRotate(): void;
    enableGyroscope(): Promise<boolean>;
    disableGyroscope(): void;
    addHotspot(hotspot: Hotspot): void;
    removeHotspot(id: string): void;
    getRotation(): {
        x: number;
        y: number;
        z: number;
    } | undefined;
    setRotation(x: number, y: number, z: number): void;
    enterFullscreen(): Promise<void>;
    exitFullscreen(): void;
    screenshot(width?: number, height?: number): string | undefined;
    getViewer(): PanoramaViewer | null;
}
//# sourceMappingURL=panorama-viewer.component.d.ts.map