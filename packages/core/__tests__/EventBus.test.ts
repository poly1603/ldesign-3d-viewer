/**
 * EventBus 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../src/core/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on() and emit()', () => {
    it('should subscribe and emit events', () => {
      const handler = vi.fn();
      eventBus.on('viewer:ready', handler);

      eventBus.emit('viewer:ready');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass data to handlers', () => {
      const handler = vi.fn();
      eventBus.on('camera:change', handler);

      const data = { rotation: { x: 1, y: 2, z: 3 }, fov: 75 };
      eventBus.emit('camera:change', data);

      expect(handler).toHaveBeenCalledWith(data);
    });

    it('should support multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('viewer:ready', handler1);
      eventBus.on('viewer:ready', handler2);

      eventBus.emit('viewer:ready');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('once()', () => {
    it('should only trigger handler once', () => {
      const handler = vi.fn();
      eventBus.once('viewer:ready', handler);

      eventBus.emit('viewer:ready');
      eventBus.emit('viewer:ready');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('off()', () => {
    it('should unsubscribe handler', () => {
      const handler = vi.fn();
      eventBus.on('viewer:ready', handler);
      eventBus.off('viewer:ready', handler);

      eventBus.emit('viewer:ready');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function from on()', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('viewer:ready', handler);

      unsubscribe();
      eventBus.emit('viewer:ready');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('waitFor()', () => {
    it('should resolve when event is emitted', async () => {
      setTimeout(() => {
        eventBus.emit('viewer:ready');
      }, 10);

      await expect(eventBus.waitFor('viewer:ready', 1000)).resolves.toBeUndefined();
    });

    it('should reject on timeout', async () => {
      await expect(eventBus.waitFor('viewer:ready', 10)).rejects.toThrow('Timeout');
    });
  });

  describe('clear()', () => {
    it('should clear all listeners for specific event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('viewer:ready', handler1);
      eventBus.on('camera:change', handler2);

      eventBus.clear('viewer:ready');

      eventBus.emit('viewer:ready');
      eventBus.emit('camera:change', { rotation: { x: 0, y: 0, z: 0 }, fov: 75 });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should clear all listeners when no event specified', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('viewer:ready', handler1);
      eventBus.on('camera:change', handler2);

      eventBus.clear();

      eventBus.emit('viewer:ready');
      eventBus.emit('camera:change', { rotation: { x: 0, y: 0, z: 0 }, fov: 75 });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('getHistory()', () => {
    it('should track event history', () => {
      eventBus.emit('viewer:ready');
      eventBus.emit('camera:change', { rotation: { x: 1, y: 2, z: 3 }, fov: 75 });

      const history = eventBus.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].event).toBe('viewer:ready');
      expect(history[1].event).toBe('camera:change');
    });
  });

  describe('getListenerCount()', () => {
    it('should return correct count', () => {
      eventBus.on('viewer:ready', () => { });
      eventBus.on('viewer:ready', () => { });
      eventBus.once('viewer:ready', () => { });

      expect(eventBus.getListenerCount('viewer:ready')).toBe(3);
    });
  });
});

