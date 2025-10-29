/**
 * 多分辨率瓦片管理系统
 * 支持四叉树管理、动态加载、多格式支持
 */
import * as THREE from 'three';
export interface TileCoordinate {
    level: number;
    x: number;
    y: number;
}
export interface TileFormat {
    type: 'google' | 'marzipano' | 'krpano' | 'custom';
    /** URL 模板，例如: '/tiles/{l}/{x}_{y}.jpg' */
    urlTemplate: string;
    /** 最大层级 */
    maxLevel: number;
    /** 瓦片大小 */
    tileSize: number;
    /** 每层的列数和行数 */
    dimensions?: {
        cols: number;
        rows: number;
    }[];
}
export interface TileNode {
    coordinate: TileCoordinate;
    texture: THREE.Texture | null;
    mesh: THREE.Mesh | null;
    children: TileNode[];
    isLoading: boolean;
    isVisible: boolean;
    lastAccessTime: number;
}
export declare class TileManager {
    private scene;
    private camera;
    private format;
    private textureCache;
    private rootNodes;
    private visibleTiles;
    private loadingTiles;
    private maxConcurrentLoads;
    private maxCachedTiles;
    private cacheCleanupInterval;
    private lastCleanupTime;
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, format: TileFormat);
    /**
     * 初始化根节点（level 0）
     */
    private initializeRootNodes;
    /**
     * 获取指定层级的所有瓦片坐标
     */
    private getTilesForLevel;
    /**
     * 更新可见瓦片（在动画循环中调用）
     */
    update(): void;
    /**
     * 更新瓦片可见性
     */
    private updateVisibility;
    /**
     * 递归更新节点可见性
     */
    private updateNodeVisibility;
    /**
     * 检查瓦片是否可见
     */
    private isTileVisible;
    /**
     * 计算瓦片到相机的距离
     */
    private getTileDistance;
    /**
     * 判断是否应该细分瓦片
     */
    private shouldSubdivideTile;
    /**
     * 创建子节点
     */
    private createChildNodes;
    /**
     * 加载可见瓦片
     */
    private loadVisibleTiles;
    /**
     * 加载单个瓦片
     */
    private loadTile;
    /**
     * 生成瓦片 URL
     */
    private getTileUrl;
    /**
     * 生成瓦片唯一键
     */
    private getTileKey;
    /**
     * 创建瓦片网格
     */
    private createTileMesh;
    /**
     * 清理缓存
     */
    private cleanupCache;
    /**
     * 收集所有节点
     */
    private collectAllNodes;
    /**
     * 卸载瓦片
     */
    private unloadTile;
    /**
     * 获取统计信息
     */
    getStats(): {
        visibleTiles: number;
        loadedTiles: number;
        loadingTiles: number;
        totalNodes: number;
    };
    /**
     * 预加载指定层级的所有瓦片
     */
    preloadLevel(level: number): Promise<void>;
    /**
     * 销毁
     */
    dispose(): void;
}
//# sourceMappingURL=TileManager.d.ts.map