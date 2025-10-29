/**
 * 视频全景播放器
 * 支持 360° 视频播放、流式传输和自适应码率
 */
import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
export interface VideoOptions {
    /** 视频源 URL（可以是单个或多个质量级别） */
    sources: VideoSource[];
    /** 是否自动播放 */
    autoplay?: boolean;
    /** 是否循环播放 */
    loop?: boolean;
    /** 是否静音 */
    muted?: boolean;
    /** 初始音量 (0-1) */
    volume?: number;
    /** 播放速率 */
    playbackRate?: number;
    /** 是否启用自适应码率 */
    adaptiveBitrate?: boolean;
    /** 跨域设置 */
    crossOrigin?: string;
}
export interface VideoSource {
    url: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    bitrate?: number;
    resolution?: {
        width: number;
        height: number;
    };
}
export interface VideoState {
    isPlaying: boolean;
    isPaused: boolean;
    isEnded: boolean;
    isSeeking: boolean;
    currentTime: number;
    duration: number;
    buffered: TimeRanges | null;
    volume: number;
    muted: boolean;
    playbackRate: number;
    currentQuality: string;
}
export declare class VideoPanorama {
    private video;
    private videoTexture;
    private sources;
    private currentSourceIndex;
    private eventBus;
    private options;
    private adaptiveBitrateEnabled;
    private bandwidthEstimate;
    private lastBandwidthCheck;
    constructor(options: VideoOptions, eventBus?: EventBus);
    /**
     * 创建 video 元素
     */
    private createVideoElement;
    /**
     * 设置视频事件监听器
     */
    private setupEventListeners;
    /**
     * 获取视频错误消息
     */
    private getVideoErrorMessage;
    /**
     * 选择视频源
     */
    private selectSource;
    /**
     * 更新带宽估算
     */
    private updateBandwidthEstimate;
    /**
     * 检查并调整自适应码率
     */
    private checkAdaptiveBitrate;
    /**
     * 创建视频纹理
     */
    createTexture(): THREE.VideoTexture;
    /**
     * 播放
     */
    play(): Promise<void>;
    /**
     * 暂停
     */
    pause(): void;
    /**
     * 停止
     */
    stop(): void;
    /**
     * 跳转到指定时间
     */
    seek(time: number): void;
    /**
     * 设置音量
     */
    setVolume(volume: number): void;
    /**
     * 设置静音
     */
    setMuted(muted: boolean): void;
    /**
     * 设置播放速率
     */
    setPlaybackRate(rate: number): void;
    /**
     * 设置循环
     */
    setLoop(loop: boolean): void;
    /**
     * 手动设置质量
     */
    setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void;
    /**
     * 启用/禁用自适应码率
     */
    setAdaptiveBitrate(enabled: boolean): void;
    /**
     * 获取当前状态
     */
    getState(): VideoState;
    /**
     * 获取视频元素（用于高级用途）
     */
    getVideoElement(): HTMLVideoElement;
    /**
     * 获取视频纹理
     */
    getTexture(): THREE.VideoTexture | null;
    /**
     * 销毁
     */
    dispose(): void;
}
//# sourceMappingURL=VideoPanorama.d.ts.map