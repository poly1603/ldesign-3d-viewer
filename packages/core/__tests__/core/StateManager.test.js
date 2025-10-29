import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus';
import { ControlState, InteractionMode, RenderMode, StateManager, ViewerState, } from '../../src/core/StateManager';
describe('StateManager', () => {
    let eventBus;
    let stateManager;
    beforeEach(() => {
        eventBus = new EventBus();
        stateManager = new StateManager(eventBus);
    });
    describe('基本功能', () => {
        it('应该能够创建 StateManager', () => {
            expect(stateManager).toBeDefined();
        });
        it('应该初始化为 IDLE 状态', () => {
            expect(stateManager.getViewerState()).toBe(ViewerState.IDLE);
        });
        it('应该返回完整的状态对象', () => {
            const state = stateManager.getState();
            expect(state).toHaveProperty('viewer');
            expect(state).toHaveProperty('controls');
            expect(state).toHaveProperty('renderMode');
            expect(state).toHaveProperty('interactionMode');
            expect(state).toHaveProperty('isAutoRotating');
            expect(state).toHaveProperty('isFullscreen');
            expect(state).toHaveProperty('isDragging');
            expect(state).toHaveProperty('isTransitioning');
            expect(state).toHaveProperty('quality');
        });
        it('返回的状态对象应该是只读副本', () => {
            const state1 = stateManager.getState();
            const state2 = stateManager.getState();
            expect(state1).not.toBe(state2);
            expect(state1.controls).not.toBe(state2.controls);
        });
    });
    describe('Viewer 状态管理', () => {
        it('应该能够设置 Viewer 状态', () => {
            stateManager.setViewerState(ViewerState.LOADING);
            expect(stateManager.getViewerState()).toBe(ViewerState.LOADING);
        });
        it('状态改变时应该触发 ready 事件', () => {
            const readyHandler = vi.fn();
            eventBus.on('viewer:ready', readyHandler);
            stateManager.setViewerState(ViewerState.READY);
            expect(readyHandler).toHaveBeenCalled();
        });
        it('进入错误状态时应该触发 error 事件', () => {
            const errorHandler = vi.fn();
            eventBus.on('error', errorHandler);
            stateManager.setViewerState(ViewerState.ERROR);
            expect(errorHandler).toHaveBeenCalled();
            expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
        });
        it('设置相同状态时不应该触发事件', () => {
            stateManager.setViewerState(ViewerState.READY);
            const readyHandler = vi.fn();
            eventBus.on('viewer:ready', readyHandler);
            stateManager.setViewerState(ViewerState.READY);
            expect(readyHandler).not.toHaveBeenCalled();
        });
        it('isLoading 应该正确判断加载状态', () => {
            expect(stateManager.isLoading()).toBe(false);
            stateManager.setViewerState(ViewerState.LOADING);
            expect(stateManager.isLoading()).toBe(true);
            stateManager.setViewerState(ViewerState.READY);
            expect(stateManager.isLoading()).toBe(false);
        });
        it('isReady 应该正确判断就绪状态', () => {
            expect(stateManager.isReady()).toBe(false);
            stateManager.setViewerState(ViewerState.READY);
            expect(stateManager.isReady()).toBe(true);
            stateManager.setViewerState(ViewerState.ERROR);
            expect(stateManager.isReady()).toBe(false);
        });
        it('isDisposed 应该正确判断销毁状态', () => {
            expect(stateManager.isDisposed()).toBe(false);
            stateManager.setViewerState(ViewerState.DISPOSED);
            expect(stateManager.isDisposed()).toBe(true);
        });
    });
    describe('交互能力检查', () => {
        it('IDLE 状态下不能交互', () => {
            expect(stateManager.canInteract()).toBe(false);
        });
        it('LOADING 状态下不能交互', () => {
            stateManager.setViewerState(ViewerState.LOADING);
            expect(stateManager.canInteract()).toBe(false);
        });
        it('READY 状态下可以交互', () => {
            stateManager.setViewerState(ViewerState.READY);
            expect(stateManager.canInteract()).toBe(true);
        });
        it('过渡中不能交互', () => {
            stateManager.setViewerState(ViewerState.READY);
            stateManager.setTransitioning(true);
            expect(stateManager.canInteract()).toBe(false);
        });
        it('DISPOSED 状态下不能交互', () => {
            stateManager.setViewerState(ViewerState.DISPOSED);
            expect(stateManager.canInteract()).toBe(false);
        });
    });
    describe('控制状态管理', () => {
        it('应该能够启用控制', () => {
            stateManager.enableControl(ControlState.MOUSE);
            expect(stateManager.isControlEnabled(ControlState.MOUSE)).toBe(true);
        });
        it('应该能够禁用控制', () => {
            stateManager.enableControl(ControlState.MOUSE);
            stateManager.disableControl(ControlState.MOUSE);
            expect(stateManager.isControlEnabled(ControlState.MOUSE)).toBe(false);
        });
        it('启用控制时应该触发事件', () => {
            const handler = vi.fn();
            eventBus.on('controls:enable', handler);
            stateManager.enableControl(ControlState.TOUCH);
            expect(handler).toHaveBeenCalledWith({ type: ControlState.TOUCH });
        });
        it('禁用控制时应该触发事件', () => {
            stateManager.enableControl(ControlState.TOUCH);
            const handler = vi.fn();
            eventBus.on('controls:disable', handler);
            stateManager.disableControl(ControlState.TOUCH);
            expect(handler).toHaveBeenCalledWith({ type: ControlState.TOUCH });
        });
        it('应该能够同时启用多个控制', () => {
            stateManager.enableControl(ControlState.MOUSE);
            stateManager.enableControl(ControlState.KEYBOARD);
            stateManager.enableControl(ControlState.TOUCH);
            expect(stateManager.isControlEnabled(ControlState.MOUSE)).toBe(true);
            expect(stateManager.isControlEnabled(ControlState.KEYBOARD)).toBe(true);
            expect(stateManager.isControlEnabled(ControlState.TOUCH)).toBe(true);
        });
        it('重复启用控制不应该触发事件', () => {
            stateManager.enableControl(ControlState.MOUSE);
            const handler = vi.fn();
            eventBus.on('controls:enable', handler);
            stateManager.enableControl(ControlState.MOUSE);
            expect(handler).not.toHaveBeenCalled();
        });
        it('禁用未启用的控制不应该触发事件', () => {
            const handler = vi.fn();
            eventBus.on('controls:disable', handler);
            stateManager.disableControl(ControlState.GYROSCOPE);
            expect(handler).not.toHaveBeenCalled();
        });
    });
    describe('渲染模式管理', () => {
        it('应该默认为 ON_DEMAND 模式', () => {
            expect(stateManager.getRenderMode()).toBe(RenderMode.ON_DEMAND);
        });
        it('应该能够设置渲染模式', () => {
            stateManager.setRenderMode(RenderMode.CONTINUOUS);
            expect(stateManager.getRenderMode()).toBe(RenderMode.CONTINUOUS);
        });
        it('设置相同模式不应该触发状态记录', () => {
            stateManager.setRenderMode(RenderMode.CONTINUOUS);
            const historyLength = stateManager.getStateHistory().length;
            stateManager.setRenderMode(RenderMode.CONTINUOUS);
            expect(stateManager.getStateHistory().length).toBe(historyLength);
        });
    });
    describe('交互模式管理', () => {
        it('应该默认为 NAVIGATE 模式', () => {
            expect(stateManager.getInteractionMode()).toBe(InteractionMode.NAVIGATE);
        });
        it('应该能够设置交互模式', () => {
            stateManager.setInteractionMode(InteractionMode.MEASURE);
            expect(stateManager.getInteractionMode()).toBe(InteractionMode.MEASURE);
        });
        it('应该能够切换多种交互模式', () => {
            const modes = [
                InteractionMode.MEASURE,
                InteractionMode.ANNOTATE,
                InteractionMode.EDIT_HOTSPOT,
                InteractionMode.NAVIGATE,
            ];
            for (const mode of modes) {
                stateManager.setInteractionMode(mode);
                expect(stateManager.getInteractionMode()).toBe(mode);
            }
        });
    });
    describe('自动旋转状态', () => {
        it('应该默认不自动旋转', () => {
            expect(stateManager.isAutoRotating()).toBe(false);
        });
        it('应该能够启用自动旋转', () => {
            stateManager.setAutoRotating(true);
            expect(stateManager.isAutoRotating()).toBe(true);
        });
        it('应该能够禁用自动旋转', () => {
            stateManager.setAutoRotating(true);
            stateManager.setAutoRotating(false);
            expect(stateManager.isAutoRotating()).toBe(false);
        });
    });
    describe('全屏状态', () => {
        it('应该默认不是全屏', () => {
            expect(stateManager.isFullscreen()).toBe(false);
        });
        it('应该能够进入全屏', () => {
            stateManager.setFullscreen(true);
            expect(stateManager.isFullscreen()).toBe(true);
        });
        it('应该能够退出全屏', () => {
            stateManager.setFullscreen(true);
            stateManager.setFullscreen(false);
            expect(stateManager.isFullscreen()).toBe(false);
        });
    });
    describe('拖拽状态', () => {
        it('应该默认不在拖拽', () => {
            expect(stateManager.isDragging()).toBe(false);
        });
        it('应该能够设置拖拽状态', () => {
            stateManager.setDragging(true);
            expect(stateManager.isDragging()).toBe(true);
        });
        it('开始拖拽时应该触发 dragstart 事件', () => {
            const handler = vi.fn();
            eventBus.on('interaction:dragstart', handler);
            stateManager.setDragging(true);
            expect(handler).toHaveBeenCalled();
        });
        it('结束拖拽时应该触发 dragend 事件', () => {
            stateManager.setDragging(true);
            const handler = vi.fn();
            eventBus.on('interaction:dragend', handler);
            stateManager.setDragging(false);
            expect(handler).toHaveBeenCalled();
        });
    });
    describe('过渡状态', () => {
        it('应该默认不在过渡中', () => {
            expect(stateManager.isTransitioning()).toBe(false);
        });
        it('应该能够设置过渡状态', () => {
            stateManager.setTransitioning(true);
            expect(stateManager.isTransitioning()).toBe(true);
        });
        it('应该能够结束过渡', () => {
            stateManager.setTransitioning(true);
            stateManager.setTransitioning(false);
            expect(stateManager.isTransitioning()).toBe(false);
        });
    });
    describe('质量级别管理', () => {
        it('应该默认为 high 质量', () => {
            expect(stateManager.getQuality()).toBe('high');
        });
        it('应该能够设置质量级别', () => {
            stateManager.setQuality('ultra');
            expect(stateManager.getQuality()).toBe('ultra');
        });
        it('质量变化时应该触发事件', () => {
            const handler = vi.fn();
            eventBus.on('quality:change', handler);
            stateManager.setQuality('low');
            expect(handler).toHaveBeenCalledWith({ preset: 'low', settings: {} });
        });
        it('应该能够设置所有质量级别', () => {
            const qualities = ['ultra', 'high', 'medium', 'low'];
            for (const quality of qualities) {
                stateManager.setQuality(quality);
                expect(stateManager.getQuality()).toBe(quality);
            }
        });
    });
    describe('状态历史', () => {
        it('应该记录状态变化', () => {
            stateManager.setViewerState(ViewerState.LOADING);
            stateManager.setViewerState(ViewerState.READY);
            const history = stateManager.getStateHistory();
            expect(history.length).toBeGreaterThan(0);
            expect(history[history.length - 1].state).toHaveProperty('viewer', ViewerState.READY);
        });
        it('每个历史记录应该包含时间戳', () => {
            stateManager.setViewerState(ViewerState.LOADING);
            const history = stateManager.getStateHistory();
            expect(history[history.length - 1]).toHaveProperty('timestamp');
            expect(typeof history[history.length - 1].timestamp).toBe('number');
        });
        it('应该限制历史记录数量', () => {
            // 触发超过 50 次状态变化
            for (let i = 0; i < 60; i++) {
                stateManager.setAutoRotating(i % 2 === 0);
            }
            const history = stateManager.getStateHistory();
            expect(history.length).toBeLessThanOrEqual(50);
        });
        it('返回的历史应该是副本', () => {
            const history1 = stateManager.getStateHistory();
            const history2 = stateManager.getStateHistory();
            expect(history1).not.toBe(history2);
        });
    });
    describe('重置功能', () => {
        it('应该能够重置所有状态', () => {
            // 修改各种状态
            stateManager.setViewerState(ViewerState.READY);
            stateManager.enableControl(ControlState.MOUSE);
            stateManager.setRenderMode(RenderMode.CONTINUOUS);
            stateManager.setInteractionMode(InteractionMode.MEASURE);
            stateManager.setAutoRotating(true);
            stateManager.setFullscreen(true);
            stateManager.setDragging(true);
            stateManager.setTransitioning(true);
            stateManager.setQuality('ultra');
            // 重置
            stateManager.reset();
            // 验证所有状态恢复初始值
            expect(stateManager.getViewerState()).toBe(ViewerState.IDLE);
            expect(stateManager.isControlEnabled(ControlState.MOUSE)).toBe(false);
            expect(stateManager.getRenderMode()).toBe(RenderMode.ON_DEMAND);
            expect(stateManager.getInteractionMode()).toBe(InteractionMode.NAVIGATE);
            expect(stateManager.isAutoRotating()).toBe(false);
            expect(stateManager.isFullscreen()).toBe(false);
            expect(stateManager.isDragging()).toBe(false);
            expect(stateManager.isTransitioning()).toBe(false);
            expect(stateManager.getQuality()).toBe('high');
        });
        it('重置应该清空历史记录', () => {
            stateManager.setViewerState(ViewerState.READY);
            stateManager.setAutoRotating(true);
            stateManager.reset();
            expect(stateManager.getStateHistory().length).toBe(0);
        });
    });
    describe('销毁功能', () => {
        it('应该能够销毁状态管理器', () => {
            stateManager.dispose();
            expect(stateManager.isDisposed()).toBe(true);
        });
        it('销毁时应该清空所有控制', () => {
            stateManager.enableControl(ControlState.MOUSE);
            stateManager.enableControl(ControlState.KEYBOARD);
            stateManager.dispose();
            expect(stateManager.isControlEnabled(ControlState.MOUSE)).toBe(false);
            expect(stateManager.isControlEnabled(ControlState.KEYBOARD)).toBe(false);
        });
        it('销毁时应该清空历史记录', () => {
            stateManager.setViewerState(ViewerState.READY);
            stateManager.dispose();
            expect(stateManager.getStateHistory().length).toBe(0);
        });
    });
    describe('复杂场景', () => {
        it('应该能够处理快速连续的状态变化', () => {
            for (let i = 0; i < 100; i++) {
                stateManager.setAutoRotating(i % 2 === 0);
                stateManager.setDragging(i % 3 === 0);
                stateManager.setTransitioning(i % 5 === 0);
            }
            // 不应该出错
            expect(stateManager.getState()).toBeDefined();
        });
        it('应该能够处理复杂的状态组合', () => {
            stateManager.setViewerState(ViewerState.READY);
            stateManager.enableControl(ControlState.MOUSE);
            stateManager.enableControl(ControlState.KEYBOARD);
            stateManager.setRenderMode(RenderMode.CONTINUOUS);
            stateManager.setInteractionMode(InteractionMode.ANNOTATE);
            stateManager.setAutoRotating(false);
            stateManager.setFullscreen(true);
            const state = stateManager.getState();
            expect(state.viewer).toBe(ViewerState.READY);
            expect(state.controls.has(ControlState.MOUSE)).toBe(true);
            expect(state.controls.has(ControlState.KEYBOARD)).toBe(true);
            expect(state.renderMode).toBe(RenderMode.CONTINUOUS);
            expect(state.interactionMode).toBe(InteractionMode.ANNOTATE);
            expect(state.isAutoRotating).toBe(false);
            expect(state.isFullscreen).toBe(true);
        });
    });
    describe('性能', () => {
        it('应该快速执行状态查询', () => {
            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                stateManager.getState();
                stateManager.getViewerState();
                stateManager.canInteract();
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // 3000次查询应该在50ms内完成
            expect(duration).toBeLessThan(50);
        });
        it('应该快速执行状态修改', () => {
            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                stateManager.setAutoRotating(i % 2 === 0);
                stateManager.setDragging(i % 3 === 0);
                stateManager.setTransitioning(i % 5 === 0);
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // 3000次状态修改应该在100ms内完成
            expect(duration).toBeLessThan(100);
        });
    });
});
//# sourceMappingURL=StateManager.test.js.map