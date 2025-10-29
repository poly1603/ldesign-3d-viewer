/**
 * 辅助工具函数
 */
/**
 * 防抖函数
 */
export function debounce(func, wait) {
    let timeout = null;
    return function (...args) {
        // eslint-disable-next-line ts/no-this-alias
        const context = this;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func.apply(context, args);
            timeout = null;
        }, wait);
    };
}
/**
 * 节流函数
 */
export function throttle(func, wait) {
    let timeout = null;
    let previous = 0;
    return function (...args) {
        const now = Date.now();
        // eslint-disable-next-line ts/no-this-alias
        const context = this;
        const remaining = wait - (now - previous);
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        }
        else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
/**
 * 取消令牌 - 用于取消异步操作
 */
export class CancellationToken {
    constructor() {
        this._isCancelled = false;
        this._callbacks = new Set();
    }
    get isCancelled() {
        return this._isCancelled;
    }
    /**
     * 取消操作
     */
    cancel() {
        if (this._isCancelled) {
            return;
        }
        this._isCancelled = true;
        // 调用所有回调
        this._callbacks.forEach((callback) => {
            try {
                callback();
            }
            catch (error) {
                console.error('Error in cancellation callback:', error);
            }
        });
        this._callbacks.clear();
    }
    /**
     * 注册取消回调
     */
    onCancel(callback) {
        this._callbacks.add(callback);
        return () => this._callbacks.delete(callback);
    }
    /**
     * 检查是否已取消，如果是则抛出错误
     */
    throwIfCancelled() {
        if (this._isCancelled) {
            throw new Error('Operation was cancelled');
        }
    }
    /**
     * 重置取消状态
     */
    reset() {
        this._isCancelled = false;
        this._callbacks.clear();
    }
}
/**
 * 可取消的 Promise 包装器
 */
export class CancellablePromise {
    constructor(executor, token) {
        this.token = token || new CancellationToken();
        this.promise = new Promise((resolve, reject) => {
            // 如果已经取消，立即拒绝
            if (this.token.isCancelled) {
                reject(new Error('Operation was cancelled'));
                return;
            }
            // 注册取消回调
            this.token.onCancel(() => {
                reject(new Error('Operation was cancelled'));
            });
            // 执行原始 executor
            executor(resolve, reject, this.token);
        });
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.promise.catch(onrejected);
    }
    finally(onfinally) {
        return this.promise.finally(onfinally);
    }
    cancel() {
        this.token.cancel();
    }
    get isCancelled() {
        return this.token.isCancelled;
    }
}
/**
 * 延迟函数
 */
export function delay(ms, token) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            resolve();
        }, ms);
        if (token) {
            token.onCancel(() => {
                clearTimeout(timeout);
                reject(new Error('Delay was cancelled'));
            });
        }
    });
}
/**
 * 重试函数
 */
export async function retry(fn, options = {}) {
    const { maxAttempts = 3, delayMs = 1000, backoff = true, onRetry, } = options;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                if (onRetry) {
                    onRetry(attempt, lastError);
                }
                const waitTime = backoff ? delayMs * attempt : delayMs;
                await delay(waitTime);
            }
        }
    }
    // eslint-disable-next-line no-throw-literal
    throw lastError;
}
/**
 * 限制并发数的 Promise.all
 */
export async function promiseAllLimit(tasks, limit) {
    const results = [];
    const executing = [];
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const p = Promise.resolve().then(() => task()).then((result) => {
            results[i] = result;
        });
        executing.push(p);
        if (executing.length >= limit) {
            await Promise.race(executing);
            // eslint-disable-next-line no-self-compare
            executing.splice(executing.findIndex(p => p === p), 1);
        }
    }
    await Promise.all(executing);
    return results;
}
/**
 * 深度克隆对象
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
}
/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * 线性插值
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}
/**
 * 限制数值范围
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * 将数值映射到新范围
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
/**
 * 缓动函数
 */
export const easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - --t * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    easeInElastic: (t) => {
        if (t === 0 || t === 1)
            return t;
        return -(2 ** (10 * (t - 1))) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    easeOutElastic: (t) => {
        if (t === 0 || t === 1)
            return t;
        return 2 ** (-10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
};
/**
 * 检查是否为移动设备
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
/**
 * 检查是否为触摸设备
 */
export function isTouchDevice() {
    return ('ontouchstart' in window
        || navigator.maxTouchPoints > 0
        || navigator.msMaxTouchPoints > 0);
}
/**
 * 格式化文件大小
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
/**
 * 格式化持续时间
 */
export function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else if (seconds > 0) {
        return `${seconds}s`;
    }
    else {
        return `${ms}ms`;
    }
}
/**
 * 等待条件满足
 */
export async function waitFor(condition, options = {}) {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();
    while (!condition()) {
        if (Date.now() - startTime > timeout) {
            throw new Error('Wait timeout');
        }
        await delay(interval);
    }
}
//# sourceMappingURL=helpers.js.map