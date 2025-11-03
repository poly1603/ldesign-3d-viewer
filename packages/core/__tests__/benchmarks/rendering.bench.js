/**
 * 渲染性能基准测试
 */
import { describe, bench, beforeEach } from 'vitest';
import * as THREE from 'three';
import { PanoramaViewer } from '../../src/PanoramaViewer';
describe('Rendering Performance', () => {
    let container;
    let viewer;
    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        viewer = new PanoramaViewer(container, {
            initialView: { fov: 75, pitch: 0, yaw: 0 }
        });
    });
    bench('render single frame', () => {
        viewer['renderer'].render(viewer['scene'], viewer['camera']);
    });
    bench('create texture from canvas', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const texture = new THREE.CanvasTexture(canvas);
        texture.dispose();
    });
    bench('update camera rotation', () => {
        const rotation = Math.random() * Math.PI * 2;
        viewer['camera'].rotation.y = rotation;
    });
    bench('raycast intersection test', () => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1);
        raycaster.setFromCamera(mouse, viewer['camera']);
        raycaster.intersectObjects(viewer['scene'].children, true);
    });
});
//# sourceMappingURL=rendering.bench.js.map