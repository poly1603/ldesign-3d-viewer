/**
 * 实时滤镜系统 - 为全景图像添加各种视觉滤镜效果
 * 支持：黑白、复古、暖色、冷色、高对比度等多种预设滤镜
 */
import * as THREE from 'three';
export var FilterPreset;
(function (FilterPreset) {
    FilterPreset["NONE"] = "none";
    FilterPreset["GRAYSCALE"] = "grayscale";
    FilterPreset["SEPIA"] = "sepia";
    FilterPreset["WARM"] = "warm";
    FilterPreset["COOL"] = "cool";
    FilterPreset["VINTAGE"] = "vintage";
    FilterPreset["HIGH_CONTRAST"] = "highContrast";
    FilterPreset["SOFT"] = "soft";
    FilterPreset["VIVID"] = "vivid";
    FilterPreset["NOIR"] = "noir";
    FilterPreset["SUNSET"] = "sunset";
    FilterPreset["MOONLIGHT"] = "moonlight";
})(FilterPreset || (FilterPreset = {}));
export class Filters {
    constructor() {
        this.currentPreset = FilterPreset.NONE;
        this.settings = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            temperature: 0,
            tint: 0,
            vignette: 0,
            grain: 0,
        };
        this.material = this.createFilterMaterial();
    }
    /**
     * 创建滤镜材质
     */
    createFilterMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                brightness: { value: 0.0 },
                contrast: { value: 0.0 },
                saturation: { value: 0.0 },
                hue: { value: 0.0 },
                temperature: { value: 0.0 },
                tint: { value: 0.0 },
                vignette: { value: 0.0 },
                grain: { value: 0.0 },
                time: { value: 0.0 },
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float contrast;
        uniform float saturation;
        uniform float hue;
        uniform float temperature;
        uniform float tint;
        uniform float vignette;
        uniform float grain;
        uniform float time;
        
        varying vec2 vUv;

        // RGB to HSV conversion
        vec3 rgb2hsv(vec3 c) {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        // HSV to RGB conversion
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        // Random noise
        float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          vec3 rgb = color.rgb;

          // Brightness
          rgb += brightness;

          // Contrast
          rgb = (rgb - 0.5) * (1.0 + contrast) + 0.5;

          // Temperature (warm/cool)
          if (temperature > 0.0) {
            rgb.r += temperature * 0.1;
            rgb.b -= temperature * 0.1;
          } else {
            rgb.b += abs(temperature) * 0.1;
            rgb.r -= abs(temperature) * 0.1;
          }

          // Tint (green/magenta)
          if (tint > 0.0) {
            rgb.r += tint * 0.1;
          } else {
            rgb.g += abs(tint) * 0.1;
          }

          // Saturation & Hue (via HSV)
          vec3 hsv = rgb2hsv(rgb);
          hsv.x += hue / 360.0;
          hsv.y *= 1.0 + saturation;
          rgb = hsv2rgb(hsv);

          // Vignette
          if (vignette > 0.0) {
            vec2 center = vUv - vec2(0.5);
            float dist = length(center);
            float vignetteAmount = smoothstep(0.8, 0.2, dist);
            rgb *= mix(1.0, vignetteAmount, vignette);
          }

          // Film grain
          if (grain > 0.0) {
            float noise = random(vUv + time);
            rgb += (noise - 0.5) * grain * 0.1;
          }

          // Clamp values
          rgb = clamp(rgb, 0.0, 1.0);

          gl_FragColor = vec4(rgb, color.a);
        }
      `,
        });
    }
    /**
     * 应用滤镜到材质
     */
    applyToMaterial(material) {
        if (material instanceof THREE.MeshBasicMaterial
            || material instanceof THREE.MeshStandardMaterial) {
            // 应用滤镜设置到材质
            // 注意：这里需要使用着色器材质或后处理效果来实现
            // 简化版本：直接修改材质颜色
            const factor = 1 + this.settings.brightness;
            if (material.color) {
                material.color.multiplyScalar(factor);
            }
            material.needsUpdate = true;
        }
    }
    /**
     * 应用预设滤镜
     */
    applyPreset(preset) {
        this.currentPreset = preset;
        switch (preset) {
            case FilterPreset.NONE:
                this.reset();
                break;
            case FilterPreset.GRAYSCALE:
                this.setSettings({
                    saturation: -1,
                    contrast: 0.1,
                });
                break;
            case FilterPreset.SEPIA:
                this.setSettings({
                    saturation: -0.3,
                    temperature: 0.6,
                    contrast: -0.1,
                    brightness: 0.1,
                });
                break;
            case FilterPreset.WARM:
                this.setSettings({
                    temperature: 0.5,
                    saturation: 0.2,
                    brightness: 0.05,
                });
                break;
            case FilterPreset.COOL:
                this.setSettings({
                    temperature: -0.5,
                    tint: -0.1,
                    contrast: 0.1,
                });
                break;
            case FilterPreset.VINTAGE:
                this.setSettings({
                    saturation: -0.2,
                    contrast: 0.3,
                    vignette: 0.4,
                    grain: 0.2,
                    temperature: 0.3,
                });
                break;
            case FilterPreset.HIGH_CONTRAST:
                this.setSettings({
                    contrast: 0.5,
                    saturation: 0.3,
                    brightness: 0.05,
                });
                break;
            case FilterPreset.SOFT:
                this.setSettings({
                    contrast: -0.2,
                    saturation: -0.1,
                    brightness: 0.1,
                });
                break;
            case FilterPreset.VIVID:
                this.setSettings({
                    saturation: 0.5,
                    contrast: 0.2,
                    brightness: 0.05,
                });
                break;
            case FilterPreset.NOIR:
                this.setSettings({
                    saturation: -1,
                    contrast: 0.6,
                    brightness: -0.1,
                    vignette: 0.5,
                });
                break;
            case FilterPreset.SUNSET:
                this.setSettings({
                    temperature: 0.7,
                    saturation: 0.3,
                    hue: 10,
                    vignette: 0.2,
                });
                break;
            case FilterPreset.MOONLIGHT:
                this.setSettings({
                    temperature: -0.6,
                    saturation: -0.4,
                    brightness: -0.2,
                    contrast: 0.2,
                    tint: -0.2,
                });
                break;
        }
        this.updateUniforms();
    }
    /**
     * 设置滤镜参数
     */
    setSettings(settings) {
        Object.assign(this.settings, settings);
        this.updateUniforms();
    }
    /**
     * 获取当前设置
     */
    getSettings() {
        return { ...this.settings };
    }
    /**
     * 获取当前预设
     */
    getCurrentPreset() {
        return this.currentPreset;
    }
    /**
     * 更新着色器uniforms
     */
    updateUniforms() {
        this.material.uniforms.brightness.value = this.settings.brightness;
        this.material.uniforms.contrast.value = this.settings.contrast;
        this.material.uniforms.saturation.value = this.settings.saturation;
        this.material.uniforms.hue.value = this.settings.hue;
        this.material.uniforms.temperature.value = this.settings.temperature;
        this.material.uniforms.tint.value = this.settings.tint;
        this.material.uniforms.vignette.value = this.settings.vignette;
        this.material.uniforms.grain.value = this.settings.grain;
        this.material.needsUpdate = true;
    }
    /**
     * 更新时间（用于动画效果，如胶片颗粒）
     */
    updateTime(time) {
        this.material.uniforms.time.value = time;
    }
    /**
     * 重置所有滤镜
     */
    reset() {
        this.settings = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            temperature: 0,
            tint: 0,
            vignette: 0,
            grain: 0,
        };
        this.currentPreset = FilterPreset.NONE;
        this.updateUniforms();
    }
    /**
     * 获取滤镜材质
     */
    getMaterial() {
        return this.material;
    }
    /**
     * 获取所有可用的预设
     */
    static getAvailablePresets() {
        return Object.values(FilterPreset);
    }
    /**
     * 获取预设的描述
     */
    static getPresetDescription(preset) {
        const descriptions = {
            [FilterPreset.NONE]: '无滤镜',
            [FilterPreset.GRAYSCALE]: '黑白 - 经典黑白照片效果',
            [FilterPreset.SEPIA]: '复古 - 怀旧的褐色调',
            [FilterPreset.WARM]: '暖色 - 温暖的色调',
            [FilterPreset.COOL]: '冷色 - 清爽的蓝色调',
            [FilterPreset.VINTAGE]: '老照片 - 复古胶片效果',
            [FilterPreset.HIGH_CONTRAST]: '高对比度 - 鲜明的对比',
            [FilterPreset.SOFT]: '柔和 - 柔美的效果',
            [FilterPreset.VIVID]: '鲜艳 - 色彩饱和度增强',
            [FilterPreset.NOIR]: '黑色电影 - 戏剧性的黑白',
            [FilterPreset.SUNSET]: '日落 - 温暖的黄昏色调',
            [FilterPreset.MOONLIGHT]: '月光 - 清冷的夜晚色调',
        };
        return descriptions[preset];
    }
    /**
     * 销毁滤镜
     */
    dispose() {
        this.material.dispose();
    }
}
//# sourceMappingURL=Filters.js.map