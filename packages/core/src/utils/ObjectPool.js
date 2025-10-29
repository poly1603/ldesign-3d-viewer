/**
 * Generic object pool for reusing objects and reducing garbage collection
 * Significantly improves performance by avoiding frequent object creation/destruction
 */
/**
 * Vector3 object pool for Three.js
 */
import * as THREE from 'three';
export class ObjectPool {
    constructor(createFn, resetFn, maxSize = 100) {
        this.pool = [];
        this.created = 0;
        this.create = createFn;
        this.reset = resetFn;
        this.maxSize = maxSize;
    }
    /**
     * Get an object from the pool or create a new one
     */
    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        this.created++;
        return this.create();
    }
    /**
     * Return an object to the pool for reuse
     */
    release(obj) {
        if (this.pool.length < this.maxSize) {
            if (this.reset) {
                this.reset(obj);
            }
            this.pool.push(obj);
        }
    }
    /**
     * Release multiple objects at once
     */
    releaseMultiple(objects) {
        objects.forEach(obj => this.release(obj));
    }
    /**
     * Clear the pool
     */
    clear() {
        this.pool = [];
    }
    /**
     * Get pool statistics
     */
    getStats() {
        return {
            pooled: this.pool.length,
            created: this.created,
        };
    }
    /**
     * Preallocate objects in the pool
     */
    preallocate(count) {
        for (let i = 0; i < count && this.pool.length < this.maxSize; i++) {
            this.pool.push(this.create());
        }
    }
}
export class Vector3Pool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Vector3(), v => v.set(0, 0, 0), 200);
    }
    static getInstance() {
        if (!Vector3Pool.instance) {
            Vector3Pool.instance = new Vector3Pool();
        }
        return Vector3Pool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(v) {
        this.pool.release(v);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * Euler object pool for Three.js
 */
export class EulerPool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Euler(), e => e.set(0, 0, 0), 100);
    }
    static getInstance() {
        if (!EulerPool.instance) {
            EulerPool.instance = new EulerPool();
        }
        return EulerPool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(e) {
        this.pool.release(e);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * Quaternion object pool for Three.js
 */
export class QuaternionPool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Quaternion(), q => q.set(0, 0, 0, 1), 100);
    }
    static getInstance() {
        if (!QuaternionPool.instance) {
            QuaternionPool.instance = new QuaternionPool();
        }
        return QuaternionPool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(q) {
        this.pool.release(q);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * Matrix4 object pool for Three.js
 */
export class Matrix4Pool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Matrix4(), m => m.identity(), 50);
    }
    static getInstance() {
        if (!Matrix4Pool.instance) {
            Matrix4Pool.instance = new Matrix4Pool();
        }
        return Matrix4Pool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(m) {
        this.pool.release(m);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * Vector2 object pool for Three.js
 */
export class Vector2Pool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Vector2(), v => v.set(0, 0), 150);
    }
    static getInstance() {
        if (!Vector2Pool.instance) {
            Vector2Pool.instance = new Vector2Pool();
        }
        return Vector2Pool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(v) {
        this.pool.release(v);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * Color object pool for Three.js
 */
export class ColorPool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Color(), c => c.setRGB(1, 1, 1), 50);
    }
    static getInstance() {
        if (!ColorPool.instance) {
            ColorPool.instance = new ColorPool();
        }
        return ColorPool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(c) {
        this.pool.release(c);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * Raycaster object pool for Three.js
 */
export class RaycasterPool {
    constructor() {
        this.pool = new ObjectPool(() => new THREE.Raycaster(), (r) => {
            r.far = Infinity;
            r.near = 0;
        }, 20);
    }
    static getInstance() {
        if (!RaycasterPool.instance) {
            RaycasterPool.instance = new RaycasterPool();
        }
        return RaycasterPool.instance;
    }
    acquire() {
        return this.pool.acquire();
    }
    release(r) {
        this.pool.release(r);
    }
    getStats() {
        return this.pool.getStats();
    }
}
/**
 * 获取所有对象池的统计信息
 */
export function getAllPoolStats() {
    return {
        Vector3: Vector3Pool.getInstance().getStats(),
        Vector2: Vector2Pool.getInstance().getStats(),
        Euler: EulerPool.getInstance().getStats(),
        Quaternion: QuaternionPool.getInstance().getStats(),
        Matrix4: Matrix4Pool.getInstance().getStats(),
        Color: ColorPool.getInstance().getStats(),
        Raycaster: RaycasterPool.getInstance().getStats(),
    };
}
//# sourceMappingURL=ObjectPool.js.map