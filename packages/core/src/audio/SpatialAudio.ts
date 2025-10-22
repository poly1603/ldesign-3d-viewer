/**
 * 空间音频系统
 * 使用 Web Audio API 实现 3D 位置音频
 */

import * as THREE from 'three';
import { logger } from '../core/Logger';

export interface AudioSourceOptions {
  /** 音频 URL */
  url: string;
  /** 音频位置（球坐标：theta, phi, radius） */
  position?: { theta: number; phi: number; radius?: number };
  /** 是否循环 */
  loop?: boolean;
  /** 音量 (0-1) */
  volume?: number;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 最大听觉距离 */
  maxDistance?: number;
  /** 参考距离（音量开始衰减的距离） */
  refDistance?: number;
  /** 衰减模型 */
  distanceModel?: DistanceModelType;
  /** 锥形参数（定向音频） */
  cone?: {
    innerAngle: number;
    outerAngle: number;
    outerGain: number;
  };
}

export interface AmbisonicsOptions {
  /** Ambisonics 音频 URL（多通道） */
  url: string;
  /** Ambisonics 阶数 (1-3) */
  order?: number;
  /** 是否循环 */
  loop?: boolean;
  /** 音量 */
  volume?: number;
}

export class SpatialAudio {
  private audioContext: AudioContext | null = null;
  private listener: AudioListener | null = null;
  private masterGain: GainNode | null = null;
  private sources: Map<string, AudioSourceNode> = new Map();
  private ambientSources: Set<AudioBuffer> = new Set();
  private camera: THREE.PerspectiveCamera;
  private isInitialized: boolean = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * 初始化音频上下文（需要用户交互触发）
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 创建监听器（对应相机位置）
      this.listener = this.audioContext.listener;

      // 创建主增益节点
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      this.isInitialized = true;
      logger.info('Spatial audio initialized');
    } catch (error) {
      logger.error('Failed to initialize spatial audio', error);
      throw error;
    }
  }

  /**
   * 添加空间音频源
   */
  public async addSource(id: string, options: AudioSourceOptions): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      throw new Error('Spatial audio not initialized');
    }

    try {
      // 加载音频
      const audioBuffer = await this.loadAudio(options.url);

      // 创建音频节点
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = options.loop ?? false;

      // 创建 panner 节点（用于3D定位）
      const panner = this.audioContext.createPanner();

      // 配置 panner
      panner.panningModel = 'HRTF'; // 使用 Head-Related Transfer Function
      panner.distanceModel = options.distanceModel ?? 'inverse';
      panner.refDistance = options.refDistance ?? 1;
      panner.maxDistance = options.maxDistance ?? 10000;
      panner.rolloffFactor = 1;

      // 配置锥形（定向音频）
      if (options.cone) {
        panner.coneInnerAngle = options.cone.innerAngle;
        panner.coneOuterAngle = options.cone.outerAngle;
        panner.coneOuterGain = options.cone.outerGain;
      }

      // 创建增益节点（控制音量）
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume ?? 1.0;

      // 连接节点：source -> gain -> panner -> master
      source.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(this.masterGain);

      // 设置位置
      if (options.position) {
        const position = this.sphericalToCartesian(
          options.position.theta,
          options.position.phi,
          options.position.radius ?? 100
        );
        panner.setPosition(position.x, position.y, position.z);
      }

      // 保存引用
      const sourceNode: AudioSourceNode = {
        source,
        panner,
        gainNode,
        isPlaying: false,
        position: options.position || { theta: 0, phi: 0, radius: 100 },
      };

      this.sources.set(id, sourceNode);

      // 自动播放
      if (options.autoplay) {
        await this.play(id);
      }

      logger.debug(`Audio source added: ${id}`);
    } catch (error) {
      logger.error(`Failed to add audio source: ${id}`, error);
      throw error;
    }
  }

  /**
   * 添加环境音效（全向，非空间化）
   */
  public async addAmbientSound(url: string, options: {
    loop?: boolean;
    volume?: number;
    autoplay?: boolean;
  } = {}): Promise<string> {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      throw new Error('Spatial audio not initialized');
    }

    const id = `ambient_${Date.now()}`;

    try {
      const audioBuffer = await this.loadAudio(url);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = options.loop ?? false;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume ?? 0.5;

      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      this.sources.set(id, {
        source,
        panner: null,
        gainNode,
        isPlaying: false,
        position: { theta: 0, phi: 0 },
      });

      if (options.autoplay) {
        await this.play(id);
      }

      this.ambientSources.add(audioBuffer);
      logger.debug(`Ambient sound added: ${id}`);

      return id;
    } catch (error) {
      logger.error('Failed to add ambient sound', error);
      throw error;
    }
  }

  /**
   * 播放音频
   */
  public async play(id: string): Promise<void> {
    const node = this.sources.get(id);
    if (!node || node.isPlaying) {
      return;
    }

    try {
      // 恢复音频上下文（如果被暂停）
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      node.source.start(0);
      node.isPlaying = true;
      logger.debug(`Audio playing: ${id}`);
    } catch (error) {
      logger.error(`Failed to play audio: ${id}`, error);
    }
  }

  /**
   * 停止音频
   */
  public stop(id: string): void {
    const node = this.sources.get(id);
    if (!node || !node.isPlaying) {
      return;
    }

    try {
      node.source.stop();
      node.isPlaying = false;
      logger.debug(`Audio stopped: ${id}`);
    } catch (error) {
      logger.error(`Failed to stop audio: ${id}`, error);
    }
  }

  /**
   * 设置音频源音量
   */
  public setVolume(id: string, volume: number): void {
    const node = this.sources.get(id);
    if (!node) {
      return;
    }

    node.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置主音量
   */
  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 更新音频源位置
   */
  public updateSourcePosition(id: string, position: { theta: number; phi: number; radius?: number }): void {
    const node = this.sources.get(id);
    if (!node || !node.panner) {
      return;
    }

    const cartesian = this.sphericalToCartesian(
      position.theta,
      position.phi,
      position.radius ?? 100
    );

    node.panner.setPosition(cartesian.x, cartesian.y, cartesian.z);
    node.position = position;
  }

  /**
   * 更新监听器位置和方向（基于相机）
   */
  public update(): void {
    if (!this.listener || !this.isInitialized) {
      return;
    }

    // 更新监听器位置
    const position = this.camera.position;
    this.listener.setPosition(position.x, position.y, position.z);

    // 更新监听器方向
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const up = this.camera.up;

    this.listener.setOrientation(
      direction.x, direction.y, direction.z,
      up.x, up.y, up.z
    );
  }

  /**
   * 移除音频源
   */
  public removeSource(id: string): void {
    const node = this.sources.get(id);
    if (!node) {
      return;
    }

    if (node.isPlaying) {
      this.stop(id);
    }

    node.source.disconnect();
    node.gainNode.disconnect();
    if (node.panner) {
      node.panner.disconnect();
    }

    this.sources.delete(id);
    logger.debug(`Audio source removed: ${id}`);
  }

  /**
   * 球坐标转笛卡尔坐标
   */
  private sphericalToCartesian(theta: number, phi: number, radius: number): THREE.Vector3 {
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  /**
   * 加载音频文件
   */
  private async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      logger.debug(`Audio loaded: ${url}`);
      return audioBuffer;
    } catch (error) {
      logger.error(`Failed to load audio: ${url}`, error);
      throw error;
    }
  }

  /**
   * 暂停所有音频
   */
  public pauseAll(): void {
    if (this.audioContext) {
      this.audioContext.suspend();
      logger.debug('All audio paused');
    }
  }

  /**
   * 恢复所有音频
   */
  public resumeAll(): void {
    if (this.audioContext) {
      this.audioContext.resume();
      logger.debug('All audio resumed');
    }
  }

  /**
   * 销毁音频系统
   */
  public dispose(): void {
    // 停止所有音频源
    this.sources.forEach((node, id) => {
      if (node.isPlaying) {
        this.stop(id);
      }
      node.source.disconnect();
      node.gainNode.disconnect();
      if (node.panner) {
        node.panner.disconnect();
      }
    });

    this.sources.clear();
    this.ambientSources.clear();

    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
    logger.info('Spatial audio disposed');
  }
}

/**
 * 音频源节点
 */
interface AudioSourceNode {
  source: AudioBufferSourceNode;
  panner: PannerNode | null;
  gainNode: GainNode;
  isPlaying: boolean;
  position: { theta: number; phi: number; radius?: number };
}

