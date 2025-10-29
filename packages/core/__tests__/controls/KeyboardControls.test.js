/**
 * KeyboardControls 单元测试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KeyboardControls } from '../../src/controls/KeyboardControls';
import * as THREE from 'three';
describe('KeyboardControls', () => {
    let camera;
    let keyboardControls;
    beforeEach(() => {
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, 5);
        keyboardControls = new KeyboardControls(camera);
    });
    afterEach(() => {
        keyboardControls.dispose();
    });
    describe('基本功能', () => {
        it('应该能够创建 KeyboardControls', () => {
            expect(keyboardControls).toBeDefined();
            expect(keyboardControls).toBeInstanceOf(KeyboardControls);
        });
        it('应该默认启用', () => {
            // 通过按键验证是否启用
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            expect(() => {
                window.dispatchEvent(event);
            }).not.toThrow();
        });
        it('应该能够禁用和启用', () => {
            keyboardControls.setEnabled(false);
            const initialRotation = camera.quaternion.clone();
            // 按下按键
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            // 更新
            keyboardControls.update();
            // 相机不应该改变
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
            keyboardControls.setEnabled(true);
        });
    });
    describe('方向键旋转', () => {
        it('应该能够处理左箭头键', () => {
            const initialRotation = camera.quaternion.clone();
            // 按下左箭头
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            // 更新
            keyboardControls.update();
            // 相机应该发生旋转
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
            // 松开按键
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(keyup);
        });
        it('应该能够处理右箭头键', () => {
            const initialRotation = camera.quaternion.clone();
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowRight' });
            window.dispatchEvent(keyup);
        });
        it('应该能够处理上箭头键', () => {
            const initialRotation = camera.quaternion.clone();
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowUp' });
            window.dispatchEvent(keyup);
        });
        it('应该能够处理下箭头键', () => {
            const initialRotation = camera.quaternion.clone();
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowDown' });
            window.dispatchEvent(keyup);
        });
        it('左右箭头应该影响水平旋转', () => {
            const euler1 = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            const initialY = euler1.y;
            // 按左箭头
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            const euler2 = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            // Y 轴旋转应该改变
            expect(euler2.y).not.toBe(initialY);
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(keyup);
        });
        it('上下箭头应该影响垂直旋转', () => {
            const euler1 = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            const initialX = euler1.x;
            // 按上箭头
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            const euler2 = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            // X 轴旋转应该改变
            expect(euler2.x).not.toBe(initialX);
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowUp' });
            window.dispatchEvent(keyup);
        });
        it('应该限制垂直旋转角度', () => {
            // 持续按上箭头
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            window.dispatchEvent(keydown);
            // 多次更新
            for (let i = 0; i < 100; i++) {
                keyboardControls.update();
            }
            const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            // 垂直旋转应该被限制在 [-π/2, π/2]
            expect(euler.x).toBeGreaterThanOrEqual(-Math.PI / 2);
            expect(euler.x).toBeLessThanOrEqual(Math.PI / 2);
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowUp' });
            window.dispatchEvent(keyup);
        });
    });
    describe('缩放控制', () => {
        it('应该能够处理加号键放大', () => {
            camera.fov = 75;
            const keydown = new KeyboardEvent('keydown', { key: '+' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            // FOV 应该减小（放大）
            expect(camera.fov).toBeLessThan(75);
            const keyup = new KeyboardEvent('keyup', { key: '+' });
            window.dispatchEvent(keyup);
        });
        it('应该能够处理等号键放大', () => {
            camera.fov = 75;
            const keydown = new KeyboardEvent('keydown', { key: '=' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            expect(camera.fov).toBeLessThan(75);
            const keyup = new KeyboardEvent('keyup', { key: '=' });
            window.dispatchEvent(keyup);
        });
        it('应该能够处理减号键缩小', () => {
            camera.fov = 75;
            const keydown = new KeyboardEvent('keydown', { key: '-' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            // FOV 应该增大（缩小）
            expect(camera.fov).toBeGreaterThan(75);
            const keyup = new KeyboardEvent('keyup', { key: '-' });
            window.dispatchEvent(keyup);
        });
        it('应该能够处理下划线键缩小', () => {
            camera.fov = 75;
            const keydown = new KeyboardEvent('keydown', { key: '_' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            expect(camera.fov).toBeGreaterThan(75);
            const keyup = new KeyboardEvent('keyup', { key: '_' });
            window.dispatchEvent(keyup);
        });
        it('应该限制FOV在合理范围内（最小值）', () => {
            camera.fov = 35;
            // 持续放大
            const keydown = new KeyboardEvent('keydown', { key: '+' });
            window.dispatchEvent(keydown);
            for (let i = 0; i < 20; i++) {
                keyboardControls.update();
            }
            // FOV 不应该小于 30
            expect(camera.fov).toBeGreaterThanOrEqual(30);
            const keyup = new KeyboardEvent('keyup', { key: '+' });
            window.dispatchEvent(keyup);
        });
        it('应该限制FOV在合理范围内（最大值）', () => {
            camera.fov = 95;
            // 持续缩小
            const keydown = new KeyboardEvent('keydown', { key: '-' });
            window.dispatchEvent(keydown);
            for (let i = 0; i < 20; i++) {
                keyboardControls.update();
            }
            // FOV 不应该大于 100
            expect(camera.fov).toBeLessThanOrEqual(100);
            const keyup = new KeyboardEvent('keyup', { key: '-' });
            window.dispatchEvent(keyup);
        });
    });
    describe('多键同时按下', () => {
        it('应该能够同时处理多个方向键', () => {
            const initialRotation = camera.quaternion.clone();
            // 同时按下左箭头和上箭头
            const keydown1 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const keydown2 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            window.dispatchEvent(keydown1);
            window.dispatchEvent(keydown2);
            keyboardControls.update();
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
            // 松开按键
            const keyup1 = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            const keyup2 = new KeyboardEvent('keyup', { key: 'ArrowUp' });
            window.dispatchEvent(keyup1);
            window.dispatchEvent(keyup2);
        });
        it('应该能够同时旋转和缩放', () => {
            const initialRotation = camera.quaternion.clone();
            camera.fov = 75;
            // 同时按下左箭头和加号
            const keydown1 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const keydown2 = new KeyboardEvent('keydown', { key: '+' });
            window.dispatchEvent(keydown1);
            window.dispatchEvent(keydown2);
            keyboardControls.update();
            // 旋转和 FOV 都应该改变
            expect(camera.quaternion.equals(initialRotation)).toBe(false);
            expect(camera.fov).toBeLessThan(75);
            // 松开按键
            const keyup1 = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            const keyup2 = new KeyboardEvent('keyup', { key: '+' });
            window.dispatchEvent(keyup1);
            window.dispatchEvent(keyup2);
        });
        it('左右箭头同时按下应该相互抵消', () => {
            const euler1 = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            const initialY = euler1.y;
            // 同时按下左右箭头
            const keydown1 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const keydown2 = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(keydown1);
            window.dispatchEvent(keydown2);
            keyboardControls.update();
            const euler2 = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
            // Y 轴旋转应该基本不变（可能有微小浮点误差）
            expect(Math.abs(euler2.y - initialY)).toBeLessThan(0.01);
            // 松开按键
            const keyup1 = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            const keyup2 = new KeyboardEvent('keyup', { key: 'ArrowRight' });
            window.dispatchEvent(keyup1);
            window.dispatchEvent(keyup2);
        });
    });
    describe('按键状态管理', () => {
        it('松开按键后应该停止旋转', () => {
            // 按下按键
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            const rotation1 = camera.quaternion.clone();
            // 松开按键
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(keyup);
            // 再次更新
            keyboardControls.update();
            // 旋转应该停止
            expect(camera.quaternion.equals(rotation1)).toBe(true);
        });
        it('应该持续响应按住的按键', () => {
            const initialRotation = camera.quaternion.clone();
            // 按下按键
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            // 多次更新
            for (let i = 0; i < 5; i++) {
                keyboardControls.update();
            }
            const finalRotation = camera.quaternion.clone();
            // 应该持续旋转
            expect(finalRotation.equals(initialRotation)).toBe(false);
            // 计算旋转角度应该比单次更新大
            const angle = finalRotation.angleTo(initialRotation);
            expect(angle).toBeGreaterThan(0.01);
            // 松开按键
            const keyup = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(keyup);
        });
        it('禁用时应该清除按键状态', () => {
            // 按下按键
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            // 禁用
            keyboardControls.setEnabled(false);
            const rotation1 = camera.quaternion.clone();
            // 更新不应该改变相机
            keyboardControls.update();
            expect(camera.quaternion.equals(rotation1)).toBe(true);
        });
    });
    describe('资源清理', () => {
        it('dispose 应该移除事件监听器', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            keyboardControls.dispose();
            // 应该调用 removeEventListener
            expect(removeEventListenerSpy).toHaveBeenCalled();
        });
        it('dispose 后应该停止响应按键', () => {
            keyboardControls.dispose();
            const initialRotation = camera.quaternion.clone();
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            // 相机不应该改变
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
        });
        it('dispose 应该清除所有按键状态', () => {
            // 按下多个按键
            const keydown1 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const keydown2 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            window.dispatchEvent(keydown1);
            window.dispatchEvent(keydown2);
            keyboardControls.dispose();
            const rotation1 = camera.quaternion.clone();
            // 更新不应该改变相机
            keyboardControls.update();
            expect(camera.quaternion.equals(rotation1)).toBe(true);
        });
        it('多次调用 dispose 不应该出错', () => {
            expect(() => {
                keyboardControls.dispose();
                keyboardControls.dispose();
                keyboardControls.dispose();
            }).not.toThrow();
        });
    });
    describe('边界情况', () => {
        it('应该处理未知按键', () => {
            const initialRotation = camera.quaternion.clone();
            const initialFov = camera.fov;
            const keydown = new KeyboardEvent('keydown', { key: 'a' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            // 相机不应该改变
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
            expect(camera.fov).toBe(initialFov);
            const keyup = new KeyboardEvent('keyup', { key: 'a' });
            window.dispatchEvent(keyup);
        });
        it('应该处理特殊键', () => {
            const initialRotation = camera.quaternion.clone();
            const keydown = new KeyboardEvent('keydown', { key: 'Control' });
            window.dispatchEvent(keydown);
            keyboardControls.update();
            expect(camera.quaternion.equals(initialRotation)).toBe(true);
            const keyup = new KeyboardEvent('keyup', { key: 'Control' });
            window.dispatchEvent(keyup);
        });
        it('应该处理空按键名', () => {
            expect(() => {
                const keydown = new KeyboardEvent('keydown', { key: '' });
                window.dispatchEvent(keydown);
                keyboardControls.update();
            }).not.toThrow();
        });
        it('禁用状态下按键不应该被记录', () => {
            keyboardControls.setEnabled(false);
            const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            window.dispatchEvent(keydown);
            // 重新启用
            keyboardControls.setEnabled(true);
            const rotation1 = camera.quaternion.clone();
            // 更新不应该有之前按下的按键效果
            keyboardControls.update();
            expect(camera.quaternion.equals(rotation1)).toBe(true);
        });
    });
    describe('性能', () => {
        it('应该快速处理按键事件', () => {
            const start = performance.now();
            for (let i = 0; i < 100; i++) {
                const keydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
                window.dispatchEvent(keydown);
                const keyup = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
                window.dispatchEvent(keyup);
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(50);
        });
        it('update 方法应该快速执行', () => {
            // 按下多个按键
            const keydown1 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            const keydown2 = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            const keydown3 = new KeyboardEvent('keydown', { key: '+' });
            window.dispatchEvent(keydown1);
            window.dispatchEvent(keydown2);
            window.dispatchEvent(keydown3);
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                keyboardControls.update();
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(100);
            // 清理
            const keyup1 = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            const keyup2 = new KeyboardEvent('keyup', { key: 'ArrowUp' });
            const keyup3 = new KeyboardEvent('keyup', { key: '+' });
            window.dispatchEvent(keyup1);
            window.dispatchEvent(keyup2);
            window.dispatchEvent(keyup3);
        });
        it('应该高效管理大量按键', () => {
            const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
            const start = performance.now();
            // 按下所有按键
            keys.forEach((key) => {
                const keydown = new KeyboardEvent('keydown', { key });
                window.dispatchEvent(keydown);
            });
            // 多次更新
            for (let i = 0; i < 100; i++) {
                keyboardControls.update();
            }
            // 松开所有按键
            keys.forEach((key) => {
                const keyup = new KeyboardEvent('keyup', { key });
                window.dispatchEvent(keyup);
            });
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(50);
        });
    });
});
//# sourceMappingURL=KeyboardControls.test.js.map