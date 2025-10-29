/**
 * 环境映射系统
 * 实现实时环境映射和反射效果
 */
import * as THREE from 'three';
export interface EnvironmentMappingOptions {
    resolution: number;
    refreshRate: number;
    intensity: number;
    roughness: number;
    metalness: number;
}
export declare class EnvironmentMapping {
    private scene;
    private renderer;
    private cubeRenderTarget;
    private cubeCamera;
    private envMap;
    private options;
    private reflectionObjects;
    private lastUpdate;
    private updateInterval;
    private defaultOptions;
    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, options?: Partial<EnvironmentMappingOptions>);
    /**
     * 初始化环境贴图
     */
    initialize(): void;
    /**
     * 添加反射物体
     */
    addReflectionObject(mesh: THREE.Mesh): void;
    /**
     * 移除反射物体
     */
    removeReflectionObject(mesh: THREE.Mesh): void;
    /**
     * 更新环境贴图
     */
    update(deltaTime: number): void;
    /**
     * 设置强度
     */
    setIntensity(intensity: number): void;
    /**
     * 设置粗糙度
     */
    setRoughness(roughness: number): void;
    /**
     * 设置金属度
     */
    setMetalness(metalness: number): void;
    /**
     * 从全景纹理创建环境贴图
     */
    setEnvironmentFromPanorama(texture: THREE.Texture): void;
    /**
     * 获取环境贴图
     */
    getEnvironmentMap(): THREE.Texture | null;
    /**
     * 获取反射物体数量
     */
    getReflectionObjectCount(): number;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=EnvironmentMapping.d.ts.map