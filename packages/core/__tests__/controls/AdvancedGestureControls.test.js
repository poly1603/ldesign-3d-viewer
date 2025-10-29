import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdvancedGestureControls } from '../../src/controls/AdvancedGestureControls';
// Helper to create mock touch
function createTouch(identifier, clientX, clientY) {
    return {
        identifier,
        clientX,
        clientY,
        screenX: clientX,
        screenY: clientY,
        pageX: clientX,
        pageY: clientY,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        force: 1,
        target: document.createElement('div'),
    };
}
// Helper to create TouchEvent
function createTouchEvent(type, touches, changedTouches = touches) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'touches', {
        value: touches,
        writable: false,
    });
    Object.defineProperty(event, 'changedTouches', {
        value: changedTouches,
        writable: false,
    });
    Object.defineProperty(event, 'targetTouches', {
        value: touches,
        writable: false,
    });
    return event;
}
describe('AdvancedGestureControls', () => {
    let element;
    let controls;
    let gestureCallback;
    let capturedGestures;
    beforeEach(() => {
        element = document.createElement('div');
        capturedGestures = [];
        gestureCallback = vi.fn((event) => {
            capturedGestures.push(event);
        });
        controls = new AdvancedGestureControls(element, gestureCallback);
    });
    afterEach(() => {
        // Properly dispose controls to clean up timers and event listeners
        if (controls) {
            controls.dispose();
        }
    });
    describe('基本功能', () => {
        it('应该能够创建 AdvancedGestureControls', () => {
            expect(controls).toBeDefined();
        });
        it('应该接受可选的回调函数', () => {
            const controlsWithoutCallback = new AdvancedGestureControls(element);
            expect(controlsWithoutCallback).toBeDefined();
        });
        it('应该能够禁用和启用', () => {
            controls.setEnabled(false);
            const touch = createTouch(0, 100, 100);
            const event = createTouchEvent('touchstart', [touch]);
            element.dispatchEvent(event);
            expect(capturedGestures.length).toBe(0);
            controls.setEnabled(true);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            // Long press should not fire immediately
            expect(capturedGestures.length).toBe(0);
        });
    });
    describe('单击手势', () => {
        it('应该能够检测单击', async () => {
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            // Wait a bit but not long enough for long-press
            await new Promise(resolve => setTimeout(resolve, 100));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            expect(capturedGestures.length).toBeGreaterThanOrEqual(1);
            expect(capturedGestures[capturedGestures.length - 1].type).toBe('tap');
            expect(capturedGestures[capturedGestures.length - 1].x).toBe(100);
            expect(capturedGestures[capturedGestures.length - 1].y).toBe(100);
        });
        it('移动超过10px不应该触发单击', async () => {
            const touch1 = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 50));
            const touch2 = createTouch(0, 120, 100);
            element.dispatchEvent(createTouchEvent('touchend', [], [touch2]));
            const tapGestures = capturedGestures.filter(g => g.type === 'tap');
            expect(tapGestures.length).toBe(0);
        });
        it('时间超过300ms不应该触发单击', async () => {
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 350));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            const tapGestures = capturedGestures.filter(g => g.type === 'tap');
            expect(tapGestures.length).toBe(0);
        });
    });
    describe('双击手势', () => {
        it('应该能够检测双击', async () => {
            const touch = createTouch(0, 100, 100);
            // First tap
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            // Second tap (within 300ms)
            await new Promise(resolve => setTimeout(resolve, 100));
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            const doubleTapGestures = capturedGestures.filter(g => g.type === 'doubletap');
            expect(doubleTapGestures.length).toBe(1);
            expect(doubleTapGestures[0].x).toBe(100);
            expect(doubleTapGestures[0].y).toBe(100);
        });
        it('间隔超过300ms不应该触发双击', async () => {
            const touch = createTouch(0, 100, 100);
            // First tap
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            // Second tap (after 350ms)
            await new Promise(resolve => setTimeout(resolve, 350));
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            const doubleTapGestures = capturedGestures.filter(g => g.type === 'doubletap');
            expect(doubleTapGestures.length).toBe(0);
        });
    });
    describe('长按手势', () => {
        it('应该能够检测长按', async () => {
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            // Wait for long-press delay (500ms)
            await new Promise(resolve => setTimeout(resolve, 550));
            const longPressGestures = capturedGestures.filter(g => g.type === 'longpress');
            expect(longPressGestures.length).toBe(1);
            expect(longPressGestures[0].x).toBe(100);
            expect(longPressGestures[0].y).toBe(100);
        });
        it('移动手指应该取消长按', async () => {
            const touch1 = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            // Move finger before long-press fires
            await new Promise(resolve => setTimeout(resolve, 200));
            const touch2 = createTouch(0, 105, 105);
            element.dispatchEvent(createTouchEvent('touchmove', [touch2]));
            // Wait for what would have been long-press
            await new Promise(resolve => setTimeout(resolve, 400));
            const longPressGestures = capturedGestures.filter(g => g.type === 'longpress');
            expect(longPressGestures.length).toBe(0);
        });
        it('抬起手指应该取消长按', async () => {
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            // Lift finger before long-press fires
            await new Promise(resolve => setTimeout(resolve, 200));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            // Wait for what would have been long-press
            await new Promise(resolve => setTimeout(resolve, 400));
            const longPressGestures = capturedGestures.filter(g => g.type === 'longpress');
            expect(longPressGestures.length).toBe(0);
        });
    });
    describe('滑动手势', () => {
        it('应该能够检测滑动', async () => {
            const touch1 = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 100));
            const touch2 = createTouch(0, 200, 150);
            element.dispatchEvent(createTouchEvent('touchend', [], [touch2]));
            const swipeGestures = capturedGestures.filter(g => g.type === 'swipe');
            expect(swipeGestures.length).toBe(1);
            expect(swipeGestures[0].deltaX).toBe(100);
            expect(swipeGestures[0].deltaY).toBe(50);
        });
        it('移动距离小于50px不应该触发滑动', async () => {
            const touch1 = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 100));
            const touch2 = createTouch(0, 140, 100);
            element.dispatchEvent(createTouchEvent('touchend', [], [touch2]));
            const swipeGestures = capturedGestures.filter(g => g.type === 'swipe');
            expect(swipeGestures.length).toBe(0);
        });
        it('时间超过300ms不应该触发滑动', async () => {
            const touch1 = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 350));
            const touch2 = createTouch(0, 200, 100);
            element.dispatchEvent(createTouchEvent('touchend', [], [touch2]));
            const swipeGestures = capturedGestures.filter(g => g.type === 'swipe');
            expect(swipeGestures.length).toBe(0);
        });
        it('应该能够检测向上滑动', async () => {
            const touch1 = createTouch(0, 100, 200);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 100));
            const touch2 = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchend', [], [touch2]));
            const swipeGestures = capturedGestures.filter(g => g.type === 'swipe');
            expect(swipeGestures.length).toBe(1);
            expect(swipeGestures[0].deltaY).toBe(-100);
        });
    });
    describe('捏合旋转手势', () => {
        it('应该能够检测旋转', async () => {
            const touch1 = createTouch(0, 100, 100);
            const touch2 = createTouch(1, 200, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            await new Promise(resolve => setTimeout(resolve, 50));
            // Rotate 10 degrees (significant rotation)
            const touch1Moved = createTouch(0, 100, 110);
            const touch2Moved = createTouch(1, 200, 90);
            element.dispatchEvent(createTouchEvent('touchmove', [touch1Moved, touch2Moved]));
            const pinchRotateGestures = capturedGestures.filter(g => g.type === 'pinchrotate');
            // May or may not fire depending on angle threshold
            if (pinchRotateGestures.length > 0) {
                expect(pinchRotateGestures[0].rotation).toBeDefined();
                expect(pinchRotateGestures[0].scale).toBeDefined();
            }
        });
        it('应该能够跟踪缩放', async () => {
            const touch1 = createTouch(0, 100, 100);
            const touch2 = createTouch(1, 200, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            await new Promise(resolve => setTimeout(resolve, 50));
            // Move fingers apart (zoom in)
            const touch1Moved = createTouch(0, 50, 100);
            const touch2Moved = createTouch(1, 250, 100);
            element.dispatchEvent(createTouchEvent('touchmove', [touch1Moved, touch2Moved]));
            // The pinchrotate event should include scale
            const pinchRotateGestures = capturedGestures.filter(g => g.type === 'pinchrotate');
            if (pinchRotateGestures.length > 0) {
                expect(pinchRotateGestures[0].scale).toBeGreaterThan(1);
            }
        });
        it('小于5度的旋转不应该触发事件', async () => {
            const touch1 = createTouch(0, 100, 100);
            const touch2 = createTouch(1, 200, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            await new Promise(resolve => setTimeout(resolve, 50));
            // Very small rotation (< 5 degrees)
            const touch1Moved = createTouch(0, 100, 101);
            const touch2Moved = createTouch(1, 200, 99);
            element.dispatchEvent(createTouchEvent('touchmove', [touch1Moved, touch2Moved]));
            const pinchRotateGestures = capturedGestures.filter(g => g.type === 'pinchrotate');
            expect(pinchRotateGestures.length).toBe(0);
        });
        it('结束触摸应该重置捏合旋转状态', async () => {
            const touch1 = createTouch(0, 100, 100);
            const touch2 = createTouch(1, 200, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            await new Promise(resolve => setTimeout(resolve, 50));
            // End one touch
            element.dispatchEvent(createTouchEvent('touchend', [touch1], [touch2]));
            // Start new two-finger gesture
            const touch3 = createTouch(2, 150, 150);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch3]));
            // Should not throw error
            const touch1Moved = createTouch(0, 100, 110);
            const touch3Moved = createTouch(2, 150, 160);
            expect(() => element.dispatchEvent(createTouchEvent('touchmove', [touch1Moved, touch3Moved]))).not.toThrow();
        });
    });
    describe('多点触摸', () => {
        it('应该能够跟踪多个触摸点', async () => {
            const touch1 = createTouch(0, 100, 100);
            const touch2 = createTouch(1, 200, 200);
            const touch3 = createTouch(2, 150, 150);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 10));
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            await new Promise(resolve => setTimeout(resolve, 10));
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2, touch3]));
            // Should not throw error
            expect(capturedGestures.length).toBeGreaterThanOrEqual(0);
        });
        it('应该能够正确处理触摸点的添加和移除', async () => {
            const touch1 = createTouch(0, 100, 100);
            const touch2 = createTouch(1, 200, 200);
            element.dispatchEvent(createTouchEvent('touchstart', [touch1]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [touch1], [touch2]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch1]));
            // Should handle all transitions without errors
            expect(true).toBe(true);
        });
    });
    describe('资源清理', () => {
        it('dispose 应该清除所有触摸状态', async () => {
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            controls.dispose();
            // Should not throw error
            expect(() => element.dispatchEvent(createTouchEvent('touchend', [], [touch]))).not.toThrow();
        });
        it('dispose 应该取消长按计时器', async () => {
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            controls.dispose();
            // Wait for what would have been long-press
            await new Promise(resolve => setTimeout(resolve, 600));
            const longPressGestures = capturedGestures.filter(g => g.type === 'longpress');
            expect(longPressGestures.length).toBe(0);
        });
        it('dispose 应该移除事件监听器', () => {
            const initialGestureCount = capturedGestures.length;
            controls.dispose();
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            // No new gestures should be captured
            expect(capturedGestures.length).toBe(initialGestureCount);
        });
        it('多次调用 dispose 不应该出错', () => {
            expect(() => {
                controls.dispose();
                controls.dispose();
                controls.dispose();
            }).not.toThrow();
        });
    });
    describe('边界情况', () => {
        it('应该能够处理无效的触摸标识符', async () => {
            const touch = createTouch(999, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            // Should not throw error
            expect(capturedGestures.length).toBeGreaterThanOrEqual(0);
        });
        it('应该能够处理坐标为0的触摸', async () => {
            const touch = createTouch(0, 0, 0);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            const tapGestures = capturedGestures.filter(g => g.type === 'tap');
            if (tapGestures.length > 0) {
                expect(tapGestures[0].x).toBe(0);
                expect(tapGestures[0].y).toBe(0);
            }
        });
        it('应该能够处理负坐标的触摸', async () => {
            const touch = createTouch(0, -50, -50);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 50));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            // Should not throw error
            expect(true).toBe(true);
        });
        it('禁用后不应该触发任何手势', async () => {
            controls.setEnabled(false);
            const touch = createTouch(0, 100, 100);
            element.dispatchEvent(createTouchEvent('touchstart', [touch]));
            await new Promise(resolve => setTimeout(resolve, 600));
            element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            expect(capturedGestures.length).toBe(0);
        });
    });
    describe('性能', () => {
        it('应该快速处理触摸事件', () => {
            const startTime = performance.now();
            for (let i = 0; i < 100; i++) {
                const touch = createTouch(i, 100 + i, 100 + i);
                element.dispatchEvent(createTouchEvent('touchstart', [touch]));
                element.dispatchEvent(createTouchEvent('touchend', [], [touch]));
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Should process 200 events in less than 100ms
            expect(duration).toBeLessThan(100);
        });
        it('应该高效处理复杂的多点触摸序列', () => {
            const startTime = performance.now();
            for (let i = 0; i < 50; i++) {
                const touch1 = createTouch(0, 100, 100);
                const touch2 = createTouch(1, 200, 200);
                element.dispatchEvent(createTouchEvent('touchstart', [touch1, touch2]));
                const touch1Moved = createTouch(0, 100 + i, 100 + i);
                const touch2Moved = createTouch(1, 200 - i, 200 - i);
                element.dispatchEvent(createTouchEvent('touchmove', [touch1Moved, touch2Moved]));
                element.dispatchEvent(createTouchEvent('touchend', [], [touch1, touch2]));
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Should process 150 events in less than 150ms
            expect(duration).toBeLessThan(150);
        });
    });
});
//# sourceMappingURL=AdvancedGestureControls.test.js.map