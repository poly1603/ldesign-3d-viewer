/**
 * HDR 渲染器
 * 支持 HDR 纹理、Tone Mapping 和高级色彩处理
 */
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { logger } from '../core/Logger';
export class HDRRenderer {
    constructor(renderer, scene, options = {}) {
        this.renderer = renderer;
        this.scene = scene;
        this.options = {
            toneMapping: options.toneMapping ?? 'aces',
            exposure: options.exposure ?? 1.0,
            whitePoint: options.whitePoint ?? 1.0,
            enableBloom: options.enableBloom ?? false,
            bloomStrength: options.bloomStrength ?? 1.5,
            bloomRadius: options.bloomRadius ?? 0.4,
            bloomThreshold: options.bloomThreshold ?? 0.85,
        };
        this.rgbeLoader = new RGBELoader();
        this.applyToneMapping();
    }
    /**
     * 加载 HDR 纹理（RGBE 格式）
     */
    async loadHDR(url) {
        return new Promise((resolve, reject) => {
            this.rgbeLoader.load(url, (texture) => {
                // 配置 HDR 纹理
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.LinearSRGBColorSpace;
                logger.info(`HDR texture loaded: ${url}`);
                resolve(texture);
            }, undefined, (error) => {
                logger.error(`Failed to load HDR texture: ${url}`, error);
                reject(error);
            });
        });
    }
    /**
     * 应用 Tone Mapping
     */
    applyToneMapping() {
        switch (this.options.toneMapping) {
            case 'none':
                this.renderer.toneMapping = THREE.NoToneMapping;
                break;
            case 'linear':
                this.renderer.toneMapping = THREE.LinearToneMapping;
                break;
            case 'reinhard':
                this.renderer.toneMapping = THREE.ReinhardToneMapping;
                break;
            case 'cineon':
                this.renderer.toneMapping = THREE.CineonToneMapping;
                break;
            case 'aces':
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                break;
            case 'custom':
                this.renderer.toneMapping = THREE.CustomToneMapping;
                break;
        }
        this.renderer.toneMappingExposure = this.options.exposure;
        logger.debug(`Tone mapping applied: ${this.options.toneMapping}`);
    }
    /**
     * 设置 Tone Mapping 类型
     */
    setToneMapping(type) {
        this.options.toneMapping = type;
        this.applyToneMapping();
    }
    /**
     * 设置曝光度
     */
    setExposure(exposure) {
        this.options.exposure = exposure;
        this.renderer.toneMappingExposure = exposure;
    }
    /**
     * 获取当前曝光度
     */
    getExposure() {
        return this.options.exposure;
    }
    /**
     * 创建自定义 Tone Mapping Shader
     */
    static createCustomToneMappingShader() {
        return `
      // 自定义 Tone Mapping 着色器
      vec3 CustomToneMapping(vec3 color) {
        // Uncharted 2 Tone Mapping
        float A = 0.15;
        float B = 0.50;
        float C = 0.10;
        float D = 0.20;
        float E = 0.02;
        float F = 0.30;
        float W = 11.2;
        
        color *= toneMappingExposure;
        color = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
        
        float white = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
        color /= white;
        
        return color;
      }
    `;
    }
    /**
     * 应用 HDR 环境贴图
     */
    applyEnvironmentMap(texture) {
        this.scene.environment = texture;
        this.scene.background = texture;
        logger.debug('HDR environment map applied');
    }
    /**
     * 移除环境贴图
     */
    removeEnvironmentMap() {
        this.scene.environment = null;
        this.scene.background = null;
    }
    /**
     * 创建 PBR 材质（用于 HDR 环境）
     */
    static createPBRMaterial(options = {}) {
        return new THREE.MeshStandardMaterial({
            color: options.color ?? 0xFFFFFF,
            metalness: options.metalness ?? 0.5,
            roughness: options.roughness ?? 0.5,
            envMapIntensity: options.envMapIntensity ?? 1.0,
        });
    }
    /**
     * 获取选项
     */
    getOptions() {
        return { ...this.options };
    }
    /**
     * 更新选项
     */
    updateOptions(options) {
        Object.assign(this.options, options);
        if (options.toneMapping) {
            this.applyToneMapping();
        }
        if (options.exposure !== undefined) {
            this.setExposure(options.exposure);
        }
    }
    /**
     * 销毁
     */
    dispose() {
        this.removeEnvironmentMap();
        logger.debug('HDR renderer disposed');
    }
}
/**
 * 色彩分级（Color Grading）
 */
export class ColorGrading {
    constructor() {
        this.material = null;
    }
    /**
     * 创建色彩分级着色器材质
     */
    createMaterial(options = {}) {
        const uniforms = {
            tDiffuse: { value: null },
            brightness: { value: options.brightness ?? 0.0 },
            contrast: { value: options.contrast ?? 1.0 },
            saturation: { value: options.saturation ?? 1.0 },
            hue: { value: options.hue ?? 0.0 },
            temperature: { value: options.temperature ?? 0.0 },
            tint: { value: options.tint ?? 0.0 },
        };
        this.material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
        });
        return this.material;
    }
    /**
     * 顶点着色器
     */
    getVertexShader() {
        return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    }
    /**
     * 片元着色器
     */
    getFragmentShader() {
        return `
      uniform sampler2D tDiffuse;
      uniform float brightness;
      uniform float contrast;
      uniform float saturation;
      uniform float hue;
      uniform float temperature;
      uniform float tint;
      
      varying vec2 vUv;
      
      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }
      
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        
        // 亮度
        color.rgb += brightness;
        
        // 对比度
        color.rgb = (color.rgb - 0.5) * contrast + 0.5;
        
        // 饱和度和色相
        vec3 hsv = rgb2hsv(color.rgb);
        hsv.x += hue;
        hsv.y *= saturation;
        color.rgb = hsv2rgb(hsv);
        
        // 色温（简化版）
        color.r += temperature * 0.1;
        color.b -= temperature * 0.1;
        
        // 色调
        color.g += tint * 0.1;
        
        gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
      }
    `;
    }
    /**
     * 更新参数
     */
    updateParameter(name, value) {
        if (this.material && this.material.uniforms[name]) {
            this.material.uniforms[name].value = value;
        }
    }
    /**
     * 销毁
     */
    dispose() {
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }
    }
}
//# sourceMappingURL=HDRRenderer.js.map