/**
 * 电量与发热控制管理器
 * 监控设备电池状态和温度，自动调整性能以节省电量
 */
export interface PowerState {
    isCharging: boolean;
    level: number;
    dischargingTime: number;
    chargingTime: number;
}
export interface PowerMode {
    mode: 'performance' | 'balanced' | 'powersaver';
    targetFPS: number;
    pixelRatio: number;
    renderQuality: 'high' | 'medium' | 'low';
    enablePostProcessing: boolean;
    throttleRendering: boolean;
}
export declare class PowerManager {
    private static instance;
    private battery;
    private currentMode;
    private listeners;
    private isMonitoring;
    private checkInterval;
    private frameTimeHistory;
    private maxFrameTimeHistory;
    private lastFrameTime;
    private lastRenderTime;
    private minRenderInterval;
    private constructor();
    static getInstance(): PowerManager;
    /**
     * 初始化电池 API
     */
    private initBatteryAPI;
    /**
     * 设置电池状态监听
     */
    private setupBatteryListeners;
    /**
     * 获取当前电池状态
     */
    getPowerState(): PowerState | null;
    /**
     * 设置电源模式
     */
    setPowerMode(mode: PowerMode['mode']): void;
    /**
     * 获取模式设置
     */
    private getModeSettings;
    /**
     * 自动更新电源模式
     */
    private updatePowerMode;
    /**
     * 开始监控
     */
    startMonitoring(interval?: number): void;
    /**
     * 停止监控
     */
    stopMonitoring(): void;
    /**
     * 记录帧时间
     */
    recordFrameTime(): void;
    /**
     * 检查性能
     */
    private checkPerformance;
    /**
     * 性能降级
     */
    private degradePerformance;
    /**
     * 检查是否应该渲染（节流）
     */
    shouldRender(): boolean;
    /**
     * 获取当前模式
     */
    getCurrentMode(): PowerMode['mode'];
    /**
     * 获取当前设置
     */
    getCurrentSettings(): PowerMode;
    /**
     * 添加模式变化监听器
     */
    onChange(callback: (mode: PowerMode) => void): () => void;
    /**
     * 通知监听器
     */
    private notifyListeners;
    /**
     * 获取电池支持状态
     */
    isBatteryAPISupported(): boolean;
    /**
     * 获取平均帧率
     */
    getAverageFPS(): number;
    /**
     * 重置帧时间历史
     */
    resetFrameTimeHistory(): void;
    /**
     * 获取性能统计
     */
    getStats(): {
        currentMode: PowerMode['mode'];
        averageFPS: number;
        batteryLevel: number | null;
        isCharging: boolean | null;
        recommendations: string[];
    };
    /**
     * 生成报告
     */
    generateReport(): string;
    /**
     * 清理资源
     */
    dispose(): void;
}
export declare const powerManager: PowerManager;
//# sourceMappingURL=PowerManager.d.ts.map