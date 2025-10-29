/**
 * EventBus 单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../src/core/EventBus';
describe('EventBus', () => {
    let eventBus;
    beforeEach(() => {
        eventBus = new EventBus();
    });
    describe('基础事件订阅和触发', () => {
        it('应该能够订阅和触发事件', () => {
            const handler = vi.fn();
            eventBus.on('viewer:ready', handler);
            eventBus.emit('viewer:ready');
            expect(handler).toHaveBeenCalledTimes(1);
        });
        it('应该能够传递数据给事件处理器', () => {
            const handler = vi.fn();
            const testData = { url: 'test.jpg', progress: 50 };
            eventBus.on('image:loading', handler);
            eventBus.emit('image:loading', testData);
            expect(handler).toHaveBeenCalledWith(testData);
        });
        it('应该支持多个处理器订阅同一事件', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            const handler3 = vi.fn();
            eventBus.on('camera:change', handler1);
            eventBus.on('camera:change', handler2);
            eventBus.on('camera:change', handler3);
            eventBus.emit('camera:change', { rotation: { x: 0, y: 0, z: 0 }, fov: 75 });
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
            expect(handler3).toHaveBeenCalledTimes(1);
        });
    });
    describe('once 一次性事件', () => {
        it('应该只触发一次', () => {
            const handler = vi.fn();
            eventBus.once('viewer:ready', handler);
            eventBus.emit('viewer:ready');
            eventBus.emit('viewer:ready');
            eventBus.emit('viewer:ready');
            expect(handler).toHaveBeenCalledTimes(1);
        });
        it('多个once处理器都应该只触发一次', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            eventBus.once('render:after', handler1);
            eventBus.once('render:after', handler2);
            eventBus.emit('render:after');
            eventBus.emit('render:after');
            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });
    describe('off 取消订阅', () => {
        it('应该能够取消订阅事件', () => {
            const handler = vi.fn();
            eventBus.on('hotspot:click', handler);
            eventBus.off('hotspot:click', handler);
            eventBus.emit('hotspot:click', { id: 'test', data: {} });
            expect(handler).not.toHaveBeenCalled();
        });
        it('on 返回的取消函数应该能正常工作', () => {
            const handler = vi.fn();
            const unsubscribe = eventBus.on('interaction:drag', handler);
            eventBus.emit('interaction:drag', { x: 10, y: 20, deltaX: 5, deltaY: 10 });
            expect(handler).toHaveBeenCalledTimes(1);
            unsubscribe();
            eventBus.emit('interaction:drag', { x: 15, y: 25, deltaX: 5, deltaY: 5 });
            expect(handler).toHaveBeenCalledTimes(1); // 应该还是 1 次
        });
        it('取消订阅不应该影响其他处理器', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            eventBus.on('quality:change', handler1);
            eventBus.on('quality:change', handler2);
            eventBus.off('quality:change', handler1);
            eventBus.emit('quality:change', { preset: 'high', settings: {} });
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });
    describe('waitFor Promise接口', () => {
        it('应该能够等待事件触发', async () => {
            setTimeout(() => {
                eventBus.emit('image:loaded', { url: 'test.jpg' });
            }, 10);
            const data = await eventBus.waitFor('image:loaded');
            expect(data).toEqual({ url: 'test.jpg' });
        });
        it('超时应该拒绝Promise', async () => {
            await expect(eventBus.waitFor('image:loaded', 50)).rejects.toThrow('Timeout waiting for event');
        });
        it('应该能够在超时前正常返回', async () => {
            setTimeout(() => {
                eventBus.emit('viewer:dispose', undefined);
            }, 10);
            await expect(eventBus.waitFor('viewer:dispose', 100)).resolves.toBeUndefined();
        });
    });
    describe('事件历史', () => {
        it('应该记录事件历史', () => {
            eventBus.emit('hotspot:add', { id: 'hotspot1' });
            eventBus.emit('hotspot:add', { id: 'hotspot2' });
            eventBus.emit('hotspot:remove', { id: 'hotspot1' });
            const history = eventBus.getHistory();
            expect(history).toHaveLength(3);
            expect(history[0].event).toBe('hotspot:add');
            expect(history[1].event).toBe('hotspot:add');
            expect(history[2].event).toBe('hotspot:remove');
        });
        it('应该按时间筛选历史', () => {
            const now = Date.now();
            eventBus.emit('render:before');
            const history = eventBus.getHistory(now - 1000);
            expect(history.length).toBeGreaterThan(0);
        });
        it('历史记录应该有时间戳', () => {
            const before = Date.now();
            eventBus.emit('camera:zoom', { fov: 60 });
            const after = Date.now();
            const history = eventBus.getHistory();
            const lastEvent = history[history.length - 1];
            expect(lastEvent.timestamp).toBeGreaterThanOrEqual(before);
            expect(lastEvent.timestamp).toBeLessThanOrEqual(after);
        });
    });
    describe('错误处理', () => {
        it('处理器抛出错误不应该影响其他处理器', () => {
            const errorHandler = vi.fn(() => {
                throw new Error('Handler error');
            });
            const normalHandler = vi.fn();
            eventBus.on('error', errorHandler);
            eventBus.on('error', normalHandler);
            eventBus.emit('error', new Error('Test error'));
            expect(errorHandler).toHaveBeenCalled();
            expect(normalHandler).toHaveBeenCalled();
        });
    });
    describe('性能和内存', () => {
        it('应该能够清除所有监听器', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            eventBus.on('performance:stats', handler1);
            eventBus.on('performance:warning', handler2);
            eventBus.clear();
            eventBus.emit('performance:stats', { fps: 60, frameTime: 16 });
            eventBus.emit('performance:warning', { type: 'test', message: 'test', value: 0 });
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });
        it('应该能够处理大量事件', () => {
            const handler = vi.fn();
            eventBus.on('test:event', handler);
            for (let i = 0; i < 1000; i++) {
                eventBus.emit('test:event');
            }
            expect(handler).toHaveBeenCalledTimes(1000);
        });
    });
    describe('边界情况', () => {
        it('触发未订阅的事件不应该报错', () => {
            expect(() => {
                eventBus.emit('non:existent:event');
            }).not.toThrow();
        });
        it('取消订阅不存在的处理器不应该报错', () => {
            const handler = vi.fn();
            expect(() => {
                eventBus.off('camera:change', handler);
            }).not.toThrow();
        });
        it('应该支持自定义事件名（通过索引签名）', () => {
            const handler = vi.fn();
            eventBus.on('custom:event', handler);
            eventBus.emit('custom:event', { data: 'test' });
            expect(handler).toHaveBeenCalledWith({ data: 'test' });
        });
    });
});
//# sourceMappingURL=EventBus.test.js.map