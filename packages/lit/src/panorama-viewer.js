var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core';
/**
 * Panorama Viewer Web Component
 *
 * @element panorama-viewer
 *
 * @attr {string} image - URL or path to the panorama image
 * @attr {string} format - Image format: 'equirectangular' or 'cubemap'
 * @attr {number} fov - Field of view in degrees (default: 75)
 * @attr {number} min-fov - Minimum field of view for zoom (default: 30)
 * @attr {number} max-fov - Maximum field of view for zoom (default: 100)
 * @attr {boolean} auto-rotate - Enable auto rotation (default: false)
 * @attr {number} auto-rotate-speed - Auto rotation speed (default: 0.5)
 * @attr {boolean} gyroscope - Enable gyroscope controls on mobile (default: true)
 * @attr {boolean} keyboard-controls - Enable keyboard controls (default: true)
 * @attr {boolean} render-on-demand - Enable render on demand (default: true)
 * @attr {boolean} show-mini-map - Show mini map (default: true)
 * @attr {string} width - Container width (default: 100%)
 * @attr {string} height - Container height (default: 500px)
 *
 * @fires ready - Fired when the viewer is initialized
 * @fires error - Fired when an error occurs
 * @fires progress - Fired during image loading
 * @fires hotspotclick - Fired when a hotspot is clicked
 */
let PanoramaViewerElement = (() => {
    let _classDecorators = [customElement('panorama-viewer')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _image_decorators;
    let _image_initializers = [];
    let _image_extraInitializers = [];
    let _format_decorators;
    let _format_initializers = [];
    let _format_extraInitializers = [];
    let _fov_decorators;
    let _fov_initializers = [];
    let _fov_extraInitializers = [];
    let _minFov_decorators;
    let _minFov_initializers = [];
    let _minFov_extraInitializers = [];
    let _maxFov_decorators;
    let _maxFov_initializers = [];
    let _maxFov_extraInitializers = [];
    let _autoRotate_decorators;
    let _autoRotate_initializers = [];
    let _autoRotate_extraInitializers = [];
    let _autoRotateSpeed_decorators;
    let _autoRotateSpeed_initializers = [];
    let _autoRotateSpeed_extraInitializers = [];
    let _gyroscope_decorators;
    let _gyroscope_initializers = [];
    let _gyroscope_extraInitializers = [];
    let _keyboardControls_decorators;
    let _keyboardControls_initializers = [];
    let _keyboardControls_extraInitializers = [];
    let _renderOnDemand_decorators;
    let _renderOnDemand_initializers = [];
    let _renderOnDemand_extraInitializers = [];
    let _showMiniMap_decorators;
    let _showMiniMap_initializers = [];
    let _showMiniMap_extraInitializers = [];
    let _width_decorators;
    let _width_initializers = [];
    let _width_extraInitializers = [];
    let _height_decorators;
    let _height_initializers = [];
    let _height_extraInitializers = [];
    let _viewLimits_decorators;
    let _viewLimits_initializers = [];
    let _viewLimits_extraInitializers = [];
    var PanoramaViewerElement = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.image = __runInitializers(this, _image_initializers, '');
            this.format = (__runInitializers(this, _image_extraInitializers), __runInitializers(this, _format_initializers, 'equirectangular'));
            this.fov = (__runInitializers(this, _format_extraInitializers), __runInitializers(this, _fov_initializers, 75));
            this.minFov = (__runInitializers(this, _fov_extraInitializers), __runInitializers(this, _minFov_initializers, 30));
            this.maxFov = (__runInitializers(this, _minFov_extraInitializers), __runInitializers(this, _maxFov_initializers, 100));
            this.autoRotate = (__runInitializers(this, _maxFov_extraInitializers), __runInitializers(this, _autoRotate_initializers, false));
            this.autoRotateSpeed = (__runInitializers(this, _autoRotate_extraInitializers), __runInitializers(this, _autoRotateSpeed_initializers, 0.5));
            this.gyroscope = (__runInitializers(this, _autoRotateSpeed_extraInitializers), __runInitializers(this, _gyroscope_initializers, true));
            this.keyboardControls = (__runInitializers(this, _gyroscope_extraInitializers), __runInitializers(this, _keyboardControls_initializers, true));
            this.renderOnDemand = (__runInitializers(this, _keyboardControls_extraInitializers), __runInitializers(this, _renderOnDemand_initializers, true));
            this.showMiniMap = (__runInitializers(this, _renderOnDemand_extraInitializers), __runInitializers(this, _showMiniMap_initializers, true));
            this.width = (__runInitializers(this, _showMiniMap_extraInitializers), __runInitializers(this, _width_initializers, '100%'));
            this.height = (__runInitializers(this, _width_extraInitializers), __runInitializers(this, _height_initializers, '500px'));
            this.viewLimits = (__runInitializers(this, _height_extraInitializers), __runInitializers(this, _viewLimits_initializers, undefined));
            this.viewer = (__runInitializers(this, _viewLimits_extraInitializers), null);
            this.containerElement = null;
        }
        render() {
            return html `
      <div class="container" style="width: ${this.width}; height: ${this.height}">
      </div>
    `;
        }
        firstUpdated() {
            this.containerElement = this.shadowRoot?.querySelector('.container');
            if (this.containerElement && this.image) {
                this.initializeViewer();
            }
        }
        initializeViewer() {
            if (!this.containerElement || !this.image)
                return;
            try {
                const options = {
                    container: this.containerElement,
                    image: this.image,
                    format: this.format,
                    fov: this.fov,
                    minFov: this.minFov,
                    maxFov: this.maxFov,
                    autoRotate: this.autoRotate,
                    autoRotateSpeed: this.autoRotateSpeed,
                    gyroscope: this.gyroscope,
                    viewLimits: this.viewLimits,
                    keyboardControls: this.keyboardControls,
                    renderOnDemand: this.renderOnDemand,
                    onProgress: (progress) => {
                        this.dispatchEvent(new CustomEvent('progress', { detail: { progress } }));
                    },
                };
                this.viewer = new CoreViewer(options);
                // Setup hotspot click listener
                this.containerElement.addEventListener('hotspotclick', ((e) => {
                    this.dispatchEvent(new CustomEvent('hotspotclick', {
                        detail: { hotspot: e.detail.hotspot },
                    }));
                }));
                // Set initial minimap visibility
                if (!this.showMiniMap && this.viewer) {
                    this.viewer.hideMiniMap();
                }
                this.dispatchEvent(new CustomEvent('ready'));
            }
            catch (error) {
                this.dispatchEvent(new CustomEvent('error', {
                    detail: { error },
                }));
            }
        }
        updated(changedProperties) {
            // Handle image changes
            if (changedProperties.has('image') && this.viewer && this.image) {
                this.viewer.loadImage(this.image, true).catch((error) => {
                    this.dispatchEvent(new CustomEvent('error', {
                        detail: { error },
                    }));
                });
            }
            // Handle autoRotate changes
            if (changedProperties.has('autoRotate') && this.viewer) {
                if (this.autoRotate) {
                    this.viewer.enableAutoRotate();
                }
                else {
                    this.viewer.disableAutoRotate();
                }
            }
            // Handle viewLimits changes
            if (changedProperties.has('viewLimits') && this.viewer) {
                this.viewer.setViewLimits(this.viewLimits ?? null);
            }
            // Handle minimap visibility
            if (changedProperties.has('showMiniMap') && this.viewer) {
                if (this.showMiniMap) {
                    this.viewer.showMiniMap();
                }
                else {
                    this.viewer.hideMiniMap();
                }
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.viewer) {
                this.viewer.dispose();
                this.viewer = null;
            }
        }
        /**
         * Load a new panorama image
         */
        async loadImage(url, transition = false) {
            if (this.viewer) {
                await this.viewer.loadImage(url, transition);
            }
        }
        /**
         * Reset camera to initial position
         */
        reset() {
            if (this.viewer) {
                this.viewer.reset();
            }
        }
        /**
         * Enable auto rotation
         */
        enableAutoRotate() {
            if (this.viewer) {
                this.viewer.enableAutoRotate();
            }
        }
        /**
         * Disable auto rotation
         */
        disableAutoRotate() {
            if (this.viewer) {
                this.viewer.disableAutoRotate();
            }
        }
        /**
         * Enable gyroscope controls (mobile only)
         */
        async enableGyroscope() {
            if (this.viewer) {
                return await this.viewer.enableGyroscope();
            }
            return false;
        }
        /**
         * Disable gyroscope controls
         */
        disableGyroscope() {
            if (this.viewer) {
                this.viewer.disableGyroscope();
            }
        }
        /**
         * Get the current camera rotation
         */
        getRotation() {
            if (this.viewer) {
                return this.viewer.getRotation();
            }
            return { x: 0, y: 0, z: 0 };
        }
        /**
         * Set the camera rotation
         */
        setRotation(x, y, z) {
            if (this.viewer) {
                this.viewer.setRotation(x, y, z);
            }
        }
        /**
         * Add a hotspot marker
         */
        addHotspot(hotspot) {
            if (this.viewer) {
                this.viewer.addHotspot(hotspot);
            }
        }
        /**
         * Remove a hotspot by ID
         */
        removeHotspot(id) {
            if (this.viewer) {
                this.viewer.removeHotspot(id);
            }
        }
        /**
         * Get all hotspots
         */
        getHotspots() {
            if (this.viewer) {
                return this.viewer.getHotspots();
            }
            return [];
        }
        /**
         * Enter fullscreen mode
         */
        async enterFullscreen() {
            if (this.viewer) {
                await this.viewer.enterFullscreen();
            }
        }
        /**
         * Exit fullscreen mode
         */
        exitFullscreen() {
            if (this.viewer) {
                this.viewer.exitFullscreen();
            }
        }
        /**
         * Check if in fullscreen
         */
        isFullscreen() {
            if (this.viewer) {
                return this.viewer.isFullscreen();
            }
            return false;
        }
        /**
         * Take a screenshot
         */
        screenshot(width, height) {
            if (this.viewer) {
                return this.viewer.screenshot(width, height);
            }
            return '';
        }
        /**
         * Set view limits
         */
        setViewLimits(limits) {
            if (this.viewer) {
                this.viewer.setViewLimits(limits ?? null);
            }
        }
        /**
         * Show mini map
         */
        showMiniMapView() {
            if (this.viewer) {
                this.viewer.showMiniMap();
            }
        }
        /**
         * Hide mini map
         */
        hideMiniMapView() {
            if (this.viewer) {
                this.viewer.hideMiniMap();
            }
        }
        /**
         * Toggle mini map visibility
         */
        toggleMiniMapView() {
            if (this.viewer) {
                this.viewer.toggleMiniMap();
            }
        }
    };
    __setFunctionName(_classThis, "PanoramaViewerElement");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _image_decorators = [property({ type: String })];
        _format_decorators = [property({ type: String })];
        _fov_decorators = [property({ type: Number })];
        _minFov_decorators = [property({ type: Number, attribute: 'min-fov' })];
        _maxFov_decorators = [property({ type: Number, attribute: 'max-fov' })];
        _autoRotate_decorators = [property({ type: Boolean, attribute: 'auto-rotate' })];
        _autoRotateSpeed_decorators = [property({ type: Number, attribute: 'auto-rotate-speed' })];
        _gyroscope_decorators = [property({ type: Boolean })];
        _keyboardControls_decorators = [property({ type: Boolean, attribute: 'keyboard-controls' })];
        _renderOnDemand_decorators = [property({ type: Boolean, attribute: 'render-on-demand' })];
        _showMiniMap_decorators = [property({ type: Boolean, attribute: 'show-mini-map' })];
        _width_decorators = [property({ type: String })];
        _height_decorators = [property({ type: String })];
        _viewLimits_decorators = [property({ type: Object, attribute: false })];
        __esDecorate(null, null, _image_decorators, { kind: "field", name: "image", static: false, private: false, access: { has: obj => "image" in obj, get: obj => obj.image, set: (obj, value) => { obj.image = value; } }, metadata: _metadata }, _image_initializers, _image_extraInitializers);
        __esDecorate(null, null, _format_decorators, { kind: "field", name: "format", static: false, private: false, access: { has: obj => "format" in obj, get: obj => obj.format, set: (obj, value) => { obj.format = value; } }, metadata: _metadata }, _format_initializers, _format_extraInitializers);
        __esDecorate(null, null, _fov_decorators, { kind: "field", name: "fov", static: false, private: false, access: { has: obj => "fov" in obj, get: obj => obj.fov, set: (obj, value) => { obj.fov = value; } }, metadata: _metadata }, _fov_initializers, _fov_extraInitializers);
        __esDecorate(null, null, _minFov_decorators, { kind: "field", name: "minFov", static: false, private: false, access: { has: obj => "minFov" in obj, get: obj => obj.minFov, set: (obj, value) => { obj.minFov = value; } }, metadata: _metadata }, _minFov_initializers, _minFov_extraInitializers);
        __esDecorate(null, null, _maxFov_decorators, { kind: "field", name: "maxFov", static: false, private: false, access: { has: obj => "maxFov" in obj, get: obj => obj.maxFov, set: (obj, value) => { obj.maxFov = value; } }, metadata: _metadata }, _maxFov_initializers, _maxFov_extraInitializers);
        __esDecorate(null, null, _autoRotate_decorators, { kind: "field", name: "autoRotate", static: false, private: false, access: { has: obj => "autoRotate" in obj, get: obj => obj.autoRotate, set: (obj, value) => { obj.autoRotate = value; } }, metadata: _metadata }, _autoRotate_initializers, _autoRotate_extraInitializers);
        __esDecorate(null, null, _autoRotateSpeed_decorators, { kind: "field", name: "autoRotateSpeed", static: false, private: false, access: { has: obj => "autoRotateSpeed" in obj, get: obj => obj.autoRotateSpeed, set: (obj, value) => { obj.autoRotateSpeed = value; } }, metadata: _metadata }, _autoRotateSpeed_initializers, _autoRotateSpeed_extraInitializers);
        __esDecorate(null, null, _gyroscope_decorators, { kind: "field", name: "gyroscope", static: false, private: false, access: { has: obj => "gyroscope" in obj, get: obj => obj.gyroscope, set: (obj, value) => { obj.gyroscope = value; } }, metadata: _metadata }, _gyroscope_initializers, _gyroscope_extraInitializers);
        __esDecorate(null, null, _keyboardControls_decorators, { kind: "field", name: "keyboardControls", static: false, private: false, access: { has: obj => "keyboardControls" in obj, get: obj => obj.keyboardControls, set: (obj, value) => { obj.keyboardControls = value; } }, metadata: _metadata }, _keyboardControls_initializers, _keyboardControls_extraInitializers);
        __esDecorate(null, null, _renderOnDemand_decorators, { kind: "field", name: "renderOnDemand", static: false, private: false, access: { has: obj => "renderOnDemand" in obj, get: obj => obj.renderOnDemand, set: (obj, value) => { obj.renderOnDemand = value; } }, metadata: _metadata }, _renderOnDemand_initializers, _renderOnDemand_extraInitializers);
        __esDecorate(null, null, _showMiniMap_decorators, { kind: "field", name: "showMiniMap", static: false, private: false, access: { has: obj => "showMiniMap" in obj, get: obj => obj.showMiniMap, set: (obj, value) => { obj.showMiniMap = value; } }, metadata: _metadata }, _showMiniMap_initializers, _showMiniMap_extraInitializers);
        __esDecorate(null, null, _width_decorators, { kind: "field", name: "width", static: false, private: false, access: { has: obj => "width" in obj, get: obj => obj.width, set: (obj, value) => { obj.width = value; } }, metadata: _metadata }, _width_initializers, _width_extraInitializers);
        __esDecorate(null, null, _height_decorators, { kind: "field", name: "height", static: false, private: false, access: { has: obj => "height" in obj, get: obj => obj.height, set: (obj, value) => { obj.height = value; } }, metadata: _metadata }, _height_initializers, _height_extraInitializers);
        __esDecorate(null, null, _viewLimits_decorators, { kind: "field", name: "viewLimits", static: false, private: false, access: { has: obj => "viewLimits" in obj, get: obj => obj.viewLimits, set: (obj, value) => { obj.viewLimits = value; } }, metadata: _metadata }, _viewLimits_initializers, _viewLimits_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PanoramaViewerElement = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.styles = css `
    :host {
      display: block;
      position: relative;
    }

    .container {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PanoramaViewerElement = _classThis;
})();
export { PanoramaViewerElement };
//# sourceMappingURL=panorama-viewer.js.map