/**
 * 导览模式 - 自动引导用户浏览全景场景
 * 支持预设路径、自动播放、暂停、跳转等功能
 */
import type { EventBus } from '../core/EventBus';
import type { SphericalPosition } from '../types';
export interface TourWaypoint {
    id: string;
    position: SphericalPosition;
    duration: number;
    fov?: number;
    title?: string;
    description?: string;
    onEnter?: () => void;
    onLeave?: () => void;
}
export interface TourPath {
    id: string;
    name: string;
    waypoints: TourWaypoint[];
    loop?: boolean;
    autoStart?: boolean;
}
export interface TourConfig {
    transitionDuration?: number;
    autoAdvance?: boolean;
    showProgress?: boolean;
    pauseOnInteraction?: boolean;
}
export interface TourState {
    isPlaying: boolean;
    isPaused: boolean;
    currentWaypointIndex: number;
    currentPath: TourPath | null;
    progress: number;
}
export declare class TourGuide {
    private eventBus;
    private config;
    private state;
    private paths;
    private currentTimer;
    private transitionStartTime;
    private animationFrameId;
    private onSetCameraPosition;
    constructor(eventBus: EventBus, config?: TourConfig);
    /**
     * 设置相机位置控制回调
     */
    setCameraController(callback: (position: SphericalPosition, fov?: number, duration?: number) => void): void;
    /**
     * 添加导览路径
     */
    addPath(path: TourPath): void;
    /**
     * 移除导览路径
     */
    removePath(pathId: string): void;
    /**
     * 获取所有路径
     */
    getPaths(): TourPath[];
    /**
     * 获取路径
     */
    getPath(pathId: string): TourPath | undefined;
    /**
     * 开始导览
     */
    start(pathId: string, fromWaypoint?: number): void;
    /**
     * 暂停导览
     */
    pause(): void;
    /**
     * 恢复导览
     */
    resume(): void;
    /**
     * 停止导览
     */
    stop(): void;
    /**
     * 跳转到指定航点
     */
    goToWaypoint(index: number): void;
    /**
     * 下一个航点
     */
    next(): void;
    /**
     * 上一个航点
     */
    previous(): void;
    /**
     * 导航到指定航点
     */
    private navigateToWaypoint;
    /**
     * 安排下一个航点
     */
    private scheduleNextWaypoint;
    /**
     * 清除定时器
     */
    private clearTimers;
    /**
     * 更新进度
     */
    private updateProgress;
    /**
     * 获取当前航点
     */
    getCurrentWaypoint(): TourWaypoint | null;
    /**
     * 获取状态
     */
    getState(): Readonly<TourState>;
    /**
     * 是否正在播放
     */
    isPlaying(): boolean;
    /**
     * 是否暂停
     */
    isPaused(): boolean;
    /**
     * 获取进度
     */
    getProgress(): number;
    /**
     * 销毁导览
     */
    dispose(): void;
}
//# sourceMappingURL=TourGuide.d.ts.map