/**
 * ObjectPool 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ObjectPool,
  Vector3Pool,
  EulerPool,
  getAllPoolStats
} from '../src/utils/ObjectPool';
import * as THREE from 'three';

describe('ObjectPool', () => {
  describe('Generic ObjectPool', () => {
    let pool: ObjectPool<{ value: number }>;

    beforeEach(() => {
      pool = new ObjectPool(
        () => ({ value: 0 }),
        (obj) => { obj.value = 0; },
        10
      );
    });

    it('should create new object when pool is empty', () => {
      const obj = pool.acquire();
      expect(obj).toBeDefined();
      expect(obj.value).toBe(0);
    });

    it('should reuse objects from pool', () => {
      const obj1 = pool.acquire();
      obj1.value = 42;
      pool.release(obj1);

      const obj2 = pool.acquire();
      expect(obj2.value).toBe(0); // Should be reset
    });

    it('should respect max pool size', () => {
      const objects = [];
      for (let i = 0; i < 15; i++) {
        objects.push(pool.acquire());
      }

      objects.forEach(obj => pool.release(obj));

      const stats = pool.getStats();
      expect(stats.pooled).toBeLessThanOrEqual(10);
    });

    it('should track created count', () => {
      pool.acquire();
      pool.acquire();
      pool.acquire();

      const stats = pool.getStats();
      expect(stats.created).toBe(3);
    });
  });

  describe('Vector3Pool', () => {
    it('should acquire Vector3', () => {
      const v = Vector3Pool.getInstance().acquire();
      expect(v).toBeInstanceOf(THREE.Vector3);
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should reset Vector3 on release', () => {
      const v = Vector3Pool.getInstance().acquire();
      v.set(1, 2, 3);
      Vector3Pool.getInstance().release(v);

      const v2 = Vector3Pool.getInstance().acquire();
      expect(v2.x).toBe(0);
      expect(v2.y).toBe(0);
      expect(v2.z).toBe(0);
    });
  });

  describe('EulerPool', () => {
    it('should acquire Euler', () => {
      const e = EulerPool.getInstance().acquire();
      expect(e).toBeInstanceOf(THREE.Euler);
    });

    it('should reset Euler on release', () => {
      const e = EulerPool.getInstance().acquire();
      e.set(1, 2, 3);
      EulerPool.getInstance().release(e);

      const e2 = EulerPool.getInstance().acquire();
      expect(e2.x).toBe(0);
      expect(e2.y).toBe(0);
      expect(e2.z).toBe(0);
    });
  });

  describe('getAllPoolStats()', () => {
    it('should return stats for all pools', () => {
      Vector3Pool.getInstance().acquire();
      EulerPool.getInstance().acquire();

      const stats = getAllPoolStats();

      expect(stats.Vector3).toBeDefined();
      expect(stats.Euler).toBeDefined();
      expect(stats.Vector3.created).toBeGreaterThan(0);
    });
  });
});

