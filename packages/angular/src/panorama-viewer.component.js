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
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PanoramaViewer } from '@panorama-viewer/core';
let PanoramaViewerComponent = (() => {
    let _classDecorators = [Component({
            selector: 'lib-panorama-viewer',
            standalone: true,
            template: `
    <div #container class="panorama-viewer-container" [style.width]="width" [style.height]="height"></div>
  `,
            styles: [`
    .panorama-viewer-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _containerRef_decorators;
    let _containerRef_initializers = [];
    let _containerRef_extraInitializers = [];
    let _image_decorators;
    let _image_initializers = [];
    let _image_extraInitializers = [];
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
    let _width_decorators;
    let _width_initializers = [];
    let _width_extraInitializers = [];
    let _height_decorators;
    let _height_initializers = [];
    let _height_extraInitializers = [];
    let _hotspots_decorators;
    let _hotspots_initializers = [];
    let _hotspots_extraInitializers = [];
    let _viewLimits_decorators;
    let _viewLimits_initializers = [];
    let _viewLimits_extraInitializers = [];
    let _viewerReady_decorators;
    let _viewerReady_initializers = [];
    let _viewerReady_extraInitializers = [];
    let _viewerError_decorators;
    let _viewerError_initializers = [];
    let _viewerError_extraInitializers = [];
    let _rotationChange_decorators;
    let _rotationChange_initializers = [];
    let _rotationChange_extraInitializers = [];
    var PanoramaViewerComponent = _classThis = class {
        constructor() {
            this.containerRef = __runInitializers(this, _containerRef_initializers, void 0);
            this.image = (__runInitializers(this, _containerRef_extraInitializers), __runInitializers(this, _image_initializers, void 0));
            this.fov = (__runInitializers(this, _image_extraInitializers), __runInitializers(this, _fov_initializers, 75));
            this.minFov = (__runInitializers(this, _fov_extraInitializers), __runInitializers(this, _minFov_initializers, 30));
            this.maxFov = (__runInitializers(this, _minFov_extraInitializers), __runInitializers(this, _maxFov_initializers, 100));
            this.autoRotate = (__runInitializers(this, _maxFov_extraInitializers), __runInitializers(this, _autoRotate_initializers, false));
            this.autoRotateSpeed = (__runInitializers(this, _autoRotate_extraInitializers), __runInitializers(this, _autoRotateSpeed_initializers, 0.5));
            this.gyroscope = (__runInitializers(this, _autoRotateSpeed_extraInitializers), __runInitializers(this, _gyroscope_initializers, true));
            this.width = (__runInitializers(this, _gyroscope_extraInitializers), __runInitializers(this, _width_initializers, '100%'));
            this.height = (__runInitializers(this, _width_extraInitializers), __runInitializers(this, _height_initializers, '600px'));
            this.hotspots = (__runInitializers(this, _height_extraInitializers), __runInitializers(this, _hotspots_initializers, []));
            this.viewLimits = (__runInitializers(this, _hotspots_extraInitializers), __runInitializers(this, _viewLimits_initializers, void 0));
            this.viewerReady = (__runInitializers(this, _viewLimits_extraInitializers), __runInitializers(this, _viewerReady_initializers, new EventEmitter()));
            this.viewerError = (__runInitializers(this, _viewerReady_extraInitializers), __runInitializers(this, _viewerError_initializers, new EventEmitter()));
            this.rotationChange = (__runInitializers(this, _viewerError_extraInitializers), __runInitializers(this, _rotationChange_initializers, new EventEmitter()));
            this.viewer = (__runInitializers(this, _rotationChange_extraInitializers), null);
        }
        ngOnInit() {
            this.initViewer();
        }
        ngOnDestroy() {
            this.destroyViewer();
        }
        async initViewer() {
            if (!this.image) {
                console.warn('[PanoramaViewerComponent] No image provided');
                return;
            }
            try {
                const options = {
                    container: this.containerRef.nativeElement,
                    image: this.image,
                    fov: this.fov,
                    minFov: this.minFov,
                    maxFov: this.maxFov,
                    autoRotate: this.autoRotate,
                    autoRotateSpeed: this.autoRotateSpeed,
                    gyroscope: this.gyroscope,
                    viewLimits: this.viewLimits,
                };
                this.viewer = new PanoramaViewer(options);
                // Add hotspots
                if (this.hotspots && this.hotspots.length > 0) {
                    this.hotspots.forEach(hotspot => this.viewer.addHotspot(hotspot));
                }
                this.viewerReady.emit(this.viewer);
            }
            catch (error) {
                console.error('[PanoramaViewerComponent] Failed to initialize viewer:', error);
                this.viewerError.emit(error);
            }
        }
        destroyViewer() {
            if (this.viewer) {
                this.viewer.dispose();
                this.viewer = null;
            }
        }
        // Public API
        async loadImage(url) {
            if (this.viewer) {
                await this.viewer.loadImage(url);
            }
        }
        reset() {
            this.viewer?.reset();
        }
        enableAutoRotate() {
            this.viewer?.enableAutoRotate();
        }
        disableAutoRotate() {
            this.viewer?.disableAutoRotate();
        }
        async enableGyroscope() {
            return this.viewer ? await this.viewer.enableGyroscope() : false;
        }
        disableGyroscope() {
            this.viewer?.disableGyroscope();
        }
        addHotspot(hotspot) {
            this.viewer?.addHotspot(hotspot);
        }
        removeHotspot(id) {
            this.viewer?.removeHotspot(id);
        }
        getRotation() {
            return this.viewer?.getRotation();
        }
        setRotation(x, y, z) {
            this.viewer?.setRotation(x, y, z);
        }
        async enterFullscreen() {
            if (this.viewer) {
                await this.viewer.enterFullscreen();
            }
        }
        exitFullscreen() {
            this.viewer?.exitFullscreen();
        }
        screenshot(width, height) {
            return this.viewer?.screenshot(width, height);
        }
        getViewer() {
            return this.viewer;
        }
    };
    __setFunctionName(_classThis, "PanoramaViewerComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _containerRef_decorators = [ViewChild('container', { static: true })];
        _image_decorators = [Input()];
        _fov_decorators = [Input()];
        _minFov_decorators = [Input()];
        _maxFov_decorators = [Input()];
        _autoRotate_decorators = [Input()];
        _autoRotateSpeed_decorators = [Input()];
        _gyroscope_decorators = [Input()];
        _width_decorators = [Input()];
        _height_decorators = [Input()];
        _hotspots_decorators = [Input()];
        _viewLimits_decorators = [Input()];
        _viewerReady_decorators = [Output()];
        _viewerError_decorators = [Output()];
        _rotationChange_decorators = [Output()];
        __esDecorate(null, null, _containerRef_decorators, { kind: "field", name: "containerRef", static: false, private: false, access: { has: obj => "containerRef" in obj, get: obj => obj.containerRef, set: (obj, value) => { obj.containerRef = value; } }, metadata: _metadata }, _containerRef_initializers, _containerRef_extraInitializers);
        __esDecorate(null, null, _image_decorators, { kind: "field", name: "image", static: false, private: false, access: { has: obj => "image" in obj, get: obj => obj.image, set: (obj, value) => { obj.image = value; } }, metadata: _metadata }, _image_initializers, _image_extraInitializers);
        __esDecorate(null, null, _fov_decorators, { kind: "field", name: "fov", static: false, private: false, access: { has: obj => "fov" in obj, get: obj => obj.fov, set: (obj, value) => { obj.fov = value; } }, metadata: _metadata }, _fov_initializers, _fov_extraInitializers);
        __esDecorate(null, null, _minFov_decorators, { kind: "field", name: "minFov", static: false, private: false, access: { has: obj => "minFov" in obj, get: obj => obj.minFov, set: (obj, value) => { obj.minFov = value; } }, metadata: _metadata }, _minFov_initializers, _minFov_extraInitializers);
        __esDecorate(null, null, _maxFov_decorators, { kind: "field", name: "maxFov", static: false, private: false, access: { has: obj => "maxFov" in obj, get: obj => obj.maxFov, set: (obj, value) => { obj.maxFov = value; } }, metadata: _metadata }, _maxFov_initializers, _maxFov_extraInitializers);
        __esDecorate(null, null, _autoRotate_decorators, { kind: "field", name: "autoRotate", static: false, private: false, access: { has: obj => "autoRotate" in obj, get: obj => obj.autoRotate, set: (obj, value) => { obj.autoRotate = value; } }, metadata: _metadata }, _autoRotate_initializers, _autoRotate_extraInitializers);
        __esDecorate(null, null, _autoRotateSpeed_decorators, { kind: "field", name: "autoRotateSpeed", static: false, private: false, access: { has: obj => "autoRotateSpeed" in obj, get: obj => obj.autoRotateSpeed, set: (obj, value) => { obj.autoRotateSpeed = value; } }, metadata: _metadata }, _autoRotateSpeed_initializers, _autoRotateSpeed_extraInitializers);
        __esDecorate(null, null, _gyroscope_decorators, { kind: "field", name: "gyroscope", static: false, private: false, access: { has: obj => "gyroscope" in obj, get: obj => obj.gyroscope, set: (obj, value) => { obj.gyroscope = value; } }, metadata: _metadata }, _gyroscope_initializers, _gyroscope_extraInitializers);
        __esDecorate(null, null, _width_decorators, { kind: "field", name: "width", static: false, private: false, access: { has: obj => "width" in obj, get: obj => obj.width, set: (obj, value) => { obj.width = value; } }, metadata: _metadata }, _width_initializers, _width_extraInitializers);
        __esDecorate(null, null, _height_decorators, { kind: "field", name: "height", static: false, private: false, access: { has: obj => "height" in obj, get: obj => obj.height, set: (obj, value) => { obj.height = value; } }, metadata: _metadata }, _height_initializers, _height_extraInitializers);
        __esDecorate(null, null, _hotspots_decorators, { kind: "field", name: "hotspots", static: false, private: false, access: { has: obj => "hotspots" in obj, get: obj => obj.hotspots, set: (obj, value) => { obj.hotspots = value; } }, metadata: _metadata }, _hotspots_initializers, _hotspots_extraInitializers);
        __esDecorate(null, null, _viewLimits_decorators, { kind: "field", name: "viewLimits", static: false, private: false, access: { has: obj => "viewLimits" in obj, get: obj => obj.viewLimits, set: (obj, value) => { obj.viewLimits = value; } }, metadata: _metadata }, _viewLimits_initializers, _viewLimits_extraInitializers);
        __esDecorate(null, null, _viewerReady_decorators, { kind: "field", name: "viewerReady", static: false, private: false, access: { has: obj => "viewerReady" in obj, get: obj => obj.viewerReady, set: (obj, value) => { obj.viewerReady = value; } }, metadata: _metadata }, _viewerReady_initializers, _viewerReady_extraInitializers);
        __esDecorate(null, null, _viewerError_decorators, { kind: "field", name: "viewerError", static: false, private: false, access: { has: obj => "viewerError" in obj, get: obj => obj.viewerError, set: (obj, value) => { obj.viewerError = value; } }, metadata: _metadata }, _viewerError_initializers, _viewerError_extraInitializers);
        __esDecorate(null, null, _rotationChange_decorators, { kind: "field", name: "rotationChange", static: false, private: false, access: { has: obj => "rotationChange" in obj, get: obj => obj.rotationChange, set: (obj, value) => { obj.rotationChange = value; } }, metadata: _metadata }, _rotationChange_initializers, _rotationChange_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PanoramaViewerComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PanoramaViewerComponent = _classThis;
})();
export { PanoramaViewerComponent };
//# sourceMappingURL=panorama-viewer.component.js.map