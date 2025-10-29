import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core';
export const PanoramaViewer = (props) => {
    let containerRef;
    let viewer = null;
    const [, setReady] = createSignal(false);
    onMount(() => {
        if (!containerRef) {
            console.warn('[PanoramaViewer] Container ref not available');
            return;
        }
        if (!props.image) {
            console.warn('[PanoramaViewer] No image provided');
            return;
        }
        try {
            const options = {
                container: containerRef,
                image: props.image,
                fov: props.fov ?? 75,
                minFov: props.minFov ?? 30,
                maxFov: props.maxFov ?? 100,
                autoRotate: props.autoRotate ?? false,
                autoRotateSpeed: props.autoRotateSpeed ?? 0.5,
                gyroscope: props.gyroscope ?? true,
                viewLimits: props.viewLimits ?? null,
            };
            viewer = new CoreViewer(options);
            // Add hotspots
            if (props.hotspots && props.hotspots.length > 0) {
                props.hotspots.forEach(hotspot => viewer.addHotspot(hotspot));
            }
            setReady(true);
            props.onReady?.(viewer);
        }
        catch (error) {
            console.error('[PanoramaViewer] Failed to initialize:', error);
            props.onError?.(error);
        }
    });
    createEffect(() => {
        if (viewer && props.hotspots) {
            // Update hotspots when they change
            const currentHotspots = viewer.getHotspots();
            const currentIds = new Set(currentHotspots.map(h => h.id));
            const newIds = new Set(props.hotspots.map(h => h.id));
            // Remove old hotspots
            currentIds.forEach((id) => {
                if (!newIds.has(id)) {
                    viewer.removeHotspot(id);
                }
            });
            // Add new hotspots
            props.hotspots.forEach((hotspot) => {
                if (!currentIds.has(hotspot.id)) {
                    viewer.addHotspot(hotspot);
                }
            });
        }
    });
    onCleanup(() => {
        if (viewer) {
            viewer.dispose();
            viewer = null;
        }
    });
    return (<div ref={containerRef} class="panorama-viewer-container" style={{
            width: props.width ?? '100%',
            height: props.height ?? '600px',
            position: 'relative',
            overflow: 'hidden',
        }}/>);
};
export function createPanoramaViewer(container, options) {
    return new CoreViewer({ ...options, container });
}
export function usePanoramaViewer() {
    const [viewer, setViewer] = createSignal(null);
    onCleanup(() => {
        const v = viewer();
        if (v) {
            v.dispose();
        }
    });
    return { viewer, setViewer };
}
//# sourceMappingURL=PanoramaViewer.js.map