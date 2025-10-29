/**
 * PluginManager 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginManager, definePlugin } from '../../src/plugins/PluginManager';
import { EventBus } from '../../src/core/EventBus';
describe('PluginManager', () => {
    let manager;
    let eventBus;
    let mockContext;
    beforeEach(() => {
        eventBus = new EventBus();
        manager = new PluginManager(eventBus);
        // 创建模拟上下文
        mockContext = {
            viewer: {},
            eventBus,
            scene: {},
            camera: {},
            renderer: {},
            container: {},
        };
        manager.setContext(mockContext);
    });
    describe('基本功能', () => {
        it('应该能够创建插件管理器', () => {
            expect(manager).toBeDefined();
        });
        it('应该能够注册插件', () => {
            const plugin = {
                metadata: {
                    name: 'test-plugin',
                    version: '1.0.0',
                },
                install: vi.fn(),
            };
            manager.register(plugin);
            expect(manager.get('test-plugin')).toBe(plugin);
        });
        it('重复注册同名插件应该被忽略', () => {
            const plugin1 = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            const plugin2 = {
                metadata: { name: 'test', version: '2.0.0' },
                install: vi.fn(),
            };
            manager.register(plugin1);
            manager.register(plugin2);
            expect(manager.get('test')?.metadata.version).toBe('1.0.0');
        });
    });
    describe('插件安装', () => {
        it('应该能够安装已注册的插件', async () => {
            const installFn = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: installFn,
            };
            manager.register(plugin);
            await manager.install('test');
            expect(installFn).toHaveBeenCalledWith(mockContext);
            expect(manager.isInstalled('test')).toBe(true);
        });
        it('应该能够直接安装未注册的插件', async () => {
            const installFn = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: installFn,
            };
            await manager.install(plugin);
            expect(installFn).toHaveBeenCalled();
            expect(manager.isInstalled('test')).toBe(true);
            expect(manager.get('test')).toBe(plugin);
        });
        it('安装不存在的插件应该抛出错误', async () => {
            await expect(manager.install('non-existent')).rejects.toThrow('Plugin not found');
        });
        it('未设置context时安装应该抛出错误', async () => {
            const newManager = new PluginManager(eventBus);
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            await expect(newManager.install(plugin)).rejects.toThrow('Plugin context not set');
        });
        it('重复安装同一插件应该被忽略', async () => {
            const installFn = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: installFn,
            };
            manager.register(plugin);
            await manager.install('test');
            await manager.install('test');
            expect(installFn).toHaveBeenCalledTimes(1);
        });
        it('应该触发plugin:installed事件', async () => {
            const listener = vi.fn();
            eventBus.on('plugin:installed', listener);
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            await manager.install(plugin);
            expect(listener).toHaveBeenCalledWith({ name: 'test' });
        });
        it('插件install抛出错误应该传播', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn().mockRejectedValue(new Error('Install failed')),
            };
            await expect(manager.install(plugin)).rejects.toThrow('Install failed');
            expect(manager.isInstalled('test')).toBe(false);
        });
    });
    describe('插件依赖', () => {
        it('应该检查依赖并正确安装', async () => {
            const pluginA = {
                metadata: { name: 'plugin-a', version: '1.0.0' },
                install: vi.fn(),
            };
            const pluginB = {
                metadata: {
                    name: 'plugin-b',
                    version: '1.0.0',
                    dependencies: ['plugin-a'],
                },
                install: vi.fn(),
            };
            manager.register(pluginA);
            manager.register(pluginB);
            await manager.install('plugin-a');
            await manager.install('plugin-b');
            expect(manager.isInstalled('plugin-a')).toBe(true);
            expect(manager.isInstalled('plugin-b')).toBe(true);
        });
        it('缺少依赖时应该抛出错误', async () => {
            const plugin = {
                metadata: {
                    name: 'test',
                    version: '1.0.0',
                    dependencies: ['missing-plugin'],
                },
                install: vi.fn(),
            };
            await expect(manager.install(plugin)).rejects.toThrow('Missing dependency: missing-plugin');
        });
    });
    describe('插件卸载', () => {
        it('应该能够卸载插件', async () => {
            const uninstallFn = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                uninstall: uninstallFn,
            };
            await manager.install(plugin);
            expect(manager.isInstalled('test')).toBe(true);
            await manager.uninstall('test');
            expect(uninstallFn).toHaveBeenCalled();
            expect(manager.isInstalled('test')).toBe(false);
        });
        it('卸载不存在的插件应该不抛出错误', async () => {
            await expect(manager.uninstall('non-existent')).resolves.not.toThrow();
        });
        it('卸载未安装的插件应该不抛出错误', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            manager.register(plugin);
            await expect(manager.uninstall('test')).resolves.not.toThrow();
        });
        it('应该触发plugin:uninstalled事件', async () => {
            const listener = vi.fn();
            eventBus.on('plugin:uninstalled', listener);
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            await manager.install(plugin);
            await manager.uninstall('test');
            expect(listener).toHaveBeenCalledWith({ name: 'test' });
        });
        it('被依赖的插件不能被卸载', async () => {
            const pluginA = {
                metadata: { name: 'plugin-a', version: '1.0.0' },
                install: vi.fn(),
            };
            const pluginB = {
                metadata: {
                    name: 'plugin-b',
                    version: '1.0.0',
                    dependencies: ['plugin-a'],
                },
                install: vi.fn(),
            };
            await manager.install(pluginA);
            await manager.install(pluginB);
            await expect(manager.uninstall('plugin-a')).rejects.toThrow('Cannot uninstall plugin-a: required by plugin-b');
        });
        it('插件uninstall抛出错误应该传播', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                uninstall: vi.fn().mockRejectedValue(new Error('Uninstall failed')),
            };
            await manager.install(plugin);
            await expect(manager.uninstall('test')).rejects.toThrow('Uninstall failed');
        });
    });
    describe('生命周期钩子', () => {
        it('应该调用插件的onUpdate钩子', async () => {
            const onUpdate = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                onUpdate,
            };
            manager.register(plugin);
            await manager.install(plugin);
            manager.update(0.016);
            expect(onUpdate).toHaveBeenCalledWith(0.016);
        });
        it('应该调用插件的onResize钩子', async () => {
            const onResize = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                onResize,
            };
            manager.register(plugin);
            await manager.install(plugin);
            manager.resize(1920, 1080);
            expect(onResize).toHaveBeenCalledWith(1920, 1080);
        });
        it('未安装的插件钩子不应该被调用', () => {
            const onUpdate = vi.fn();
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                onUpdate,
            };
            manager.register(plugin);
            manager.update(0.016);
            expect(onUpdate).not.toHaveBeenCalled();
        });
        it('生命周期钩子中的错误不应该中断其他插件', async () => {
            const onUpdate1 = vi.fn(() => {
                throw new Error('Error in plugin 1');
            });
            const onUpdate2 = vi.fn();
            const plugin1 = {
                metadata: { name: 'plugin1', version: '1.0.0' },
                install: vi.fn(),
                onUpdate: onUpdate1,
            };
            const plugin2 = {
                metadata: { name: 'plugin2', version: '1.0.0' },
                install: vi.fn(),
                onUpdate: onUpdate2,
            };
            await manager.install(plugin1);
            await manager.install(plugin2);
            manager.update(0.016);
            expect(onUpdate1).toHaveBeenCalled();
            expect(onUpdate2).toHaveBeenCalled();
        });
    });
    describe('查询方法', () => {
        it('应该能够获取已注册的插件列表', () => {
            const plugin1 = {
                metadata: { name: 'plugin1', version: '1.0.0' },
                install: vi.fn(),
            };
            const plugin2 = {
                metadata: { name: 'plugin2', version: '2.0.0' },
                install: vi.fn(),
            };
            manager.register(plugin1);
            manager.register(plugin2);
            const registered = manager.getRegistered();
            expect(registered).toHaveLength(2);
            expect(registered.map(p => p.name)).toContain('plugin1');
            expect(registered.map(p => p.name)).toContain('plugin2');
        });
        it('应该能够获取已安装的插件列表', async () => {
            const plugin1 = {
                metadata: { name: 'plugin1', version: '1.0.0' },
                install: vi.fn(),
            };
            const plugin2 = {
                metadata: { name: 'plugin2', version: '2.0.0' },
                install: vi.fn(),
            };
            manager.register(plugin1);
            manager.register(plugin2);
            await manager.install('plugin1');
            const installed = manager.getInstalled();
            expect(installed).toHaveLength(1);
            expect(installed[0].name).toBe('plugin1');
        });
        it('应该能够检查插件是否已安装', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            expect(manager.isInstalled('test')).toBe(false);
            await manager.install(plugin);
            expect(manager.isInstalled('test')).toBe(true);
        });
    });
    describe('批量操作', () => {
        it('应该能够卸载所有插件', async () => {
            const plugin1 = {
                metadata: { name: 'plugin1', version: '1.0.0' },
                install: vi.fn(),
                uninstall: vi.fn(),
            };
            const plugin2 = {
                metadata: { name: 'plugin2', version: '2.0.0' },
                install: vi.fn(),
                uninstall: vi.fn(),
            };
            await manager.install(plugin1);
            await manager.install(plugin2);
            expect(manager.getInstalled()).toHaveLength(2);
            await manager.uninstallAll();
            expect(manager.getInstalled()).toHaveLength(0);
            expect(plugin1.uninstall).toHaveBeenCalled();
            expect(plugin2.uninstall).toHaveBeenCalled();
        });
        it('应该能够销毁插件管理器', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                uninstall: vi.fn(),
            };
            await manager.install(plugin);
            await manager.dispose();
            expect(manager.getInstalled()).toHaveLength(0);
            expect(manager.getRegistered()).toHaveLength(0);
        });
    });
    describe('definePlugin 辅助函数', () => {
        it('应该返回相同的插件对象', () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            const defined = definePlugin(plugin);
            expect(defined).toBe(plugin);
        });
    });
    describe('边界情况', () => {
        it('应该处理异步install函数', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }),
            };
            await manager.install(plugin);
            expect(manager.isInstalled('test')).toBe(true);
        });
        it('应该处理异步uninstall函数', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
                uninstall: vi.fn(async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }),
            };
            await manager.install(plugin);
            await manager.uninstall('test');
            expect(manager.isInstalled('test')).toBe(false);
        });
        it('应该处理没有uninstall方法的插件', async () => {
            const plugin = {
                metadata: { name: 'test', version: '1.0.0' },
                install: vi.fn(),
            };
            await manager.install(plugin);
            await expect(manager.uninstall('test')).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=PluginManager.test.js.map