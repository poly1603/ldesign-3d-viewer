import * as THREE from 'three';
export declare class KeyboardControls {
    private camera;
    private enabled;
    private rotationSpeed;
    private zoomSpeed;
    private keys;
    private boundKeyDown;
    private boundKeyUp;
    constructor(camera: THREE.PerspectiveCamera);
    private bindEvents;
    private onKeyDown;
    private onKeyUp;
    update(): void;
    setEnabled(enabled: boolean): void;
    dispose(): void;
}
//# sourceMappingURL=KeyboardControls.d.ts.map