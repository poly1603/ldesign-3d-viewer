/**
 * 粒子系统
 * 实现雨、雪、烟雾等粒子效果
 */
import * as THREE from 'three';
export type ParticleEffect = 'rain' | 'snow' | 'fog' | 'dust' | 'sparkles';
export interface ParticleConfig {
    count: number;
    size: number;
    color: THREE.Color | string;
    opacity: number;
    velocity: THREE.Vector3;
    spread: number;
    lifetime: number;
    gravity: number;
}
export declare class ParticleSystem {
    private scene;
    private particleSystem;
    private geometry;
    private material;
    private config;
    private velocities;
    private lifetimes;
    private ages;
    private defaultConfig;
    constructor(scene: THREE.Scene, config?: Partial<ParticleConfig>);
    /**
     * 初始化粒子系统
     */
    initialize(): void;
    /**
     * 重置单个粒子
     */
    private resetParticle;
    /**
     * 更新粒子
     */
    update(deltaTime: number): void;
    /**
     * 应用预设效果
     */
    applyEffect(effect: ParticleEffect): void;
    /**
     * 雨效果
     */
    private applyRainEffect;
    /**
     * 雪效果
     */
    private applySnowEffect;
    /**
     * 雾效果
     */
    private applyFogEffect;
    /**
     * 灰尘效果
     */
    private applyDustEffect;
    /**
     * 闪光效果
     */
    private applySparklesEffect;
    /**
     * 设置粒子数量
     */
    setCount(count: number): void;
    /**
     * 设置粒子大小
     */
    setSize(size: number): void;
    /**
     * 设置颜色
     */
    setColor(color: THREE.Color | string): void;
    /**
     * 设置透明度
     */
    setOpacity(opacity: number): void;
    /**
     * 启用/禁用
     */
    setVisible(visible: boolean): void;
    /**
     * 获取统计
     */
    getStats(): {
        particleCount: number;
        activeParticles: number;
        averageAge: number;
    };
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=ParticleSystem.d.ts.map