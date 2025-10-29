/**
 * GPU-instanced hotspot rendering
 * Render thousands of hotspots with minimal performance impact
 */
import * as THREE from 'three';
export class InstancedHotspots {
    constructor(scene, camera, maxInstances = 1000) {
        this.instancedMesh = null;
        this.hotspots = new Map();
        this.maxInstances = 1000;
        this.currentInstanceCount = 0;
        this.dummy = new THREE.Object3D();
        this.scene = scene;
        this.camera = camera;
        this.maxInstances = maxInstances;
        this.createInstancedMesh();
    }
    /**
     * Create instanced mesh for hotspots
     */
    createInstancedMesh() {
        // Create simple sphere geometry for hotspots
        const geometry = new THREE.SphereGeometry(5, 16, 16);
        // Create material with instancing support
        const material = new THREE.MeshBasicMaterial({
            color: 0x4CAF50,
            transparent: true,
            opacity: 0.8,
        });
        // Create instanced mesh
        this.instancedMesh = new THREE.InstancedMesh(geometry, material, this.maxInstances);
        // Set initial count to 0 (nothing visible)
        this.instancedMesh.count = 0;
        this.scene.add(this.instancedMesh);
    }
    /**
     * Add hotspot with GPU instancing
     */
    addHotspot(hotspot) {
        if (this.currentInstanceCount >= this.maxInstances) {
            console.warn('Maximum instanced hotspots reached');
            return;
        }
        const index = this.currentInstanceCount;
        this.hotspots.set(hotspot.id, { index, hotspot });
        // Update instance matrix
        this.updateHotspotInstance(index, hotspot);
        this.currentInstanceCount++;
        if (this.instancedMesh) {
            this.instancedMesh.count = this.currentInstanceCount;
        }
    }
    /**
     * Update hotspot instance matrix
     */
    updateHotspotInstance(index, hotspot) {
        if (!this.instancedMesh)
            return;
        // Convert spherical to cartesian coordinates
        const { theta, phi } = hotspot.position;
        const radius = 490; // Slightly inside sphere surface
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        // Set position
        this.dummy.position.set(x, y, z);
        // Make hotspot face camera
        this.dummy.lookAt(0, 0, 0);
        // Apply transformation
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(index, this.dummy.matrix);
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
    /**
     * Remove hotspot
     */
    removeHotspot(id) {
        const entry = this.hotspots.get(id);
        if (!entry)
            return;
        const removedIndex = entry.index;
        // Swap with last instance
        const lastIndex = this.currentInstanceCount - 1;
        if (removedIndex !== lastIndex) {
            // Find hotspot at last index
            const lastHotspot = Array.from(this.hotspots.values())
                .find(h => h.index === lastIndex);
            if (lastHotspot) {
                // Update its index
                lastHotspot.index = removedIndex;
                this.updateHotspotInstance(removedIndex, lastHotspot.hotspot);
            }
        }
        this.hotspots.delete(id);
        this.currentInstanceCount--;
        if (this.instancedMesh) {
            this.instancedMesh.count = this.currentInstanceCount;
        }
    }
    /**
     * Update all hotspot positions (call when camera moves)
     */
    update() {
        // Hotspots are already positioned in world space
        // They automatically move with camera due to instancing
        // This method can be used for additional updates if needed
    }
    /**
     * Get number of active instances
     */
    getCount() {
        return this.currentInstanceCount;
    }
    /**
     * Clear all hotspots
     */
    clear() {
        this.hotspots.clear();
        this.currentInstanceCount = 0;
        if (this.instancedMesh) {
            this.instancedMesh.count = 0;
        }
    }
    /**
     * Set hotspot color
     */
    setColor(color) {
        if (this.instancedMesh) {
            this.instancedMesh.material.color.setHex(color);
        }
    }
    /**
     * Set hotspot opacity
     */
    setOpacity(opacity) {
        if (this.instancedMesh) {
            this.instancedMesh.material.opacity = opacity;
        }
    }
    /**
     * Dispose
     */
    dispose() {
        if (this.instancedMesh) {
            this.instancedMesh.geometry.dispose();
            this.instancedMesh.material.dispose();
            this.scene.remove(this.instancedMesh);
            this.instancedMesh = null;
        }
        this.hotspots.clear();
    }
}
//# sourceMappingURL=InstancedHotspots.js.map