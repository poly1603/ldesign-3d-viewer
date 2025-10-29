/**
 * 手势识别器 - 识别常见的触摸手势
 * 支持：单击、双击、长按、滑动、捏合缩放、旋转
 */
export var GestureType;
(function (GestureType) {
    GestureType["TAP"] = "tap";
    GestureType["DOUBLE_TAP"] = "doubleTap";
    GestureType["LONG_PRESS"] = "longPress";
    GestureType["SWIPE_LEFT"] = "swipeLeft";
    GestureType["SWIPE_RIGHT"] = "swipeRight";
    GestureType["SWIPE_UP"] = "swipeUp";
    GestureType["SWIPE_DOWN"] = "swipeDown";
    GestureType["PINCH"] = "pinch";
    GestureType["ROTATE"] = "rotate";
})(GestureType || (GestureType = {}));
export class GestureRecognizer {
    constructor(element, config = {}) {
        // Touch tracking
        this.touches = null;
        this.startTime = 0;
        this.startPosition = null;
        this.lastTapTime = 0;
        this.longPressTimer = null;
        // Multi-touch tracking
        this.initialDistance = 0;
        this.initialAngle = 0;
        this.element = element;
        this.config = {
            doubleTapDelay: config.doubleTapDelay ?? 300,
            longPressDelay: config.longPressDelay ?? 500,
            swipeThreshold: config.swipeThreshold ?? 50,
            pinchThreshold: config.pinchThreshold ?? 0.1,
            rotationThreshold: config.rotationThreshold ?? 15,
            enabled: config.enabled ?? true,
        };
        this.callbacks = new Map();
        // Bind event handlers
        this.boundHandleTouchStart = this.handleTouchStart.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        this.setupListeners();
    }
    /**
     * 设置事件监听器
     */
    setupListeners() {
        if (!this.config.enabled)
            return;
        this.element.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
        this.element.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
        this.element.addEventListener('touchend', this.boundHandleTouchEnd);
        // Mouse fallback for desktop
        this.element.addEventListener('mousedown', this.boundHandleMouseDown);
        this.element.addEventListener('mouseup', this.boundHandleMouseUp);
    }
    /**
     * 移除事件监听器
     */
    removeListeners() {
        this.element.removeEventListener('touchstart', this.boundHandleTouchStart);
        this.element.removeEventListener('touchmove', this.boundHandleTouchMove);
        this.element.removeEventListener('touchend', this.boundHandleTouchEnd);
        this.element.removeEventListener('mousedown', this.boundHandleMouseDown);
        this.element.removeEventListener('mouseup', this.boundHandleMouseUp);
    }
    /**
     * 处理触摸开始
     */
    handleTouchStart(e) {
        this.touches = e.touches;
        this.startTime = Date.now();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.startPosition = { x: touch.clientX, y: touch.clientY };
            // 启动长按定时器
            this.longPressTimer = window.setTimeout(() => {
                this.emitGesture({
                    type: GestureType.LONG_PRESS,
                    originalEvent: e,
                    position: this.startPosition,
                    duration: Date.now() - this.startTime,
                });
            }, this.config.longPressDelay);
        }
        else if (e.touches.length === 2) {
            // 多点触摸 - 准备捏合和旋转
            this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            this.initialAngle = this.getAngle(e.touches[0], e.touches[1]);
            this.clearLongPress();
        }
    }
    /**
     * 处理触摸移动
     */
    handleTouchMove(e) {
        if (!this.touches)
            return;
        // 移动时取消长按
        this.clearLongPress();
        if (e.touches.length === 2 && this.touches.length === 2) {
            // 检测捏合
            const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / this.initialDistance;
            if (Math.abs(scale - 1) > this.config.pinchThreshold) {
                this.emitGesture({
                    type: GestureType.PINCH,
                    originalEvent: e,
                    scale,
                });
            }
            // 检测旋转
            const currentAngle = this.getAngle(e.touches[0], e.touches[1]);
            const rotation = currentAngle - this.initialAngle;
            if (Math.abs(rotation) > this.config.rotationThreshold) {
                this.emitGesture({
                    type: GestureType.ROTATE,
                    originalEvent: e,
                    rotation,
                });
            }
        }
    }
    /**
     * 处理触摸结束
     */
    handleTouchEnd(e) {
        this.clearLongPress();
        if (!this.startPosition || !this.touches)
            return;
        const duration = Date.now() - this.startTime;
        if (this.touches.length === 1 && e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            const endPosition = { x: touch.clientX, y: touch.clientY };
            const delta = {
                x: endPosition.x - this.startPosition.x,
                y: endPosition.y - this.startPosition.y,
            };
            const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2);
            // 检测滑动
            if (distance > this.config.swipeThreshold) {
                const angle = Math.atan2(delta.y, delta.x) * 180 / Math.PI;
                let swipeType;
                if (angle >= -45 && angle < 45) {
                    swipeType = GestureType.SWIPE_RIGHT;
                }
                else if (angle >= 45 && angle < 135) {
                    swipeType = GestureType.SWIPE_DOWN;
                }
                else if (angle >= -135 && angle < -45) {
                    swipeType = GestureType.SWIPE_UP;
                }
                else {
                    swipeType = GestureType.SWIPE_LEFT;
                }
                this.emitGesture({
                    type: swipeType,
                    originalEvent: e,
                    position: endPosition,
                    delta,
                    duration,
                });
            }
            // 检测点击
            else if (distance < 10 && duration < this.config.doubleTapDelay) {
                const now = Date.now();
                // 检测双击
                if (now - this.lastTapTime < this.config.doubleTapDelay) {
                    this.emitGesture({
                        type: GestureType.DOUBLE_TAP,
                        originalEvent: e,
                        position: endPosition,
                    });
                    this.lastTapTime = 0; // 重置以避免三次点击
                }
                else {
                    this.emitGesture({
                        type: GestureType.TAP,
                        originalEvent: e,
                        position: endPosition,
                    });
                    this.lastTapTime = now;
                }
            }
        }
        this.touches = null;
        this.startPosition = null;
    }
    /**
     * 处理鼠标按下（桌面端fallback）
     */
    handleMouseDown(e) {
        this.startTime = Date.now();
        this.startPosition = { x: e.clientX, y: e.clientY };
    }
    /**
     * 处理鼠标释放（桌面端fallback）
     */
    handleMouseUp(e) {
        if (!this.startPosition)
            return;
        const endPosition = { x: e.clientX, y: e.clientY };
        const delta = {
            x: endPosition.x - this.startPosition.x,
            y: endPosition.y - this.startPosition.y,
        };
        const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2);
        if (distance < 10) {
            const now = Date.now();
            if (now - this.lastTapTime < this.config.doubleTapDelay) {
                this.emitGesture({
                    type: GestureType.DOUBLE_TAP,
                    originalEvent: e,
                    position: endPosition,
                });
                this.lastTapTime = 0;
            }
            else {
                this.emitGesture({
                    type: GestureType.TAP,
                    originalEvent: e,
                    position: endPosition,
                });
                this.lastTapTime = now;
            }
        }
        this.startPosition = null;
    }
    /**
     * 清除长按定时器
     */
    clearLongPress() {
        if (this.longPressTimer !== null) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
    /**
     * 计算两个触摸点之间的距离
     */
    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * 计算两个触摸点之间的角度
     */
    getAngle(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    /**
     * 发出手势事件
     */
    emitGesture(event) {
        const callbacks = this.callbacks.get(event.type);
        if (callbacks) {
            callbacks.forEach(callback => callback(event));
        }
    }
    /**
     * 监听手势
     */
    on(type, callback) {
        if (!this.callbacks.has(type)) {
            this.callbacks.set(type, new Set());
        }
        this.callbacks.get(type).add(callback);
    }
    /**
     * 移除手势监听
     */
    off(type, callback) {
        const callbacks = this.callbacks.get(type);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }
    /**
     * 启用手势识别
     */
    enable() {
        if (!this.config.enabled) {
            this.config.enabled = true;
            this.setupListeners();
        }
    }
    /**
     * 禁用手势识别
     */
    disable() {
        if (this.config.enabled) {
            this.config.enabled = false;
            this.removeListeners();
            this.clearLongPress();
        }
    }
    /**
     * 销毁手势识别器
     */
    dispose() {
        this.disable();
        this.callbacks.clear();
    }
}
//# sourceMappingURL=GestureRecognizer.js.map