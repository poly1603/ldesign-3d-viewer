/**
 * 路径绘制工具
 * 在全景中绘制导览路径和轨迹
 */
import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export class PathDrawer {
    constructor(container, camera, eventBus) {
        this.paths = new Map();
        // 绘制状态
        this.isDrawing = false;
        this.currentPath = null;
        this.tempPoints = [];
        // 播放状态
        this.isPlaying = false;
        this.playingPathId = null;
        this.playbackProgress = 0;
        this.container = container;
        this.camera = camera;
        this.eventBus = eventBus || new EventBus();
        // 创建画布
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.zIndex = '9';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.resize();
        this.setupEventListeners();
    }
    /**
     * 调整大小
     */
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (!this.isDrawing)
                return;
            const { theta, phi } = this.getSphericalFromMouse(e);
            this.tempPoints.push({
                theta,
                phi,
                timestamp: Date.now(),
            });
            this.render();
        });
        window.addEventListener('resize', () => this.resize());
    }
    /**
     * 从鼠标获取球面坐标
     */
    getSphericalFromMouse(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
        const direction = raycaster.ray.direction;
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(direction);
        return { theta: spherical.theta, phi: spherical.phi };
    }
    /**
     * 开始绘制
     */
    startDrawing(name = 'Path') {
        this.isDrawing = true;
        this.tempPoints = [];
        this.canvas.style.cursor = 'crosshair';
        this.eventBus.emit('path:drawing-started', { name });
    }
    /**
     * 完成绘制
     */
    finishDrawing(name = 'Path', closed = false) {
        if (this.tempPoints.length < 2) {
            this.cancelDrawing();
            return;
        }
        const path = {
            id: `path-${Date.now()}`,
            name,
            points: [...this.tempPoints],
            color: '#00ff00',
            lineWidth: 3,
            closed,
            animated: false,
            speed: 1,
        };
        this.addPath(path);
        this.isDrawing = false;
        this.tempPoints = [];
        this.canvas.style.cursor = 'default';
        this.eventBus.emit('path:drawing-finished', { path });
    }
    /**
     * 取消绘制
     */
    cancelDrawing() {
        this.isDrawing = false;
        this.tempPoints = [];
        this.canvas.style.cursor = 'default';
        this.render();
        this.eventBus.emit('path:drawing-cancelled', {});
    }
    /**
     * 添加路径
     */
    addPath(path) {
        this.paths.set(path.id, path);
        this.render();
    }
    /**
     * 移除路径
     */
    removePath(id) {
        this.paths.delete(id);
        this.render();
    }
    /**
     * 球面坐标转画布坐标
     */
    sphericalToCanvas(theta, phi) {
        const x = ((theta / (Math.PI * 2) + 0.5) % 1) * this.canvas.width;
        const y = (phi / Math.PI) * this.canvas.height;
        return { x, y };
    }
    /**
     * 渲染所有路径
     */
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 渲染已保存的路径
        this.paths.forEach((path) => {
            this.renderPath(path);
        });
        // 渲染临时路径
        if (this.isDrawing && this.tempPoints.length > 0) {
            this.renderTempPath();
        }
        // 渲染播放进度
        if (this.isPlaying && this.playingPathId) {
            const path = this.paths.get(this.playingPathId);
            if (path) {
                this.renderPlaybackProgress(path);
            }
        }
    }
    /**
     * 渲染路径
     */
    renderPath(path) {
        if (path.points.length < 2)
            return;
        const ctx = this.ctx;
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        path.points.forEach((point, index) => {
            const { x, y } = this.sphericalToCanvas(point.theta, point.phi);
            if (index === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
            // 绘制点
            ctx.save();
            ctx.fillStyle = path.color;
            ctx.beginPath();
            ctx.arc(x, y, path.lineWidth * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        if (path.closed && path.points.length > 2) {
            ctx.closePath();
        }
        ctx.stroke();
    }
    /**
     * 渲染临时路径
     */
    renderTempPath() {
        const ctx = this.ctx;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        this.tempPoints.forEach((point, index) => {
            const { x, y } = this.sphericalToCanvas(point.theta, point.phi);
            if (index === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
            // 绘制点
            ctx.save();
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.stroke();
        ctx.setLineDash([]);
    }
    /**
     * 渲染播放进度
     */
    renderPlaybackProgress(path) {
        const index = Math.floor(this.playbackProgress * (path.points.length - 1));
        if (index < 0 || index >= path.points.length)
            return;
        const point = path.points[index];
        const { x, y } = this.sphericalToCanvas(point.theta, point.phi);
        // 绘制当前位置
        this.ctx.save();
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    /**
     * 播放路径
     */
    playPath(pathId, onProgress) {
        return new Promise((resolve) => {
            const path = this.paths.get(pathId);
            if (!path) {
                resolve();
                return;
            }
            this.isPlaying = true;
            this.playingPathId = pathId;
            this.playbackProgress = 0;
            const totalPoints = path.points.length;
            let currentIndex = 0;
            const animate = () => {
                if (!this.isPlaying || currentIndex >= totalPoints) {
                    this.isPlaying = false;
                    this.playingPathId = null;
                    this.render();
                    resolve();
                    return;
                }
                const point = path.points[currentIndex];
                this.playbackProgress = currentIndex / (totalPoints - 1);
                if (onProgress) {
                    onProgress(point, currentIndex);
                }
                this.render();
                const duration = point.duration || 1000 / path.speed;
                setTimeout(() => {
                    currentIndex++;
                    animate();
                }, duration);
            };
            animate();
        });
    }
    /**
     * 停止播放
     */
    stopPlayback() {
        this.isPlaying = false;
        this.playingPathId = null;
        this.playbackProgress = 0;
        this.render();
    }
    /**
     * 导出路径
     */
    exportPaths() {
        return Array.from(this.paths.values());
    }
    /**
     * 导入路径
     */
    importPaths(paths) {
        this.paths.clear();
        paths.forEach(path => this.addPath(path));
    }
    /**
     * 清除所有路径
     */
    clear() {
        this.paths.clear();
        this.render();
    }
    /**
     * 清理资源
     */
    dispose() {
        this.stopPlayback();
        this.canvas.remove();
        this.paths.clear();
    }
}
//# sourceMappingURL=PathDrawer.js.map