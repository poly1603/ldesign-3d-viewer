import * as THREE from 'three';
import type { Hotspot } from '../types';
export declare class HotspotManager {
    private hotspots;
    private container;
    private camera;
    private scene;
    private markers;
    private raycaster;
    private mouse;
    constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, scene: THREE.Scene);
    private bindEvents;
    private onContainerClick;
    private dispatchHotspotEvent;
    private sphericalToCartesian;
    addHotspot(hotspot: Hotspot): void;
    private createMarker;
    private createDefaultMarker;
    removeHotspot(id: string): void;
    getHotspots(): Hotspot[];
    update(): void;
    dispose(): void;
}
//# sourceMappingURL=HotspotManager.d.ts.map