/**
 * 状态机管理器 - 管理 Viewer 的各种状态
 */
import type { EventBus } from './EventBus';
export declare enum ViewerState {
    IDLE = "idle",
    LOADING = "loading",
    READY = "ready",
    ERROR = "error",
    DISPOSED = "disposed",
    TRANSITIONING = "transitioning"
}
export declare enum ControlState {
    MOUSE = "mouse",
    TOUCH = "touch",
    GYROSCOPE = "gyroscope",
    KEYBOARD = "keyboard",
    VR = "vr",
    AR = "ar"
}
export declare enum RenderMode {
    CONTINUOUS = "continuous",
    ON_DEMAND = "on_demand"
}
export declare enum InteractionMode {
    NAVIGATE = "navigate",
    MEASURE = "measure",
    ANNOTATE = "annotate",
    EDIT_HOTSPOT = "edit_hotspot"
}
export interface ViewerStateData {
    viewer: ViewerState;
    controls: Set<ControlState>;
    renderMode: RenderMode;
    interactionMode: InteractionMode;
    isAutoRotating: boolean;
    isFullscreen: boolean;
    isDragging: boolean;
    isTransitioning: boolean;
    quality: 'ultra' | 'high' | 'medium' | 'low';
}
export declare class StateManager {
    private state;
    private eventBus;
    private stateHistory;
    private maxHistorySize;
    constructor(eventBus: EventBus);
    /**
     * 获取当前状态
     */
    getState(): Readonly<ViewerStateData>;
    /**
     * 获取 Viewer 状态
     */
    getViewerState(): ViewerState;
    /**
     * 设置 Viewer 状态
     */
    setViewerState(newState: ViewerState): void;
    /**
     * 检查是否可以执行操作
     */
    canInteract(): boolean;
    /**
     * 检查是否正在加载
     */
    isLoading(): boolean;
    /**
     * 检查是否就绪
     */
    isReady(): boolean;
    /**
     * 检查是否已销毁
     */
    isDisposed(): boolean;
    /**
     * 启用控制
     */
    enableControl(control: ControlState): void;
    /**
     * 禁用控制
     */
    disableControl(control: ControlState): void;
    /**
     * 检查控制是否启用
     */
    isControlEnabled(control: ControlState): boolean;
    /**
     * 设置渲染模式
     */
    setRenderMode(mode: RenderMode): void;
    /**
     * 获取渲染模式
     */
    getRenderMode(): RenderMode;
    /**
     * 设置交互模式
     */
    setInteractionMode(mode: InteractionMode): void;
    /**
     * 获取交互模式
     */
    getInteractionMode(): InteractionMode;
    /**
     * 设置自动旋转状态
     */
    setAutoRotating(value: boolean): void;
    /**
     * 检查是否自动旋转
     */
    isAutoRotating(): boolean;
    /**
     * 设置全屏状态
     */
    setFullscreen(value: boolean): void;
    /**
     * 检查是否全屏
     */
    isFullscreen(): boolean;
    /**
     * 设置拖拽状态
     */
    setDragging(value: boolean): void;
    /**
     * 检查是否正在拖拽
     */
    isDragging(): boolean;
    /**
     * 设置过渡状态
     */
    setTransitioning(value: boolean): void;
    /**
     * 检查是否正在过渡
     */
    isTransitioning(): boolean;
    /**
     * 设置质量级别
     */
    setQuality(quality: 'ultra' | 'high' | 'medium' | 'low'): void;
    /**
     * 获取质量级别
     */
    getQuality(): 'ultra' | 'high' | 'medium' | 'low';
    /**
     * 记录状态变更
     */
    private recordStateChange;
    /**
     * 获取状态历史
     */
    getStateHistory(): Array<{
        state: Partial<ViewerStateData>;
        timestamp: number;
    }>;
    /**
     * 重置状态
     */
    reset(): void;
    /**
     * 销毁状态管理器
     */
    dispose(): void;
}
//# sourceMappingURL=StateManager.d.ts.map