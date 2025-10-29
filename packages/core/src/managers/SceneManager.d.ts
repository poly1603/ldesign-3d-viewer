/**
 * 场景管理器
 * 管理多个全景场景的切换、预加载和过渡动画
 */
import type * as THREE from 'three';
import { EventBus } from '../core/EventBus';
export interface Scene {
    id: string;
    name: string;
    url: string;
    thumbnail?: string;
    preload?: boolean;
    hotspots?: any[];
    metadata?: Record<string, any>;
}
export interface SceneTransition {
    type: 'fade' | 'slide' | 'crossfade' | 'instant';
    duration: number;
    easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}
export declare class SceneManager {
    private scenes;
    private currentSceneId;
    private textureCache;
    private eventBus;
    private isTransitioning;
    private transitionProgress;
    private currentMaterial;
    private nextMaterial;
    constructor(eventBus?: EventBus);
    /**
     * 添加场景
     */
    addScene(scene: Scene): void;
    /**
     * 批量添加场景
     */
    addScenes(scenes: Scene[]): void;
    /**
     * 移除场景
     */
    removeScene(id: string): void;
    /**
     * 获取场景
     */
    getScene(id: string): Scene | undefined;
    /**
     * 获取所有场景
     */
    getAllScenes(): Scene[];
    /**
     * 获取当前场景
     */
    getCurrentScene(): Scene | null;
    /**
     * 预加载场景纹理
     */
    preloadScene(id: string): Promise<void>;
    /**
     * 预加载多个场景
     */
    preloadScenes(ids: string[]): Promise<void>;
    /**
     * 切换场景
     */
    switchTo(id: string, transition?: SceneTransition): Promise<void>;
    /**
     * 执行过渡动画
     */
    private performTransition;
    /**
     * 立即切换
     */
    private instantTransition;
    /**
     * 淡入淡出过渡
     */
    private fadeTransition;
    /**
     * 交叉淡化过渡
     */
    private crossfadeTransition;
    /**
     * 滑动过渡
     */
    private slideTransition;
    /**
     * 应用缓动函数
     */
    private applyEasing;
    /**
     * 下一个场景
     */
    next(transition?: SceneTransition): Promise<void>;
    /**
     * 上一个场景
     */
    previous(transition?: SceneTransition): Promise<void>;
    /**
     * 设置当前材质（由 PanoramaViewer 调用）
     */
    setCurrentMaterial(material: THREE.MeshBasicMaterial): void;
    /**
     * 是否正在过渡
     */
    isInTransition(): boolean;
    /**
     * 获取过渡进度
     */
    getTransitionProgress(): number;
    /**
     * 获取场景数量
     */
    getSceneCount(): number;
    /**
     * 清除所有场景
     */
    clear(): void;
    /**
     * 导出场景配置
     */
    exportConfig(): Scene[];
    /**
     * 从配置导入场景
     */
    importConfig(scenes: Scene[]): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalScenes: number;
        currentScene: string | null;
        preloadedScenes: number;
        isTransitioning: boolean;
    };
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=SceneManager.d.ts.map