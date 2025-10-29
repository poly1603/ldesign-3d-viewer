/**
 * 天气系统
 * 实现晴天、雨天、雾天等天气效果和过渡
 */
import * as THREE from 'three';
export type WeatherType = 'sunny' | 'rainy' | 'snowy' | 'foggy' | 'cloudy' | 'stormy';
export interface WeatherConfig {
    type: WeatherType;
    intensity: number;
    windSpeed: number;
    windDirection: THREE.Vector3;
}
export declare class WeatherSystem {
    private scene;
    private currentWeather;
    private particleSystem;
    private fog;
    private config;
    private defaultConfig;
    constructor(scene: THREE.Scene, config?: Partial<WeatherConfig>);
    /**
     * 设置天气
     */
    setWeather(weather: WeatherType, intensity?: number): void;
    /**
     * 晴天
     */
    private applySunnyWeather;
    /**
     * 雨天
     */
    private applyRainyWeather;
    /**
     * 雪天
     */
    private applySnowyWeather;
    /**
     * 雾天
     */
    private applyFoggyWeather;
    /**
     * 多云
     */
    private applyCloudyWeather;
    /**
     * 暴风雨
     */
    private applyStormyWeather;
    /**
     * 清除效果
     */
    private clearEffects;
    /**
     * 更新（每帧调用）
     */
    update(deltaTime: number): void;
    /**
     * 过渡到新天气
     */
    transitionTo(weather: WeatherType, duration?: number): Promise<void>;
    /**
     * 获取当前天气
     */
    getCurrentWeather(): WeatherType;
    /**
     * 设置强度
     */
    setIntensity(intensity: number): void;
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=WeatherSystem.d.ts.map