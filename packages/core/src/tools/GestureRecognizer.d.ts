/**
 * 手势识别器 - 识别常见的触摸手势
 * 支持：单击、双击、长按、滑动、捏合缩放、旋转
 */
export declare enum GestureType {
    TAP = "tap",
    DOUBLE_TAP = "doubleTap",
    LONG_PRESS = "longPress",
    SWIPE_LEFT = "swipeLeft",
    SWIPE_RIGHT = "swipeRight",
    SWIPE_UP = "swipeUp",
    SWIPE_DOWN = "swipeDown",
    PINCH = "pinch",
    ROTATE = "rotate"
}
export interface GestureEvent {
    type: GestureType;
    originalEvent: TouchEvent | MouseEvent;
    position?: {
        x: number;
        y: number;
    };
    delta?: {
        x: number;
        y: number;
    };
    scale?: number;
    rotation?: number;
    duration?: number;
}
export interface GestureConfig {
    doubleTapDelay?: number;
    longPressDelay?: number;
    swipeThreshold?: number;
    pinchThreshold?: number;
    rotationThreshold?: number;
    enabled?: boolean;
}
export type GestureCallback = (event: GestureEvent) => void;
export declare class GestureRecognizer {
    private element;
    private config;
    private callbacks;
    private touches;
    private startTime;
    private startPosition;
    private lastTapTime;
    private longPressTimer;
    private initialDistance;
    private initialAngle;
    private boundHandleTouchStart;
    private boundHandleTouchMove;
    private boundHandleTouchEnd;
    private boundHandleMouseDown;
    private boundHandleMouseUp;
    constructor(element: HTMLElement, config?: GestureConfig);
    /**
     * 设置事件监听器
     */
    private setupListeners;
    /**
     * 移除事件监听器
     */
    private removeListeners;
    /**
     * 处理触摸开始
     */
    private handleTouchStart;
    /**
     * 处理触摸移动
     */
    private handleTouchMove;
    /**
     * 处理触摸结束
     */
    private handleTouchEnd;
    /**
     * 处理鼠标按下（桌面端fallback）
     */
    private handleMouseDown;
    /**
     * 处理鼠标释放（桌面端fallback）
     */
    private handleMouseUp;
    /**
     * 清除长按定时器
     */
    private clearLongPress;
    /**
     * 计算两个触摸点之间的距离
     */
    private getDistance;
    /**
     * 计算两个触摸点之间的角度
     */
    private getAngle;
    /**
     * 发出手势事件
     */
    private emitGesture;
    /**
     * 监听手势
     */
    on(type: GestureType, callback: GestureCallback): void;
    /**
     * 移除手势监听
     */
    off(type: GestureType, callback: GestureCallback): void;
    /**
     * 启用手势识别
     */
    enable(): void;
    /**
     * 禁用手势识别
     */
    disable(): void;
    /**
     * 销毁手势识别器
     */
    dispose(): void;
}
//# sourceMappingURL=GestureRecognizer.d.ts.map