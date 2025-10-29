/**
 * 天气系统
 * 实现晴天、雨天、雾天等天气效果和过渡
 */
import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem';
export class WeatherSystem {
    constructor(scene, config) {
        this.currentWeather = 'sunny';
        this.particleSystem = null;
        this.fog = null;
        this.defaultConfig = {
            type: 'sunny',
            intensity: 1.0,
            windSpeed: 1.0,
            windDirection: new THREE.Vector3(1, 0, 0),
        };
        this.scene = scene;
        this.config = { ...this.defaultConfig, ...config };
    }
    /**
     * 设置天气
     */
    setWeather(weather, intensity = 1.0) {
        this.currentWeather = weather;
        this.config.intensity = THREE.MathUtils.clamp(intensity, 0, 1);
        // 清除当前效果
        this.clearEffects();
        // 应用新效果
        switch (weather) {
            case 'sunny':
                this.applySunnyWeather();
                break;
            case 'rainy':
                this.applyRainyWeather();
                break;
            case 'snowy':
                this.applySnowyWeather();
                break;
            case 'foggy':
                this.applyFoggyWeather();
                break;
            case 'cloudy':
                this.applyCloudyWeather();
                break;
            case 'stormy':
                this.applyStormyWeather();
                break;
        }
    }
    /**
     * 晴天
     */
    applySunnyWeather() {
        // 无特殊效果，清除雾
        this.scene.fog = null;
    }
    /**
     * 雨天
     */
    applyRainyWeather() {
        this.particleSystem = new ParticleSystem(this.scene);
        this.particleSystem.applyEffect('rain');
        this.particleSystem.setCount(Math.floor(2000 * this.config.intensity));
        this.particleSystem.initialize();
        // 添加轻微雾效
        this.scene.fog = new THREE.Fog(0xCCCCCC, 10, 50);
    }
    /**
     * 雪天
     */
    applySnowyWeather() {
        this.particleSystem = new ParticleSystem(this.scene);
        this.particleSystem.applyEffect('snow');
        this.particleSystem.setCount(Math.floor(1500 * this.config.intensity));
        this.particleSystem.initialize();
        // 添加雾效
        this.scene.fog = new THREE.Fog(0xFFFFFF, 10, 40);
    }
    /**
     * 雾天
     */
    applyFoggyWeather() {
        const fogColor = 0xCCCCCC;
        const near = 5 * (1 - this.config.intensity);
        const far = 30 * (1 - this.config.intensity * 0.5);
        this.scene.fog = new THREE.Fog(fogColor, near, far);
        // 添加雾粒子
        this.particleSystem = new ParticleSystem(this.scene);
        this.particleSystem.applyEffect('fog');
        this.particleSystem.setCount(Math.floor(500 * this.config.intensity));
        this.particleSystem.initialize();
    }
    /**
     * 多云
     */
    applyCloudyWeather() {
        // 轻微雾效
        this.scene.fog = new THREE.Fog(0xDDDDDD, 20, 60);
    }
    /**
     * 暴风雨
     */
    applyStormyWeather() {
        // 强雨
        this.particleSystem = new ParticleSystem(this.scene);
        this.particleSystem.applyEffect('rain');
        this.particleSystem.setCount(Math.floor(3000 * this.config.intensity));
        this.particleSystem.initialize();
        // 浓雾
        this.scene.fog = new THREE.Fog(0x666666, 5, 30);
    }
    /**
     * 清除效果
     */
    clearEffects() {
        if (this.particleSystem) {
            this.particleSystem.dispose();
            this.particleSystem = null;
        }
        this.scene.fog = null;
    }
    /**
     * 更新（每帧调用）
     */
    update(deltaTime) {
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
    }
    /**
     * 过渡到新天气
     */
    async transitionTo(weather, duration = 2000) {
        return new Promise((resolve) => {
            const startIntensity = this.config.intensity;
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // 淡出当前天气
                if (progress < 0.5) {
                    this.config.intensity = startIntensity * (1 - progress * 2);
                }
                else {
                    // 淡入新天气
                    if (progress === 0.5) {
                        this.setWeather(weather, 0);
                    }
                    this.config.intensity = (progress - 0.5) * 2;
                }
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    this.config.intensity = 1;
                    resolve();
                }
            };
            animate();
        });
    }
    /**
     * 获取当前天气
     */
    getCurrentWeather() {
        return this.currentWeather;
    }
    /**
     * 设置强度
     */
    setIntensity(intensity) {
        this.config.intensity = THREE.MathUtils.clamp(intensity, 0, 1);
        // 重新应用当前天气
        this.setWeather(this.currentWeather, this.config.intensity);
    }
    /**
     * 清理资源
     */
    dispose() {
        this.clearEffects();
        // @ts-expect-error - 可选属性，用于UI控制
        if (this.controlsElement) {
            // @ts-expect-error - 可选属性，用于UI控制
            this.controlsElement.remove();
        }
    }
}
//# sourceMappingURL=WeatherSystem.js.map