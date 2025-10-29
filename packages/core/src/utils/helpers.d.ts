/**
 * 辅助工具函数
 */
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 取消令牌 - 用于取消异步操作
 */
export declare class CancellationToken {
    private _isCancelled;
    private _callbacks;
    get isCancelled(): boolean;
    /**
     * 取消操作
     */
    cancel(): void;
    /**
     * 注册取消回调
     */
    onCancel(callback: () => void): () => void;
    /**
     * 检查是否已取消，如果是则抛出错误
     */
    throwIfCancelled(): void;
    /**
     * 重置取消状态
     */
    reset(): void;
}
/**
 * 可取消的 Promise 包装器
 */
export declare class CancellablePromise<T> {
    private promise;
    private token;
    constructor(executor: (resolve: (value: T) => void, reject: (reason?: any) => void, token: CancellationToken) => void, token?: CancellationToken);
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult>;
    finally(onfinally?: (() => void) | null): Promise<T>;
    cancel(): void;
    get isCancelled(): boolean;
}
/**
 * 延迟函数
 */
export declare function delay(ms: number, token?: CancellationToken): Promise<void>;
/**
 * 重试函数
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
}): Promise<T>;
/**
 * 限制并发数的 Promise.all
 */
export declare function promiseAllLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]>;
/**
 * 深度克隆对象
 */
export declare function deepClone<T>(obj: T): T;
/**
 * 生成唯一 ID
 */
export declare function generateId(prefix?: string): string;
/**
 * 线性插值
 */
export declare function lerp(start: number, end: number, t: number): number;
/**
 * 限制数值范围
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * 将数值映射到新范围
 */
export declare function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
/**
 * 缓动函数
 */
export declare const easing: {
    linear: (t: number) => number;
    easeInQuad: (t: number) => number;
    easeOutQuad: (t: number) => number;
    easeInOutQuad: (t: number) => number;
    easeInCubic: (t: number) => number;
    easeOutCubic: (t: number) => number;
    easeInOutCubic: (t: number) => number;
    easeInQuart: (t: number) => number;
    easeOutQuart: (t: number) => number;
    easeInOutQuart: (t: number) => number;
    easeInElastic: (t: number) => number;
    easeOutElastic: (t: number) => number;
};
/**
 * 检查是否为移动设备
 */
export declare function isMobile(): boolean;
/**
 * 检查是否为触摸设备
 */
export declare function isTouchDevice(): boolean;
/**
 * 格式化文件大小
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 格式化持续时间
 */
export declare function formatDuration(ms: number): string;
/**
 * 等待条件满足
 */
export declare function waitFor(condition: () => boolean, options?: {
    timeout?: number;
    interval?: number;
}): Promise<void>;
//# sourceMappingURL=helpers.d.ts.map