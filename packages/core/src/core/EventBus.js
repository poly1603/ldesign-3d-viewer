/**
 * 事件总线系统 - 用于组件间解耦通信
 */
export class EventBus {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }
    /**
     * 订阅事件
     */
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        // 返回取消订阅函数
        return () => this.off(event, handler);
    }
    /**
     * 订阅一次性事件
     */
    once(event, handler) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(handler);
        return () => this.offOnce(event, handler);
    }
    /**
     * 取消订阅
     */
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.listeners.delete(event);
            }
        }
    }
    /**
     * 取消一次性订阅
     */
    offOnce(event, handler) {
        const handlers = this.onceListeners.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.onceListeners.delete(event);
            }
        }
    }
    /**
     * 触发事件
     */
    emit(event, data) {
        // 记录事件历史
        if (this.eventHistory.length >= this.maxHistorySize) {
            this.eventHistory.shift();
        }
        this.eventHistory.push({
            event: event,
            data,
            timestamp: Date.now(),
        });
        // 触发普通监听器
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error(`Error in event handler for "${event}":`, error);
                }
            });
        }
        // 触发一次性监听器
        const onceHandlers = this.onceListeners.get(event);
        if (onceHandlers) {
            const handlersArray = Array.from(onceHandlers);
            onceHandlers.clear();
            this.onceListeners.delete(event);
            handlersArray.forEach((handler) => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error(`Error in once event handler for "${event}":`, error);
                }
            });
        }
    }
    /**
     * 等待事件触发（Promise 方式）
     */
    waitFor(event, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId = null;
            const handler = (data) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(data);
            };
            this.once(event, handler);
            if (timeout) {
                timeoutId = setTimeout(() => {
                    this.offOnce(event, handler);
                    reject(new Error(`Timeout waiting for event "${event}"`));
                }, timeout);
            }
        });
    }
    /**
     * 清除所有监听器
     */
    clear(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        }
        else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }
    /**
     * 获取事件历史
     */
    getHistory() {
        return [...this.eventHistory];
    }
    /**
     * 获取监听器数量
     */
    getListenerCount(event) {
        if (event) {
            const regular = this.listeners.get(event)?.size || 0;
            const once = this.onceListeners.get(event)?.size || 0;
            return regular + once;
        }
        let total = 0;
        this.listeners.forEach(handlers => (total += handlers.size));
        this.onceListeners.forEach(handlers => (total += handlers.size));
        return total;
    }
    /**
     * 销毁事件总线
     */
    dispose() {
        this.clear();
        this.eventHistory = [];
    }
}
//# sourceMappingURL=EventBus.js.map