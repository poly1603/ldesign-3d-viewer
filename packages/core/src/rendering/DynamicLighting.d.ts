/**
 * 动态光照系统
 * 添加点光源、聚光灯和实时阴影
 */
import * as THREE from 'three';
export interface LightConfig {
    type: 'point' | 'spot' | 'directional' | 'hemisphere';
    color: string | number;
    intensity: number;
    position?: THREE.Vector3;
    target?: THREE.Vector3;
    distance?: number;
    angle?: number;
    penumbra?: number;
    castShadow?: boolean;
}
export declare class DynamicLighting {
    private scene;
    private renderer;
    private lights;
    private shadowsEnabled;
    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer);
    /**
     * 初始化阴影
     */
    initializeShadows(): void;
    /**
     * 添加光源
     */
    addLight(id: string, config: LightConfig): THREE.Light;
    /**
     * 创建点光源
     */
    private createPointLight;
    /**
     * 创建聚光灯
     */
    private createSpotLight;
    /**
     * 创建平行光
     */
    private createDirectionalLight;
    /**
     * 创建半球光
     */
    private createHemisphereLight;
    /**
     * 移除光源
     */
    removeLight(id: string): void;
    /**
     * 获取光源
     */
    getLight(id: string): THREE.Light | undefined;
    /**
     * 更新光源属性
     */
    updateLight(id: string, updates: Partial<LightConfig>): void;
    /**
     * 设置光源可见性
     */
    setLightVisible(id: string, visible: boolean): void;
    /**
     * 启用/禁用阴影
     */
    setShadowsEnabled(enabled: boolean): void;
    /**
     * 创建预设光照场景
     */
    applyPreset(preset: 'day' | 'night' | 'sunset' | 'studio'): void;
    /**
     * 清除所有光源
     */
    clear(): void;
    /**
     * 获取所有光源
     */
    getAllLights(): Array<{
        id: string;
        light: THREE.Light;
    }>;
    /**
     * 获取光源数量
     */
    getLightCount(): number;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=DynamicLighting.d.ts.map