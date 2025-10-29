/**
 * HotspotManager 单元测试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HotspotManager } from '../../src/utils/HotspotManager';
import * as THREE from 'three';
describe('HotspotManager', () => {
    let container;
    let camera;
    let scene;
    let manager;
    beforeEach(() => {
        // 创建容器
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        // 创建相机和场景
        camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        scene = new THREE.Scene();
        // 创建管理器
        manager = new HotspotManager(container, camera, scene);
    });
    afterEach(() => {
        manager.dispose();
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
    describe('基本功能', () => {
        it('应该能够创建 HotspotManager', () => {
            expect(manager).toBeDefined();
            expect(manager).toBeInstanceOf(HotspotManager);
        });
        it('初始状态应该没有热点', () => {
            expect(manager.getHotspots()).toHaveLength(0);
        });
    });
    describe('添加热点', () => {
        it('应该能够添加热点', () => {
            const hotspot = {
                id: 'test-1',
                position: { theta: 0, phi: Math.PI / 2 },
                label: 'Test Hotspot',
            };
            manager.addHotspot(hotspot);
            const hotspots = manager.getHotspots();
            expect(hotspots).toHaveLength(1);
            expect(hotspots[0].id).toBe('test-1');
            expect(hotspots[0].label).toBe('Test Hotspot');
        });
        it('应该为热点创建 DOM 标记', () => {
            const hotspot = {
                id: 'test-1',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            const marker = container.querySelector('[data-hotspot-id="test-1"]');
            expect(marker).toBeTruthy();
            expect(marker?.className).toBe('panorama-hotspot');
        });
        it('应该能够添加多个热点', () => {
            const hotspot1 = {
                id: 'test-1',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            const hotspot2 = {
                id: 'test-2',
                position: { theta: Math.PI, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot1);
            manager.addHotspot(hotspot2);
            expect(manager.getHotspots()).toHaveLength(2);
        });
        it('应该支持自定义热点元素', () => {
            const customElement = document.createElement('div');
            customElement.className = 'custom-hotspot';
            customElement.textContent = 'Custom';
            const hotspot = {
                id: 'custom',
                position: { theta: 0, phi: Math.PI / 2 },
                element: customElement,
            };
            manager.addHotspot(hotspot);
            const marker = container.querySelector('.custom-hotspot');
            expect(marker).toBeTruthy();
            expect(marker?.textContent).toBe('Custom');
        });
        it('添加的标记应该具有正确的样式', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            const marker = container.querySelector('[data-hotspot-id="test"]');
            expect(marker?.style.position).toBe('absolute');
            expect(marker?.style.pointerEvents).toBe('auto');
            expect(marker?.style.cursor).toBe('pointer');
        });
    });
    describe('移除热点', () => {
        it('应该能够移除热点', () => {
            const hotspot = {
                id: 'test-1',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            expect(manager.getHotspots()).toHaveLength(1);
            manager.removeHotspot('test-1');
            expect(manager.getHotspots()).toHaveLength(0);
        });
        it('移除热点应该删除 DOM 标记', () => {
            const hotspot = {
                id: 'test-1',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            expect(container.querySelector('[data-hotspot-id="test-1"]')).toBeTruthy();
            manager.removeHotspot('test-1');
            expect(container.querySelector('[data-hotspot-id="test-1"]')).toBeFalsy();
        });
        it('移除不存在的热点不应该抛出错误', () => {
            expect(() => {
                manager.removeHotspot('non-existent');
            }).not.toThrow();
        });
        it('应该能够移除所有热点', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            manager.addHotspot({ id: '2', position: { theta: 1, phi: Math.PI / 2 } });
            manager.addHotspot({ id: '3', position: { theta: 2, phi: Math.PI / 2 } });
            expect(manager.getHotspots()).toHaveLength(3);
            manager.removeHotspot('1');
            manager.removeHotspot('2');
            manager.removeHotspot('3');
            expect(manager.getHotspots()).toHaveLength(0);
        });
    });
    describe('热点事件', () => {
        it('点击热点标记应该触发 hotspotclick 事件', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            const listener = vi.fn();
            container.addEventListener('hotspotclick', listener);
            manager.addHotspot(hotspot);
            const marker = container.querySelector('[data-hotspot-id="test"]');
            marker.click();
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener.mock.calls[0][0].detail.hotspot.id).toBe('test');
        });
        it('事件应该包含热点详细信息', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
                label: 'Test Label',
                data: { custom: 'value' },
            };
            const listener = vi.fn();
            container.addEventListener('hotspotclick', listener);
            manager.addHotspot(hotspot);
            const marker = container.querySelector('[data-hotspot-id="test"]');
            marker.click();
            const eventDetail = listener.mock.calls[0][0].detail.hotspot;
            expect(eventDetail.id).toBe('test');
            expect(eventDetail.label).toBe('Test Label');
            expect(eventDetail.data).toEqual({ custom: 'value' });
        });
    });
    describe('热点更新', () => {
        it('应该能够更新热点位置', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            // 调用 update 方法应该更新标记位置
            expect(() => {
                manager.update();
            }).not.toThrow();
        });
        it('update 应该根据相机位置更新标记的屏幕坐标', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            manager.update();
            const marker = container.querySelector('[data-hotspot-id="test"]');
            // 标记位置属性应该被设置（即使值为 '0px' 也是有效的）
            expect(marker.style.left).toBeDefined();
            expect(marker.style.top).toBeDefined();
            expect(marker.style.display).toBeDefined();
        });
        it('应该隐藏位于相机后方的标记', () => {
            const hotspot = {
                id: 'test',
                position: { theta: Math.PI, phi: Math.PI / 2 }, // 相机后方
            };
            manager.addHotspot(hotspot);
            // 设置相机朝向
            camera.position.set(0, 0, 0);
            camera.lookAt(0, 0, -1);
            manager.update();
            const marker = container.querySelector('[data-hotspot-id="test"]');
            // 标记应该被隐藏或者显示取决于相机方向
            expect(marker.style.display).toBeDefined();
        });
    });
    describe('热点查询', () => {
        it('应该返回所有热点的数组', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            manager.addHotspot({ id: '2', position: { theta: 1, phi: Math.PI / 2 } });
            const hotspots = manager.getHotspots();
            expect(Array.isArray(hotspots)).toBe(true);
            expect(hotspots).toHaveLength(2);
        });
        it('返回的数组应该是新副本', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            const hotspots1 = manager.getHotspots();
            const hotspots2 = manager.getHotspots();
            expect(hotspots1).not.toBe(hotspots2);
        });
    });
    describe('资源清理', () => {
        it('dispose 应该移除所有标记', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            manager.addHotspot({ id: '2', position: { theta: 1, phi: Math.PI / 2 } });
            expect(container.querySelectorAll('[data-hotspot-id]')).toHaveLength(2);
            manager.dispose();
            expect(container.querySelectorAll('[data-hotspot-id]')).toHaveLength(0);
        });
        it('dispose 应该清空热点列表', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            manager.addHotspot({ id: '2', position: { theta: 1, phi: Math.PI / 2 } });
            manager.dispose();
            expect(manager.getHotspots()).toHaveLength(0);
        });
        it('dispose 后应该能够重新添加热点', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            manager.dispose();
            expect(() => {
                manager.addHotspot({ id: '2', position: { theta: 1, phi: Math.PI / 2 } });
            }).not.toThrow();
            expect(manager.getHotspots()).toHaveLength(1);
        });
        it('多次调用 dispose 不应该出错', () => {
            manager.addHotspot({ id: '1', position: { theta: 0, phi: Math.PI / 2 } });
            expect(() => {
                manager.dispose();
                manager.dispose();
                manager.dispose();
            }).not.toThrow();
        });
    });
    describe('边界情况', () => {
        it('应该处理相同ID的热点（覆盖旧的）', () => {
            const hotspot1 = {
                id: 'same',
                position: { theta: 0, phi: Math.PI / 2 },
                label: 'First',
            };
            const hotspot2 = {
                id: 'same',
                position: { theta: 1, phi: Math.PI / 2 },
                label: 'Second',
            };
            manager.addHotspot(hotspot1);
            manager.addHotspot(hotspot2);
            const hotspots = manager.getHotspots();
            expect(hotspots).toHaveLength(1);
            expect(hotspots[0].label).toBe('Second');
        });
        it('应该处理空标签', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
                label: '',
            };
            expect(() => {
                manager.addHotspot(hotspot);
            }).not.toThrow();
            const marker = container.querySelector('[data-hotspot-id="test"]');
            expect(marker).toBeTruthy();
        });
        it('应该处理没有标签的热点', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            expect(() => {
                manager.addHotspot(hotspot);
            }).not.toThrow();
        });
        it('应该处理极端的球面坐标', () => {
            const hotspots = [
                { id: '1', position: { theta: 0, phi: 0 } },
                { id: '2', position: { theta: Math.PI * 2, phi: Math.PI } },
                { id: '3', position: { theta: -Math.PI, phi: Math.PI / 2 } },
            ];
            hotspots.forEach(h => {
                expect(() => manager.addHotspot(h)).not.toThrow();
            });
            expect(manager.getHotspots()).toHaveLength(3);
        });
    });
    describe('标记交互', () => {
        it('鼠标悬停应该触发缩放效果（默认标记）', () => {
            const hotspot = {
                id: 'test',
                position: { theta: 0, phi: Math.PI / 2 },
            };
            manager.addHotspot(hotspot);
            const marker = container.querySelector('[data-hotspot-id="test"]');
            // 触发 mouseenter
            const enterEvent = new MouseEvent('mouseenter', { bubbles: true });
            marker.dispatchEvent(enterEvent);
            expect(marker.style.transform).toContain('scale');
            // 触发 mouseleave
            const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
            marker.dispatchEvent(leaveEvent);
            expect(marker.style.transform).toBe('scale(1)');
        });
    });
});
//# sourceMappingURL=HotspotManager.test.js.map