import React, { forwardRef, useEffect, useImperativeHandle, useRef, } from 'react';
import { PanoramaViewer as CoreViewer, } from '@panorama-viewer/core';
export const PanoramaViewer = forwardRef((props, ref) => {
    const { image, format = 'equirectangular', fov = 75, minFov = 30, maxFov = 100, autoRotate = false, autoRotateSpeed = 0.5, gyroscope = true, width = '100%', height = '500px', className, style, viewLimits = null, keyboardControls = true, renderOnDemand = true, showMiniMap = true, onReady, onError, onProgress, onHotspotClick, } = props;
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    // Initialize viewer
    useEffect(() => {
        if (!containerRef.current)
            return;
        try {
            const options = {
                container: containerRef.current,
                image,
                format,
                fov,
                minFov,
                maxFov,
                autoRotate,
                autoRotateSpeed,
                gyroscope,
                viewLimits,
                keyboardControls,
                renderOnDemand,
                onProgress,
            };
            viewerRef.current = new CoreViewer(options);
            // Setup hotspot click listener
            const hotspotClickHandler = ((e) => {
                if (onHotspotClick) {
                    onHotspotClick(e.detail.hotspot);
                }
            });
            containerRef.current.addEventListener('hotspotclick', hotspotClickHandler);
            // Set initial minimap visibility
            if (!showMiniMap && viewerRef.current) {
                viewerRef.current.hideMiniMap();
            }
            onReady?.();
            return () => {
                if (containerRef.current) {
                    containerRef.current.removeEventListener('hotspotclick', hotspotClickHandler);
                }
                if (viewerRef.current) {
                    viewerRef.current.dispose();
                    viewerRef.current = null;
                }
            };
        }
        catch (error) {
            onError?.(error);
        }
    }, []); // Only initialize once
    // Handle image changes
    useEffect(() => {
        if (viewerRef.current) {
            viewerRef.current.loadImage(image, true).catch((error) => {
                onError?.(error);
            });
        }
    }, [image, onError]);
    // Handle autoRotate changes
    useEffect(() => {
        if (viewerRef.current) {
            if (autoRotate) {
                viewerRef.current.enableAutoRotate();
            }
            else {
                viewerRef.current.disableAutoRotate();
            }
        }
    }, [autoRotate]);
    // Handle viewLimits changes
    useEffect(() => {
        if (viewerRef.current) {
            viewerRef.current.setViewLimits(viewLimits);
        }
    }, [viewLimits]);
    // Handle minimap visibility
    useEffect(() => {
        if (viewerRef.current) {
            if (showMiniMap) {
                viewerRef.current.showMiniMap();
            }
            else {
                viewerRef.current.hideMiniMap();
            }
        }
    }, [showMiniMap]);
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        loadImage: async (url, transition = false) => {
            if (viewerRef.current) {
                await viewerRef.current.loadImage(url, transition);
            }
        },
        reset: () => {
            if (viewerRef.current) {
                viewerRef.current.reset();
            }
        },
        enableAutoRotate: () => {
            if (viewerRef.current) {
                viewerRef.current.enableAutoRotate();
            }
        },
        disableAutoRotate: () => {
            if (viewerRef.current) {
                viewerRef.current.disableAutoRotate();
            }
        },
        enableGyroscope: async () => {
            if (viewerRef.current) {
                return await viewerRef.current.enableGyroscope();
            }
            return false;
        },
        disableGyroscope: () => {
            if (viewerRef.current) {
                viewerRef.current.disableGyroscope();
            }
        },
        getRotation: () => {
            if (viewerRef.current) {
                return viewerRef.current.getRotation();
            }
            return { x: 0, y: 0, z: 0 };
        },
        setRotation: (x, y, z) => {
            if (viewerRef.current) {
                viewerRef.current.setRotation(x, y, z);
            }
        },
        addHotspot: (hotspot) => {
            if (viewerRef.current) {
                viewerRef.current.addHotspot(hotspot);
            }
        },
        removeHotspot: (id) => {
            if (viewerRef.current) {
                viewerRef.current.removeHotspot(id);
            }
        },
        getHotspots: () => {
            if (viewerRef.current) {
                return viewerRef.current.getHotspots();
            }
            return [];
        },
        enterFullscreen: async () => {
            if (viewerRef.current) {
                await viewerRef.current.enterFullscreen();
            }
        },
        exitFullscreen: () => {
            if (viewerRef.current) {
                viewerRef.current.exitFullscreen();
            }
        },
        isFullscreen: () => {
            if (viewerRef.current) {
                return viewerRef.current.isFullscreen();
            }
            return false;
        },
        screenshot: (width, height) => {
            if (viewerRef.current) {
                return viewerRef.current.screenshot(width, height);
            }
            return '';
        },
        setViewLimits: (limits) => {
            if (viewerRef.current) {
                viewerRef.current.setViewLimits(limits);
            }
        },
        showMiniMap: () => {
            if (viewerRef.current) {
                viewerRef.current.showMiniMap();
            }
        },
        hideMiniMap: () => {
            if (viewerRef.current) {
                viewerRef.current.hideMiniMap();
            }
        },
        toggleMiniMap: () => {
            if (viewerRef.current) {
                viewerRef.current.toggleMiniMap();
            }
        },
    }));
    const containerStyle = {
        position: 'relative',
        overflow: 'hidden',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
    };
    return <div ref={containerRef} className={className} style={containerStyle}/>;
});
PanoramaViewer.displayName = 'PanoramaViewer';
export default PanoramaViewer;
//# sourceMappingURL=PanoramaViewer.js.map