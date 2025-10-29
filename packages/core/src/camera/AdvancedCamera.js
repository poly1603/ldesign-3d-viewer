/**
 * 高级相机控制系统
 * 提供平滑插值、路径动画、目标跟踪等高级功能
 */
import * as THREE from 'three';
import { logger } from '../core/Logger';
import { easing } from '../utils/helpers';
export class AdvancedCamera {
    constructor(camera) {
        this.keyframes = [];
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.currentPathOptions = null;
        this.target = null;
        this.isRecording = false;
        this.recordedKeyframes = [];
        this.recordStartTime = 0;
        this.isPaused = false;
        this.pausedTime = 0;
        // 平滑插值状态
        this.targetPosition = null;
        this.targetRotation = null;
        this.targetFov = null;
        this.smoothSpeed = 0.1;
        this.camera = camera;
    }
    /**
     * 平滑移动到目标位置
     */
    smoothMoveTo(position, rotation, fov, duration = 1000) {
        return new Promise((resolve) => {
            // 处理零或负数持续时间
            if (duration <= 0) {
                this.camera.position.copy(position);
                if (rotation) {
                    this.camera.rotation.copy(rotation);
                }
                if (fov !== undefined) {
                    this.camera.fov = fov;
                    this.camera.updateProjectionMatrix();
                }
                resolve();
                return;
            }
            const startPosition = this.camera.position.clone();
            const startRotation = this.camera.rotation.clone();
            const startFov = this.camera.fov;
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing.easeInOutQuad(progress);
                // 插值位置
                this.camera.position.lerpVectors(startPosition, position, easedProgress);
                // 插值旋转
                if (rotation) {
                    this.camera.rotation.x = THREE.MathUtils.lerp(startRotation.x, rotation.x, easedProgress);
                    this.camera.rotation.y = THREE.MathUtils.lerp(startRotation.y, rotation.y, easedProgress);
                    this.camera.rotation.z = THREE.MathUtils.lerp(startRotation.z, rotation.z, easedProgress);
                }
                // 插值 FOV
                if (fov !== undefined) {
                    this.camera.fov = THREE.MathUtils.lerp(startFov, fov, easedProgress);
                    this.camera.updateProjectionMatrix();
                }
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    resolve();
                }
            };
            animate();
        });
    }
    /**
     * 添加关键帧
     */
    addKeyframe(keyframe) {
        this.keyframes.push({
            ...keyframe,
            timestamp: Date.now(),
        });
        logger.debug(`Keyframe added. Total: ${this.keyframes.length}`);
    }
    /**
     * 清除所有关键帧
     */
    clearKeyframes() {
        this.keyframes = [];
        logger.debug('All keyframes cleared');
    }
    /**
     * 播放关键帧路径
     */
    playPath(options) {
        if (this.keyframes.length < 2) {
            logger.warn('Need at least 2 keyframes to play path');
            return;
        }
        this.isAnimating = true;
        this.animationStartTime = Date.now();
        this.currentPathOptions = options;
        logger.info(`Playing camera path with ${this.keyframes.length} keyframes`);
        this.animatePath();
    }
    /**
     * 动画路径
     */
    animatePath() {
        if (!this.isAnimating || !this.currentPathOptions || this.isPaused)
            return;
        const elapsed = Date.now() - this.animationStartTime;
        let progress = elapsed / this.currentPathOptions.duration;
        // 循环
        if (progress >= 1 && this.currentPathOptions.loop) {
            this.animationStartTime = Date.now();
            progress = 0;
        }
        progress = Math.min(progress, 1);
        // 应用缓动
        const easingFunc = this.currentPathOptions.easing
            ? easing[this.currentPathOptions.easing]
            : easing.linear;
        const easedProgress = easingFunc(progress);
        // 计算当前关键帧索引
        const totalFrames = this.keyframes.length - 1;
        const frameIndex = easedProgress * totalFrames;
        const startIndex = Math.floor(frameIndex);
        const endIndex = Math.min(startIndex + 1, this.keyframes.length - 1);
        const localProgress = frameIndex - startIndex;
        // 插值关键帧
        const startFrame = this.keyframes[startIndex];
        const endFrame = this.keyframes[endIndex];
        this.camera.position.lerpVectors(startFrame.position, endFrame.position, localProgress);
        this.camera.rotation.x = THREE.MathUtils.lerp(startFrame.rotation.x, endFrame.rotation.x, localProgress);
        this.camera.rotation.y = THREE.MathUtils.lerp(startFrame.rotation.y, endFrame.rotation.y, localProgress);
        this.camera.rotation.z = THREE.MathUtils.lerp(startFrame.rotation.z, endFrame.rotation.z, localProgress);
        if (startFrame.fov !== undefined && endFrame.fov !== undefined) {
            this.camera.fov = THREE.MathUtils.lerp(startFrame.fov, endFrame.fov, localProgress);
            this.camera.updateProjectionMatrix();
        }
        // 回调
        this.currentPathOptions.onUpdate?.(progress);
        if (progress < 1 || this.currentPathOptions.loop) {
            requestAnimationFrame(() => this.animatePath());
        }
        else {
            this.isAnimating = false;
            this.currentPathOptions.onComplete?.();
            logger.info('Camera path animation completed');
        }
    }
    /**
     * 停止路径动画
     */
    stopPath() {
        this.isAnimating = false;
        this.isPaused = false;
        this.currentPathOptions = null;
        logger.debug('Camera path stopped');
    }
    /**
     * 暂停路径动画
     */
    pausePath() {
        if (this.isAnimating && !this.isPaused) {
            this.isPaused = true;
            this.pausedTime = Date.now();
            logger.debug('Camera path paused');
        }
    }
    /**
     * 恢复路径动画
     */
    resumePath() {
        if (this.isAnimating && this.isPaused) {
            const pauseDuration = Date.now() - this.pausedTime;
            this.animationStartTime += pauseDuration;
            this.isPaused = false;
            this.animatePath();
            logger.debug('Camera path resumed');
        }
    }
    /**
     * 开始录制相机路径
     */
    startRecording() {
        this.isRecording = true;
        this.recordedKeyframes = [];
        this.recordStartTime = Date.now();
        logger.info('Camera recording started');
    }
    /**
     * 记录当前帧（在动画循环中调用）
     */
    recordFrame() {
        if (!this.isRecording)
            return;
        this.recordedKeyframes.push({
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            fov: this.camera.fov,
            timestamp: Date.now() - this.recordStartTime,
        });
    }
    /**
     * 停止录制
     */
    stopRecording() {
        this.isRecording = false;
        logger.info(`Camera recording stopped. Recorded ${this.recordedKeyframes.length} frames`);
        return this.recordedKeyframes;
    }
    /**
     * 获取录制的关键帧
     */
    getRecordedKeyframes() {
        return this.recordedKeyframes;
    }
    /**
     * 清除录制的关键帧
     */
    clearRecordedKeyframes() {
        this.recordedKeyframes = [];
        logger.debug('Recorded keyframes cleared');
    }
    /**
     * 加载录制的路径
     */
    loadRecording(keyframes) {
        this.keyframes = keyframes;
        logger.info(`Loaded ${keyframes.length} keyframes`);
    }
    /**
     * 设置目标跟踪
     */
    setTarget(target) {
        this.target = target;
        logger.debug('Camera target set');
    }
    /**
     * 清除目标
     */
    clearTarget() {
        this.target = null;
        logger.debug('Camera target cleared');
    }
    /**
     * 更新（在动画循环中调用）
     */
    update() {
        // 录制
        if (this.isRecording) {
            this.recordFrame();
        }
        // 目标跟踪
        if (this.target) {
            this.updateTargetTracking();
        }
        // 平滑插值
        this.updateSmoothing();
    }
    /**
     * 更新目标跟踪
     */
    updateTargetTracking() {
        if (!this.target)
            return;
        const speed = this.target.followSpeed ?? 0.05;
        // 跟随目标位置
        this.camera.position.lerp(this.target.position, speed);
        // 注视目标
        if (this.target.lockToTarget) {
            this.camera.lookAt(this.target.position);
        }
    }
    /**
     * 更新平滑插值
     */
    updateSmoothing() {
        if (this.targetPosition) {
            this.camera.position.lerp(this.targetPosition, this.smoothSpeed);
            // 检查是否到达目标
            if (this.camera.position.distanceTo(this.targetPosition) < 0.01) {
                this.targetPosition = null;
            }
        }
        if (this.targetRotation) {
            this.camera.rotation.x = THREE.MathUtils.lerp(this.camera.rotation.x, this.targetRotation.x, this.smoothSpeed);
            this.camera.rotation.y = THREE.MathUtils.lerp(this.camera.rotation.y, this.targetRotation.y, this.smoothSpeed);
            this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, this.targetRotation.z, this.smoothSpeed);
            // 检查是否到达目标
            const rotDiff = Math.abs(this.camera.rotation.x - this.targetRotation.x)
                + Math.abs(this.camera.rotation.y - this.targetRotation.y)
                + Math.abs(this.camera.rotation.z - this.targetRotation.z);
            if (rotDiff < 0.01) {
                this.targetRotation = null;
            }
        }
        if (this.targetFov !== null) {
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, this.smoothSpeed);
            this.camera.updateProjectionMatrix();
            if (Math.abs(this.camera.fov - this.targetFov) < 0.1) {
                this.targetFov = null;
            }
        }
    }
    /**
     * 设置平滑插值目标
     */
    setSmoothTarget(position, rotation, fov) {
        if (position) {
            this.targetPosition = position.clone();
        }
        if (rotation) {
            this.targetRotation = rotation.clone();
        }
        if (fov !== undefined) {
            this.targetFov = fov;
        }
    }
    /**
     * 设置平滑速度
     */
    setSmoothSpeed(speed) {
        this.smoothSpeed = Math.max(0, Math.min(1, speed));
    }
    /**
     * 注视某个点
     */
    lookAt(target, smooth = false) {
        if (smooth) {
            // 计算目标旋转
            const direction = target.clone().sub(this.camera.position).normalize();
            const phi = Math.acos(direction.y);
            const theta = Math.atan2(direction.x, direction.z);
            this.targetRotation = new THREE.Euler(Math.PI / 2 - phi, theta, 0, 'YXZ');
        }
        else {
            this.camera.lookAt(target);
        }
    }
    /**
     * 保存当前状态
     */
    saveState() {
        return {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            fov: this.camera.fov,
            timestamp: Date.now(),
        };
    }
    /**
     * 恢复状态
     */
    restoreState(state, smooth = false) {
        if (smooth) {
            this.setSmoothTarget(state.position, state.rotation, state.fov);
        }
        else {
            this.camera.position.copy(state.position);
            this.camera.rotation.copy(state.rotation);
            this.camera.fov = state.fov ?? this.camera.fov;
            this.camera.updateProjectionMatrix();
        }
    }
    /**
     * 导出路径为 JSON
     */
    exportPath() {
        return JSON.stringify(this.keyframes, null, 2);
    }
    /**
     * 从 JSON 导入路径
     */
    importPath(json) {
        try {
            const keyframes = JSON.parse(json);
            this.keyframes = keyframes.map((kf) => ({
                position: new THREE.Vector3(kf.position.x, kf.position.y, kf.position.z),
                rotation: new THREE.Euler(kf.rotation._x, kf.rotation._y, kf.rotation._z),
                fov: kf.fov,
                timestamp: kf.timestamp,
            }));
            logger.info(`Imported ${this.keyframes.length} keyframes from JSON`);
        }
        catch (error) {
            logger.error('Failed to import camera path', error);
        }
    }
    /**
     * 获取当前状态
     */
    getState() {
        return {
            isAnimating: this.isAnimating,
            isRecording: this.isRecording,
            keyframeCount: this.keyframes.length,
            hasTarget: this.target !== null,
        };
    }
    /**
     * 销毁
     */
    dispose() {
        this.stopPath();
        this.clearKeyframes();
        this.clearTarget();
        this.targetPosition = null;
        this.targetRotation = null;
        this.targetFov = null;
        logger.debug('AdvancedCamera disposed');
    }
}
//# sourceMappingURL=AdvancedCamera.js.map