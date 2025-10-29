/**
 * 时间轴播放器
 * 播放时间序列全景，支持时间刻度控制
 */
export interface TimelineFrame {
    timestamp: number;
    imageUrl: string;
    label?: string;
    data?: Record<string, any>;
}
export interface TimelineConfig {
    frames: TimelineFrame[];
    loop: boolean;
    autoPlay: boolean;
    playbackSpeed: number;
    showControls: boolean;
}
export declare class TimelinePlayer {
    private config;
    private currentIndex;
    private isPlaying;
    private startTime;
    private pauseTime;
    private controlsElement;
    private container;
    private onFrameChange?;
    constructor(container: HTMLElement, config: Partial<TimelineConfig>, onFrameChange?: (frame: TimelineFrame, index: number) => void);
    /**
     * 创建控制面板
     */
    private createControls;
    /**
     * 更新控制面板
     */
    private updateControls;
    /**
     * 播放
     */
    play(): void;
    /**
     * 暂停
     */
    pause(): void;
    /**
     * 停止
     */
    stop(): void;
    /**
     * 动画循环
     */
    private animate;
    /**
     * 更新帧
     */
    private updateFrame;
    /**
     * 跳转到指定帧
     */
    seekTo(index: number): void;
    /**
     * 下一帧
     */
    next(): void;
    /**
     * 上一帧
     */
    previous(): void;
    /**
     * 设置播放速度
     */
    setPlaybackSpeed(speed: number): void;
    /**
     * 添加帧
     */
    addFrame(frame: TimelineFrame): void;
    /**
     * 移除帧
     */
    removeFrame(index: number): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=TimelinePlayer.d.ts.map