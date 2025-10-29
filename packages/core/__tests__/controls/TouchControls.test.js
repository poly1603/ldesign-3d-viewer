/**
 * TouchControls 单元测试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchControls } from '../../src/controls/TouchControls';
import * as THREE from 'three';
describe('TouchControls', () => {
    let camera;
    let domElement;
    let touchControls;
    beforeEach(() => {
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 5);
        // 创建模拟 DOM 元素
        domElement = document.createElement('div');
        document.body.appendChild(domElement);
        touchControls = new TouchControls(camera, domElement);
    });
    afterEach(() => {
        touchControls.dispose();
        document.body.removeChild(domElement);
    });
    describe('基本功能', () => {
        it('应该能够创建 TouchControls', () => {
            expect(touchControls).toBeDefined();
            expect(touchControls).toBeInstanceOf(TouchControls);
        });
        it('应该默认启用', () => {
            // 通过触发事件验证是否启用
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
            });
            expect(() => {
                domElement.dispatchEvent(touchEvent);
            }).not.toThrow();
        });
        it('应该能够禁用和启用', () => {
            touchControls.setEnabled(false);
            // 禁用后触摸不应该改变相机
            const initialRotation = camera.quaternion.clone();
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
            });
            domElement.dispatchEvent(touchEvent);
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
            touchControls.setEnabled(true);
        });
    });
    describe('单指触摸', () => {
        it('应该能够处理单指触摸开始', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            expect(() => {
                domElement.dispatchEvent(touchEvent);
            }).not.toThrow();
        });
        it('应该能够通过单指拖动旋转相机', () => {
            const initialRotation = camera.quaternion.clone();
            // 触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 触摸移动
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 200, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 相机应该发生旋转
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
        });
        it('应该在垂直方向限制旋转角度', () => {
            // 触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 大幅度向上移动（超过限制）
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 100, clientY: -10000 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 获取欧拉角
            const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            // 垂直旋转应该被限制在 [-π/2, π/2]
            expect(euler.x).toBeGreaterThanOrEqual(-Math.PI / 2);
            expect(euler.x).toBeLessThanOrEqual(Math.PI / 2);
        });
        it('应该在触摸结束时停止旋转', () => {
            // 触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 触摸移动
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 200, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 触摸结束
            const touchEnd = new TouchEvent('touchend', {
                touches: [],
                cancelable: true,
            });
            domElement.dispatchEvent(touchEnd);
            const rotationAfterEnd = camera.quaternion.clone();
            // 再次移动不应该影响相机（因为已经结束触摸）
            const touchMove2 = new TouchEvent('touchmove', {
                touches: [{ clientX: 300, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove2);
            expect(camera.quaternion.equals(rotationAfterEnd)).toBe(true);
        });
    });
    describe('双指触摸', () => {
        it('应该能够处理双指缩放', () => {
            const initialFov = camera.fov;
            // 双指触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 },
                    { clientX: 200, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 双指靠近（缩小）
            const touchMove = new TouchEvent('touchmove', {
                touches: [
                    { clientX: 120, clientY: 100 },
                    { clientX: 180, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // FOV 应该改变
            expect(camera.fov).not.toBe(initialFov);
        });
        it('应该限制FOV在合理范围内', () => {
            // 双指触摸开始（很近）
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 },
                    { clientX: 110, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 双指远离（放大到极限）
            const touchMove = new TouchEvent('touchmove', {
                touches: [
                    { clientX: 0, clientY: 100 },
                    { clientX: 10000, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // FOV 应该被限制
            expect(camera.fov).toBeGreaterThanOrEqual(30);
            expect(camera.fov).toBeLessThanOrEqual(100);
        });
        it('捏合手势应该缩小视野', () => {
            camera.fov = 75;
            // 双指触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 },
                    { clientX: 300, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 双指靠近
            const touchMove = new TouchEvent('touchmove', {
                touches: [
                    { clientX: 150, clientY: 100 },
                    { clientX: 250, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // FOV 应该增大（双指靠近时视野变大）
            expect(camera.fov).toBeGreaterThan(75);
        });
        it('扩张手势应该放大视野', () => {
            camera.fov = 75;
            // 双指触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 150, clientY: 100 },
                    { clientX: 250, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 双指分开
            const touchMove = new TouchEvent('touchmove', {
                touches: [
                    { clientX: 100, clientY: 100 },
                    { clientX: 300, clientY: 100 },
                ],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // FOV 应该减小（双指分开时视野变小）
            expect(camera.fov).toBeLessThan(75);
        });
    });
    describe('惯性效果', () => {
        it('应该在触摸结束后应用惯性', () => {
            // 触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 快速移动
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 200, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 触摸结束
            const touchEnd = new TouchEvent('touchend', {
                touches: [],
                cancelable: true,
            });
            domElement.dispatchEvent(touchEnd);
            const rotationAfterEnd = camera.quaternion.clone();
            // 调用 update 应该继续旋转（惯性）
            touchControls.update();
            expect(camera.quaternion.equals(rotationAfterEnd)).toBe(false);
        });
        it('惯性应该逐渐减弱', () => {
            // 触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 快速移动
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 300, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 触摸结束
            const touchEnd = new TouchEvent('touchend', {
                touches: [],
                cancelable: true,
            });
            domElement.dispatchEvent(touchEnd);
            // 记录初始旋转
            const rotation0 = camera.quaternion.clone();
            // 第一次 update
            touchControls.update();
            const rotation1 = camera.quaternion.clone();
            // 第二次 update
            touchControls.update();
            const rotation2 = camera.quaternion.clone();
            // 计算旋转变化量
            const angle1 = rotation1.angleTo(rotation0);
            const angle2 = rotation2.angleTo(rotation1);
            // 第二次的变化应该小于第一次（惯性减弱）
            expect(angle2).toBeLessThan(angle1);
        });
        it('惯性最终应该停止', () => {
            // 触摸开始
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            // 小幅移动
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 110, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 触摸结束
            const touchEnd = new TouchEvent('touchend', {
                touches: [],
                cancelable: true,
            });
            domElement.dispatchEvent(touchEnd);
            // 多次 update 直到惯性停止
            let lastRotation = camera.quaternion.clone();
            let stoppedCount = 0;
            for (let i = 0; i < 1000; i++) {
                touchControls.update();
                if (camera.quaternion.equals(lastRotation)) {
                    stoppedCount++;
                    if (stoppedCount > 10) {
                        // 连续多次没有变化，说明已停止
                        break;
                    }
                }
                else {
                    stoppedCount = 0;
                }
                lastRotation = camera.quaternion.clone();
            }
            expect(stoppedCount).toBeGreaterThan(10);
        });
    });
    describe('事件处理', () => {
        it('应该阻止默认触摸行为', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');
            domElement.dispatchEvent(touchEvent);
            expect(preventDefaultSpy).toHaveBeenCalled();
        });
        it('禁用时不应该处理触摸事件', () => {
            touchControls.setEnabled(false);
            const initialRotation = camera.quaternion.clone();
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 200, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
        });
    });
    describe('资源清理', () => {
        it('dispose 应该移除事件监听器', () => {
            const removeEventListenerSpy = vi.spyOn(domElement, 'removeEventListener');
            touchControls.dispose();
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
        });
        it('dispose 后应该禁用控制', () => {
            touchControls.dispose();
            const initialRotation = camera.quaternion.clone();
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 200, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchMove);
            // 相机不应该改变
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
        });
        it('多次调用 dispose 不应该出错', () => {
            expect(() => {
                touchControls.dispose();
                touchControls.dispose();
                touchControls.dispose();
            }).not.toThrow();
        });
    });
    describe('边界情况', () => {
        it('应该处理没有 touches 的事件', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [],
                cancelable: true,
            });
            expect(() => {
                domElement.dispatchEvent(touchEvent);
            }).not.toThrow();
        });
        it('应该处理超过两指的触摸', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 },
                    { clientX: 200, clientY: 100 },
                    { clientX: 300, clientY: 100 },
                ],
                cancelable: true,
            });
            expect(() => {
                domElement.dispatchEvent(touchEvent);
            }).not.toThrow();
        });
        it('应该处理触摸位置为 0 的情况', () => {
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 0, clientY: 0 }],
                cancelable: true,
            });
            expect(() => {
                domElement.dispatchEvent(touchStart);
            }).not.toThrow();
        });
        it('应该处理负数触摸位置', () => {
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: -100, clientY: -100 }],
                cancelable: true,
            });
            expect(() => {
                domElement.dispatchEvent(touchStart);
            }).not.toThrow();
        });
    });
    describe('性能', () => {
        it('应该快速处理大量触摸事件', () => {
            const start = performance.now();
            // 模拟快速滑动
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 0, clientY: 100 }],
                cancelable: true,
            });
            domElement.dispatchEvent(touchStart);
            for (let i = 0; i < 100; i++) {
                const touchMove = new TouchEvent('touchmove', {
                    touches: [{ clientX: i * 2, clientY: 100 }],
                    cancelable: true,
                });
                domElement.dispatchEvent(touchMove);
            }
            const touchEnd = new TouchEvent('touchend', {
                touches: [],
                cancelable: true,
            });
            domElement.dispatchEvent(touchEnd);
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(100);
        });
        it('update 方法应该快速执行', () => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                touchControls.update();
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(50);
        });
    });
});
//# sourceMappingURL=TouchControls.test.js.map