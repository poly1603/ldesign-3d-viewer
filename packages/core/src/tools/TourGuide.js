/**
 * 导览模式 - 自动引导用户浏览全景场景
 * 支持预设路径、自动播放、暂停、跳转等功能
 */
export class TourGuide {
    constructor(eventBus, config = {}) {
        this.currentTimer = null;
        this.transitionStartTime = 0;
        this.animationFrameId = null;
        // Camera control callback
        this.onSetCameraPosition = null;
        this.eventBus = eventBus;
        this.config = {
            transitionDuration: config.transitionDuration ?? 2000,
            autoAdvance: config.autoAdvance ?? true,
            showProgress: config.showProgress ?? true,
            pauseOnInteraction: config.pauseOnInteraction ?? true,
        };
        this.state = {
            isPlaying: false,
            isPaused: false,
            currentWaypointIndex: -1,
            currentPath: null,
            progress: 0,
        };
        this.paths = new Map();
    }
    /**
     * 设置相机位置控制回调
     */
    setCameraController(callback) {
        this.onSetCameraPosition = callback;
    }
    /**
     * 添加导览路径
     */
    addPath(path) {
        this.paths.set(path.id, path);
        this.eventBus.emit('tour:pathAdded', { path });
    }
    /**
     * 移除导览路径
     */
    removePath(pathId) {
        const path = this.paths.get(pathId);
        if (path) {
            if (this.state.currentPath?.id === pathId) {
                this.stop();
            }
            this.paths.delete(pathId);
            this.eventBus.emit('tour:pathRemoved', { pathId });
        }
    }
    /**
     * 获取所有路径
     */
    getPaths() {
        return Array.from(this.paths.values());
    }
    /**
     * 获取路径
     */
    getPath(pathId) {
        return this.paths.get(pathId);
    }
    /**
     * 开始导览
     */
    start(pathId, fromWaypoint = 0) {
        const path = this.paths.get(pathId);
        if (!path) {
            console.error(`Tour path '${pathId}' not found`);
            return;
        }
        if (path.waypoints.length === 0) {
            console.error('Tour path has no waypoints');
            return;
        }
        this.stop(); // 停止当前导览
        this.state.currentPath = path;
        this.state.currentWaypointIndex = fromWaypoint;
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.progress = 0;
        this.eventBus.emit('tour:started', { path, waypointIndex: fromWaypoint });
        this.navigateToWaypoint(fromWaypoint);
    }
    /**
     * 暂停导览
     */
    pause() {
        if (!this.state.isPlaying || this.state.isPaused)
            return;
        this.state.isPaused = true;
        this.clearTimers();
        this.eventBus.emit('tour:paused', {});
    }
    /**
     * 恢复导览
     */
    resume() {
        if (!this.state.isPlaying || !this.state.isPaused)
            return;
        this.state.isPaused = false;
        this.eventBus.emit('tour:resumed', {});
        // 继续当前航点的停留时间
        const waypoint = this.getCurrentWaypoint();
        if (waypoint) {
            this.scheduleNextWaypoint(waypoint.duration);
        }
    }
    /**
     * 停止导览
     */
    stop() {
        if (!this.state.isPlaying)
            return;
        const currentPath = this.state.currentPath;
        this.clearTimers();
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.currentWaypointIndex = -1;
        this.state.currentPath = null;
        this.state.progress = 0;
        this.eventBus.emit('tour:stopped', { path: currentPath });
    }
    /**
     * 跳转到指定航点
     */
    goToWaypoint(index) {
        if (!this.state.currentPath)
            return;
        const waypoints = this.state.currentPath.waypoints;
        if (index < 0 || index >= waypoints.length) {
            console.error(`Waypoint index ${index} out of bounds`);
            return;
        }
        this.state.currentWaypointIndex = index;
        this.navigateToWaypoint(index);
    }
    /**
     * 下一个航点
     */
    next() {
        if (!this.state.currentPath)
            return;
        const nextIndex = this.state.currentWaypointIndex + 1;
        const waypoints = this.state.currentPath.waypoints;
        if (nextIndex < waypoints.length) {
            this.goToWaypoint(nextIndex);
        }
        else if (this.state.currentPath.loop) {
            this.goToWaypoint(0);
        }
        else {
            this.stop();
        }
    }
    /**
     * 上一个航点
     */
    previous() {
        if (!this.state.currentPath)
            return;
        const prevIndex = this.state.currentWaypointIndex - 1;
        if (prevIndex >= 0) {
            this.goToWaypoint(prevIndex);
        }
        else if (this.state.currentPath.loop) {
            this.goToWaypoint(this.state.currentPath.waypoints.length - 1);
        }
    }
    /**
     * 导航到指定航点
     */
    navigateToWaypoint(index) {
        if (!this.state.currentPath)
            return;
        const waypoint = this.state.currentPath.waypoints[index];
        if (!waypoint)
            return;
        // 调用上一个航点的离开回调
        const prevWaypoint = this.getCurrentWaypoint();
        if (prevWaypoint && prevWaypoint.onLeave) {
            prevWaypoint.onLeave();
        }
        // 设置相机位置
        if (this.onSetCameraPosition) {
            this.onSetCameraPosition(waypoint.position, waypoint.fov, this.config.transitionDuration);
        }
        // 调用进入回调
        if (waypoint.onEnter) {
            waypoint.onEnter();
        }
        this.eventBus.emit('tour:waypointReached', { waypoint, index });
        // 更新进度
        this.updateProgress();
        // 如果启用自动前进，安排下一个航点
        if (this.config.autoAdvance && !this.state.isPaused) {
            this.scheduleNextWaypoint(waypoint.duration);
        }
    }
    /**
     * 安排下一个航点
     */
    scheduleNextWaypoint(delay) {
        this.clearTimers();
        this.currentTimer = window.setTimeout(() => {
            if (this.state.isPlaying && !this.state.isPaused) {
                this.next();
            }
        }, delay);
    }
    /**
     * 清除定时器
     */
    clearTimers() {
        if (this.currentTimer !== null) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    /**
     * 更新进度
     */
    updateProgress() {
        if (!this.state.currentPath)
            return;
        const waypoints = this.state.currentPath.waypoints;
        this.state.progress = waypoints.length > 0
            ? (this.state.currentWaypointIndex + 1) / waypoints.length
            : 0;
        if (this.config.showProgress) {
            this.eventBus.emit('tour:progressUpdated', {
                progress: this.state.progress,
                currentIndex: this.state.currentWaypointIndex,
                totalWaypoints: waypoints.length,
            });
        }
    }
    /**
     * 获取当前航点
     */
    getCurrentWaypoint() {
        if (!this.state.currentPath)
            return null;
        return this.state.currentPath.waypoints[this.state.currentWaypointIndex] || null;
    }
    /**
     * 获取状态
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 是否正在播放
     */
    isPlaying() {
        return this.state.isPlaying;
    }
    /**
     * 是否暂停
     */
    isPaused() {
        return this.state.isPaused;
    }
    /**
     * 获取进度
     */
    getProgress() {
        return this.state.progress;
    }
    /**
     * 销毁导览
     */
    dispose() {
        this.stop();
        this.paths.clear();
    }
}
//# sourceMappingURL=TourGuide.js.map