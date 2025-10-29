import * as THREE from 'three';
export declare class MiniMap {
    private container;
    private miniMapElement;
    private canvas;
    private ctx;
    private camera;
    private size;
    private margin;
    private visible;
    constructor(container: HTMLElement, camera: THREE.PerspectiveCamera);
    update(): void;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
}
//# sourceMappingURL=MiniMap.d.ts.map