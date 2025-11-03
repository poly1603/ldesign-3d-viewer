/**
 * 核心模块性能基准测试
 */
import { describe, bench, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../src/core/EventBus';
import { StateManager } from '../../src/core/StateManager';
import { MemoryManager } from '../../src/core/MemoryManager';
describe('EventBus Performance', () => {
    let eventBus;
    beforeEach(() => {
        eventBus = new EventBus();
    });
    afterEach(() => {
        eventBus.dispose();
    });
    bench('emit event (no listeners)', () => {
        eventBus.emit('test-event', { data: 'test' });
    });
    bench('emit event (1 listener)', () => {
        eventBus.on('test-event', () => { });
        eventBus.emit('test-event', { data: 'test' });
    });
    bench('emit event (10 listeners)', () => {
        for (let i = 0; i < 10; i++) {
            eventBus.on('test-event', () => { });
        }
        eventBus.emit('test-event', { data: 'test' });
    });
    bench('add and remove listener', () => {
        const handler = () => { };
        eventBus.on('test-event', handler);
        eventBus.off('test-event', handler);
    });
    bench('add 100 listeners', () => {
        for (let i = 0; i < 100; i++) {
            eventBus.on(`event-${i}`, () => { });
        }
    });
});
describe('StateManager Performance', () => {
    let stateManager;
    beforeEach(() => {
        stateManager = new StateManager({
            view: { fov: 75, pitch: 0, yaw: 0 },
            loading: false,
            error: null,
        });
    });
    afterEach(() => {
        stateManager.dispose();
    });
    bench('get state', () => {
        stateManager.getState();
    });
    bench('update state (single property)', () => {
        stateManager.setState({ loading: true });
    });
    bench('update state (nested property)', () => {
        stateManager.setState({ view: { fov: 80, pitch: 10, yaw: 20 } });
    });
    bench('subscribe to state changes', () => {
        const unsubscribe = stateManager.subscribe(() => { });
        unsubscribe();
    });
    bench('notify 10 subscribers', () => {
        const unsubscribers = [];
        for (let i = 0; i < 10; i++) {
            unsubscribers.push(stateManager.subscribe(() => { }));
        }
        stateManager.setState({ loading: true });
        unsubscribers.forEach(fn => fn());
    });
    bench('batch state updates', () => {
        stateManager.setState({
            view: { fov: 75, pitch: 0, yaw: 0 },
            loading: true,
            error: null,
        });
    });
});
describe('MemoryManager Performance', () => {
    let memoryManager;
    beforeEach(() => {
        memoryManager = MemoryManager.getInstance();
        memoryManager.clearAll();
    });
    bench('track resource', () => {
        const resource = { dispose: () => { } };
        memoryManager.track(resource);
    });
    bench('track 100 resources', () => {
        for (let i = 0; i < 100; i++) {
            memoryManager.track({ dispose: () => { } });
        }
    });
    bench('untrack resource', () => {
        const resource = { dispose: () => { } };
        memoryManager.track(resource);
        memoryManager.untrack(resource);
    });
    bench('get memory info', () => {
        memoryManager.getMemoryInfo();
    });
    bench('cleanup (50 resources)', () => {
        for (let i = 0; i < 50; i++) {
            memoryManager.track({ dispose: () => { } });
        }
        memoryManager.clearAll();
    });
});
//# sourceMappingURL=core.bench.js.map