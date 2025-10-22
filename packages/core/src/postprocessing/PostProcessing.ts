/**
 * 后处理效果系统
 * 使用 Three.js EffectComposer 实现各种后处理效果
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { logger } from '../core/Logger';

export interface PostProcessingOptions {
  /** 启用抗锯齿 */
  antialiasing?: 'none' | 'fxaa' | 'smaa';
  /** 启用 Bloom 光晕 */
  bloom?: {
    enabled: boolean;
    strength?: number;
    radius?: number;
    threshold?: number;
  };
  /** 启用景深 */
  depthOfField?: {
    enabled: boolean;
    focus?: number;
    aperture?: number;
    maxBlur?: number;
  };
  /** 启用色彩调整 */
  colorAdjustment?: {
    enabled: boolean;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
  /** 启用晕影 */
  vignette?: {
    enabled: boolean;
    offset?: number;
    darkness?: number;
  };
}

export class PostProcessing {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private bokehPass: BokehPass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private smaaPass: SMAAPass | null = null;
  private colorAdjustmentPass: ShaderPass | null = null;
  private vignettePass: ShaderPass | null = null;
  private options: Required<PostProcessingOptions>;
  private enabled: boolean = false;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    options: PostProcessingOptions = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.options = {
      antialiasing: options.antialiasing ?? 'fxaa',
      bloom: {
        enabled: options.bloom?.enabled ?? false,
        strength: options.bloom?.strength ?? 1.5,
        radius: options.bloom?.radius ?? 0.4,
        threshold: options.bloom?.threshold ?? 0.85,
      },
      depthOfField: {
        enabled: options.depthOfField?.enabled ?? false,
        focus: options.depthOfField?.focus ?? 500,
        aperture: options.depthOfField?.aperture ?? 0.025,
        maxBlur: options.depthOfField?.maxBlur ?? 0.01,
      },
      colorAdjustment: {
        enabled: options.colorAdjustment?.enabled ?? false,
        brightness: options.colorAdjustment?.brightness ?? 0,
        contrast: options.colorAdjustment?.contrast ?? 1,
        saturation: options.colorAdjustment?.saturation ?? 1,
      },
      vignette: {
        enabled: options.vignette?.enabled ?? false,
        offset: options.vignette?.offset ?? 1.0,
        darkness: options.vignette?.darkness ?? 1.0,
      },
    };
  }

  /**
   * 初始化后处理
   */
  public initialize(): void {
    if (this.composer) {
      logger.warn('PostProcessing already initialized');
      return;
    }

    // 创建 EffectComposer
    this.composer = new EffectComposer(this.renderer);

    // 添加渲染通道
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 添加 Bloom
    if (this.options.bloom.enabled) {
      this.addBloom();
    }

    // 添加景深
    if (this.options.depthOfField.enabled) {
      this.addDepthOfField();
    }

    // 添加色彩调整
    if (this.options.colorAdjustment.enabled) {
      this.addColorAdjustment();
    }

    // 添加晕影
    if (this.options.vignette.enabled) {
      this.addVignette();
    }

    // 添加抗锯齿（最后添加）
    this.addAntialiasing();

    this.enabled = true;
    logger.info('PostProcessing initialized');
  }

  /**
   * 添加 Bloom 效果
   */
  private addBloom(): void {
    if (!this.composer) return;

    const size = this.renderer.getSize(new THREE.Vector2());
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.x, size.y),
      this.options.bloom.strength,
      this.options.bloom.radius,
      this.options.bloom.threshold
    );

    this.composer.addPass(this.bloomPass);
    logger.debug('Bloom pass added');
  }

  /**
   * 添加景深效果
   */
  private addDepthOfField(): void {
    if (!this.composer) return;

    const size = this.renderer.getSize(new THREE.Vector2());
    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: this.options.depthOfField.focus,
      aperture: this.options.depthOfField.aperture,
      maxblur: this.options.depthOfField.maxBlur,
      width: size.x,
      height: size.y,
    });

    this.composer.addPass(this.bokehPass);
    logger.debug('Depth of field pass added');
  }

  /**
   * 添加色彩调整
   */
  private addColorAdjustment(): void {
    if (!this.composer) return;

    const colorAdjustmentShader = {
      uniforms: {
        tDiffuse: { value: null },
        brightness: { value: this.options.colorAdjustment.brightness },
        contrast: { value: this.options.colorAdjustment.contrast },
        saturation: { value: this.options.colorAdjustment.saturation },
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
        varying vec2 vUv;

        vec3 adjustBrightness(vec3 color, float value) {
          return color + value;
        }

        vec3 adjustContrast(vec3 color, float value) {
          return (color - 0.5) * value + 0.5;
        }

        vec3 adjustSaturation(vec3 color, float value) {
          float gray = dot(color, vec3(0.299, 0.587, 0.114));
          return mix(vec3(gray), color, value);
        }

        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          vec3 color = texel.rgb;

          color = adjustBrightness(color, brightness);
          color = adjustContrast(color, contrast);
          color = adjustSaturation(color, saturation);

          gl_FragColor = vec4(color, texel.a);
        }
      `,
    };

    this.colorAdjustmentPass = new ShaderPass(colorAdjustmentShader);
    this.composer.addPass(this.colorAdjustmentPass);
    logger.debug('Color adjustment pass added');
  }

  /**
   * 添加晕影效果
   */
  private addVignette(): void {
    if (!this.composer) return;

    const vignetteShader = {
      uniforms: {
        tDiffuse: { value: null },
        offset: { value: this.options.vignette.offset },
        darkness: { value: this.options.vignette.darkness },
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
        uniform float offset;
        uniform float darkness;
        varying vec2 vUv;

        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
          float vignette = 1.0 - dot(uv, uv) * darkness;
          gl_FragColor = vec4(texel.rgb * vignette, texel.a);
        }
      `,
    };

    this.vignettePass = new ShaderPass(vignetteShader);
    this.composer.addPass(this.vignettePass);
    logger.debug('Vignette pass added');
  }

  /**
   * 添加抗锯齿
   */
  private addAntialiasing(): void {
    if (!this.composer || this.options.antialiasing === 'none') return;

    if (this.options.antialiasing === 'fxaa') {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.fxaaPass = new ShaderPass(FXAAShader);
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / size.x;
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / size.y;
      this.composer.addPass(this.fxaaPass);
      logger.debug('FXAA pass added');
    } else if (this.options.antialiasing === 'smaa') {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.smaaPass = new SMAAPass(size.x, size.y);
      this.composer.addPass(this.smaaPass);
      logger.debug('SMAA pass added');
    }
  }

  /**
   * 渲染
   */
  public render(deltaTime?: number): void {
    if (!this.enabled || !this.composer) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.composer.render(deltaTime);
  }

  /**
   * 启用/禁用后处理
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    logger.debug(`PostProcessing ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 是否启用
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 设置 Bloom 参数
   */
  public setBloomParams(params: {
    strength?: number;
    radius?: number;
    threshold?: number;
  }): void {
    if (!this.bloomPass) return;

    if (params.strength !== undefined) {
      this.bloomPass.strength = params.strength;
      this.options.bloom.strength = params.strength;
    }
    if (params.radius !== undefined) {
      this.bloomPass.radius = params.radius;
      this.options.bloom.radius = params.radius;
    }
    if (params.threshold !== undefined) {
      this.bloomPass.threshold = params.threshold;
      this.options.bloom.threshold = params.threshold;
    }
  }

  /**
   * 设置景深参数
   */
  public setDepthOfFieldParams(params: {
    focus?: number;
    aperture?: number;
    maxBlur?: number;
  }): void {
    if (!this.bokehPass) return;

    if (params.focus !== undefined) {
      this.bokehPass.uniforms['focus'].value = params.focus;
      this.options.depthOfField.focus = params.focus;
    }
    if (params.aperture !== undefined) {
      this.bokehPass.uniforms['aperture'].value = params.aperture;
      this.options.depthOfField.aperture = params.aperture;
    }
    if (params.maxBlur !== undefined) {
      this.bokehPass.uniforms['maxblur'].value = params.maxBlur;
      this.options.depthOfField.maxBlur = params.maxBlur;
    }
  }

  /**
   * 设置色彩调整参数
   */
  public setColorAdjustmentParams(params: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  }): void {
    if (!this.colorAdjustmentPass) return;

    if (params.brightness !== undefined) {
      this.colorAdjustmentPass.uniforms['brightness'].value = params.brightness;
      this.options.colorAdjustment.brightness = params.brightness;
    }
    if (params.contrast !== undefined) {
      this.colorAdjustmentPass.uniforms['contrast'].value = params.contrast;
      this.options.colorAdjustment.contrast = params.contrast;
    }
    if (params.saturation !== undefined) {
      this.colorAdjustmentPass.uniforms['saturation'].value = params.saturation;
      this.options.colorAdjustment.saturation = params.saturation;
    }
  }

  /**
   * 窗口大小变化时调用
   */
  public resize(width: number, height: number): void {
    if (!this.composer) return;

    this.composer.setSize(width, height);

    // 更新 FXAA 分辨率
    if (this.fxaaPass) {
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
    }

    // 更新 SMAA 分辨率
    if (this.smaaPass) {
      this.smaaPass.setSize(width, height);
    }

    logger.debug(`PostProcessing resized to ${width}x${height}`);
  }

  /**
   * 获取当前配置
   */
  public getOptions(): Readonly<Required<PostProcessingOptions>> {
    return { ...this.options };
  }

  /**
   * 销毁
   */
  public dispose(): void {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }

    this.renderPass = null;
    this.bloomPass = null;
    this.bokehPass = null;
    this.fxaaPass = null;
    this.smaaPass = null;
    this.colorAdjustmentPass = null;
    this.vignettePass = null;

    this.enabled = false;
    logger.debug('PostProcessing disposed');
  }
}

