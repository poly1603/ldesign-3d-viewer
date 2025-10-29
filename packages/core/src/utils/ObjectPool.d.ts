/**
 * Generic object pool for reusing objects and reducing garbage collection
 * Significantly improves performance by avoiding frequent object creation/destruction
 */
/**
 * Vector3 object pool for Three.js
 */
import * as THREE from 'three';
export declare class ObjectPool<T> {
    private pool;
    private create;
    private reset?;
    private maxSize;
    private created;
    constructor(createFn: () => T, resetFn?: (obj: T) => void, maxSize?: number);
    /**
     * Get an object from the pool or create a new one
     */
    acquire(): T;
    /**
     * Return an object to the pool for reuse
     */
    release(obj: T): void;
    /**
     * Release multiple objects at once
     */
    releaseMultiple(objects: T[]): void;
    /**
     * Clear the pool
     */
    clear(): void;
    /**
     * Get pool statistics
     */
    getStats(): {
        pooled: number;
        created: number;
    };
    /**
     * Preallocate objects in the pool
     */
    preallocate(count: number): void;
}
export declare class Vector3Pool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Vector3Pool;
    acquire(): THREE.Vector3;
    release(v: THREE.Vector3): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * Euler object pool for Three.js
 */
export declare class EulerPool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): EulerPool;
    acquire(): THREE.Euler;
    release(e: THREE.Euler): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * Quaternion object pool for Three.js
 */
export declare class QuaternionPool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): QuaternionPool;
    acquire(): THREE.Quaternion;
    release(q: THREE.Quaternion): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * Matrix4 object pool for Three.js
 */
export declare class Matrix4Pool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Matrix4Pool;
    acquire(): THREE.Matrix4;
    release(m: THREE.Matrix4): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * Vector2 object pool for Three.js
 */
export declare class Vector2Pool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Vector2Pool;
    acquire(): THREE.Vector2;
    release(v: THREE.Vector2): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * Color object pool for Three.js
 */
export declare class ColorPool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): ColorPool;
    acquire(): THREE.Color;
    release(c: THREE.Color): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * Raycaster object pool for Three.js
 */
export declare class RaycasterPool {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): RaycasterPool;
    acquire(): THREE.Raycaster;
    release(r: THREE.Raycaster): void;
    getStats(): {
        pooled: number;
        created: number;
    };
}
/**
 * 获取所有对象池的统计信息
 */
export declare function getAllPoolStats(): {
    Vector3: {
        pooled: number;
        created: number;
    };
    Vector2: {
        pooled: number;
        created: number;
    };
    Euler: {
        pooled: number;
        created: number;
    };
    Quaternion: {
        pooled: number;
        created: number;
    };
    Matrix4: {
        pooled: number;
        created: number;
    };
    Color: {
        pooled: number;
        created: number;
    };
    Raycaster: {
        pooled: number;
        created: number;
    };
};
//# sourceMappingURL=ObjectPool.d.ts.map