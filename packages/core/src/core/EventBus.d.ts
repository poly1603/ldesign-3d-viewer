/**
 * 事件总线系统 - 用于组件间解耦通信
 */
export type EventHandler<T = any> = (data: T) => void;
export interface EventMap {
    [key: string]: any;
    'viewer:ready': void;
    'viewer:dispose': void;
    'image:loading': {
        url: string;
        progress: number;
    };
    'image:loaded': {
        url: string;
    };
    'image:error': {
        url: string;
        error: Error;
    };
    'camera:change': {
        rotation: {
            x: number;
            y: number;
            z: number;
        };
        fov: number;
    };
    'camera:move': {
        rotation: {
            x: number;
            y: number;
            z: number;
        };
    };
    'camera:zoom': {
        fov: number;
    };
    'render:before': void;
    'render:after': void;
    'render:requested': void;
    'interaction:dragstart': {
        x: number;
        y: number;
    };
    'interaction:drag': {
        x: number;
        y: number;
        deltaX: number;
        deltaY: number;
    };
    'interaction:dragend': {
        x: number;
        y: number;
    };
    'interaction:zoom': {
        delta: number;
        fov: number;
    };
    'hotspot:add': {
        id: string;
    };
    'hotspot:remove': {
        id: string;
    };
    'hotspot:click': {
        id: string;
        data: any;
    };
    'hotspot:hover': {
        id: string;
        data: any;
    };
    'performance:warning': {
        type: string;
        message: string;
        value: number;
    };
    'performance:stats': {
        fps: number;
        frameTime: number;
    };
    'controls:enable': {
        type: string;
    };
    'controls:disable': {
        type: string;
    };
    'quality:change': {
        preset: string;
        settings: any;
    };
    'xr:sessionstart': {
        mode: 'vr' | 'ar';
    };
    'xr:sessionend': void;
    'video:play': void;
    'video:pause': void;
    'video:ended': void;
    'video:timeupdate': {
        currentTime: number;
        duration: number;
    };
    'error': Error;
}
export declare class EventBus {
    private listeners;
    private onceListeners;
    private eventHistory;
    private maxHistorySize;
    /**
     * 订阅事件
     */
    on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void;
    /**
     * 订阅一次性事件
     */
    once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void;
    /**
     * 取消订阅
     */
    off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void;
    /**
     * 取消一次性订阅
     */
    private offOnce;
    /**
     * 触发事件
     */
    emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void;
    /**
     * 等待事件触发（Promise 方式）
     */
    waitFor<K extends keyof EventMap>(event: K, timeout?: number): Promise<EventMap[K]>;
    /**
     * 清除所有监听器
     */
    clear(event?: keyof EventMap): void;
    /**
     * 获取事件历史
     */
    getHistory(): Array<{
        event: string;
        data: any;
        timestamp: number;
    }>;
    /**
     * 获取监听器数量
     */
    getListenerCount(event?: keyof EventMap): number;
    /**
     * 销毁事件总线
     */
    dispose(): void;
}
//# sourceMappingURL=EventBus.d.ts.map