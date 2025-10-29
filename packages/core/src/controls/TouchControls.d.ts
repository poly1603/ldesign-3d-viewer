import * as THREE from 'three';
export declare class TouchControls {
    private camera;
    private domElement;
    private enabled;
    private touchState;
    private dampingFactor;
    private rotationSpeed;
    private boundTouchStart;
    private boundTouchMove;
    private boundTouchEnd;
    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement);
    private bindEvents;
    private onTouchStart;
    private onTouchMove;
    private onTouchEnd;
    private rotate;
    private zoom;
    update(): void;
    setEnabled(enabled: boolean): void;
    dispose(): void;
}
//# sourceMappingURL=TouchControls.d.ts.map