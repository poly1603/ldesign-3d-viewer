/**
 * 环境映射系统
 * 实现实时环境映射和反射效果
 */
import * as THREE from 'three';
export class EnvironmentMapping {
    constructor(scene, renderer, options) {
        this.envMap = null;
        this.reflectionObjects = new Set();
        this.lastUpdate = 0;
        this.updateInterval = 0;
        this.defaultOptions = {
            resolution: 256,
            refreshRate: 30,
            intensity: 1.0,
            roughness: 0.1,
            metalness: 1.0,
        };
        this.scene = scene;
        this.renderer = renderer;
        this.options = { ...this.defaultOptions, ...options };
        this.updateInterval = 1000 / this.options.refreshRate;
        // 创建立方体渲染目标
        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(this.options.resolution, {
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
        });
        // 创建立方体相机
        this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget);
    }
    /**
     * 初始化环境贴图
     */
    initialize() {
        this.envMap = this.cubeRenderTarget.texture;
    }
    /**
     * 添加反射物体
     */
    addReflectionObject(mesh) {
        this.reflectionObjects.add(mesh);
        // 配置材质
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.envMap = this.envMap;
            mesh.material.envMapIntensity = this.options.intensity;
            mesh.material.roughness = this.options.roughness;
            mesh.material.metalness = this.options.metalness;
            mesh.material.needsUpdate = true;
        }
    }
    /**
     * 移除反射物体
     */
    removeReflectionObject(mesh) {
        this.reflectionObjects.delete(mesh);
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.envMap = null;
            mesh.material.needsUpdate = true;
        }
    }
    /**
     * 更新环境贴图
     */
    update(deltaTime) {
        this.lastUpdate += deltaTime;
        if (this.lastUpdate < this.updateInterval)
            return;
        this.lastUpdate = 0;
        // 隐藏反射物体（避免自反射）
        this.reflectionObjects.forEach((obj) => {
            obj.visible = false;
        });
        // 更新立方体相机
        this.cubeCamera.update(this.renderer, this.scene);
        // 恢复反射物体
        this.reflectionObjects.forEach((obj) => {
            obj.visible = true;
        });
    }
    /**
     * 设置强度
     */
    setIntensity(intensity) {
        this.options.intensity = THREE.MathUtils.clamp(intensity, 0, 1);
        this.reflectionObjects.forEach((mesh) => {
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.envMapIntensity = this.options.intensity;
                mesh.material.needsUpdate = true;
            }
        });
    }
    /**
     * 设置粗糙度
     */
    setRoughness(roughness) {
        this.options.roughness = THREE.MathUtils.clamp(roughness, 0, 1);
        this.reflectionObjects.forEach((mesh) => {
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.roughness = this.options.roughness;
                mesh.material.needsUpdate = true;
            }
        });
    }
    /**
     * 设置金属度
     */
    setMetalness(metalness) {
        this.options.metalness = THREE.MathUtils.clamp(metalness, 0, 1);
        this.reflectionObjects.forEach((mesh) => {
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.metalness = this.options.metalness;
                mesh.material.needsUpdate = true;
            }
        });
    }
    /**
     * 从全景纹理创建环境贴图
     */
    setEnvironmentFromPanorama(texture) {
        // 使用PMREMGenerator生成预滤波环境贴图
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        this.envMap = envMap;
        // 更新所有反射物体
        this.reflectionObjects.forEach((mesh) => {
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.envMap = envMap;
                mesh.material.needsUpdate = true;
            }
        });
        pmremGenerator.dispose();
    }
    /**
     * 获取环境贴图
     */
    getEnvironmentMap() {
        return this.envMap;
    }
    /**
     * 获取反射物体数量
     */
    getReflectionObjectCount() {
        return this.reflectionObjects.size;
    }
    /**
     * 清理资源
     */
    dispose() {
        this.cubeRenderTarget.dispose();
        this.reflectionObjects.clear();
        if (this.envMap) {
            this.envMap.dispose();
        }
    }
}
//# sourceMappingURL=EnvironmentMapping.js.map