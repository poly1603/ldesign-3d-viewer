/**
 * 高级相机控制系统
 * 提供平滑插值、路径动画、目标跟踪等高级功能
 */
import * as THREE from 'three';
import { easing } from '../utils/helpers';
export interface CameraKeyframe {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov?: number;
    timestamp: number;
}
export interface CameraPathOptions {
    duration: number;
    easing?: keyof typeof easing;
    loop?: boolean;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
}
export interface CameraTarget {
    position: THREE.Vector3;
    /** 注视点约束 */
    lockToTarget?: boolean;
    /** 跟随速度 (0-1) */
    followSpeed?: number;
}
export declare class AdvancedCamera {
    private camera;
    private keyframes;
    private isAnimating;
    private animationStartTime;
    private currentPathOptions;
    private target;
    private isRecording;
    private recordedKeyframes;
    private recordStartTime;
    private isPaused;
    private pausedTime;
    private targetPosition;
    private targetRotation;
    private targetFov;
    private smoothSpeed;
    constructor(camera: THREE.PerspectiveCamera);
    /**
     * 平滑移动到目标位置
     */
    smoothMoveTo(position: THREE.Vector3, rotation?: THREE.Euler, fov?: number, duration?: number): Promise<void>;
    /**
     * 添加关键帧
     */
    addKeyframe(keyframe: Omit<CameraKeyframe, 'timestamp'>): void;
    /**
     * 清除所有关键帧
     */
    clearKeyframes(): void;
    /**
     * 播放关键帧路径
     */
    playPath(options: CameraPathOptions): void;
    /**
     * 动画路径
     */
    private animatePath;
    /**
     * 停止路径动画
     */
    stopPath(): void;
    /**
     * 暂停路径动画
     */
    pausePath(): void;
    /**
     * 恢复路径动画
     */
    resumePath(): void;
    /**
     * 开始录制相机路径
     */
    startRecording(): void;
    /**
     * 记录当前帧（在动画循环中调用）
     */
    recordFrame(): void;
    /**
     * 停止录制
     */
    stopRecording(): CameraKeyframe[];
    /**
     * 获取录制的关键帧
     */
    getRecordedKeyframes(): CameraKeyframe[];
    /**
     * 清除录制的关键帧
     */
    clearRecordedKeyframes(): void;
    /**
     * 加载录制的路径
     */
    loadRecording(keyframes: CameraKeyframe[]): void;
    /**
     * 设置目标跟踪
     */
    setTarget(target: CameraTarget): void;
    /**
     * 清除目标
     */
    clearTarget(): void;
    /**
     * 更新（在动画循环中调用）
     */
    update(): void;
    /**
     * 更新目标跟踪
     */
    private updateTargetTracking;
    /**
     * 更新平滑插值
     */
    private updateSmoothing;
    /**
     * 设置平滑插值目标
     */
    setSmoothTarget(position?: THREE.Vector3, rotation?: THREE.Euler, fov?: number): void;
    /**
     * 设置平滑速度
     */
    setSmoothSpeed(speed: number): void;
    /**
     * 注视某个点
     */
    lookAt(target: THREE.Vector3, smooth?: boolean): void;
    /**
     * 保存当前状态
     */
    saveState(): CameraKeyframe;
    /**
     * 恢复状态
     */
    restoreState(state: CameraKeyframe, smooth?: boolean): void;
    /**
     * 导出路径为 JSON
     */
    exportPath(): string;
    /**
     * 从 JSON 导入路径
     */
    importPath(json: string): void;
    /**
     * 获取当前状态
     */
    getState(): {
        isAnimating: boolean;
        isRecording: boolean;
        keyframeCount: number;
        hasTarget: boolean;
    };
    /**
     * 销毁
     */
    dispose(): void;
}
//# sourceMappingURL=AdvancedCamera.d.ts.map