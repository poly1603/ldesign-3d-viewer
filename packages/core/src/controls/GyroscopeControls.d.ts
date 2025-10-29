import * as THREE from 'three';
export declare class GyroscopeControls {
    private camera;
    private enabled;
    private screenOrientation;
    private alphaOffset;
    private boundDeviceOrientation;
    private boundOrientationChange;
    constructor(camera: THREE.PerspectiveCamera);
    /**
     * Enable gyroscope controls
     * Returns true if successfully enabled
     */
    enable(): Promise<boolean>;
    /**
     * Disable gyroscope controls
     */
    disable(): void;
    private onDeviceOrientation;
    private onScreenOrientationChange;
    private setObjectQuaternion;
    isEnabled(): boolean;
    dispose(): void;
}
//# sourceMappingURL=GyroscopeControls.d.ts.map