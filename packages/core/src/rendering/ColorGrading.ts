/**
 * 色彩分级系统
 * 提供电影级调色预设和自定义LUT支持
 */

import * as THREE from 'three'

export interface ColorGradingSettings {
  // 基础调整
  brightness: number // -1 to 1
  contrast: number // 0 to 2
  saturation: number // 0 to 2
  exposure: number // -2 to 2

  // 色调
  temperature: number // -1 to 1 (蓝色 -> 黄色)
  tint: number // -1 to 1 (绿色 -> 品红)

  // 高级
  highlights: number // -1 to 1
  shadows: number // -1 to 1
  whites: number // -1 to 1
  blacks: number // -1 to 1

  // 色相/饱和度
  hue: number // -180 to 180

  // Vignette
  vignetteAmount: number // 0 to 1
  vignetteSmoothing: number // 0 to 1
}

export type ColorGradingPreset =
  | 'natural'
  | 'vivid'
  | 'warm'
  | 'cool'
  | 'cinematic'
  | 'vintage'
  | 'dramatic'
  | 'sunset'
  | 'moonlight'
  | 'noir'

export class ColorGrading {
  private settings: ColorGradingSettings
  private lutTexture: THREE.DataTexture | null = null
  private uniforms: Record<string, THREE.IUniform>

  // 默认设置
  private static readonly defaultSettings: ColorGradingSettings = {
    brightness: 0,
    contrast: 1,
    saturation: 1,
    exposure: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    hue: 0,
    vignetteAmount: 0,
    vignetteSmoothing: 0.5,
  }

  constructor(settings?: Partial<ColorGradingSettings>) {
    this.settings = { ...ColorGrading.defaultSettings, ...settings }
    this.uniforms = this.createUniforms()
  }

  /**
   * 创建 uniforms
   */
  private createUniforms(): Record<string, THREE.IUniform> {
    return {
      brightness: { value: this.settings.brightness },
      contrast: { value: this.settings.contrast },
      saturation: { value: this.settings.saturation },
      exposure: { value: this.settings.exposure },
      temperature: { value: this.settings.temperature },
      tint: { value: this.settings.tint },
      highlights: { value: this.settings.highlights },
      shadows: { value: this.settings.shadows },
      whites: { value: this.settings.whites },
      blacks: { value: this.settings.blacks },
      hue: { value: this.settings.hue },
      vignetteAmount: { value: this.settings.vignetteAmount },
      vignetteSmoothing: { value: this.settings.vignetteSmoothing },
      lutTexture: { value: this.lutTexture },
    }
  }

  /**
   * 获取 shader 代码
   */
  public getShaderCode(): string {
    return `
      uniform float brightness;
      uniform float contrast;
      uniform float saturation;
      uniform float exposure;
      uniform float temperature;
      uniform float tint;
      uniform float highlights;
      uniform float shadows;
      uniform float whites;
      uniform float blacks;
      uniform float hue;
      uniform float vignetteAmount;
      uniform float vignetteSmoothing;
      uniform sampler2D lutTexture;

      // RGB to HSV
      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      // HSV to RGB
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // 应用色彩分级
      vec3 applyColorGrading(vec3 color, vec2 uv) {
        // 曝光
        color *= pow(2.0, exposure);
        
        // 亮度
        color += brightness;
        
        // 对比度
        color = (color - 0.5) * contrast + 0.5;
        
        // 色温
        color.r += temperature * 0.1;
        color.b -= temperature * 0.1;
        
        // 色调
        color.g += tint * 0.1;
        
        // 高光和阴影
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        float highlightMask = smoothstep(0.5, 1.0, luminance);
        float shadowMask = smoothstep(0.5, 0.0, luminance);
        
        color += highlightMask * highlights * 0.2;
        color += shadowMask * shadows * 0.2;
        
        // 白色和黑色
        color = mix(color, vec3(1.0), whites * highlightMask * 0.3);
        color = mix(color, vec3(0.0), -blacks * shadowMask * 0.3);
        
        // HSV 调整
        vec3 hsv = rgb2hsv(color);
        
        // 色相
        hsv.x = fract(hsv.x + hue / 360.0);
        
        // 饱和度
        hsv.y *= saturation;
        
        color = hsv2rgb(hsv);
        
        // 晕影
        if (vignetteAmount > 0.0) {
          vec2 center = uv - 0.5;
          float dist = length(center);
          float vignette = smoothstep(0.8, 0.8 - vignetteSmoothing, dist);
          color = mix(color, color * vignette, vignetteAmount);
        }
        
        // LUT (如果有)
        // TODO: 实现 3D LUT 查找
        
        return clamp(color, 0.0, 1.0);
      }
    `
  }

  /**
   * 应用预设
   */
  public applyPreset(preset: ColorGradingPreset): void {
    const presets: Record<ColorGradingPreset, Partial<ColorGradingSettings>> = {
      natural: {
        brightness: 0,
        contrast: 1,
        saturation: 1,
        exposure: 0,
      },
      vivid: {
        brightness: 0.05,
        contrast: 1.2,
        saturation: 1.3,
        exposure: 0.1,
      },
      warm: {
        brightness: 0.1,
        contrast: 1.1,
        saturation: 1.1,
        temperature: 0.3,
        tint: 0.05,
      },
      cool: {
        brightness: -0.05,
        contrast: 1.05,
        saturation: 0.95,
        temperature: -0.3,
        tint: -0.05,
      },
      cinematic: {
        brightness: -0.1,
        contrast: 1.3,
        saturation: 0.9,
        highlights: -0.2,
        shadows: 0.1,
        vignetteAmount: 0.3,
      },
      vintage: {
        brightness: 0.05,
        contrast: 0.9,
        saturation: 0.7,
        temperature: 0.2,
        vignetteAmount: 0.5,
        hue: 10,
      },
      dramatic: {
        brightness: -0.15,
        contrast: 1.5,
        saturation: 1.2,
        highlights: -0.3,
        shadows: 0.2,
        vignetteAmount: 0.4,
      },
      sunset: {
        brightness: 0.1,
        contrast: 1.2,
        saturation: 1.3,
        temperature: 0.5,
        tint: 0.1,
        highlights: 0.2,
      },
      moonlight: {
        brightness: -0.2,
        contrast: 1.1,
        saturation: 0.6,
        temperature: -0.4,
        tint: -0.2,
      },
      noir: {
        brightness: -0.3,
        contrast: 1.8,
        saturation: 0,
        highlights: -0.4,
        shadows: 0.3,
        vignetteAmount: 0.6,
      },
    }

    const presetSettings = presets[preset]
    this.updateSettings(presetSettings)
  }

  /**
   * 更新设置
   */
  public updateSettings(settings: Partial<ColorGradingSettings>): void {
    Object.assign(this.settings, settings)
    this.updateUniforms()
  }

  /**
   * 更新 uniforms
   */
  private updateUniforms(): void {
    Object.keys(this.settings).forEach((key) => {
      if (this.uniforms[key]) {
        this.uniforms[key].value = this.settings[key as keyof ColorGradingSettings]
      }
    })
  }

  /**
   * 获取当前设置
   */
  public getSettings(): ColorGradingSettings {
    return { ...this.settings }
  }

  /**
   * 获取 uniforms
   */
  public getUniforms(): Record<string, THREE.IUniform> {
    return this.uniforms
  }

  /**
   * 加载 LUT 纹理
   */
  public async loadLUT(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      loader.load(
        url,
        (texture) => {
          this.lutTexture = texture as THREE.DataTexture
          this.lutTexture.minFilter = THREE.LinearFilter
          this.lutTexture.magFilter = THREE.LinearFilter
          this.lutTexture.wrapS = THREE.ClampToEdgeWrapping
          this.lutTexture.wrapT = THREE.ClampToEdgeWrapping

          this.uniforms.lutTexture.value = this.lutTexture
          resolve()
        },
        undefined,
        reject,
      )
    })
  }

  /**
   * 创建 3D LUT
   */
  public create3DLUT(size: number = 32): THREE.DataTexture {
    const data = new Uint8Array(size * size * size * 4)

    let i = 0
    for (let b = 0; b < size; b++) {
      for (let g = 0; g < size; g++) {
        for (let r = 0; r < size; r++) {
          data[i++] = Math.floor((r / (size - 1)) * 255)
          data[i++] = Math.floor((g / (size - 1)) * 255)
          data[i++] = Math.floor((b / (size - 1)) * 255)
          data[i++] = 255
        }
      }
    }

    const texture = new THREE.DataTexture(data, size * size, size, THREE.RGBAFormat)
    texture.needsUpdate = true

    return texture
  }

  /**
   * 重置为默认值
   */
  public reset(): void {
    this.settings = { ...ColorGrading.defaultSettings }
    this.updateUniforms()
  }

  /**
   * 导出设置
   */
  public exportSettings(): ColorGradingSettings {
    return { ...this.settings }
  }

  /**
   * 导入设置
   */
  public importSettings(settings: ColorGradingSettings): void {
    this.settings = { ...settings }
    this.updateUniforms()
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.lutTexture) {
      this.lutTexture.dispose()
      this.lutTexture = null
    }
  }
}
