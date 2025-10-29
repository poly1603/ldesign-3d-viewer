import * as THREE from 'three';
export class KeyboardControls {
    constructor(camera) {
        this.enabled = true;
        this.rotationSpeed = 0.05;
        this.zoomSpeed = 2;
        this.keys = new Set();
        this.camera = camera;
        this.boundKeyDown = this.onKeyDown.bind(this);
        this.boundKeyUp = this.onKeyUp.bind(this);
        this.bindEvents();
    }
    bindEvents() {
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
    }
    onKeyDown(event) {
        if (!this.enabled)
            return;
        this.keys.add(event.key);
    }
    onKeyUp(event) {
        this.keys.delete(event.key);
    }
    update() {
        if (!this.enabled)
            return;
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(this.camera.quaternion);
        // Arrow keys for rotation
        if (this.keys.has('ArrowLeft')) {
            euler.y += this.rotationSpeed;
        }
        if (this.keys.has('ArrowRight')) {
            euler.y -= this.rotationSpeed;
        }
        if (this.keys.has('ArrowUp')) {
            euler.x -= this.rotationSpeed;
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        }
        if (this.keys.has('ArrowDown')) {
            euler.x += this.rotationSpeed;
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        }
        this.camera.quaternion.setFromEuler(euler);
        // + and - for zoom
        if (this.keys.has('+') || this.keys.has('=')) {
            this.camera.fov = Math.max(30, this.camera.fov - this.zoomSpeed);
            this.camera.updateProjectionMatrix();
        }
        if (this.keys.has('-') || this.keys.has('_')) {
            this.camera.fov = Math.min(100, this.camera.fov + this.zoomSpeed);
            this.camera.updateProjectionMatrix();
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.keys.clear();
        }
    }
    dispose() {
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
        this.keys.clear();
        this.enabled = false;
    }
}
//# sourceMappingURL=KeyboardControls.js.map