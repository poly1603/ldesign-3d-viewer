/**
 * 测试工具类库
 * 提供通用的测试辅助函数
 */
import * as THREE from 'three';
/**
 * 创建mock的Three.js相机
 */
export declare function createMockCamera(): THREE.PerspectiveCamera;
/**
 * 创建mock的Three.js场景
 */
export declare function createMockScene(): THREE.Scene;
/**
 * 创建mock的WebGL渲染器
 */
export declare function createMockRenderer(): any;
/**
 * 创建mock的触摸事件
 */
export declare function createMockTouch(identifier: number, clientX: number, clientY: number): Touch;
/**
 * 创建mock的触摸事件对象
 */
export declare function createMockTouchEvent(type: string, touches: Touch[], changedTouches?: Touch[]): TouchEvent;
/**
 * 等待指定时间
 */
export declare function wait(ms: number): Promise<void>;
/**
 * 等待条件满足
 */
export declare function waitFor(condition: () => boolean, timeout?: number, interval?: number): Promise<void>;
/**
 * 创建mock的视频元素
 */
export declare function createMockVideoElement(): {
    src: string;
    currentTime: number;
    duration: number;
    paused: boolean;
    ended: boolean;
    seeking: boolean;
    volume: number;
    muted: boolean;
    playbackRate: number;
    loop: boolean;
    videoWidth: number;
    videoHeight: number;
    crossOrigin: string;
    playsInline: boolean;
    preload: string;
    error: MediaError | null;
    buffered: TimeRanges;
    listeners: Map<string, Set<Function>>;
    addEventListener(type: string, listener: Function): void;
    removeEventListener(type: string, listener: Function): void;
    dispatchEvent(event: any): boolean;
    play(): Promise<void>;
    pause(): void;
    load(): void;
};
/**
 * 创建mock的XR会话
 */
export declare function createMockXRSession(): {
    ended: boolean;
    listeners: Map<string, Set<Function>>;
    addEventListener(type: string, listener: Function): void;
    removeEventListener(type: string, listener: Function): void;
    end(): Promise<void>;
    updateRenderState(_state: any): Promise<void>;
    requestReferenceSpace(_type: string): Promise<any>;
};
/**
 * Mock MediaError (如果环境不支持)
 */
export declare function setupMediaErrorMock(): void;
/**
 * 测量函数执行时间
 */
export declare function measureTime(fn: () => void | Promise<void>): Promise<number>;
/**
 * 批量创建测试数据
 */
export declare function createTestData<T>(count: number, factory: (index: number) => T): T[];
/**
 * 验证对象是否已被dispose
 */
export declare function expectDisposed(obj: any): boolean;
//# sourceMappingURL=test-helpers.d.ts.map