/**
 * Generic object pool for reusing objects and reducing garbage collection
 * Significantly improves performance by avoiding frequent object creation/destruction
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private create: () => T;
  private reset?: (obj: T) => void;
  private maxSize: number;
  private created = 0;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 100
  ) {
    this.create = createFn;
    this.reset = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool or create a new one
   */
  public acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    this.created++;
    return this.create();
  }

  /**
   * Return an object to the pool for reuse
   */
  public release(obj: T): void {
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
  public releaseMultiple(objects: T[]): void {
    objects.forEach(obj => this.release(obj));
  }

  /**
   * Clear the pool
   */
  public clear(): void {
    this.pool = [];
  }

  /**
   * Get pool statistics
   */
  public getStats(): { pooled: number; created: number } {
    return {
      pooled: this.pool.length,
      created: this.created,
    };
  }

  /**
   * Preallocate objects in the pool
   */
  public preallocate(count: number): void {
    for (let i = 0; i < count && this.pool.length < this.maxSize; i++) {
      this.pool.push(this.create());
    }
  }
}

/**
 * Vector3 object pool for Three.js
 */
import * as THREE from 'three';

export class Vector3Pool {
  private static instance: Vector3Pool;
  private pool: ObjectPool<THREE.Vector3>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Vector3(),
      (v) => v.set(0, 0, 0),
      200
    );
  }

  public static getInstance(): Vector3Pool {
    if (!Vector3Pool.instance) {
      Vector3Pool.instance = new Vector3Pool();
    }
    return Vector3Pool.instance;
  }

  public acquire(): THREE.Vector3 {
    return this.pool.acquire();
  }

  public release(v: THREE.Vector3): void {
    this.pool.release(v);
  }

  public getStats() {
    return this.pool.getStats();
  }
}

/**
 * Euler object pool for Three.js
 */
export class EulerPool {
  private static instance: EulerPool;
  private pool: ObjectPool<THREE.Euler>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Euler(),
      (e) => e.set(0, 0, 0),
      100
    );
  }

  public static getInstance(): EulerPool {
    if (!EulerPool.instance) {
      EulerPool.instance = new EulerPool();
    }
    return EulerPool.instance;
  }

  public acquire(): THREE.Euler {
    return this.pool.acquire();
  }

  public release(e: THREE.Euler): void {
    this.pool.release(e);
  }
}

/**
 * Quaternion object pool for Three.js
 */
export class QuaternionPool {
  private static instance: QuaternionPool;
  private pool: ObjectPool<THREE.Quaternion>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Quaternion(),
      (q) => q.set(0, 0, 0, 1),
      100
    );
  }

  public static getInstance(): QuaternionPool {
    if (!QuaternionPool.instance) {
      QuaternionPool.instance = new QuaternionPool();
    }
    return QuaternionPool.instance;
  }

  public acquire(): THREE.Quaternion {
    return this.pool.acquire();
  }

  public release(q: THREE.Quaternion): void {
    this.pool.release(q);
  }

  public getStats() {
    return this.pool.getStats();
  }
}

/**
 * Matrix4 object pool for Three.js
 */
export class Matrix4Pool {
  private static instance: Matrix4Pool;
  private pool: ObjectPool<THREE.Matrix4>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Matrix4(),
      (m) => m.identity(),
      50
    );
  }

  public static getInstance(): Matrix4Pool {
    if (!Matrix4Pool.instance) {
      Matrix4Pool.instance = new Matrix4Pool();
    }
    return Matrix4Pool.instance;
  }

  public acquire(): THREE.Matrix4 {
    return this.pool.acquire();
  }

  public release(m: THREE.Matrix4): void {
    this.pool.release(m);
  }

  public getStats() {
    return this.pool.getStats();
  }
}

/**
 * Vector2 object pool for Three.js
 */
export class Vector2Pool {
  private static instance: Vector2Pool;
  private pool: ObjectPool<THREE.Vector2>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Vector2(),
      (v) => v.set(0, 0),
      150
    );
  }

  public static getInstance(): Vector2Pool {
    if (!Vector2Pool.instance) {
      Vector2Pool.instance = new Vector2Pool();
    }
    return Vector2Pool.instance;
  }

  public acquire(): THREE.Vector2 {
    return this.pool.acquire();
  }

  public release(v: THREE.Vector2): void {
    this.pool.release(v);
  }

  public getStats() {
    return this.pool.getStats();
  }
}

/**
 * Color object pool for Three.js
 */
export class ColorPool {
  private static instance: ColorPool;
  private pool: ObjectPool<THREE.Color>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Color(),
      (c) => c.setRGB(1, 1, 1),
      50
    );
  }

  public static getInstance(): ColorPool {
    if (!ColorPool.instance) {
      ColorPool.instance = new ColorPool();
    }
    return ColorPool.instance;
  }

  public acquire(): THREE.Color {
    return this.pool.acquire();
  }

  public release(c: THREE.Color): void {
    this.pool.release(c);
  }

  public getStats() {
    return this.pool.getStats();
  }
}

/**
 * Raycaster object pool for Three.js
 */
export class RaycasterPool {
  private static instance: RaycasterPool;
  private pool: ObjectPool<THREE.Raycaster>;

  private constructor() {
    this.pool = new ObjectPool(
      () => new THREE.Raycaster(),
      (r) => {
        r.far = Infinity;
        r.near = 0;
      },
      20
    );
  }

  public static getInstance(): RaycasterPool {
    if (!RaycasterPool.instance) {
      RaycasterPool.instance = new RaycasterPool();
    }
    return RaycasterPool.instance;
  }

  public acquire(): THREE.Raycaster {
    return this.pool.acquire();
  }

  public release(r: THREE.Raycaster): void {
    this.pool.release(r);
  }

  public getStats() {
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

