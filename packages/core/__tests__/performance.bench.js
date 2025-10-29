import { bench, describe } from 'vitest';
import * as THREE from 'three';
import { PanoramaViewer } from '../src/PanoramaViewer';
import { ObjectPool } from '../src/utils/ObjectPool';
describe('performance Benchmarks', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
    });
    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
    describe('viewer Initialization', () => {
        bench('create viewer instance', () => {
            const viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
            });
            viewer.dispose();
        });
        bench('create viewer with high quality preset', () => {
            const viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
                qualityPreset: 'ultra',
            });
            viewer.dispose();
        });
        bench('create viewer with low quality preset', () => {
            const viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
                qualityPreset: 'low',
            });
            viewer.dispose();
        });
    });
    describe('hotspot Operations', () => {
        let viewer;
        beforeEach(() => {
            viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
            });
        });
        afterEach(() => {
            viewer.dispose();
        });
        bench('add 100 hotspots', () => {
            for (let i = 0; i < 100; i++) {
                viewer.addHotspot({
                    id: `hotspot-${i}`,
                    position: {
                        theta: Math.random() * Math.PI * 2,
                        phi: Math.random() * Math.PI,
                    },
                });
            }
        });
        bench('remove 100 hotspots', () => {
            // Add hotspots first
            for (let i = 0; i < 100; i++) {
                viewer.addHotspot({
                    id: `hotspot-${i}`,
                    position: { theta: 0, phi: 0 },
                });
            }
            // Benchmark removal
            for (let i = 0; i < 100; i++) {
                viewer.removeHotspot(`hotspot-${i}`);
            }
        });
    });
    describe('object Pool Performance', () => {
        const pool = new ObjectPool(() => new THREE.Vector3(), obj => obj.set(0, 0, 0), 100);
        bench('get from object pool', () => {
            const obj = pool.get();
            pool.release(obj);
        });
        bench('create new Vector3 without pool', () => {
            const obj = new THREE.Vector3();
            // Simulate usage
            obj.set(1, 2, 3);
        });
        bench('pool get/release cycle', () => {
            const objects = [];
            // Get 50 objects
            for (let i = 0; i < 50; i++) {
                objects.push(pool.get());
            }
            // Release them
            for (const obj of objects) {
                pool.release(obj);
            }
        });
    });
    describe('camera Operations', () => {
        let viewer;
        beforeEach(() => {
            viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
            });
        });
        afterEach(() => {
            viewer.dispose();
        });
        bench('get rotation', () => {
            viewer.getRotation();
        });
        bench('set rotation', () => {
            viewer.setRotation(Math.random() * Math.PI * 2, Math.random() * Math.PI, Math.random() * Math.PI * 2);
        });
        bench('reset camera', () => {
            viewer.reset();
        });
    });
    describe('memory Operations', () => {
        bench('viewer creation and disposal', () => {
            const viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
            });
            viewer.dispose();
        });
        bench('multiple viewers lifecycle', () => {
            const viewers = [];
            // Create 10 viewers
            for (let i = 0; i < 10; i++) {
                viewers.push(new PanoramaViewer({
                    container,
                    image: '/test.jpg',
                }));
            }
            // Dispose all
            for (const viewer of viewers) {
                viewer.dispose();
            }
        });
    });
    describe('screenshot Performance', () => {
        let viewer;
        beforeEach(() => {
            viewer = new PanoramaViewer({
                container,
                image: '/test.jpg',
            });
        });
        afterEach(() => {
            viewer.dispose();
        });
        bench('screenshot at default size', () => {
            viewer.screenshot();
        });
        bench('screenshot at 1920x1080', () => {
            viewer.screenshot(1920, 1080);
        });
        bench('screenshot at 4K', () => {
            viewer.screenshot(3840, 2160);
        });
    });
});
//# sourceMappingURL=performance.bench.js.map