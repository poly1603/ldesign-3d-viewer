/**
 * 热力图分析系统
 * 追踪用户视线、点击和停留时间，生成热力图
 */
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export class HeatmapAnalytics {
    constructor(container, camera, eventBus, config) {
        this.heatPoints = [];
        // 追踪数据
        this.viewHistory = [];
        this.clickCount = 0;
        this.hoverTime = 0;
        this.sessionStart = Date.now();
        // 更新控制
        this.lastUpdate = 0;
        this.updateInterval = 100; // ms
        this.isTracking = false;
        this.defaultConfig = {
            resolution: 256,
            decay: 0.95,
            radius: 20,
            maxIntensity: 100,
            colorScheme: 'hot',
        };
        this.container = container;
        this.camera = camera;
        this.eventBus = eventBus || new EventBus();
        this.config = { ...this.defaultConfig, ...config };
        // 创建热力图画布
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.resolution;
        this.canvas.height = this.config.resolution;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.6';
        this.canvas.style.display = 'none'; // 默认隐藏
        this.canvas.style.zIndex = '5';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.setupEventListeners();
    }
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听点击
        this.container.addEventListener('click', (e) => {
            if (!this.isTracking)
                return;
            const { theta, phi } = this.getSphericalFromMouse(e);
            this.addHeatPoint(theta, phi, 'click', 10);
            this.clickCount++;
        });
        // 监听鼠标移动（视线追踪）
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isTracking)
                return;
            const now = Date.now();
            if (now - this.lastUpdate < this.updateInterval)
                return;
            const { theta, phi } = this.getSphericalFromMouse(e);
            this.addHeatPoint(theta, phi, 'view', 1);
            this.viewHistory.push({ theta, phi, timestamp: now });
            this.lastUpdate = now;
        });
    }
    /**
     * 从鼠标位置获取球面坐标
     */
    getSphericalFromMouse(event) {
        const rect = this.container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        // 创建射线
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        // 获取方向
        const direction = raycaster.ray.direction;
        // 转换为球面坐标
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(direction);
        return {
            theta: spherical.theta,
            phi: spherical.phi,
        };
    }
    /**
     * 添加热点
     */
    addHeatPoint(theta, phi, type, intensity = 1) {
        this.heatPoints.push({
            theta,
            phi,
            intensity,
            timestamp: Date.now(),
            type,
        });
        // 限制热点数量
        if (this.heatPoints.length > 10000) {
            this.heatPoints.shift();
        }
        this.render();
    }
    /**
     * 渲染热力图
     */
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 应用衰减
        this.applyDecay();
        // 创建热力图数据
        const data = new Uint8ClampedArray(this.canvas.width * this.canvas.height * 4);
        // 绘制每个热点
        this.heatPoints.forEach((point) => {
            const { x, y } = this.sphericalToCanvas(point.theta, point.phi);
            const intensity = Math.min(point.intensity, this.config.maxIntensity);
            this.drawHeatPoint(data, x, y, intensity);
        });
        // 应用颜色方案
        this.applyColorScheme(data);
        // 更新画布
        const imageData = new ImageData(data, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(imageData, 0, 0);
    }
    /**
     * 球面坐标转画布坐标
     */
    sphericalToCanvas(theta, phi) {
        // 等距柱状投影
        const x = Math.floor((theta / (Math.PI * 2) + 0.5) * this.canvas.width);
        const y = Math.floor((phi / Math.PI) * this.canvas.height);
        return {
            x: Math.max(0, Math.min(x, this.canvas.width - 1)),
            y: Math.max(0, Math.min(y, this.canvas.height - 1)),
        };
    }
    /**
     * 绘制热点
     */
    drawHeatPoint(data, x, y, intensity) {
        const radius = this.config.radius;
        const width = this.canvas.width;
        const height = this.canvas.height;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > radius)
                    continue;
                const px = x + dx;
                const py = y + dy;
                if (px < 0 || px >= width || py < 0 || py >= height)
                    continue;
                // 计算强度（高斯分布）
                const falloff = Math.exp(-((distance * distance) / (radius * radius * 0.5)));
                const value = intensity * falloff;
                const index = (py * width + px) * 4;
                data[index] = Math.min(255, data[index] + value); // R通道存储强度
            }
        }
    }
    /**
     * 应用颜色方案
     */
    applyColorScheme(data) {
        const scheme = this.config.colorScheme;
        for (let i = 0; i < data.length; i += 4) {
            const intensity = data[i] / 255;
            let r = 0;
            let g = 0;
            let b = 0;
            switch (scheme) {
                case 'hot': {
                    // 黑 -> 红 -> 黄 -> 白
                    if (intensity < 0.33) {
                        r = intensity * 3 * 255;
                    }
                    else if (intensity < 0.66) {
                        r = 255;
                        g = (intensity - 0.33) * 3 * 255;
                    }
                    else {
                        r = 255;
                        g = 255;
                        b = (intensity - 0.66) * 3 * 255;
                    }
                    break;
                }
                case 'cool': {
                    // 黑 -> 蓝 -> 青 -> 白
                    if (intensity < 0.5) {
                        b = intensity * 2 * 255;
                    }
                    else {
                        b = 255;
                        g = (intensity - 0.5) * 2 * 255;
                        r = (intensity - 0.5) * 2 * 255;
                    }
                    break;
                }
                case 'rainbow': {
                    // 彩虹色
                    const hue = intensity * 270; // 0-270度
                    const rgb = this.hslToRgb(hue / 360, 1, 0.5);
                    r = rgb[0];
                    g = rgb[1];
                    b = rgb[2];
                    break;
                }
                case 'grayscale':
                    r = g = b = intensity * 255;
                    break;
            }
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = intensity > 0 ? 255 : 0; // Alpha
        }
    }
    /**
     * HSL转RGB
     */
    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [r * 255, g * 255, b * 255];
    }
    /**
     * 应用衰减
     */
    applyDecay() {
        const decayRate = this.config.decay;
        this.heatPoints.forEach((point) => {
            point.intensity *= decayRate;
        });
        // 移除强度太低的点
        this.heatPoints = this.heatPoints.filter(point => point.intensity > 0.1);
    }
    /**
     * 开始追踪
     */
    startTracking() {
        this.isTracking = true;
        this.sessionStart = Date.now();
        this.eventBus.emit('analytics:tracking-started', {});
    }
    /**
     * 停止追踪
     */
    stopTracking() {
        this.isTracking = false;
        this.eventBus.emit('analytics:tracking-stopped', {});
    }
    /**
     * 显示热力图
     */
    show() {
        this.canvas.style.display = 'block';
        this.resize();
    }
    /**
     * 隐藏热力图
     */
    hide() {
        this.canvas.style.display = 'none';
    }
    /**
     * 调整大小
     */
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }
    /**
     * 导出分析数据
     */
    exportData() {
        const sessionEnd = Date.now();
        const sessionDuration = sessionEnd - this.sessionStart;
        return {
            totalViews: this.viewHistory.length,
            totalClicks: this.clickCount,
            totalHoverTime: this.hoverTime,
            averageViewTime: sessionDuration / (this.viewHistory.length || 1),
            hotspots: this.heatPoints.map(p => ({ ...p })),
            sessionStart: this.sessionStart,
            sessionEnd,
        };
    }
    /**
     * 导入分析数据
     */
    importData(data) {
        this.heatPoints = data.hotspots.map(p => ({ ...p }));
        this.clickCount = data.totalClicks;
        this.sessionStart = data.sessionStart;
        this.render();
    }
    /**
     * 获取热点区域
     * 返回最热的N个区域
     */
    getHotRegions(count = 10) {
        // 按强度排序
        const sorted = [...this.heatPoints].sort((a, b) => b.intensity - a.intensity);
        return sorted.slice(0, count).map(point => ({
            position: { theta: point.theta, phi: point.phi },
            intensity: point.intensity,
        }));
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const totalIntensity = this.heatPoints.reduce((sum, p) => sum + p.intensity, 0);
        const avgIntensity = totalIntensity / (this.heatPoints.length || 1);
        const maxIntensity = Math.max(...this.heatPoints.map(p => p.intensity), 0);
        const sessionDuration = Date.now() - this.sessionStart;
        return {
            totalPoints: this.heatPoints.length,
            totalClicks: this.clickCount,
            totalViews: this.viewHistory.length,
            averageIntensity: avgIntensity,
            maxIntensity,
            sessionDuration,
        };
    }
    /**
     * 清除数据
     */
    clear() {
        this.heatPoints = [];
        this.viewHistory = [];
        this.clickCount = 0;
        this.hoverTime = 0;
        this.sessionStart = Date.now();
        this.render();
    }
    /**
     * 设置颜色方案
     */
    setColorScheme(scheme) {
        this.config.colorScheme = scheme;
        this.render();
    }
    /**
     * 生成报告
     */
    generateReport() {
        const stats = this.getStats();
        const hotRegions = this.getHotRegions(5);
        const formatTime = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            return `${minutes}m ${seconds % 60}s`;
        };
        const report = `
Heatmap Analytics Report
========================

Session Duration: ${formatTime(stats.sessionDuration)}
Total Views: ${stats.totalViews}
Total Clicks: ${stats.totalClicks}

Heat Statistics:
- Total Heat Points: ${stats.totalPoints}
- Average Intensity: ${stats.averageIntensity.toFixed(2)}
- Max Intensity: ${stats.maxIntensity.toFixed(2)}

Top 5 Hot Regions:
${hotRegions.map((region, i) => `${i + 1}. θ=${region.position.theta.toFixed(2)}, φ=${region.position.phi.toFixed(2)} (Intensity: ${region.intensity.toFixed(2)})`).join('\n')}

Configuration:
- Resolution: ${this.config.resolution}
- Color Scheme: ${this.config.colorScheme}
- Decay Rate: ${this.config.decay}
    `.trim();
        return report;
    }
    /**
     * 导出热力图图像
     */
    exportImage() {
        return this.canvas.toDataURL('image/png');
    }
    /**
     * 清理资源
     */
    dispose() {
        this.canvas.remove();
        this.heatPoints = [];
        this.viewHistory = [];
    }
}
//# sourceMappingURL=HeatmapAnalytics.js.map