/**
 * CDN管理器
 * 自动CDN路径重写、多CDN容错、智能加速
 */
export interface CDNConfig {
    primary: string;
    fallbacks?: string[];
    pathPrefix?: string;
    enableAutoSwitch?: boolean;
    timeout?: number;
}
export interface CDNStats {
    cdn: string;
    successCount: number;
    failureCount: number;
    averageLatency: number;
    lastUsed: number;
}
export declare class CDNManager {
    private static instance;
    private config;
    private cdnStats;
    private currentCDN;
    private failedUrls;
    private constructor();
    static getInstance(config?: CDNConfig): CDNManager;
    /**
     * 初始化统计
     */
    private initStats;
    /**
     * 获取完整URL
     */
    getUrl(path: string, useFallback?: boolean): string;
    /**
     * 组合CDN路径
     */
    private combineCDNPath;
    /**
     * 选择最佳备用CDN
     */
    private selectBestFallback;
    /**
     * 加载资源（带容错）
     */
    loadWithFallback(path: string): Promise<string>;
    /**
     * 测试URL是否可访问
     */
    private testUrl;
    /**
     * 更新统计
     */
    private updateStats;
    /**
     * 预热CDN
     * 加载一个小文件测试所有CDN的可用性
     */
    warmup(testPath?: string): Promise<void>;
    /**
     * 批量转换URL
     */
    convertUrls(urls: string[]): string[];
    /**
     * 获取CDN统计
     */
    getStats(): CDNStats[];
    /**
     * 获取当前CDN
     */
    getCurrentCDN(): string;
    /**
     * 手动切换CDN
     */
    switchCDN(cdn: string): void;
    /**
     * 重置统计
     */
    resetStats(): void;
    /**
     * 获取健康的CDN列表
     */
    getHealthyCDNs(): string[];
    /**
     * 生成报告
     */
    generateReport(): string;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<CDNConfig>): void;
}
//# sourceMappingURL=CDNManager.d.ts.map