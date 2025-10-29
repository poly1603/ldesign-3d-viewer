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
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@panorama-viewer/lit';
import { deviceCapability, powerManager, formatDetector, themeManager, } from '@panorama-viewer/core';
const images = [
    'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
    'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
];
let AppComponent = (() => {
    let _classDecorators = [customElement('app-component')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _autoRotate_decorators;
    let _autoRotate_initializers = [];
    let _autoRotate_extraInitializers = [];
    let _showMiniMap_decorators;
    let _showMiniMap_initializers = [];
    let _showMiniMap_extraInitializers = [];
    let _isFullscreen_decorators;
    let _isFullscreen_initializers = [];
    let _isFullscreen_extraInitializers = [];
    let _viewLimits_decorators;
    let _viewLimits_initializers = [];
    let _viewLimits_extraInitializers = [];
    let _loadingProgress_decorators;
    let _loadingProgress_initializers = [];
    let _loadingProgress_extraInitializers = [];
    let _hotspots_decorators;
    let _hotspots_initializers = [];
    let _hotspots_extraInitializers = [];
    let _lastHotspotClick_decorators;
    let _lastHotspotClick_initializers = [];
    let _lastHotspotClick_extraInitializers = [];
    let _currentImageIndex_decorators;
    let _currentImageIndex_initializers = [];
    let _currentImageIndex_extraInitializers = [];
    let _deviceInfo_decorators;
    let _deviceInfo_initializers = [];
    let _deviceInfo_extraInitializers = [];
    let _performanceMode_decorators;
    let _performanceMode_initializers = [];
    let _performanceMode_extraInitializers = [];
    let _supportedFormats_decorators;
    let _supportedFormats_initializers = [];
    let _supportedFormats_extraInitializers = [];
    var AppComponent = _classThis = class extends _classSuper {
        connectedCallback() {
            super.connectedCallback();
            // 初始化新功能
            this.deviceInfo = deviceCapability.generateReport();
            const support = formatDetector.getSupport();
            this.supportedFormats = `WebP: ${support.webp ? '✅' : '❌'}, AVIF: ${support.avif ? '✅' : '❌'}`;
            powerManager.startMonitoring();
            powerManager.onChange((mode) => {
                this.performanceMode = `${mode.mode} (目标${mode.targetFPS}fps)`;
            });
            themeManager.applyTheme('light');
            console.log('✨ 新功能已初始化');
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            powerManager.stopMonitoring();
        }
        get viewerElement() {
            return this.shadowRoot?.querySelector('panorama-viewer');
        }
        toggleAutoRotate() {
            this.autoRotate = !this.autoRotate;
        }
        reset() {
            this.viewerElement?.reset();
        }
        async enableGyroscope() {
            const success = await this.viewerElement?.enableGyroscope();
            if (success) {
                alert('✅ Gyroscope enabled!');
            }
            else {
                alert('❌ Gyroscope not available or permission denied');
            }
        }
        async toggleFullscreen() {
            if (this.isFullscreen) {
                this.viewerElement?.exitFullscreen();
                this.isFullscreen = false;
            }
            else {
                await this.viewerElement?.enterFullscreen();
                this.isFullscreen = true;
            }
        }
        toggleMiniMapVisibility() {
            this.showMiniMap = !this.showMiniMap;
        }
        takeScreenshot() {
            const dataURL = this.viewerElement?.screenshot(1920, 1080);
            if (dataURL) {
                const link = document.createElement('a');
                link.download = 'panorama-screenshot.png';
                link.href = dataURL;
                link.click();
                alert('📸 Screenshot captured and downloaded!');
            }
        }
        addDemoHotspot() {
            const newHotspot = {
                id: `hotspot-${++this.hotspotCounter}`,
                position: {
                    theta: Math.random() * Math.PI * 2,
                    phi: Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5,
                },
                label: `📍 #${this.hotspotCounter}`,
                data: { name: `Point of Interest ${this.hotspotCounter}` },
            };
            this.viewerElement?.addHotspot(newHotspot);
            this.hotspots = this.viewerElement?.getHotspots() || [];
        }
        removeAllHotspots() {
            this.hotspots.forEach(h => this.viewerElement?.removeHotspot(h.id));
            this.hotspots = [];
            this.hotspotCounter = 0;
        }
        setHorizontalLimit() {
            this.viewLimits = {
                minTheta: -Math.PI / 4,
                maxTheta: Math.PI / 4,
            };
            alert('↔️ Horizontal rotation limited to ±45°');
        }
        setVerticalLimit() {
            this.viewLimits = {
                minPhi: Math.PI / 3,
                maxPhi: (2 * Math.PI) / 3,
            };
            alert('↕️ Vertical rotation limited');
        }
        clearLimits() {
            this.viewLimits = null;
            alert('🔓 All rotation limits cleared');
        }
        changeImage(index) {
            this.loadingProgress = 0;
            this.currentImageIndex = index;
        }
        handleReady() {
            console.log('✅ Viewer ready!');
        }
        handleError(event) {
            console.error('❌ Viewer error:', event.detail.error);
            alert(`Error: ${event.detail.error.message}`);
        }
        handleProgress(event) {
            this.loadingProgress = event.detail.progress;
            if (this.loadingProgress >= 100) {
                setTimeout(() => {
                    this.loadingProgress = 0;
                }, 500);
            }
        }
        handleHotspotClick(event) {
            this.lastHotspotClick = event.detail.hotspot;
            alert(`🎯 Clicked: ${event.detail.hotspot.label}\nData: ${JSON.stringify(event.detail.hotspot.data)}`);
        }
        render() {
            return html `
      <div class="app">
        <h1>Lit Panorama Viewer Demo - Enhanced</h1>
        
        <div class="controls-grid">
          <div class="control-section">
            <h3>Basic Controls</h3>
            <button @click=${this.toggleAutoRotate}>
              ${this.autoRotate ? '⏸️ Stop' : '▶️ Start'} Rotation
            </button>
            <button @click=${this.reset}>🔄 Reset View</button>
            <button @click=${this.enableGyroscope}>📱 Enable Gyroscope</button>
          </div>

          <div class="control-section">
            <h3>Advanced Features</h3>
            <button @click=${this.toggleFullscreen}>
              ${this.isFullscreen ? '⬜ Exit' : '⛶ Enter'} Fullscreen
            </button>
            <button @click=${this.toggleMiniMapVisibility}>
              ${this.showMiniMap ? '🗺️ Hide' : '🗺️ Show'} Mini Map
            </button>
            <button @click=${this.takeScreenshot}>📷 Screenshot</button>
          </div>

          <div class="control-section">
            <h3>Hotspots</h3>
            <button @click=${this.addDemoHotspot}>📍 Add Hotspot</button>
            <button @click=${this.removeAllHotspots}>🗑️ Remove All</button>
            <span class="info-text">${this.hotspots.length} hotspots</span>
          </div>

          <div class="control-section">
            <h3>View Limits</h3>
            <button @click=${this.setHorizontalLimit}>↔️ Limit Horizontal</button>
            <button @click=${this.setVerticalLimit}>↕️ Limit Vertical</button>
            <button @click=${this.clearLimits}>🔓 Clear Limits</button>
          </div>

          <div class="control-section">
            <h3>Images</h3>
            <button @click=${() => this.changeImage(0)}>🏔️ Mountain</button>
            <button @click=${() => this.changeImage(1)}>🌃 Night</button>
          </div>
        </div>

        ${this.loadingProgress > 0 && this.loadingProgress < 100 ? html `
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${this.loadingProgress}%"></div>
            </div>
            <span class="progress-text">Loading: ${Math.round(this.loadingProgress)}%</span>
          </div>
        ` : ''}

        <panorama-viewer
          image=${images[this.currentImageIndex]}
          ?auto-rotate=${this.autoRotate}
          ?show-mini-map=${this.showMiniMap}
          .viewLimits=${this.viewLimits}
          fov="75"
          width="100%"
          height="600px"
          @ready=${this.handleReady}
          @error=${this.handleError}
          @progress=${this.handleProgress}
          @hotspotclick=${this.handleHotspotClick}
        ></panorama-viewer>

        <div class="info-panel">
          <div class="info-row">
            <strong>Controls:</strong>
            <ul>
              <li><strong>Mouse:</strong> Click + drag to rotate, wheel to zoom</li>
              <li><strong>Keyboard:</strong> Arrow keys to rotate, +/- to zoom</li>
              <li><strong>Touch:</strong> Single finger to rotate, pinch to zoom</li>
              <li><strong>Mobile:</strong> Device orientation (with permission)</li>
            </ul>
          </div>
          
          ${this.lastHotspotClick ? html `
            <div class="info-row">
              <strong>Last Hotspot Clicked:</strong> ${this.lastHotspotClick.label}
            </div>
          ` : ''}

          <div class="info-row">
            <strong>New Features (v2.1):</strong>
            <ul>
              <li>✅ Keyboard controls with arrow keys</li>
              <li>✅ Mini-map with compass orientation</li>
              <li>✅ Interactive hotspots with custom markers</li>
              <li>✅ Full-screen mode support</li>
              <li>✅ Screenshot capture</li>
              <li>✅ View angle restrictions</li>
              <li>✅ Smooth image transitions</li>
              <li>✅ Loading progress indicator</li>
              <li>✅ Performance optimizations</li>
              <li>🆕 Smart device adaptation</li>
              <li>🆕 Automatic format detection (WebP/AVIF)</li>
              <li>🆕 Power management (battery aware)</li>
              <li>🆕 CDN failover</li>
              <li>🆕 Scene management</li>
              <li>🆕 Annotation system</li>
              <li>🆕 Color grading presets</li>
              <li>🆕 Particle effects</li>
            </ul>
          </div>

          <div class="info-row">
            <strong>Device Info:</strong>
            <div style="font-size: 0.85rem; white-space: pre-line; opacity: 0.8; max-height: 200px; overflow-y: auto;">
              ${this.deviceInfo}
            </div>
          </div>

          <div class="info-row">
            <strong>Performance:</strong>
            <div style="font-size: 0.85rem;">
              <div>电源模式: ${this.performanceMode || '检测中...'}</div>
              <div>支持格式: ${this.supportedFormats}</div>
            </div>
          </div>
        </div>
      </div>
    `;
        }
        constructor() {
            super(...arguments);
            this.autoRotate = __runInitializers(this, _autoRotate_initializers, false);
            this.showMiniMap = (__runInitializers(this, _autoRotate_extraInitializers), __runInitializers(this, _showMiniMap_initializers, true));
            this.isFullscreen = (__runInitializers(this, _showMiniMap_extraInitializers), __runInitializers(this, _isFullscreen_initializers, false));
            this.viewLimits = (__runInitializers(this, _isFullscreen_extraInitializers), __runInitializers(this, _viewLimits_initializers, null));
            this.loadingProgress = (__runInitializers(this, _viewLimits_extraInitializers), __runInitializers(this, _loadingProgress_initializers, 0));
            this.hotspots = (__runInitializers(this, _loadingProgress_extraInitializers), __runInitializers(this, _hotspots_initializers, []));
            this.lastHotspotClick = (__runInitializers(this, _hotspots_extraInitializers), __runInitializers(this, _lastHotspotClick_initializers, null));
            this.currentImageIndex = (__runInitializers(this, _lastHotspotClick_extraInitializers), __runInitializers(this, _currentImageIndex_initializers, 0));
            this.hotspotCounter = (__runInitializers(this, _currentImageIndex_extraInitializers), 0);
            this.deviceInfo = __runInitializers(this, _deviceInfo_initializers, '');
            this.performanceMode = (__runInitializers(this, _deviceInfo_extraInitializers), __runInitializers(this, _performanceMode_initializers, ''));
            this.supportedFormats = (__runInitializers(this, _performanceMode_extraInitializers), __runInitializers(this, _supportedFormats_initializers, ''));
            __runInitializers(this, _supportedFormats_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "AppComponent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _autoRotate_decorators = [state()];
        _showMiniMap_decorators = [state()];
        _isFullscreen_decorators = [state()];
        _viewLimits_decorators = [state()];
        _loadingProgress_decorators = [state()];
        _hotspots_decorators = [state()];
        _lastHotspotClick_decorators = [state()];
        _currentImageIndex_decorators = [state()];
        _deviceInfo_decorators = [state()];
        _performanceMode_decorators = [state()];
        _supportedFormats_decorators = [state()];
        __esDecorate(null, null, _autoRotate_decorators, { kind: "field", name: "autoRotate", static: false, private: false, access: { has: obj => "autoRotate" in obj, get: obj => obj.autoRotate, set: (obj, value) => { obj.autoRotate = value; } }, metadata: _metadata }, _autoRotate_initializers, _autoRotate_extraInitializers);
        __esDecorate(null, null, _showMiniMap_decorators, { kind: "field", name: "showMiniMap", static: false, private: false, access: { has: obj => "showMiniMap" in obj, get: obj => obj.showMiniMap, set: (obj, value) => { obj.showMiniMap = value; } }, metadata: _metadata }, _showMiniMap_initializers, _showMiniMap_extraInitializers);
        __esDecorate(null, null, _isFullscreen_decorators, { kind: "field", name: "isFullscreen", static: false, private: false, access: { has: obj => "isFullscreen" in obj, get: obj => obj.isFullscreen, set: (obj, value) => { obj.isFullscreen = value; } }, metadata: _metadata }, _isFullscreen_initializers, _isFullscreen_extraInitializers);
        __esDecorate(null, null, _viewLimits_decorators, { kind: "field", name: "viewLimits", static: false, private: false, access: { has: obj => "viewLimits" in obj, get: obj => obj.viewLimits, set: (obj, value) => { obj.viewLimits = value; } }, metadata: _metadata }, _viewLimits_initializers, _viewLimits_extraInitializers);
        __esDecorate(null, null, _loadingProgress_decorators, { kind: "field", name: "loadingProgress", static: false, private: false, access: { has: obj => "loadingProgress" in obj, get: obj => obj.loadingProgress, set: (obj, value) => { obj.loadingProgress = value; } }, metadata: _metadata }, _loadingProgress_initializers, _loadingProgress_extraInitializers);
        __esDecorate(null, null, _hotspots_decorators, { kind: "field", name: "hotspots", static: false, private: false, access: { has: obj => "hotspots" in obj, get: obj => obj.hotspots, set: (obj, value) => { obj.hotspots = value; } }, metadata: _metadata }, _hotspots_initializers, _hotspots_extraInitializers);
        __esDecorate(null, null, _lastHotspotClick_decorators, { kind: "field", name: "lastHotspotClick", static: false, private: false, access: { has: obj => "lastHotspotClick" in obj, get: obj => obj.lastHotspotClick, set: (obj, value) => { obj.lastHotspotClick = value; } }, metadata: _metadata }, _lastHotspotClick_initializers, _lastHotspotClick_extraInitializers);
        __esDecorate(null, null, _currentImageIndex_decorators, { kind: "field", name: "currentImageIndex", static: false, private: false, access: { has: obj => "currentImageIndex" in obj, get: obj => obj.currentImageIndex, set: (obj, value) => { obj.currentImageIndex = value; } }, metadata: _metadata }, _currentImageIndex_initializers, _currentImageIndex_extraInitializers);
        __esDecorate(null, null, _deviceInfo_decorators, { kind: "field", name: "deviceInfo", static: false, private: false, access: { has: obj => "deviceInfo" in obj, get: obj => obj.deviceInfo, set: (obj, value) => { obj.deviceInfo = value; } }, metadata: _metadata }, _deviceInfo_initializers, _deviceInfo_extraInitializers);
        __esDecorate(null, null, _performanceMode_decorators, { kind: "field", name: "performanceMode", static: false, private: false, access: { has: obj => "performanceMode" in obj, get: obj => obj.performanceMode, set: (obj, value) => { obj.performanceMode = value; } }, metadata: _metadata }, _performanceMode_initializers, _performanceMode_extraInitializers);
        __esDecorate(null, null, _supportedFormats_decorators, { kind: "field", name: "supportedFormats", static: false, private: false, access: { has: obj => "supportedFormats" in obj, get: obj => obj.supportedFormats, set: (obj, value) => { obj.supportedFormats = value; } }, metadata: _metadata }, _supportedFormats_initializers, _supportedFormats_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.styles = css `
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .app {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
      font-size: 2rem;
    }

    h3 {
      margin: 0 0 10px 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .control-section {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    button {
      width: 100%;
      padding: 10px 15px;
      margin-bottom: 8px;
      font-size: 13px;
      border: none;
      border-radius: 4px;
      background-color: #f7df1e;
      color: #000;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    button:last-child {
      margin-bottom: 0;
    }

    button:hover {
      background-color: #d4bd00;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    button:active {
      transform: translateY(0);
    }

    .info-text {
      display: block;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .progress-container {
      margin-bottom: 20px;
      text-align: center;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #f7df1e, #d4bd00);
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .info-panel {
      margin-top: 20px;
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .info-row {
      margin-bottom: 15px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-row strong {
      display: block;
      margin-bottom: 8px;
      color: #f7df1e;
    }

    .info-row ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-row li {
      margin-bottom: 5px;
      line-height: 1.6;
    }
  `;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppComponent = _classThis;
})();
export { AppComponent };
//# sourceMappingURL=app-component.js.map