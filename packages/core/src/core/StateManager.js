/**
 * 状态机管理器 - 管理 Viewer 的各种状态
 */
import { logger } from './Logger';
export var ViewerState;
(function (ViewerState) {
    ViewerState["IDLE"] = "idle";
    ViewerState["LOADING"] = "loading";
    ViewerState["READY"] = "ready";
    ViewerState["ERROR"] = "error";
    ViewerState["DISPOSED"] = "disposed";
    ViewerState["TRANSITIONING"] = "transitioning";
})(ViewerState || (ViewerState = {}));
export var ControlState;
(function (ControlState) {
    ControlState["MOUSE"] = "mouse";
    ControlState["TOUCH"] = "touch";
    ControlState["GYROSCOPE"] = "gyroscope";
    ControlState["KEYBOARD"] = "keyboard";
    ControlState["VR"] = "vr";
    ControlState["AR"] = "ar";
})(ControlState || (ControlState = {}));
export var RenderMode;
(function (RenderMode) {
    RenderMode["CONTINUOUS"] = "continuous";
    RenderMode["ON_DEMAND"] = "on_demand";
})(RenderMode || (RenderMode = {}));
export var InteractionMode;
(function (InteractionMode) {
    InteractionMode["NAVIGATE"] = "navigate";
    InteractionMode["MEASURE"] = "measure";
    InteractionMode["ANNOTATE"] = "annotate";
    InteractionMode["EDIT_HOTSPOT"] = "edit_hotspot";
})(InteractionMode || (InteractionMode = {}));
export class StateManager {
    constructor(eventBus) {
        this.stateHistory = [];
        this.maxHistorySize = 50;
        this.eventBus = eventBus;
        this.state = {
            viewer: ViewerState.IDLE,
            controls: new Set(),
            renderMode: RenderMode.ON_DEMAND,
            interactionMode: InteractionMode.NAVIGATE,
            isAutoRotating: false,
            isFullscreen: false,
            isDragging: false,
            isTransitioning: false,
            quality: 'high',
        };
    }
    /**
     * 获取当前状态
     */
    getState() {
        return { ...this.state, controls: new Set(this.state.controls) };
    }
    /**
     * 获取 Viewer 状态
     */
    getViewerState() {
        return this.state.viewer;
    }
    /**
     * 设置 Viewer 状态
     */
    setViewerState(newState) {
        if (this.state.viewer === newState) {
            return;
        }
        const oldState = this.state.viewer;
        this.state.viewer = newState;
        this.recordStateChange({ viewer: newState });
        logger.debug(`Viewer state changed: ${oldState} -> ${newState}`);
        // 触发相应事件
        if (newState === ViewerState.READY) {
            this.eventBus.emit('viewer:ready');
        }
        else if (newState === ViewerState.ERROR) {
            this.eventBus.emit('error', new Error('Viewer entered error state'));
        }
    }
    /**
     * 检查是否可以执行操作
     */
    canInteract() {
        return (this.state.viewer === ViewerState.READY
            && !this.state.isTransitioning
            // @ts-expect-error - 类型比较已经在前面的条件中检查
            && this.state.viewer !== ViewerState.DISPOSED);
    }
    /**
     * 检查是否正在加载
     */
    isLoading() {
        return this.state.viewer === ViewerState.LOADING;
    }
    /**
     * 检查是否就绪
     */
    isReady() {
        return this.state.viewer === ViewerState.READY;
    }
    /**
     * 检查是否已销毁
     */
    isDisposed() {
        return this.state.viewer === ViewerState.DISPOSED;
    }
    /**
     * 启用控制
     */
    enableControl(control) {
        if (!this.state.controls.has(control)) {
            this.state.controls.add(control);
            this.recordStateChange({ controls: new Set(this.state.controls) });
            this.eventBus.emit('controls:enable', { type: control });
            logger.debug(`Control enabled: ${control}`);
        }
    }
    /**
     * 禁用控制
     */
    disableControl(control) {
        if (this.state.controls.has(control)) {
            this.state.controls.delete(control);
            this.recordStateChange({ controls: new Set(this.state.controls) });
            this.eventBus.emit('controls:disable', { type: control });
            logger.debug(`Control disabled: ${control}`);
        }
    }
    /**
     * 检查控制是否启用
     */
    isControlEnabled(control) {
        return this.state.controls.has(control);
    }
    /**
     * 设置渲染模式
     */
    setRenderMode(mode) {
        if (this.state.renderMode !== mode) {
            this.state.renderMode = mode;
            this.recordStateChange({ renderMode: mode });
            logger.debug(`Render mode changed to: ${mode}`);
        }
    }
    /**
     * 获取渲染模式
     */
    getRenderMode() {
        return this.state.renderMode;
    }
    /**
     * 设置交互模式
     */
    setInteractionMode(mode) {
        if (this.state.interactionMode !== mode) {
            const oldMode = this.state.interactionMode;
            this.state.interactionMode = mode;
            this.recordStateChange({ interactionMode: mode });
            logger.debug(`Interaction mode changed: ${oldMode} -> ${mode}`);
        }
    }
    /**
     * 获取交互模式
     */
    getInteractionMode() {
        return this.state.interactionMode;
    }
    /**
     * 设置自动旋转状态
     */
    setAutoRotating(value) {
        if (this.state.isAutoRotating !== value) {
            this.state.isAutoRotating = value;
            this.recordStateChange({ isAutoRotating: value });
            logger.debug(`Auto-rotating: ${value}`);
        }
    }
    /**
     * 检查是否自动旋转
     */
    isAutoRotating() {
        return this.state.isAutoRotating;
    }
    /**
     * 设置全屏状态
     */
    setFullscreen(value) {
        if (this.state.isFullscreen !== value) {
            this.state.isFullscreen = value;
            this.recordStateChange({ isFullscreen: value });
            logger.debug(`Fullscreen: ${value}`);
        }
    }
    /**
     * 检查是否全屏
     */
    isFullscreen() {
        return this.state.isFullscreen;
    }
    /**
     * 设置拖拽状态
     */
    setDragging(value) {
        if (this.state.isDragging !== value) {
            this.state.isDragging = value;
            this.recordStateChange({ isDragging: value });
            if (value) {
                this.eventBus.emit('interaction:dragstart', { x: 0, y: 0 });
            }
            else {
                this.eventBus.emit('interaction:dragend', { x: 0, y: 0 });
            }
        }
    }
    /**
     * 检查是否正在拖拽
     */
    isDragging() {
        return this.state.isDragging;
    }
    /**
     * 设置过渡状态
     */
    setTransitioning(value) {
        if (this.state.isTransitioning !== value) {
            this.state.isTransitioning = value;
            this.recordStateChange({ isTransitioning: value });
            logger.debug(`Transitioning: ${value}`);
        }
    }
    /**
     * 检查是否正在过渡
     */
    isTransitioning() {
        return this.state.isTransitioning;
    }
    /**
     * 设置质量级别
     */
    setQuality(quality) {
        if (this.state.quality !== quality) {
            this.state.quality = quality;
            this.recordStateChange({ quality });
            this.eventBus.emit('quality:change', { preset: quality, settings: {} });
            logger.info(`Quality changed to: ${quality}`);
        }
    }
    /**
     * 获取质量级别
     */
    getQuality() {
        return this.state.quality;
    }
    /**
     * 记录状态变更
     */
    recordStateChange(changes) {
        this.stateHistory.push({
            state: changes,
            timestamp: Date.now(),
        });
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
    }
    /**
     * 获取状态历史
     */
    getStateHistory() {
        return [...this.stateHistory];
    }
    /**
     * 重置状态
     */
    reset() {
        this.state = {
            viewer: ViewerState.IDLE,
            controls: new Set(),
            renderMode: RenderMode.ON_DEMAND,
            interactionMode: InteractionMode.NAVIGATE,
            isAutoRotating: false,
            isFullscreen: false,
            isDragging: false,
            isTransitioning: false,
            quality: 'high',
        };
        this.stateHistory = [];
        logger.debug('State manager reset');
    }
    /**
     * 销毁状态管理器
     */
    dispose() {
        this.setViewerState(ViewerState.DISPOSED);
        this.state.controls.clear();
        this.stateHistory = [];
    }
}
//# sourceMappingURL=StateManager.js.map