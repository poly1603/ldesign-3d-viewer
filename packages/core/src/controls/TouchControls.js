import * as THREE from 'three';
export class TouchControls {
    constructor(camera, domElement) {
        this.enabled = true;
        this.dampingFactor = 0.95;
        this.rotationSpeed = 0.5;
        this.camera = camera;
        this.domElement = domElement;
        this.touchState = {
            touching: false,
            startX: 0,
            startY: 0,
            lastX: 0,
            lastY: 0,
            velocityX: 0,
            velocityY: 0,
            pinchDistance: 0,
        };
        this.bindEvents();
    }
    bindEvents() {
        this.boundTouchStart = this.onTouchStart.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchEnd = this.onTouchEnd.bind(this);
        this.domElement.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        this.domElement.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        this.domElement.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    }
    onTouchStart(event) {
        if (!this.enabled)
            return;
        event.preventDefault();
        if (event.touches.length === 1) {
            // Single touch - rotation
            this.touchState.touching = true;
            this.touchState.startX = event.touches[0].clientX;
            this.touchState.startY = event.touches[0].clientY;
            this.touchState.lastX = event.touches[0].clientX;
            this.touchState.lastY = event.touches[0].clientY;
            this.touchState.velocityX = 0;
            this.touchState.velocityY = 0;
        }
        else if (event.touches.length === 2) {
            // Two fingers - pinch zoom
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            this.touchState.pinchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }
    onTouchMove(event) {
        if (!this.enabled)
            return;
        event.preventDefault();
        if (event.touches.length === 1 && this.touchState.touching) {
            const currentX = event.touches[0].clientX;
            const currentY = event.touches[0].clientY;
            const deltaX = currentX - this.touchState.lastX;
            const deltaY = currentY - this.touchState.lastY;
            this.touchState.velocityX = deltaX;
            this.touchState.velocityY = deltaY;
            this.rotate(deltaX, deltaY);
            this.touchState.lastX = currentX;
            this.touchState.lastY = currentY;
        }
        else if (event.touches.length === 2) {
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (this.touchState.pinchDistance > 0) {
                const delta = distance - this.touchState.pinchDistance;
                this.zoom(delta * 0.1);
            }
            this.touchState.pinchDistance = distance;
        }
    }
    onTouchEnd(event) {
        if (!this.enabled)
            return;
        if (event.touches.length === 0) {
            this.touchState.touching = false;
            this.touchState.pinchDistance = 0;
        }
    }
    rotate(deltaX, deltaY) {
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(this.camera.quaternion);
        euler.y -= deltaX * 0.002 * this.rotationSpeed;
        euler.x -= deltaY * 0.002 * this.rotationSpeed;
        // Clamp vertical rotation
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        this.camera.quaternion.setFromEuler(euler);
    }
    zoom(delta) {
        this.camera.fov = Math.max(30, Math.min(100, this.camera.fov - delta));
        this.camera.updateProjectionMatrix();
    }
    update() {
        // Apply inertia
        if (!this.touchState.touching && (Math.abs(this.touchState.velocityX) > 0.01 || Math.abs(this.touchState.velocityY) > 0.01)) {
            this.rotate(this.touchState.velocityX, this.touchState.velocityY);
            this.touchState.velocityX *= this.dampingFactor;
            this.touchState.velocityY *= this.dampingFactor;
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    dispose() {
        if (this.boundTouchStart) {
            this.domElement.removeEventListener('touchstart', this.boundTouchStart);
        }
        if (this.boundTouchMove) {
            this.domElement.removeEventListener('touchmove', this.boundTouchMove);
        }
        if (this.boundTouchEnd) {
            this.domElement.removeEventListener('touchend', this.boundTouchEnd);
        }
        this.enabled = false;
    }
}
//# sourceMappingURL=TouchControls.js.map