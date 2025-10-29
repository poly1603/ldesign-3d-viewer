/**
 * 资源预加载器
 * 智能预加载资源，支持优先级队列和预测性加载
 */
export class ResourcePreloader {
    constructor() {
        this.tasks = new Map();
        this.queue = [];
        this.concurrent = 3; // 同时预加载的资源数
        this.loading = 0;
        this.initDNSPrefetch();
    }
    static getInstance() {
        if (!ResourcePreloader.instance) {
            ResourcePreloader.instance = new ResourcePreloader();
        }
        return ResourcePreloader.instance;
    }
    /**
     * 初始化 DNS 预解析
     */
    initDNSPrefetch() {
        const domains = this.extractDomains();
        domains.forEach((domain) => {
            this.addDNSPrefetch(domain);
        });
    }
    /**
     * 从现有资源中提取域名
     */
    extractDomains() {
        const domains = new Set();
        // 从 img、script、link 标签中提取域名
        const elements = document.querySelectorAll('img, script, link');
        elements.forEach((el) => {
            const src = el.getAttribute('src') || el.getAttribute('href');
            if (src) {
                try {
                    const url = new URL(src, window.location.href);
                    if (url.hostname !== window.location.hostname) {
                        domains.add(url.hostname);
                    }
                }
                catch {
                    // 忽略无效 URL
                }
            }
        });
        return Array.from(domains);
    }
    /**
     * 添加 DNS 预解析
     */
    addDNSPrefetch(domain) {
        if (document.head.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
    }
    /**
     * 添加预连接
     */
    addPreconnect(domain, crossOrigin = false) {
        if (document.head.querySelector(`link[rel="preconnect"][href="//${domain}"]`)) {
            return;
        }
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `//${domain}`;
        if (crossOrigin) {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    }
    /**
     * 预加载资源
     */
    preload(url, options = {}) {
        // 如果已经在队列中，返回现有 promise
        if (this.tasks.has(url)) {
            return this.tasks.get(url).promise;
        }
        const fullOptions = {
            priority: options.priority || 'medium',
            timeout: options.timeout || 30000,
            crossOrigin: options.crossOrigin || 'anonymous',
            type: options.type || this.detectType(url),
        };
        const task = {
            url,
            options: fullOptions,
            promise: Promise.resolve(),
            status: 'pending',
        };
        // 创建加载 promise
        task.promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                task.status = 'error';
                reject(new Error(`Preload timeout for ${url}`));
            }, fullOptions.timeout);
            this.loadResource(url, fullOptions)
                .then(() => {
                clearTimeout(timeoutId);
                task.status = 'loaded';
                task.endTime = performance.now();
                resolve();
            })
                .catch((error) => {
                clearTimeout(timeoutId);
                task.status = 'error';
                task.endTime = performance.now();
                reject(error);
            });
        });
        this.tasks.set(url, task);
        this.queue.push(task);
        // 按优先级排序
        this.sortQueue();
        // 开始处理队列
        this.processQueue();
        return task.promise;
    }
    /**
     * 批量预加载
     */
    preloadBatch(urls, options = {}) {
        return Promise.all(urls.map(url => this.preload(url, options)));
    }
    /**
     * 预测性预加载
     * 基于相机朝向预加载可能需要的资源
     */
    predictivePreload(currentUrl, relatedUrls, cameraDirection) {
        // 根据相机方向计算优先级
        relatedUrls.forEach((url, index) => {
            const priority = this.calculatePriority(index, relatedUrls.length, cameraDirection);
            this.preload(url, { priority });
        });
    }
    /**
     * 计算预加载优先级
     */
    calculatePriority(index, total, _cameraDirection) {
        // 简单策略：前1/3高优先级，中间1/3中优先级，后1/3低优先级
        const ratio = index / total;
        if (ratio < 0.33)
            return 'high';
        if (ratio < 0.66)
            return 'medium';
        return 'low';
    }
    /**
     * 检测资源类型
     */
    detectType(url) {
        const ext = url.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'webp':
            case 'avif':
            case 'gif':
                return 'image';
            case 'mp4':
            case 'webm':
            case 'ogg':
                return 'video';
            case 'mp3':
            case 'wav':
                return 'audio';
            case 'woff':
            case 'woff2':
            case 'ttf':
            case 'otf':
                return 'font';
            case 'js':
                return 'script';
            case 'css':
                return 'style';
            default:
                return 'script';
        }
    }
    /**
     * 加载资源
     */
    async loadResource(url, options) {
        // 使用 <link rel="preload">
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = options.type === 'script' ? 'script' : options.type === 'style' ? 'style' : 'fetch';
        if (options.crossOrigin) {
            link.crossOrigin = options.crossOrigin;
        }
        return new Promise((resolve, reject) => {
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to preload ${url}`));
            document.head.appendChild(link);
        });
    }
    /**
     * 排序队列（按优先级）
     */
    sortQueue() {
        const priorityMap = { high: 0, medium: 1, low: 2 };
        this.queue.sort((a, b) => {
            return priorityMap[a.options.priority] - priorityMap[b.options.priority];
        });
    }
    /**
     * 处理队列
     */
    processQueue() {
        while (this.loading < this.concurrent && this.queue.length > 0) {
            const task = this.queue.shift();
            if (!task)
                break;
            if (task.status === 'pending') {
                task.status = 'loading';
                task.startTime = performance.now();
                this.loading++;
                task.promise.finally(() => {
                    this.loading--;
                    this.processQueue();
                });
            }
        }
    }
    /**
     * 获取预加载统计
     */
    getStats() {
        const stats = {
            total: this.tasks.size,
            pending: 0,
            loading: 0,
            loaded: 0,
            error: 0,
            averageTime: 0,
        };
        let totalTime = 0;
        let completedCount = 0;
        this.tasks.forEach((task) => {
            stats[task.status]++;
            if (task.startTime && task.endTime) {
                totalTime += task.endTime - task.startTime;
                completedCount++;
            }
        });
        if (completedCount > 0) {
            stats.averageTime = totalTime / completedCount;
        }
        return stats;
    }
    /**
     * 清除已完成的任务
     */
    cleanup() {
        this.tasks.forEach((task, url) => {
            if (task.status === 'loaded' || task.status === 'error') {
                this.tasks.delete(url);
            }
        });
    }
    /**
     * 取消所有预加载
     */
    cancelAll() {
        this.queue = [];
        this.tasks.clear();
        this.loading = 0;
    }
    /**
     * 设置并发数
     */
    setConcurrency(count) {
        this.concurrent = Math.max(1, Math.min(count, 10));
    }
    /**
     * 预热关键资源
     * 应在应用启动时调用
     */
    warmup(criticalUrls) {
        return this.preloadBatch(criticalUrls, { priority: 'high' });
    }
}
// 导出单例
export const resourcePreloader = ResourcePreloader.getInstance();
//# sourceMappingURL=ResourcePreloader.js.map