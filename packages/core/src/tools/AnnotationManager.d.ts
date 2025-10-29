/**
 * 标注管理器
 * 在全景中添加文字、图形标注，支持编辑和导入导出
 */
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export type AnnotationType = 'text' | 'arrow' | 'rectangle' | 'circle' | 'polygon' | 'line';
export interface Annotation {
    id: string;
    type: AnnotationType;
    position: {
        theta: number;
        phi: number;
    };
    content?: string;
    style?: AnnotationStyle;
    points?: {
        theta: number;
        phi: number;
    }[];
    interactive?: boolean;
    visible?: boolean;
    data?: Record<string, any>;
}
export interface AnnotationStyle {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    lineWidth?: number;
    opacity?: number;
    strokeColor?: string;
    fillColor?: string;
    padding?: number;
}
export declare class AnnotationManager {
    private annotations;
    private canvas;
    private ctx;
    private container;
    private camera;
    private eventBus;
    private isEditing;
    private editingId;
    private selectedId;
    private defaultStyle;
    constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, eventBus?: EventBus);
    /**
     * 调整画布大小
     */
    private resize;
    /**
     * 设置交互
     */
    private setupInteraction;
    /**
     * 添加标注
     */
    addAnnotation(annotation: Annotation): void;
    /**
     * 移除标注
     */
    removeAnnotation(id: string): void;
    /**
     * 更新标注
     */
    updateAnnotation(id: string, updates: Partial<Annotation>): void;
    /**
     * 获取标注
     */
    getAnnotation(id: string): Annotation | undefined;
    /**
     * 获取所有标注
     */
    getAllAnnotations(): Annotation[];
    /**
     * 选择标注
     */
    selectAnnotation(id: string): void;
    /**
     * 取消选择
     */
    deselectAnnotation(): void;
    /**
     * 将球面坐标转换为屏幕坐标
     */
    private sphericalToScreen;
    /**
     * 渲染所有标注
     */
    render(): void;
    /**
     * 渲染文字标注
     */
    private renderText;
    /**
     * 渲染箭头标注
     */
    private renderArrow;
    /**
     * 渲染矩形标注
     */
    private renderRectangle;
    /**
     * 渲染圆形标注
     */
    private renderCircle;
    /**
     * 渲染多边形标注
     */
    private renderPolygon;
    /**
     * 渲染线条标注
     */
    private renderLine;
    /**
     * 高亮标注
     */
    private highlightAnnotation;
    /**
     * 获取指定位置的标注
     */
    private getAnnotationAtPosition;
    /**
     * 导出标注数据
     */
    exportAnnotations(): Annotation[];
    /**
     * 导入标注数据
     */
    importAnnotations(annotations: Annotation[]): void;
    /**
     * 清除所有标注
     */
    clear(): void;
    /**
     * 显示/隐藏标注
     */
    setVisible(id: string, visible: boolean): void;
    /**
     * 显示/隐藏所有标注
     */
    setAllVisible(visible: boolean): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=AnnotationManager.d.ts.map