/**
 * 区域选择器
 * 在全景中定义和管理矩形、圆形、多边形区域
 */
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export type RegionType = 'rectangle' | 'circle' | 'polygon';
export interface Region {
    id: string;
    type: RegionType;
    points: Array<{
        theta: number;
        phi: number;
    }>;
    name?: string;
    color?: string;
    fillOpacity?: number;
    strokeWidth?: number;
    data?: Record<string, any>;
}
export declare class RegionSelector {
    private regions;
    private canvas;
    private ctx;
    private container;
    private camera;
    private eventBus;
    private isSelecting;
    private currentRegion;
    private selectionType;
    private tempPoints;
    private selectedId;
    private hoveredId;
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
     * 鼠标按下
     */
    private onMouseDown;
    /**
     * 鼠标移动
     */
    private onMouseMove;
    /**
     * 鼠标抬起
     */
    private onMouseUp;
    /**
     * 点击
     */
    private onClick;
    /**
     * 从鼠标获取球面坐标
     */
    private getSphericalFromMouse;
    /**
     * 开始选择
     */
    startSelection(type: RegionType): void;
    /**
     * 完成选择
     */
    private finishSelection;
    /**
     * 取消选择
     */
    cancelSelection(): void;
    /**
     * 添加区域
     */
    addRegion(region: Region): void;
    /**
     * 移除区域
     */
    removeRegion(id: string): void;
    /**
     * 获取所有区域
     */
    getRegions(): Region[];
    /**
     * 选择区域
     */
    selectRegion(id: string): void;
    /**
     * 检查点是否在区域内
     */
    isPointInRegion(point: {
        theta: number;
        phi: number;
    }, regionId: string): boolean;
    /**
     * 点在矩形内判断
     */
    private isPointInRectangle;
    /**
     * 点在圆形内判断
     */
    private isPointInCircle;
    /**
     * 点在多边形内判断（射线法）
     */
    private isPointInPolygon;
    /**
     * 获取鼠标位置的区域
     */
    private getRegionAtMouse;
    /**
     * 球面坐标转画布坐标
     */
    private sphericalToCanvas;
    /**
     * 渲染所有区域
     */
    render(): void;
    /**
     * 渲染区域
     */
    private renderRegion;
    /**
     * 渲染矩形
     */
    private renderRectangle;
    /**
     * 渲染圆形
     */
    private renderCircle;
    /**
     * 渲染多边形
     */
    private renderPolygon;
    /**
     * 渲染临时区域
     */
    private renderTempRegion;
    /**
     * 渲染临时圆形
     */
    private renderTempCircle;
    /**
     * 高亮区域
     */
    private highlightRegion;
    /**
     * 获取指定点的所有区域
     */
    getRegionsAtPoint(point: {
        theta: number;
        phi: number;
    }): Region[];
    /**
     * 导出区域
     */
    exportRegions(): Region[];
    /**
     * 导入区域
     */
    importRegions(regions: Region[]): void;
    /**
     * 清除所有区域
     */
    clear(): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=RegionSelector.d.ts.map