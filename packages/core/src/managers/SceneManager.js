/**
 * 场景管理器
 * 管理多个全景场景的切换、预加载和过渡动画
 */
import { EventBus } from '../core/EventBus';
import { TextureCache } from '../utils/TextureCache';
import { logger } from '../core/Logger';
export class SceneManager {
    constructor(eventBus) {
        this.scenes = new Map();
        this.currentSceneId = null;
        // 过渡状态
        this.isTransitioning = false;
        this.transitionProgress = 0;
        // 场景材质
        this.currentMaterial = null;
        this.nextMaterial = null;
        this.textureCache = TextureCache.getInstance();
        this.eventBus = eventBus || new EventBus();
    }
    /**
     * 添加场景
     */
    addScene(scene) {
        this.scenes.set(scene.id, scene);
        logger.info(`Scene added: ${scene.name} (${scene.id})`);
        // 如果标记为预加载，立即加载
        if (scene.preload) {
            this.preloadScene(scene.id);
        }
    }
    /**
     * 批量添加场景
     */
    addScenes(scenes) {
        scenes.forEach(scene => this.addScene(scene));
    }
    /**
     * 移除场景
     */
    removeScene(id) {
        const scene = this.scenes.get(id);
        if (scene) {
            // 卸载纹理
            this.textureCache.unload(scene.url);
            if (scene.thumbnail) {
                this.textureCache.unload(scene.thumbnail);
            }
            this.scenes.delete(id);
            logger.info(`Scene removed: ${id}`);
        }
    }
    /**
     * 获取场景
     */
    getScene(id) {
        return this.scenes.get(id);
    }
    /**
     * 获取所有场景
     */
    getAllScenes() {
        return Array.from(this.scenes.values());
    }
    /**
     * 获取当前场景
     */
    getCurrentScene() {
        return this.currentSceneId ? this.scenes.get(this.currentSceneId) || null : null;
    }
    /**
     * 预加载场景纹理
     */
    async preloadScene(id) {
        const scene = this.scenes.get(id);
        if (!scene) {
            throw new Error(`Scene not found: ${id}`);
        }
        logger.debug(`Preloading scene: ${scene.name}`);
        try {
            // 预加载主纹理
            await this.textureCache.load(scene.url);
            // 预加载缩略图
            if (scene.thumbnail) {
                await this.textureCache.load(scene.thumbnail);
            }
            this.eventBus.emit('scene:preloaded', { id, scene });
            logger.info(`Scene preloaded: ${scene.name}`);
        }
        catch (error) {
            logger.error(`Failed to preload scene: ${scene.name}`, error);
            throw error;
        }
    }
    /**
     * 预加载多个场景
     */
    async preloadScenes(ids) {
        await Promise.all(ids.map(id => this.preloadScene(id)));
    }
    /**
     * 切换场景
     */
    async switchTo(id, transition = { type: 'fade', duration: 500 }) {
        if (this.isTransitioning) {
            logger.warn('Scene transition already in progress');
            return;
        }
        const nextScene = this.scenes.get(id);
        if (!nextScene) {
            throw new Error(`Scene not found: ${id}`);
        }
        if (this.currentSceneId === id) {
            logger.debug(`Already at scene: ${id}`);
            return;
        }
        this.isTransitioning = true;
        this.eventBus.emit('scene:switching', { from: this.currentSceneId, to: id });
        try {
            // 加载下一个场景的纹理
            const nextTexture = await this.textureCache.load(nextScene.url);
            // 执行过渡动画
            await this.performTransition(nextTexture, transition);
            // 更新当前场景
            this.currentSceneId = id;
            this.eventBus.emit('scene:switched', { id, scene: nextScene });
            logger.info(`Switched to scene: ${nextScene.name}`);
        }
        catch (error) {
            logger.error(`Failed to switch scene: ${id}`, error);
            throw error;
        }
        finally {
            this.isTransitioning = false;
            this.transitionProgress = 0;
        }
    }
    /**
     * 执行过渡动画
     */
    async performTransition(nextTexture, transition) {
        switch (transition.type) {
            case 'instant':
                return this.instantTransition(nextTexture);
            case 'fade':
                return this.fadeTransition(nextTexture, transition.duration, transition.easing);
            case 'crossfade':
                return this.crossfadeTransition(nextTexture, transition.duration, transition.easing);
            case 'slide':
                return this.slideTransition(nextTexture, transition.duration, transition.easing);
            default:
                return this.fadeTransition(nextTexture, transition.duration, transition.easing);
        }
    }
    /**
     * 立即切换
     */
    async instantTransition(nextTexture) {
        // 直接更新材质
        if (this.currentMaterial) {
            this.currentMaterial.map = nextTexture;
            this.currentMaterial.needsUpdate = true;
        }
    }
    /**
     * 淡入淡出过渡
     */
    async fadeTransition(nextTexture, duration, easing = 'easeInOut') {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const animate = () => {
                const elapsed = performance.now() - startTime;
                let progress = Math.min(elapsed / duration, 1);
                // 应用缓动函数
                progress = this.applyEasing(progress, easing);
                this.transitionProgress = progress;
                // 更新透明度
                if (this.currentMaterial) {
                    this.currentMaterial.opacity = 1 - progress;
                }
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    // 完成过渡
                    if (this.currentMaterial) {
                        this.currentMaterial.map = nextTexture;
                        this.currentMaterial.opacity = 1;
                        this.currentMaterial.needsUpdate = true;
                    }
                    resolve();
                }
            };
            // 启用透明
            if (this.currentMaterial) {
                this.currentMaterial.transparent = true;
            }
            animate();
        });
    }
    /**
     * 交叉淡化过渡
     */
    async crossfadeTransition(nextTexture, duration, easing = 'easeInOut') {
        // 交叉淡化需要两个材质同时渲染
        // 这需要在 PanoramaViewer 中配合实现
        return this.fadeTransition(nextTexture, duration, easing);
    }
    /**
     * 滑动过渡
     */
    async slideTransition(nextTexture, duration, easing = 'easeInOut') {
        // 滑动过渡需要纹理偏移动画
        return this.fadeTransition(nextTexture, duration, easing);
    }
    /**
     * 应用缓动函数
     */
    applyEasing(t, easing = 'linear') {
        switch (easing) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return t * (2 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t;
        }
    }
    /**
     * 下一个场景
     */
    async next(transition) {
        const scenes = this.getAllScenes();
        if (scenes.length === 0)
            return;
        const currentIndex = scenes.findIndex(s => s.id === this.currentSceneId);
        const nextIndex = (currentIndex + 1) % scenes.length;
        const nextScene = scenes[nextIndex];
        await this.switchTo(nextScene.id, transition);
    }
    /**
     * 上一个场景
     */
    async previous(transition) {
        const scenes = this.getAllScenes();
        if (scenes.length === 0)
            return;
        const currentIndex = scenes.findIndex(s => s.id === this.currentSceneId);
        const prevIndex = (currentIndex - 1 + scenes.length) % scenes.length;
        const prevScene = scenes[prevIndex];
        await this.switchTo(prevScene.id, transition);
    }
    /**
     * 设置当前材质（由 PanoramaViewer 调用）
     */
    setCurrentMaterial(material) {
        this.currentMaterial = material;
    }
    /**
     * 是否正在过渡
     */
    isInTransition() {
        return this.isTransitioning;
    }
    /**
     * 获取过渡进度
     */
    getTransitionProgress() {
        return this.transitionProgress;
    }
    /**
     * 获取场景数量
     */
    getSceneCount() {
        return this.scenes.size;
    }
    /**
     * 清除所有场景
     */
    clear() {
        // 卸载所有纹理
        this.scenes.forEach((scene) => {
            this.textureCache.unload(scene.url);
            if (scene.thumbnail) {
                this.textureCache.unload(scene.thumbnail);
            }
        });
        this.scenes.clear();
        this.currentSceneId = null;
        logger.info('All scenes cleared');
    }
    /**
     * 导出场景配置
     */
    exportConfig() {
        return this.getAllScenes();
    }
    /**
     * 从配置导入场景
     */
    importConfig(scenes) {
        this.clear();
        this.addScenes(scenes);
    }
    /**
     * 获取统计信息
     */
    getStats() {
        let preloadedCount = 0;
        this.scenes.forEach((scene) => {
            if (this.textureCache.has(scene.url)) {
                preloadedCount++;
            }
        });
        return {
            totalScenes: this.scenes.size,
            currentScene: this.currentSceneId,
            preloadedScenes: preloadedCount,
            isTransitioning: this.isTransitioning,
        };
    }
    /**
     * 清理资源
     */
    dispose() {
        this.clear();
        this.currentMaterial = null;
        this.nextMaterial = null;
    }
}
//# sourceMappingURL=SceneManager.js.map