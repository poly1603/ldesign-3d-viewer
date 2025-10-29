import * as THREE from 'three';
/**
 * WebWorker-based texture loader for non-blocking image loading
 * Significantly improves performance by loading textures in background
 */
export declare class WebWorkerTextureLoader {
    private worker;
    private pendingLoads;
    private loadCounter;
    constructor();
    private handleMessage;
    load(url: string): Promise<THREE.Texture>;
    private loadFallback;
    dispose(): void;
}
//# sourceMappingURL=WebWorkerTextureLoader.d.ts.map