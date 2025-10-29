/**
 * ObjectPool 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ObjectPool, Vector3Pool, Vector2Pool, EulerPool, QuaternionPool, Matrix4Pool, ColorPool, RaycasterPool, getAllPoolStats, } from '../../src/utils/ObjectPool';
import * as THREE from 'three';
describe('ObjectPool', () => {
    describe('基本功能', () => {
        let pool;
        beforeEach(() => {
            let counter = 0;
            pool = new ObjectPool(() => ({
                id: counter++,
                reset: vi.fn(),
            }), obj => obj.reset(), 5);
        });
        it('应该能够创建对象池', () => {
            expect(pool).toBeDefined();
            expect(pool.getStats().pooled).toBe(0);
            expect(pool.getStats().created).toBe(0);
        });
        it('应该能够从池中获取对象', () => {
            const obj1 = pool.acquire();
            const obj2 = pool.acquire();
            expect(obj1).toBeDefined();
            expect(obj2).toBeDefined();
            expect(obj1.id).not.toBe(obj2.id);
            expect(pool.getStats().created).toBe(2);
        });
        it('应该能够将对象归还到池中', () => {
            const obj = pool.acquire();
            pool.release(obj);
            expect(pool.getStats().pooled).toBe(1);
            const obj2 = pool.acquire();
            expect(obj2).toBe(obj); // 应该是同一个对象
        });
        it('归还对象时应该调用reset函数', () => {
            const obj = pool.acquire();
            pool.release(obj);
            expect(obj.reset).toHaveBeenCalledTimes(1);
        });
        it('应该尊重maxSize限制', () => {
            const objects = [];
            // 创建超过maxSize的对象
            for (let i = 0; i < 10; i++) {
                objects.push(pool.acquire());
            }
            // 全部归还
            objects.forEach(obj => pool.release(obj));
            // 池中只保留maxSize个
            expect(pool.getStats().pooled).toBe(5);
        });
        it('应该能够批量归还对象', () => {
            const objects = [
                pool.acquire(),
                pool.acquire(),
                pool.acquire(),
            ];
            pool.releaseMultiple(objects);
            expect(pool.getStats().pooled).toBe(3);
        });
        it('应该能够清空池', () => {
            const obj1 = pool.acquire();
            const obj2 = pool.acquire();
            pool.release(obj1);
            pool.release(obj2);
            expect(pool.getStats().pooled).toBe(2);
            pool.clear();
            expect(pool.getStats().pooled).toBe(0);
        });
        it('应该能够预分配对象', () => {
            pool.preallocate(3);
            expect(pool.getStats().pooled).toBe(3);
            const obj = pool.acquire();
            expect(obj).toBeDefined();
            expect(pool.getStats().pooled).toBe(2);
        });
        it('预分配应该尊重maxSize', () => {
            pool.preallocate(10); // 超过maxSize(5)
            expect(pool.getStats().pooled).toBe(5);
        });
    });
    describe('没有reset函数', () => {
        it('应该在没有reset函数时正常工作', () => {
            const pool = new ObjectPool(() => ({ value: 0 }));
            const obj = pool.acquire();
            obj.value = 42;
            pool.release(obj);
            const obj2 = pool.acquire();
            expect(obj2).toBe(obj);
            expect(obj2.value).toBe(42); // 没有reset，值应该保持
        });
    });
    describe('性能', () => {
        it('应该能够快速处理大量获取和释放操作', () => {
            const pool = new ObjectPool(() => ({ data: new Array(100).fill(0) }), obj => obj.data.fill(0), 100);
            pool.preallocate(50);
            const start = performance.now();
            for (let i = 0; i < 10000; i++) {
                const obj = pool.acquire();
                pool.release(obj);
            }
            const duration = performance.now() - start;
            // 10000次操作应该在合理时间内完成
            expect(duration).toBeLessThan(100);
            expect(pool.getStats().pooled).toBeGreaterThan(0);
        });
    });
});
describe('Vector3Pool', () => {
    let pool;
    beforeEach(() => {
        pool = Vector3Pool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = Vector3Pool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Vector3', () => {
        const v = pool.acquire();
        expect(v).toBeInstanceOf(THREE.Vector3);
        v.set(1, 2, 3);
        pool.release(v);
        const v2 = pool.acquire();
        expect(v2).toBe(v);
        expect(v2.x).toBe(0); // 应该被reset
        expect(v2.y).toBe(0);
        expect(v2.z).toBe(0);
    });
    it('应该能够获取统计信息', () => {
        const stats = pool.getStats();
        expect(stats).toHaveProperty('pooled');
        expect(stats).toHaveProperty('created');
    });
});
describe('Vector2Pool', () => {
    let pool;
    beforeEach(() => {
        pool = Vector2Pool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = Vector2Pool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Vector2', () => {
        const v = pool.acquire();
        expect(v).toBeInstanceOf(THREE.Vector2);
        v.set(10, 20);
        pool.release(v);
        const v2 = pool.acquire();
        expect(v2).toBe(v);
        expect(v2.x).toBe(0);
        expect(v2.y).toBe(0);
    });
});
describe('EulerPool', () => {
    let pool;
    beforeEach(() => {
        pool = EulerPool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = EulerPool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Euler', () => {
        const e = pool.acquire();
        expect(e).toBeInstanceOf(THREE.Euler);
        e.set(1, 2, 3);
        pool.release(e);
        const e2 = pool.acquire();
        expect(e2).toBe(e);
        expect(e2.x).toBe(0);
        expect(e2.y).toBe(0);
        expect(e2.z).toBe(0);
    });
});
describe('QuaternionPool', () => {
    let pool;
    beforeEach(() => {
        pool = QuaternionPool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = QuaternionPool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Quaternion', () => {
        const q = pool.acquire();
        expect(q).toBeInstanceOf(THREE.Quaternion);
        q.set(0.5, 0.5, 0.5, 0.5);
        pool.release(q);
        const q2 = pool.acquire();
        expect(q2).toBe(q);
        expect(q2.x).toBe(0);
        expect(q2.y).toBe(0);
        expect(q2.z).toBe(0);
        expect(q2.w).toBe(1);
    });
    it('应该能够获取统计信息', () => {
        const stats = pool.getStats();
        expect(stats).toHaveProperty('pooled');
        expect(stats).toHaveProperty('created');
    });
});
describe('Matrix4Pool', () => {
    let pool;
    beforeEach(() => {
        pool = Matrix4Pool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = Matrix4Pool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Matrix4', () => {
        const m = pool.acquire();
        expect(m).toBeInstanceOf(THREE.Matrix4);
        m.makeRotationX(Math.PI);
        pool.release(m);
        const m2 = pool.acquire();
        expect(m2).toBe(m);
        // 检查是否被reset为单位矩阵
        expect(m2.elements[0]).toBe(1);
        expect(m2.elements[5]).toBe(1);
        expect(m2.elements[10]).toBe(1);
        expect(m2.elements[15]).toBe(1);
    });
    it('应该能够获取统计信息', () => {
        const stats = pool.getStats();
        expect(stats).toHaveProperty('pooled');
        expect(stats).toHaveProperty('created');
    });
});
describe('ColorPool', () => {
    let pool;
    beforeEach(() => {
        pool = ColorPool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = ColorPool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Color', () => {
        const c = pool.acquire();
        expect(c).toBeInstanceOf(THREE.Color);
        c.setRGB(0.5, 0.5, 0.5);
        pool.release(c);
        const c2 = pool.acquire();
        expect(c2).toBe(c);
        expect(c2.r).toBe(1);
        expect(c2.g).toBe(1);
        expect(c2.b).toBe(1);
    });
    it('应该能够获取统计信息', () => {
        const stats = pool.getStats();
        expect(stats).toHaveProperty('pooled');
        expect(stats).toHaveProperty('created');
    });
});
describe('RaycasterPool', () => {
    let pool;
    beforeEach(() => {
        pool = RaycasterPool.getInstance();
    });
    it('应该是单例', () => {
        const pool2 = RaycasterPool.getInstance();
        expect(pool).toBe(pool2);
    });
    it('应该能够获取和归还Raycaster', () => {
        const r = pool.acquire();
        expect(r).toBeInstanceOf(THREE.Raycaster);
        r.far = 100;
        r.near = 1;
        pool.release(r);
        const r2 = pool.acquire();
        expect(r2).toBe(r);
        expect(r2.far).toBe(Infinity);
        expect(r2.near).toBe(0);
    });
    it('应该能够获取统计信息', () => {
        const stats = pool.getStats();
        expect(stats).toHaveProperty('pooled');
        expect(stats).toHaveProperty('created');
    });
});
describe('getAllPoolStats', () => {
    it('应该能够获取所有池的统计信息', () => {
        const stats = getAllPoolStats();
        expect(stats).toHaveProperty('Vector3');
        expect(stats).toHaveProperty('Vector2');
        expect(stats).toHaveProperty('Euler');
        expect(stats).toHaveProperty('Quaternion');
        expect(stats).toHaveProperty('Matrix4');
        expect(stats).toHaveProperty('Color');
        expect(stats).toHaveProperty('Raycaster');
        expect(stats.Vector3).toHaveProperty('pooled');
        expect(stats.Vector3).toHaveProperty('created');
    });
});
describe('边界情况', () => {
    it('空池应该创建新对象', () => {
        const pool = new ObjectPool(() => ({ id: 1 }));
        const obj = pool.acquire();
        expect(obj).toBeDefined();
    });
    it('应该能够处理maxSize为0', () => {
        const pool = new ObjectPool(() => ({ id: 1 }), undefined, 0);
        const obj = pool.acquire();
        pool.release(obj);
        expect(pool.getStats().pooled).toBe(0); // 不保留任何对象
    });
    it('应该能够处理连续的acquire/release', () => {
        const pool = new ObjectPool(() => ({ id: 1 }));
        for (let i = 0; i < 100; i++) {
            const obj = pool.acquire();
            pool.release(obj);
        }
        expect(pool.getStats().pooled).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=ObjectPool.test.js.map