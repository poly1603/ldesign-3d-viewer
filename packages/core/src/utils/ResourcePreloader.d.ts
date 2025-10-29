/**
 * 资源预加载器
 * 智能预加载资源，支持优先级队列和预测性加载
 */
export interface PreloadOptions {
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
    crossOrigin?: 'anonymous' | 'use-credentials';
    type?: 'image' | 'video' | 'audio' | 'font' | 'script' | 'style';
}
export interface PreloadTask {
    url: string;
    options: Required<PreloadOptions>;
    promise: Promise<void>;
    status: 'pending' | 'loading' | 'loaded' | 'error';
    startTime?: number;
    endTime?: number;
}
export declare class ResourcePreloader {
    private static instance;
    private tasks;
    private queue;
    private concurrent;
    private loading;
    private constructor();
    static getInstance(): ResourcePreloader;
    /**
     * 初始化 DNS 预解析
     */
    private initDNSPrefetch;
    /**
     * 从现有资源中提取域名
     */
    private extractDomains;
    /**
     * 添加 DNS 预解析
     */
    addDNSPrefetch(domain: string): void;
    /**
     * 添加预连接
     */
    addPreconnect(domain: string, crossOrigin?: boolean): void;
    /**
     * 预加载资源
     */
    preload(url: string, options?: PreloadOptions): Promise<void>;
    /**
     * 批量预加载
     */
    preloadBatch(urls: string[], options?: PreloadOptions): Promise<void[]>;
    /**
     * 预测性预加载
     * 基于相机朝向预加载可能需要的资源
     */
    predictivePreload(currentUrl: string, relatedUrls: string[], cameraDirection?: {
        theta: number;
        phi: number;
    }): void;
    /**
     * 计算预加载优先级
     */
    private calculatePriority;
    /**
     * 检测资源类型
     */
    private detectType;
    /**
     * 加载资源
     */
    private loadResource;
    /**
     * 排序队列（按优先级）
     */
    private sortQueue;
    /**
     * 处理队列
     */
    private processQueue;
    /**
     * 获取预加载统计
     */
    getStats(): {
        total: number;
        pending: number;
        loading: number;
        loaded: number;
        error: number;
        averageTime: number;
    };
    /**
     * 清除已完成的任务
     */
    cleanup(): void;
    /**
     * 取消所有预加载
     */
    cancelAll(): void;
    /**
     * 设置并发数
     */
    setConcurrency(count: number): void;
    /**
     * 预热关键资源
     * 应在应用启动时调用
     */
    warmup(criticalUrls: string[]): Promise<void[]>;
}
export declare const resourcePreloader: ResourcePreloader;
//# sourceMappingURL=ResourcePreloader.d.ts.map