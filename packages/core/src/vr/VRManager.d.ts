/**
 * VR 管理器
 * 使用 WebXR API 实现 VR 头显支持
 */
import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
export interface VROptions {
    /** 参考空间类型 */
    referenceSpaceType?: XRReferenceSpaceType;
    /** 启用地板级别追踪 */
    floorLevel?: boolean;
    /** 启用控制器 */
    controllers?: boolean;
    /** 传送控制 */
    teleport?: boolean;
}
export declare class VRManager {
    private renderer;
    private camera;
    private scene;
    private eventBus;
    private xrSession;
    private xrRefSpace;
    private controllers;
    private isInVR;
    private options;
    constructor(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene, options?: VROptions, eventBus?: EventBus);
    /**
     * 检查 VR 支持
     */
    static isVRSupported(): Promise<boolean>;
    /**
     * 初始化 VR
     */
    initialize(): Promise<void>;
    /**
     * 进入 VR 模式
     */
    enterVR(): Promise<void>;
    /**
     * 退出 VR 模式
     */
    exitVR(): Promise<void>;
    /**
     * 会话结束处理
     */
    private onSessionEnd;
    /**
     * 设置 VR 控制器
     */
    private setupControllers;
    /**
     * 控制器选择开始
     */
    private onSelectStart;
    /**
     * 控制器选择结束
     */
    private onSelectEnd;
    /**
     * 控制器连接
     */
    private onControllerConnected;
    /**
     * 控制器断开
     */
    private onControllerDisconnected;
    /**
     * 获取控制器
     */
    getController(index: number): THREE.Group | undefined;
    /**
     * 检查是否在 VR 中
     */
    isActive(): boolean;
    /**
     * 获取 XR 会话
     */
    getSession(): XRSession | null;
    /**
     * 销毁 VR 管理器
     */
    dispose(): void;
}
//# sourceMappingURL=VRManager.d.ts.map