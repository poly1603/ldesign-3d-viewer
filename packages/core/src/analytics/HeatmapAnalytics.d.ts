/**
 * 热力图分析系统
 * 追踪用户视线、点击和停留时间，生成热力图
 */
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export interface HeatPoint {
    theta: number;
    phi: number;
    intensity: number;
    timestamp: number;
    type: 'view' | 'click' | 'hover';
}
export interface HeatmapConfig {
    resolution: number;
    decay: number;
    radius: number;
    maxIntensity: number;
    colorScheme: 'hot' | 'cool' | 'rainbow' | 'grayscale';
}
export interface AnalyticsData {
    totalViews: number;
    totalClicks: number;
    totalHoverTime: number;
    averageViewTime: number;
    hotspots: HeatPoint[];
    sessionStart: number;
    sessionEnd: number;
}
export declare class HeatmapAnalytics {
    private heatPoints;
    private config;
    private canvas;
    private ctx;
    private container;
    private camera;
    private eventBus;
    private viewHistory;
    private clickCount;
    private hoverTime;
    private sessionStart;
    private lastUpdate;
    private updateInterval;
    private isTracking;
    private defaultConfig;
    constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, eventBus?: EventBus, config?: Partial<HeatmapConfig>);
    /**
     * 设置事件监听
     */
    private setupEventListeners;
    /**
     * 从鼠标位置获取球面坐标
     */
    private getSphericalFromMouse;
    /**
     * 添加热点
     */
    addHeatPoint(theta: number, phi: number, type: HeatPoint['type'], intensity?: number): void;
    /**
     * 渲染热力图
     */
    render(): void;
    /**
     * 球面坐标转画布坐标
     */
    private sphericalToCanvas;
    /**
     * 绘制热点
     */
    private drawHeatPoint;
    /**
     * 应用颜色方案
     */
    private applyColorScheme;
    /**
     * HSL转RGB
     */
    private hslToRgb;
    /**
     * 应用衰减
     */
    private applyDecay;
    /**
     * 开始追踪
     */
    startTracking(): void;
    /**
     * 停止追踪
     */
    stopTracking(): void;
    /**
     * 显示热力图
     */
    show(): void;
    /**
     * 隐藏热力图
     */
    hide(): void;
    /**
     * 调整大小
     */
    private resize;
    /**
     * 导出分析数据
     */
    exportData(): AnalyticsData;
    /**
     * 导入分析数据
     */
    importData(data: AnalyticsData): void;
    /**
     * 获取热点区域
     * 返回最热的N个区域
     */
    getHotRegions(count?: number): Array<{
        position: {
            theta: number;
            phi: number;
        };
        intensity: number;
    }>;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalPoints: number;
        totalClicks: number;
        totalViews: number;
        averageIntensity: number;
        maxIntensity: number;
        sessionDuration: number;
    };
    /**
     * 清除数据
     */
    clear(): void;
    /**
     * 设置颜色方案
     */
    setColorScheme(scheme: HeatmapConfig['colorScheme']): void;
    /**
     * 生成报告
     */
    generateReport(): string;
    /**
     * 导出热力图图像
     */
    exportImage(): string;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=HeatmapAnalytics.d.ts.map