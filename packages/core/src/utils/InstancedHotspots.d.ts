/**
 * GPU-instanced hotspot rendering
 * Render thousands of hotspots with minimal performance impact
 */
import * as THREE from 'three';
import type { Hotspot } from '../types';
export declare class InstancedHotspots {
    private scene;
    private camera;
    private instancedMesh;
    private hotspots;
    private maxInstances;
    private currentInstanceCount;
    private dummy;
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, maxInstances?: number);
    /**
     * Create instanced mesh for hotspots
     */
    private createInstancedMesh;
    /**
     * Add hotspot with GPU instancing
     */
    addHotspot(hotspot: Hotspot): void;
    /**
     * Update hotspot instance matrix
     */
    private updateHotspotInstance;
    /**
     * Remove hotspot
     */
    removeHotspot(id: string): void;
    /**
     * Update all hotspot positions (call when camera moves)
     */
    update(): void;
    /**
     * Get number of active instances
     */
    getCount(): number;
    /**
     * Clear all hotspots
     */
    clear(): void;
    /**
     * Set hotspot color
     */
    setColor(color: number): void;
    /**
     * Set hotspot opacity
     */
    setOpacity(opacity: number): void;
    /**
     * Dispose
     */
    dispose(): void;
}
//# sourceMappingURL=InstancedHotspots.d.ts.map