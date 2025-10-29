/**
 * 电量与发热控制管理器
 * 监控设备电池状态和温度，自动调整性能以节省电量
 */
export class PowerManager {
    constructor() {
        this.battery = null;
        this.currentMode = 'balanced';
        this.listeners = [];
        this.isMonitoring = false;
        this.checkInterval = null;
        // 性能监控
        this.frameTimeHistory = [];
        this.maxFrameTimeHistory = 60;
        this.lastFrameTime = performance.now();
        // 节流控制
        this.lastRenderTime = 0;
        this.minRenderInterval = 1000 / 60; // 默认 60 FPS
        this.initBatteryAPI();
    }
    static getInstance() {
        if (!PowerManager.instance) {
            PowerManager.instance = new PowerManager();
        }
        return PowerManager.instance;
    }
    /**
     * 初始化电池 API
     */
    async initBatteryAPI() {
        try {
            const nav = navigator;
            if ('getBattery' in nav) {
                this.battery = await nav.getBattery();
                this.setupBatteryListeners();
            }
        }
        catch (error) {
            console.warn('Battery API not available:', error);
        }
    }
    /**
     * 设置电池状态监听
     */
    setupBatteryListeners() {
        if (!this.battery)
            return;
        this.battery.addEventListener('chargingchange', () => {
            this.updatePowerMode();
        });
        this.battery.addEventListener('levelchange', () => {
            this.updatePowerMode();
        });
    }
    /**
     * 获取当前电池状态
     */
    getPowerState() {
        if (!this.battery)
            return null;
        return {
            isCharging: this.battery.charging,
            level: this.battery.level,
            dischargingTime: this.battery.dischargingTime,
            chargingTime: this.battery.chargingTime,
        };
    }
    /**
     * 设置电源模式
     */
    setPowerMode(mode) {
        this.currentMode = mode;
        const settings = this.getModeSettings(mode);
        this.notifyListeners(settings);
    }
    /**
     * 获取模式设置
     */
    getModeSettings(mode) {
        switch (mode) {
            case 'performance':
                return {
                    mode: 'performance',
                    targetFPS: 60,
                    pixelRatio: window.devicePixelRatio,
                    renderQuality: 'high',
                    enablePostProcessing: true,
                    throttleRendering: false,
                };
            case 'balanced':
                return {
                    mode: 'balanced',
                    targetFPS: 60,
                    pixelRatio: Math.min(window.devicePixelRatio, 2),
                    renderQuality: 'medium',
                    enablePostProcessing: true,
                    throttleRendering: false,
                };
            case 'powersaver':
                return {
                    mode: 'powersaver',
                    targetFPS: 30,
                    pixelRatio: 1,
                    renderQuality: 'low',
                    enablePostProcessing: false,
                    throttleRendering: true,
                };
        }
    }
    /**
     * 自动更新电源模式
     */
    updatePowerMode() {
        const state = this.getPowerState();
        if (!state)
            return;
        let newMode;
        if (state.isCharging) {
            // 充电中，使用性能模式
            newMode = 'performance';
        }
        else if (state.level < 0.2) {
            // 电量低于 20%，省电模式
            newMode = 'powersaver';
        }
        else if (state.level < 0.5) {
            // 电量 20-50%，平衡模式
            newMode = 'balanced';
        }
        else {
            // 电量充足，性能模式
            newMode = 'performance';
        }
        if (newMode !== this.currentMode) {
            this.setPowerMode(newMode);
        }
    }
    /**
     * 开始监控
     */
    startMonitoring(interval = 5000) {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.updatePowerMode();
        this.checkInterval = window.setInterval(() => {
            this.updatePowerMode();
            this.checkPerformance();
        }, interval);
    }
    /**
     * 停止监控
     */
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.checkInterval !== null) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    /**
     * 记录帧时间
     */
    recordFrameTime() {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxFrameTimeHistory) {
            this.frameTimeHistory.shift();
        }
    }
    /**
     * 检查性能
     */
    checkPerformance() {
        if (this.frameTimeHistory.length < 30)
            return;
        const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        const fps = 1000 / avgFrameTime;
        // 如果帧率持续低于目标，降级
        const settings = this.getModeSettings(this.currentMode);
        if (fps < settings.targetFPS * 0.8) {
            this.degradePerformance();
        }
    }
    /**
     * 性能降级
     */
    degradePerformance() {
        if (this.currentMode === 'performance') {
            this.setPowerMode('balanced');
        }
        else if (this.currentMode === 'balanced') {
            this.setPowerMode('powersaver');
        }
    }
    /**
     * 检查是否应该渲染（节流）
     */
    shouldRender() {
        const settings = this.getModeSettings(this.currentMode);
        if (!settings.throttleRendering) {
            return true;
        }
        const now = performance.now();
        this.minRenderInterval = 1000 / settings.targetFPS;
        if (now - this.lastRenderTime >= this.minRenderInterval) {
            this.lastRenderTime = now;
            return true;
        }
        return false;
    }
    /**
     * 获取当前模式
     */
    getCurrentMode() {
        return this.currentMode;
    }
    /**
     * 获取当前设置
     */
    getCurrentSettings() {
        return this.getModeSettings(this.currentMode);
    }
    /**
     * 添加模式变化监听器
     */
    onChange(callback) {
        this.listeners.push(callback);
        // 返回取消函数
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    /**
     * 通知监听器
     */
    notifyListeners(mode) {
        this.listeners.forEach((callback) => {
            try {
                callback(mode);
            }
            catch (error) {
                console.error('PowerManager listener error:', error);
            }
        });
    }
    /**
     * 获取电池支持状态
     */
    isBatteryAPISupported() {
        return this.battery !== null;
    }
    /**
     * 获取平均帧率
     */
    getAverageFPS() {
        if (this.frameTimeHistory.length === 0)
            return 0;
        const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        return Math.round(1000 / avgFrameTime);
    }
    /**
     * 重置帧时间历史
     */
    resetFrameTimeHistory() {
        this.frameTimeHistory = [];
        this.lastFrameTime = performance.now();
    }
    /**
     * 获取性能统计
     */
    getStats() {
        const state = this.getPowerState();
        const recommendations = [];
        // 生成建议
        if (state) {
            if (!state.isCharging && state.level < 0.2) {
                recommendations.push('电量较低，建议启用省电模式');
            }
            if (this.getAverageFPS() < 30) {
                recommendations.push('帧率较低，建议降低渲染质量');
            }
        }
        return {
            currentMode: this.currentMode,
            averageFPS: this.getAverageFPS(),
            batteryLevel: state?.level || null,
            isCharging: state?.isCharging || null,
            recommendations,
        };
    }
    /**
     * 生成报告
     */
    generateReport() {
        const stats = this.getStats();
        const settings = this.getCurrentSettings();
        let report = `
Power Manager Report
===================

Current Mode: ${stats.currentMode.toUpperCase()}
Average FPS: ${stats.averageFPS}

Power Settings:
- Target FPS: ${settings.targetFPS}
- Pixel Ratio: ${settings.pixelRatio}
- Render Quality: ${settings.renderQuality}
- Post Processing: ${settings.enablePostProcessing}
- Throttle Rendering: ${settings.throttleRendering}
`;
        if (stats.batteryLevel !== null) {
            report += `
Battery Status:
- Level: ${(stats.batteryLevel * 100).toFixed(0)}%
- Charging: ${stats.isCharging ? 'Yes' : 'No'}
`;
        }
        if (stats.recommendations.length > 0) {
            report += `
Recommendations:
${stats.recommendations.map(r => `- ${r}`).join('\n')}
`;
        }
        return report.trim();
    }
    /**
     * 清理资源
     */
    dispose() {
        this.stopMonitoring();
        this.listeners = [];
        this.frameTimeHistory = [];
    }
}
// 导出单例
export const powerManager = PowerManager.getInstance();
//# sourceMappingURL=PowerManager.js.map