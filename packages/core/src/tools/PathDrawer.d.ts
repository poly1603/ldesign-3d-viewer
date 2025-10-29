/**
 * 路径绘制工具
 * 在全景中绘制导览路径和轨迹
 */
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export interface PathPoint {
    theta: number;
    phi: number;
    timestamp: number;
    cameraFov?: number;
    duration?: number;
}
export interface Path {
    id: string;
    name: string;
    points: PathPoint[];
    color: string;
    lineWidth: number;
    closed: boolean;
    animated: boolean;
    speed: number;
}
export declare class PathDrawer {
    private paths;
    private canvas;
    private ctx;
    private container;
    private camera;
    private eventBus;
    private isDrawing;
    private currentPath;
    private tempPoints;
    private isPlaying;
    private playingPathId;
    private playbackProgress;
    constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, eventBus?: EventBus);
    /**
     * 调整大小
     */
    private resize;
    /**
     * 设置事件监听
     */
    private setupEventListeners;
    /**
     * 从鼠标获取球面坐标
     */
    private getSphericalFromMouse;
    /**
     * 开始绘制
     */
    startDrawing(name?: string): void;
    /**
     * 完成绘制
     */
    finishDrawing(name?: string, closed?: boolean): void;
    /**
     * 取消绘制
     */
    cancelDrawing(): void;
    /**
     * 添加路径
     */
    addPath(path: Path): void;
    /**
     * 移除路径
     */
    removePath(id: string): void;
    /**
     * 球面坐标转画布坐标
     */
    private sphericalToCanvas;
    /**
     * 渲染所有路径
     */
    render(): void;
    /**
     * 渲染路径
     */
    private renderPath;
    /**
     * 渲染临时路径
     */
    private renderTempPath;
    /**
     * 渲染播放进度
     */
    private renderPlaybackProgress;
    /**
     * 播放路径
     */
    playPath(pathId: string, onProgress?: (point: PathPoint, index: number) => void): Promise<void>;
    /**
     * 停止播放
     */
    stopPlayback(): void;
    /**
     * 导出路径
     */
    exportPaths(): Path[];
    /**
     * 导入路径
     */
    importPaths(paths: Path[]): void;
    /**
     * 清除所有路径
     */
    clear(): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=PathDrawer.d.ts.map