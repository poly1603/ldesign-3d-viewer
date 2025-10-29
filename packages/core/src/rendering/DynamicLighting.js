/**
 * 动态光照系统
 * 添加点光源、聚光灯和实时阴影
 */
import * as THREE from 'three';
export class DynamicLighting {
    constructor(scene, renderer) {
        this.lights = new Map();
        this.shadowsEnabled = false;
        this.scene = scene;
        this.renderer = renderer;
    }
    /**
     * 初始化阴影
     */
    initializeShadows() {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.shadowsEnabled = true;
    }
    /**
     * 添加光源
     */
    addLight(id, config) {
        let light;
        switch (config.type) {
            case 'point':
                light = this.createPointLight(config);
                break;
            case 'spot':
                light = this.createSpotLight(config);
                break;
            case 'directional':
                light = this.createDirectionalLight(config);
                break;
            case 'hemisphere':
                light = this.createHemisphereLight(config);
                break;
            default:
                light = this.createPointLight(config);
        }
        // 配置阴影
        if (config.castShadow && this.shadowsEnabled) {
            light.castShadow = true;
            if (light.shadow) {
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                // @ts-expect-error - Camera类型需要转换
                light.shadow.camera.near = 0.5;
                // @ts-expect-error - Camera类型需要转换
                light.shadow.camera.far = 500;
            }
        }
        this.lights.set(id, light);
        this.scene.add(light);
        return light;
    }
    /**
     * 创建点光源
     */
    createPointLight(config) {
        const color = typeof config.color === 'string'
            ? new THREE.Color(config.color)
            : new THREE.Color(config.color);
        const light = new THREE.PointLight(color, config.intensity, config.distance || 100);
        if (config.position) {
            light.position.copy(config.position);
        }
        return light;
    }
    /**
     * 创建聚光灯
     */
    createSpotLight(config) {
        const color = typeof config.color === 'string'
            ? new THREE.Color(config.color)
            : new THREE.Color(config.color);
        const light = new THREE.SpotLight(color, config.intensity, config.distance || 100, config.angle || Math.PI / 4, config.penumbra || 0);
        if (config.position) {
            light.position.copy(config.position);
        }
        if (config.target) {
            light.target.position.copy(config.target);
            this.scene.add(light.target);
        }
        return light;
    }
    /**
     * 创建平行光
     */
    createDirectionalLight(config) {
        const color = typeof config.color === 'string'
            ? new THREE.Color(config.color)
            : new THREE.Color(config.color);
        const light = new THREE.DirectionalLight(color, config.intensity);
        if (config.position) {
            light.position.copy(config.position);
        }
        return light;
    }
    /**
     * 创建半球光
     */
    createHemisphereLight(config) {
        const skyColor = typeof config.color === 'string'
            ? new THREE.Color(config.color)
            : new THREE.Color(config.color);
        const groundColor = new THREE.Color(0x444444);
        const light = new THREE.HemisphereLight(skyColor, groundColor, config.intensity);
        if (config.position) {
            light.position.copy(config.position);
        }
        return light;
    }
    /**
     * 移除光源
     */
    removeLight(id) {
        const light = this.lights.get(id);
        if (light) {
            this.scene.remove(light);
            if (light instanceof THREE.SpotLight && light.target) {
                this.scene.remove(light.target);
            }
            this.lights.delete(id);
        }
    }
    /**
     * 获取光源
     */
    getLight(id) {
        return this.lights.get(id);
    }
    /**
     * 更新光源属性
     */
    updateLight(id, updates) {
        const light = this.lights.get(id);
        if (!light)
            return;
        if (updates.color !== undefined) {
            const color = typeof updates.color === 'string'
                ? new THREE.Color(updates.color)
                : new THREE.Color(updates.color);
            light.color = color;
        }
        if (updates.intensity !== undefined) {
            light.intensity = updates.intensity;
        }
        if (updates.position && 'position' in light) {
            light.position.copy(updates.position);
        }
        if (light instanceof THREE.SpotLight) {
            if (updates.angle !== undefined)
                light.angle = updates.angle;
            if (updates.penumbra !== undefined)
                light.penumbra = updates.penumbra;
            if (updates.distance !== undefined)
                light.distance = updates.distance;
            if (updates.target && light.target) {
                light.target.position.copy(updates.target);
            }
        }
        if (light instanceof THREE.PointLight && updates.distance !== undefined) {
            light.distance = updates.distance;
        }
    }
    /**
     * 设置光源可见性
     */
    setLightVisible(id, visible) {
        const light = this.lights.get(id);
        if (light) {
            light.visible = visible;
        }
    }
    /**
     * 启用/禁用阴影
     */
    setShadowsEnabled(enabled) {
        this.renderer.shadowMap.enabled = enabled;
        this.shadowsEnabled = enabled;
        this.lights.forEach((light) => {
            if (light.castShadow) {
                light.castShadow = enabled;
            }
        });
    }
    /**
     * 创建预设光照场景
     */
    applyPreset(preset) {
        // 清除现有光源
        this.clear();
        switch (preset) {
            case 'day':
                this.addLight('sun', {
                    type: 'directional',
                    color: 0xFFFFFF,
                    intensity: 1.0,
                    position: new THREE.Vector3(10, 10, 10),
                    castShadow: true,
                });
                this.addLight('ambient', {
                    type: 'hemisphere',
                    color: 0xFFFFFF,
                    intensity: 0.6,
                });
                break;
            case 'night':
                this.addLight('moon', {
                    type: 'directional',
                    color: 0x4477FF,
                    intensity: 0.3,
                    position: new THREE.Vector3(5, 10, -5),
                });
                this.addLight('ambient', {
                    type: 'hemisphere',
                    color: 0x222244,
                    intensity: 0.2,
                });
                break;
            case 'sunset':
                this.addLight('sun', {
                    type: 'directional',
                    color: 0xFF6644,
                    intensity: 0.8,
                    position: new THREE.Vector3(-10, 5, 10),
                });
                this.addLight('ambient', {
                    type: 'hemisphere',
                    color: 0xFFAA66,
                    intensity: 0.4,
                });
                break;
            case 'studio':
                // 三点布光
                this.addLight('key', {
                    type: 'spot',
                    color: 0xFFFFFF,
                    intensity: 1.5,
                    position: new THREE.Vector3(5, 5, 5),
                    angle: Math.PI / 6,
                    penumbra: 0.2,
                    castShadow: true,
                });
                this.addLight('fill', {
                    type: 'spot',
                    color: 0xFFFFFF,
                    intensity: 0.7,
                    position: new THREE.Vector3(-5, 3, 5),
                    angle: Math.PI / 4,
                });
                this.addLight('back', {
                    type: 'point',
                    color: 0xFFFFFF,
                    intensity: 0.5,
                    position: new THREE.Vector3(0, 5, -5),
                });
                break;
        }
    }
    /**
     * 清除所有光源
     */
    clear() {
        this.lights.forEach((light, id) => {
            this.removeLight(id);
        });
    }
    /**
     * 获取所有光源
     */
    getAllLights() {
        const result = [];
        this.lights.forEach((light, id) => {
            result.push({ id, light });
        });
        return result;
    }
    /**
     * 获取光源数量
     */
    getLightCount() {
        return this.lights.size;
    }
    /**
     * 清理资源
     */
    dispose() {
        this.clear();
    }
}
//# sourceMappingURL=DynamicLighting.js.map