import * as THREE from 'three';
import { TouchControls } from './controls/TouchControls';
import { GyroscopeControls } from './controls/GyroscopeControls';
import { KeyboardControls } from './controls/KeyboardControls';
import { AdvancedGestureControls } from './controls/AdvancedGestureControls';
import { HotspotManager } from './utils/HotspotManager';
import { TextureCache } from './utils/TextureCache';
import { MiniMap } from './components/MiniMap';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { AdaptiveQuality } from './utils/AdaptiveQuality';
import { ImagePreloader } from './utils/ImagePreloader';
import { ColorAdjustment } from './utils/ColorAdjustment';
import { WatermarkSystem } from './utils/WatermarkSystem';
import { CameraPathAnimation } from './utils/CameraPathAnimation';
import { WebWorkerTextureLoader } from './utils/WebWorkerTextureLoader';
import { EulerPool } from './utils/ObjectPool';
import { TextureOptimizer } from './utils/TextureOptimizer';
import { checkWebGLSupport } from './utils/checkWebGLSupport';
import { logger } from './core/Logger';
export class PanoramaViewer {
    constructor(options) {
        this.sphere = null;
        this.texture = null;
        this.keyboardControls = null;
        this.advancedGestureControls = null;
        this.miniMap = null;
        this.performanceMonitor = null;
        this.adaptiveQuality = null;
        this.imagePreloader = null;
        this.colorAdjustment = null;
        this.watermarkSystem = null;
        this.cameraPathAnimation = null;
        this.webWorkerLoader = null;
        this.textureOptimizer = null;
        this.performanceOverlay = null;
        this.animationFrameId = null;
        this.isDisposed = false;
        this.needsRender = true;
        this.viewLimits = null;
        // Mouse control state
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.autoRotateAngle = 0;
        // Transition state
        this.isTransitioning = false;
        this.transitionOpacity = 1;
        // Check WebGL support
        if (!checkWebGLSupport()) {
            throw new Error('WebGL is not supported in this browser');
        }
        // Merge options with defaults
        this.options = {
            container: options.container,
            image: options.image,
            format: options.format ?? 'equirectangular',
            fov: options.fov ?? 75,
            minFov: options.minFov ?? 30,
            maxFov: options.maxFov ?? 100,
            autoRotate: options.autoRotate ?? false,
            autoRotateSpeed: options.autoRotateSpeed ?? 0.5,
            gyroscope: options.gyroscope ?? true,
            enableDamping: options.enableDamping ?? true,
            dampingFactor: options.dampingFactor ?? 0.05,
            viewLimits: options.viewLimits ?? null,
            keyboardControls: options.keyboardControls ?? true,
            onProgress: options.onProgress ?? (() => { }),
            renderOnDemand: options.renderOnDemand ?? true,
            maxTextureSize: options.maxTextureSize ?? 4096,
            enablePerformanceMonitor: options.enablePerformanceMonitor ?? false,
            showPerformanceStats: options.showPerformanceStats ?? false,
            enableAdaptiveQuality: options.enableAdaptiveQuality ?? false,
            qualityPreset: options.qualityPreset ?? 'high',
            useWebWorker: options.useWebWorker ?? true,
            advancedGestures: options.advancedGestures ?? false,
            useGPUInstancing: options.useGPUInstancing ?? true,
            preloadImages: options.preloadImages ?? [],
        };
        this.container = this.options.container;
        this.viewLimits = this.options.viewLimits ?? null;
        // Initialize Three.js components
        this.scene = new THREE.Scene();
        // Create camera
        this.camera = new THREE.PerspectiveCamera(this.options.fov, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 0.1);
        // Create renderer with optimizations
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
        this.container.appendChild(this.renderer.domElement);
        // Initialize texture cache
        this.textureCache = TextureCache.getInstance();
        // Initialize controls
        this.touchControls = new TouchControls(this.camera, this.renderer.domElement);
        this.gyroscopeControls = new GyroscopeControls(this.camera);
        if (this.options.keyboardControls) {
            this.keyboardControls = new KeyboardControls(this.camera);
        }
        // Initialize hotspot manager
        this.hotspotManager = new HotspotManager(this.container, this.camera, this.scene);
        // Initialize mini map
        this.miniMap = new MiniMap(this.container, this.camera);
        // Initialize performance monitor
        if (this.options.enablePerformanceMonitor) {
            this.performanceMonitor = new PerformanceMonitor({
                fpsThreshold: 30,
                onWarning: warning => console.warn('[Performance]', warning.message),
            });
        }
        // Initialize adaptive quality
        if (this.options.enableAdaptiveQuality && this.performanceMonitor) {
            this.adaptiveQuality = new AdaptiveQuality(this.performanceMonitor, this.options.qualityPreset, (settings) => {
                // Apply quality settings
                this.renderer.setPixelRatio(Math.min(settings.pixelRatio, window.devicePixelRatio));
                this.requestRender();
            });
        }
        // Initialize image preloader
        if (this.options.useWebWorker) {
            this.imagePreloader = new ImagePreloader(5);
            if (this.options.preloadImages && this.options.preloadImages.length > 0) {
                this.imagePreloader.preloadMultiple(this.options.preloadImages);
            }
        }
        // Initialize color adjustment
        this.colorAdjustment = new ColorAdjustment();
        // Initialize watermark system
        this.watermarkSystem = new WatermarkSystem(this.container);
        // Initialize camera path animation
        this.cameraPathAnimation = new CameraPathAnimation(this.camera);
        // Initialize WebWorker loader
        if (this.options.useWebWorker) {
            this.webWorkerLoader = new WebWorkerTextureLoader();
        }
        // Initialize texture optimizer
        this.textureOptimizer = new TextureOptimizer({
            maxTextureSize: this.options.maxTextureSize,
            autoDowngrade: true,
            enableMipmaps: true,
        });
        // Initialize advanced gestures
        if (this.options.advancedGestures) {
            this.advancedGestureControls = new AdvancedGestureControls(this.renderer.domElement, (gesture) => {
                // Handle gestures
                if (gesture.type === 'doubletap') {
                    this.reset();
                }
                else if (gesture.type === 'longpress') {
                    this.togglePerformanceOverlay();
                }
            });
        }
        // Setup event listeners
        this.setupEventListeners();
        // Load initial image
        this.loadImage(this.options.image);
        // Start render loop
        if (!this.options.renderOnDemand) {
            this.animate();
        }
        else {
            this.animateOnDemand();
        }
        // Enable gyroscope on mobile if requested
        if (this.options.gyroscope && this.isMobileDevice()) {
            this.enableGyroscope();
        }
    }
    setupEventListeners() {
        // Mouse controls
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this));
        // Prevent context menu
        this.renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        // Fullscreen change
        document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    }
    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY,
        };
        this.requestRender();
    }
    onMouseMove(event) {
        if (!this.isDragging)
            return;
        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;
        this.rotateCamera(deltaX * 0.002, deltaY * 0.002);
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY,
        };
        this.requestRender();
    }
    onMouseUp() {
        this.isDragging = false;
    }
    onWheel(event) {
        event.preventDefault();
        const delta = event.deltaY * 0.05;
        this.camera.fov = Math.max(this.options.minFov, Math.min(this.options.maxFov, this.camera.fov + delta));
        this.camera.updateProjectionMatrix();
        this.requestRender();
    }
    rotateCamera(deltaX, deltaY) {
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(this.camera.quaternion);
        euler.y -= deltaX;
        euler.x -= deltaY;
        // Apply view limits
        if (this.viewLimits) {
            if (this.viewLimits.minPhi !== undefined || this.viewLimits.maxPhi !== undefined) {
                euler.x = Math.max(this.viewLimits.minPhi ?? -Math.PI / 2, Math.min(this.viewLimits.maxPhi ?? Math.PI / 2, euler.x));
            }
            else {
                euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
            }
            if (this.viewLimits.minTheta !== undefined || this.viewLimits.maxTheta !== undefined) {
                euler.y = Math.max(this.viewLimits.minTheta ?? -Infinity, Math.min(this.viewLimits.maxTheta ?? Infinity, euler.y));
            }
        }
        else {
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
        }
        this.camera.quaternion.setFromEuler(euler);
    }
    onWindowResize() {
        if (this.isDisposed)
            return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.requestRender();
    }
    onFullscreenChange() {
        this.onWindowResize();
    }
    async loadImage(url, transition = false) {
        if (transition && !this.isTransitioning) {
            await this.loadWithTransition(url);
        }
        else {
            await this.loadDirect(url);
        }
    }
    async loadDirect(url) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let newTexture;
                    if (typeof url === 'string') {
                        // Equirectangular format
                        newTexture = await this.textureCache.load(url, this.options.onProgress);
                        newTexture.colorSpace = THREE.SRGBColorSpace;
                    }
                    else {
                        // Cubemap format
                        newTexture = await this.loadCubemap(url);
                    }
                    // Dispose old texture
                    if (this.texture && !this.textureCache.has(this.texture.image?.src)) {
                        this.texture.dispose();
                    }
                    this.texture = newTexture;
                    // Create or update sphere/box
                    this.updateGeometry();
                    this.requestRender();
                    resolve();
                }
                catch (error) {
                    reject(new Error(`Failed to load image: ${error}`));
                }
            })();
        });
    }
    async loadWithTransition(url) {
        this.isTransitioning = true;
        // Fade out
        await this.fadeTransition(1, 0, 300);
        // Load new image
        await this.loadDirect(url);
        // Fade in
        await this.fadeTransition(0, 1, 300);
        this.isTransitioning = false;
    }
    async fadeTransition(from, to, duration) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                this.transitionOpacity = from + (to - from) * progress;
                if (this.sphere) {
                    this.sphere.material.opacity = this.transitionOpacity;
                    this.sphere.material.transparent = true;
                }
                this.requestRender();
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    resolve();
                }
            };
            animate();
        });
    }
    async loadCubemap(images) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.CubeTextureLoader();
            loader.load([images.px, images.nx, images.py, images.ny, images.pz, images.nz], (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                resolve(texture);
            }, undefined, error => reject(error));
        });
    }
    updateGeometry() {
        // Remove old geometry
        if (this.sphere) {
            this.sphere.geometry.dispose();
            this.sphere.material.dispose();
            this.scene.remove(this.sphere);
        }
        if (this.options.format === 'cubemap') {
            // Use box geometry for cubemap
            const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
            const material = new THREE.MeshBasicMaterial({
                map: this.texture,
                side: THREE.BackSide,
            });
            this.sphere = new THREE.Mesh(geometry, material);
        }
        else {
            // Use sphere geometry for equirectangular
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1); // Invert to see inside
            const material = new THREE.MeshBasicMaterial({ map: this.texture });
            this.sphere = new THREE.Mesh(geometry, material);
        }
        this.scene.add(this.sphere);
    }
    enableAutoRotate() {
        this.options.autoRotate = true;
        this.requestRender();
    }
    disableAutoRotate() {
        this.options.autoRotate = false;
    }
    reset() {
        this.camera.position.set(0, 0, 0.1);
        this.camera.rotation.set(0, 0, 0);
        this.camera.fov = this.options.fov;
        this.camera.updateProjectionMatrix();
        this.autoRotateAngle = 0;
        this.requestRender();
    }
    async enableGyroscope() {
        return await this.gyroscopeControls.enable();
    }
    disableGyroscope() {
        this.gyroscopeControls.disable();
    }
    getRotation() {
        return {
            x: this.camera.rotation.x,
            y: this.camera.rotation.y,
            z: this.camera.rotation.z,
        };
    }
    setRotation(x, y, z) {
        this.camera.rotation.set(x, y, z);
        this.requestRender();
    }
    addHotspot(hotspot) {
        this.hotspotManager.addHotspot(hotspot);
        this.requestRender();
    }
    removeHotspot(id) {
        this.hotspotManager.removeHotspot(id);
    }
    getHotspots() {
        return this.hotspotManager.getHotspots();
    }
    async enterFullscreen() {
        if (this.container.requestFullscreen) {
            await this.container.requestFullscreen();
        }
    }
    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
    isFullscreen() {
        return document.fullscreenElement === this.container;
    }
    screenshot(width, height) {
        const w = width || this.renderer.domElement.width;
        const h = height || this.renderer.domElement.height;
        // Render at specified size
        const originalSize = this.renderer.getSize(new THREE.Vector2());
        this.renderer.setSize(w, h);
        this.renderer.render(this.scene, this.camera);
        // Get image data
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        // Restore original size
        this.renderer.setSize(originalSize.x, originalSize.y);
        return dataURL;
    }
    setViewLimits(limits) {
        this.viewLimits = limits;
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    showMiniMap() {
        if (this.miniMap) {
            this.miniMap.show();
        }
    }
    hideMiniMap() {
        if (this.miniMap) {
            this.miniMap.hide();
        }
    }
    toggleMiniMap() {
        if (this.miniMap) {
            this.miniMap.toggle();
        }
    }
    requestRender() {
        this.needsRender = true;
    }
    animate() {
        if (this.isDisposed)
            return;
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        this.updateControls();
        this.renderer.render(this.scene, this.camera);
    }
    animateOnDemand() {
        if (this.isDisposed)
            return;
        this.animationFrameId = requestAnimationFrame(this.animateOnDemand.bind(this));
        this.updateControls();
        if (this.needsRender) {
            this.renderer.render(this.scene, this.camera);
            this.needsRender = false;
        }
    }
    updateControls() {
        // Update performance monitor
        if (this.performanceMonitor) {
            this.performanceMonitor.update();
        }
        // Update adaptive quality
        if (this.adaptiveQuality) {
            this.adaptiveQuality.update();
        }
        // Auto rotation
        if (this.options.autoRotate && !this.isDragging && !this.gyroscopeControls.isEnabled()) {
            this.autoRotateAngle += this.options.autoRotateSpeed * 0.001;
            const euler = EulerPool.getInstance().acquire();
            euler.setFromQuaternion(this.camera.quaternion);
            euler.y = this.autoRotateAngle;
            this.camera.quaternion.setFromEuler(euler);
            EulerPool.getInstance().release(euler);
            this.requestRender();
        }
        // Update touch controls (for inertia)
        this.touchControls.update();
        // Update keyboard controls
        if (this.keyboardControls) {
            this.keyboardControls.update();
        }
        // Update hotspot positions
        this.hotspotManager.update();
        // Update mini map
        if (this.miniMap) {
            this.miniMap.update();
        }
    }
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    // ==================== New Advanced APIs ====================
    /**
     * Preload images for faster switching
     */
    async preloadImages(urls) {
        if (this.imagePreloader) {
            await this.imagePreloader.preloadMultiple(urls);
        }
    }
    /**
     * Animate camera along path
     */
    animateCameraPath(path) {
        if (this.cameraPathAnimation) {
            this.cameraPathAnimation.setPath(path);
            this.cameraPathAnimation.play(() => logger.debug('[Camera] Path animation complete'), _progress => this.requestRender());
        }
    }
    /**
     * Set brightness (-1 to 1)
     */
    setBrightness(value) {
        if (this.colorAdjustment) {
            this.colorAdjustment.setBrightness(value);
            if (this.sphere) {
                this.colorAdjustment.applyToMaterial(this.sphere.material);
            }
            this.requestRender();
        }
    }
    /**
     * Set contrast (-1 to 1)
     */
    setContrast(value) {
        if (this.colorAdjustment) {
            this.colorAdjustment.setContrast(value);
            if (this.sphere) {
                this.colorAdjustment.applyToMaterial(this.sphere.material);
            }
            this.requestRender();
        }
    }
    /**
     * Set saturation (-1 to 1)
     */
    setSaturation(value) {
        if (this.colorAdjustment) {
            this.colorAdjustment.setSaturation(value);
            if (this.sphere) {
                this.colorAdjustment.applyToMaterial(this.sphere.material);
            }
            this.requestRender();
        }
    }
    /**
     * Set exposure (-2 to 2)
     */
    setExposure(value) {
        if (this.colorAdjustment) {
            this.colorAdjustment.setExposure(value);
            if (this.sphere) {
                this.colorAdjustment.applyToMaterial(this.sphere.material);
            }
            this.requestRender();
        }
    }
    /**
     * Reset color adjustments
     */
    resetColorAdjustments() {
        if (this.colorAdjustment) {
            this.colorAdjustment.reset();
            if (this.sphere) {
                this.colorAdjustment.applyToMaterial(this.sphere.material);
            }
            this.requestRender();
        }
    }
    /**
     * Show watermark
     */
    showWatermark(options) {
        if (this.watermarkSystem) {
            if (options) {
                this.watermarkSystem.updateOptions(options);
            }
            this.watermarkSystem.show();
        }
    }
    /**
     * Hide watermark
     */
    hideWatermark() {
        if (this.watermarkSystem) {
            this.watermarkSystem.hide();
        }
    }
    /**
     * Get performance stats
     */
    getPerformanceStats() {
        if (this.performanceMonitor) {
            return this.performanceMonitor.getStats();
        }
        return null;
    }
    /**
     * Toggle performance overlay
     */
    togglePerformanceOverlay() {
        if (!this.performanceMonitor) {
            console.warn('Performance monitor not enabled');
            return;
        }
        if (this.performanceOverlay) {
            if (this.container.contains(this.performanceOverlay)) {
                this.container.removeChild(this.performanceOverlay);
            }
            this.performanceOverlay = null;
        }
        else {
            this.performanceOverlay = this.performanceMonitor.createOverlay(this.container);
        }
    }
    /**
     * Set quality preset
     */
    setQualityPreset(preset) {
        if (this.adaptiveQuality) {
            this.adaptiveQuality.setPreset(preset);
        }
        else {
            console.warn('Adaptive quality not enabled');
        }
    }
    dispose() {
        this.isDisposed = true;
        // Stop animation loop
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Dispose controls
        this.touchControls.dispose();
        this.gyroscopeControls.dispose();
        if (this.keyboardControls) {
            this.keyboardControls.dispose();
        }
        if (this.advancedGestureControls) {
            this.advancedGestureControls.dispose();
        }
        // Dispose managers and systems
        this.hotspotManager.dispose();
        if (this.miniMap) {
            this.miniMap.dispose();
        }
        if (this.imagePreloader) {
            this.imagePreloader.dispose();
        }
        if (this.colorAdjustment) {
            this.colorAdjustment.dispose();
        }
        if (this.watermarkSystem) {
            this.watermarkSystem.dispose();
        }
        if (this.webWorkerLoader) {
            this.webWorkerLoader.dispose();
        }
        // Remove performance overlay
        if (this.performanceOverlay && this.container.contains(this.performanceOverlay)) {
            this.container.removeChild(this.performanceOverlay);
        }
        // Dispose Three.js objects
        if (this.sphere) {
            this.sphere.geometry.dispose();
            this.sphere.material.dispose();
        }
        if (this.texture && !this.textureCache.has(this.texture.image?.src)) {
            this.texture.dispose();
        }
        // Dispose renderer
        this.renderer.dispose();
        // Remove DOM element
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    }
}
//# sourceMappingURL=PanoramaViewer.js.map