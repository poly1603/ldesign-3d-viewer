/**
 * 测量工具
 * 支持距离和角度测量
 */
import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
export interface MeasurePoint {
    position: THREE.Vector3;
    screenPosition: THREE.Vector2;
    id: string;
}
export interface Measurement {
    id: string;
    type: 'distance' | 'angle';
    points: MeasurePoint[];
    value: number;
    unit: string;
    label: HTMLElement;
}
export declare class MeasureTool {
    private scene;
    private camera;
    private container;
    private eventBus;
    private measurements;
    private isActive;
    private currentPoints;
    private measurementType;
    private linesMaterial;
    private pointsMaterial;
    private raycaster;
    private mouse;
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, container: HTMLElement, eventBus?: EventBus);
    /**
     * 设置事件监听
     */
    private setupEventListeners;
    /**
     * 容器点击事件
     */
    private onContainerClick;
    /**
     * 鼠标移动事件
     */
    private onMouseMove;
    /**
     * 添加测量点
     */
    private addPoint;
    /**
     * 完成测量
     */
    private completeMeasurement;
    /**
     * 计算距离
     */
    private calculateDistance;
    /**
     * 计算角度
     */
    private calculateAngle;
    /**
     * 绘制测量
     */
    private drawMeasurement;
    /**
     * 创建标签
     */
    private createLabel;
    /**
     * 更新标签位置
     */
    private updateLabelPosition;
    /**
     * 更新所有标签位置（在动画循环中调用）
     */
    update(): void;
    /**
     * 更新预览
     */
    private updatePreview;
    /**
     * 激活工具
     */
    activate(type?: 'distance' | 'angle'): void;
    /**
     * 停用工具
     */
    deactivate(): void;
    /**
     * 清除所有测量
     */
    clearAll(): void;
    /**
     * 移除测量
     */
    removeMeasurement(id: string): void;
    /**
     * 获取所有测量
     */
    getMeasurements(): Measurement[];
    /**
     * 导出测量数据
     */
    exportData(): string;
    /**
     * 销毁
     */
    dispose(): void;
}
//# sourceMappingURL=MeasureTool.d.ts.map