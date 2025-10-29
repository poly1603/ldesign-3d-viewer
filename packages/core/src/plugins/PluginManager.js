/**
 * 插件系统管理器
 * 提供插件注册、生命周期管理和 API
 */
import { logger } from '../core/Logger';
export class PluginManager {
    constructor(eventBus) {
        this.plugins = new Map();
        this.installedPlugins = new Set();
        this.context = null;
        this.eventBus = eventBus;
    }
    /**
     * 设置插件上下文
     */
    setContext(context) {
        this.context = context;
        logger.debug('Plugin context set');
    }
    /**
     * 注册插件
     */
    register(plugin) {
        const name = plugin.metadata.name;
        if (this.plugins.has(name)) {
            logger.warn(`Plugin "${name}" already registered`);
            return;
        }
        this.plugins.set(name, plugin);
        logger.info(`Plugin registered: ${name} v${plugin.metadata.version}`);
    }
    /**
     * 安装插件
     */
    async install(nameOrPlugin, _options) {
        const plugin = typeof nameOrPlugin === 'string'
            ? this.plugins.get(nameOrPlugin)
            : nameOrPlugin;
        if (!plugin) {
            throw new Error(`Plugin not found: ${nameOrPlugin}`);
        }
        const name = plugin.metadata.name;
        if (this.installedPlugins.has(name)) {
            logger.warn(`Plugin "${name}" already installed`);
            return;
        }
        if (!this.context) {
            throw new Error('Plugin context not set. Call setContext() first.');
        }
        // 检查依赖
        if (plugin.metadata.dependencies) {
            for (const dep of plugin.metadata.dependencies) {
                if (!this.installedPlugins.has(dep)) {
                    throw new Error(`Missing dependency: ${dep} for plugin ${name}`);
                }
            }
        }
        // 安装插件
        try {
            await plugin.install(this.context);
            this.installedPlugins.add(name);
            // 如果插件不在注册列表中，添加它
            if (!this.plugins.has(name)) {
                this.plugins.set(name, plugin);
            }
            logger.info(`Plugin installed: ${name}`);
            this.eventBus.emit('plugin:installed', { name });
        }
        catch (error) {
            logger.error(`Failed to install plugin: ${name}`, error);
            throw error;
        }
    }
    /**
     * 卸载插件
     */
    async uninstall(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            logger.warn(`Plugin not found: ${name}`);
            return;
        }
        if (!this.installedPlugins.has(name)) {
            logger.warn(`Plugin not installed: ${name}`);
            return;
        }
        // 检查是否有其他插件依赖它
        for (const [pluginName, p] of this.plugins.entries()) {
            if (this.installedPlugins.has(pluginName)
                && p.metadata.dependencies?.includes(name)) {
                throw new Error(`Cannot uninstall ${name}: required by ${pluginName}`);
            }
        }
        try {
            if (plugin.uninstall) {
                await plugin.uninstall();
            }
            this.installedPlugins.delete(name);
            logger.info(`Plugin uninstalled: ${name}`);
            this.eventBus.emit('plugin:uninstalled', { name });
        }
        catch (error) {
            logger.error(`Failed to uninstall plugin: ${name}`, error);
            throw error;
        }
    }
    /**
     * 更新插件（在动画循环中调用）
     */
    update(deltaTime) {
        this.plugins.forEach((plugin, name) => {
            if (this.installedPlugins.has(name) && plugin.onUpdate) {
                try {
                    plugin.onUpdate(deltaTime);
                }
                catch (error) {
                    logger.error(`Error updating plugin ${name}`, error);
                }
            }
        });
    }
    /**
     * 窗口大小变化时调用
     */
    resize(width, height) {
        this.plugins.forEach((plugin, name) => {
            if (this.installedPlugins.has(name) && plugin.onResize) {
                try {
                    plugin.onResize(width, height);
                }
                catch (error) {
                    logger.error(`Error resizing plugin ${name}`, error);
                }
            }
        });
    }
    /**
     * 获取插件
     */
    get(name) {
        return this.plugins.get(name);
    }
    /**
     * 检查插件是否已安装
     */
    isInstalled(name) {
        return this.installedPlugins.has(name);
    }
    /**
     * 获取所有已注册的插件
     */
    getRegistered() {
        return Array.from(this.plugins.values()).map(p => p.metadata);
    }
    /**
     * 获取所有已安装的插件
     */
    getInstalled() {
        return Array.from(this.plugins.values())
            .filter(p => this.installedPlugins.has(p.metadata.name))
            .map(p => p.metadata);
    }
    /**
     * 卸载所有插件
     */
    async uninstallAll() {
        const names = Array.from(this.installedPlugins);
        // 按依赖关系反向卸载
        for (let i = names.length - 1; i >= 0; i--) {
            await this.uninstall(names[i]);
        }
    }
    /**
     * 销毁插件管理器
     */
    async dispose() {
        await this.uninstallAll();
        this.plugins.clear();
        this.context = null;
        logger.debug('PluginManager disposed');
    }
}
/**
 * 创建插件辅助函数
 */
export function definePlugin(plugin) {
    return plugin;
}
//# sourceMappingURL=PluginManager.js.map