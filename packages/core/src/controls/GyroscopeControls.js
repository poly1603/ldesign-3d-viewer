import * as THREE from 'three';
export class GyroscopeControls {
    constructor(camera) {
        this.enabled = false;
        this.screenOrientation = 0;
        this.alphaOffset = 0;
        this.camera = camera;
        this.boundDeviceOrientation = this.onDeviceOrientation.bind(this);
        this.boundOrientationChange = this.onScreenOrientationChange.bind(this);
    }
    /**
     * Enable gyroscope controls
     * Returns true if successfully enabled
     */
    async enable() {
        // Check if DeviceOrientationEvent is supported
        if (!window.DeviceOrientationEvent) {
            console.warn('DeviceOrientationEvent is not supported');
            return false;
        }
        // For iOS 13+, we need to request permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    console.warn('Device orientation permission denied');
                    return false;
                }
            }
            catch (error) {
                console.error('Error requesting device orientation permission:', error);
                return false;
            }
        }
        // Add event listener
        window.addEventListener('deviceorientation', this.boundDeviceOrientation, false);
        window.addEventListener('orientationchange', this.boundOrientationChange, false);
        this.screenOrientation = window.orientation || 0;
        this.enabled = true;
        return true;
    }
    /**
     * Disable gyroscope controls
     */
    disable() {
        window.removeEventListener('deviceorientation', this.boundDeviceOrientation);
        window.removeEventListener('orientationchange', this.boundOrientationChange);
        this.enabled = false;
    }
    onDeviceOrientation(event) {
        if (!this.enabled)
            return;
        const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) + this.alphaOffset : 0;
        const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
        const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;
        const orient = this.screenOrientation ? THREE.MathUtils.degToRad(this.screenOrientation) : 0;
        this.setObjectQuaternion(alpha, beta, gamma, orient);
    }
    onScreenOrientationChange() {
        this.screenOrientation = window.orientation || 0;
    }
    setObjectQuaternion(alpha, beta, gamma, orient) {
        const zee = new THREE.Vector3(0, 0, 1);
        const euler = new THREE.Euler();
        const q0 = new THREE.Quaternion();
        const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
        euler.set(beta, alpha, -gamma, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);
        this.camera.quaternion.multiply(q1);
        this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
    }
    isEnabled() {
        return this.enabled;
    }
    dispose() {
        this.disable();
    }
}
//# sourceMappingURL=GyroscopeControls.js.map