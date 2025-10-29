/**
 * 插件系统管理器
 * 提供插件注册、生命周期管理和 API
 */
import type { EventBus } from '../core/EventBus';
import type { PanoramaViewer } from '../PanoramaViewer';
export interface PluginContext {
    viewer: PanoramaViewer;
    eventBus: EventBus;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    container: HTMLElement;
}
export interface PluginMetadata {
    name: string;
    version: string;
    author?: string;
    description?: string;
    dependencies?: string[];
}
export interface Plugin {
    metadata: PluginMetadata;
    install: (context: PluginContext) => void | Promise<void>;
    uninstall?: () => void | Promise<void>;
    onUpdate?: (deltaTime: number) => void;
    onResize?: (width: number, height: number) => void;
}
export interface PluginOptions {
    [key: string]: any;
}
export declare class PluginManager {
    private plugins;
    private installedPlugins;
    private context;
    private eventBus;
    constructor(eventBus: EventBus);
    /**
     * 设置插件上下文
     */
    setContext(context: PluginContext): void;
    /**
     * 注册插件
     */
    register(plugin: Plugin): void;
    /**
     * 安装插件
     */
    install(nameOrPlugin: string | Plugin, _options?: PluginOptions): Promise<void>;
    /**
     * 卸载插件
     */
    uninstall(name: string): Promise<void>;
    /**
     * 更新插件（在动画循环中调用）
     */
    update(deltaTime: number): void;
    /**
     * 窗口大小变化时调用
     */
    resize(width: number, height: number): void;
    /**
     * 获取插件
     */
    get(name: string): Plugin | undefined;
    /**
     * 检查插件是否已安装
     */
    isInstalled(name: string): boolean;
    /**
     * 获取所有已注册的插件
     */
    getRegistered(): PluginMetadata[];
    /**
     * 获取所有已安装的插件
     */
    getInstalled(): PluginMetadata[];
    /**
     * 卸载所有插件
     */
    uninstallAll(): Promise<void>;
    /**
     * 销毁插件管理器
     */
    dispose(): Promise<void>;
}
/**
 * 创建插件辅助函数
 */
export declare function definePlugin(plugin: Plugin): Plugin;
//# sourceMappingURL=PluginManager.d.ts.map