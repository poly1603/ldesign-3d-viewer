/**
 * 比较模式
 * 分屏对比两个全景，支持同步控制
 */
export interface ComparisonConfig {
    mode: 'split-vertical' | 'split-horizontal' | 'slider';
    splitPosition: number;
    syncCamera: boolean;
    syncZoom: boolean;
}
export declare class ComparisonView {
    private container;
    private leftViewer;
    private rightViewer;
    private config;
    private divider;
    private isDragging;
    private defaultConfig;
    constructor(container: HTMLElement, leftViewer: any, rightViewer: any, config?: Partial<ComparisonConfig>);
    /**
     * 创建分隔线
     */
    private createDivider;
    /**
     * 设置布局
     */
    private setupLayout;
    /**
     * 更新布局
     */
    private updateLayout;
    /**
     * 设置分隔线拖拽
     */
    private setupDividerDrag;
    /**
     * 设置同步控制
     */
    private setupSyncControls;
    /**
     * 设置分割位置
     */
    setSplitPosition(position: number): void;
    /**
     * 设置同步模式
     */
    setSyncCamera(enabled: boolean): void;
    /**
     * 设置缩放同步
     */
    setSyncZoom(enabled: boolean): void;
    /**
     * 切换左右图像
     */
    swap(): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=ComparisonView.d.ts.map