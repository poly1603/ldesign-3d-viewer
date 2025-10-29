/**
 * 空间音频系统
 * 使用 Web Audio API 实现 3D 位置音频
 */
import * as THREE from 'three';
export interface AudioSourceOptions {
    /** 音频 URL */
    url: string;
    /** 音频位置（球坐标：theta, phi, radius） */
    position?: {
        theta: number;
        phi: number;
        radius?: number;
    };
    /** 是否循环 */
    loop?: boolean;
    /** 音量 (0-1) */
    volume?: number;
    /** 是否自动播放 */
    autoplay?: boolean;
    /** 最大听觉距离 */
    maxDistance?: number;
    /** 参考距离（音量开始衰减的距离） */
    refDistance?: number;
    /** 衰减模型 */
    distanceModel?: DistanceModelType;
    /** 锥形参数（定向音频） */
    cone?: {
        innerAngle: number;
        outerAngle: number;
        outerGain: number;
    };
}
export interface AmbisonicsOptions {
    /** Ambisonics 音频 URL（多通道） */
    url: string;
    /** Ambisonics 阶数 (1-3) */
    order?: number;
    /** 是否循环 */
    loop?: boolean;
    /** 音量 */
    volume?: number;
}
export declare class SpatialAudio {
    private audioContext;
    private listener;
    private masterGain;
    private sources;
    private ambientSources;
    private camera;
    private isInitialized;
    constructor(camera: THREE.PerspectiveCamera);
    /**
     * 初始化音频上下文（需要用户交互触发）
     */
    initialize(): Promise<void>;
    /**
     * 添加空间音频源
     */
    addSource(id: string, options: AudioSourceOptions): Promise<void>;
    /**
     * 添加环境音效（全向，非空间化）
     */
    addAmbientSound(url: string, options?: {
        loop?: boolean;
        volume?: number;
        autoplay?: boolean;
    }): Promise<string>;
    /**
     * 播放音频
     */
    play(id: string): Promise<void>;
    /**
     * 停止音频
     */
    stop(id: string): void;
    /**
     * 设置音频源音量
     */
    setVolume(id: string, volume: number): void;
    /**
     * 设置主音量
     */
    setMasterVolume(volume: number): void;
    /**
     * 更新音频源位置
     */
    updateSourcePosition(id: string, position: {
        theta: number;
        phi: number;
        radius?: number;
    }): void;
    /**
     * 更新监听器位置和方向（基于相机）
     */
    update(): void;
    /**
     * 移除音频源
     */
    removeSource(id: string): void;
    /**
     * 球坐标转笛卡尔坐标
     */
    private sphericalToCartesian;
    /**
     * 加载音频文件
     */
    private loadAudio;
    /**
     * 暂停所有音频
     */
    pauseAll(): void;
    /**
     * 恢复所有音频
     */
    resumeAll(): void;
    /**
     * 销毁音频系统
     */
    dispose(): void;
}
//# sourceMappingURL=SpatialAudio.d.ts.map