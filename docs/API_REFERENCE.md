# API 参考文档

## 核心类

### PanoramaViewer

360° 全景查看器核心类。

#### 构造函数

```typescript
constructor(options: ViewerOptions, eventBus?: EventBus)
```

**参数**:
- `options`: 查看器配置选项
- `eventBus`: 可选的事件总线实例

#### 方法

##### loadImage()
加载新的全景图像。

```typescript
async loadImage(url: string | CubemapImages, transition?: boolean): Promise<void>
```

**参数**:
- `url`: 图像 URL 或立方体贴图对象
- `transition`: 是否使用过渡动画（默认 false）

**示例**:
```typescript
await viewer.loadImage('panorama2.jpg', true);
```

##### reset()
重置相机到初始位置。

```typescript
reset(): void
```

##### getRotation()
获取当前相机旋转。

```typescript
getRotation(): { x: number; y: number; z: number }
```

##### setRotation()
设置相机旋转。

```typescript
setRotation(x: number, y: number, z: number): void
```

##### addHotspot()
添加热点标记。

```typescript
addHotspot(hotspot: Hotspot): void
```

**Hotspot 接口**:
```typescript
interface Hotspot {
  id: string;
  position: { theta: number; phi: number };
  label?: string;
  data?: any;
  element?: HTMLElement;
}
```

##### screenshot()
截取当前视图。

```typescript
screenshot(width?: number, height?: number): string
```

**返回**: Base64 编码的 PNG 图像

---

### EventBus

类型安全的事件总线系统。

#### 方法

##### on()
订阅事件。

```typescript
on<K extends keyof EventMap>(
  event: K,
  handler: EventHandler<EventMap[K]>
): () => void
```

**返回**: 取消订阅函数

**示例**:
```typescript
const unsubscribe = eventBus.on('camera:change', ({ rotation, fov }) => {
  console.log('Camera changed', rotation, fov);
});

// 取消订阅
unsubscribe();
```

##### once()
订阅一次性事件。

```typescript
once<K extends keyof EventMap>(
  event: K,
  handler: EventHandler<EventMap[K]>
): () => void
```

##### emit()
触发事件。

```typescript
emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void
```

##### waitFor()
等待事件触发（Promise 方式）。

```typescript
waitFor<K extends keyof EventMap>(
  event: K,
  timeout?: number
): Promise<EventMap[K]>
```

**示例**:
```typescript
try {
  await eventBus.waitFor('viewer:ready', 5000);
  console.log('Viewer ready!');
} catch (error) {
  console.error('Timeout waiting for viewer');
}
```

#### 事件类型

```typescript
interface EventMap {
  // 生命周期
  'viewer:ready': void;
  'viewer:dispose': void;
  
  // 图像加载
  'image:loading': { url: string; progress: number };
  'image:loaded': { url: string };
  'image:error': { url: string; error: Error };
  
  // 相机
  'camera:change': { rotation: Vector3; fov: number };
  'camera:move': { rotation: Vector3 };
  'camera:zoom': { fov: number };
  
  // 交互
  'interaction:dragstart': { x: number; y: number };
  'interaction:drag': { x: number; y: number; deltaX: number; deltaY: number };
  'interaction:dragend': { x: number; y: number };
  
  // 热点
  'hotspot:click': { id: string; data: any };
  
  // 性能
  'performance:warning': { type: string; message: string };
  
  // VR/AR
  'xr:sessionstart': { mode: 'vr' | 'ar' };
  'xr:sessionend': void;
  
  // 视频
  'video:play': void;
  'video:pause': void;
  'video:timeupdate': { currentTime: number; duration: number };
}
```

---

### Logger

分级日志系统。

#### 方法

##### setLevel()
设置日志级别。

```typescript
setLevel(level: LogLevel): void
```

**LogLevel**:
```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}
```

##### debug() / info() / warn() / error()
记录不同级别的日志。

```typescript
debug(message: string, data?: any): void
info(message: string, data?: any): void
warn(message: string, data?: any): void
error(message: string, error?: any): void
```

##### time()
性能计时。

```typescript
time(label: string): () => void
```

**示例**:
```typescript
const endTimer = logger.time('Load image');
await viewer.loadImage('large.jpg');
endTimer(); // 输出: "Load image took 1234.56ms"
```

---

### StateManager

状态管理器。

#### 枚举

```typescript
enum ViewerState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  DISPOSED = 'disposed',
}

enum InteractionMode {
  NAVIGATE = 'navigate',
  MEASURE = 'measure',
  ANNOTATE = 'annotate',
  EDIT_HOTSPOT = 'edit_hotspot',
}
```

#### 方法

```typescript
getState(): ViewerStateData
setViewerState(state: ViewerState): void
setInteractionMode(mode: InteractionMode): void
isReady(): boolean
canInteract(): boolean
```

---

### MemoryManager

内存管理器。

#### 方法

```typescript
getStats(): MemoryStats
startMonitoring(intervalMs?: number): void
stopMonitoring(): void
forceCleanup(): void
```

**MemoryStats**:
```typescript
interface MemoryStats {
  textures: { count: number; bytes: number };
  geometries: { count: number; bytes: number };
  jsHeap?: {
    used: number;
    total: number;
    limit: number;
    usagePercent: number;
  };
  total: number;
}
```

---

## 高级功能类

### VideoPanorama

视频全景播放器。

```typescript
constructor(options: VideoOptions, eventBus?: EventBus)

async play(): Promise<void>
pause(): void
stop(): void
seek(time: number): void
setVolume(volume: number): void
setQuality(quality: 'low' | 'medium' | 'high' | 'ultra'): void
setAdaptiveBitrate(enabled: boolean): void
getState(): VideoState
createTexture(): THREE.VideoTexture
```

---

### SpatialAudio

空间音频系统。

```typescript
constructor(camera: THREE.PerspectiveCamera)

async initialize(): Promise<void>
async addSource(id: string, options: AudioSourceOptions): Promise<void>
async addAmbientSound(url: string, options?: {...}): Promise<string>
async play(id: string): Promise<void>
stop(id: string): void
setVolume(id: string, volume: number): void
setMasterVolume(volume: number): void
updateSourcePosition(id: string, position: {...}): void
update(): void
```

---

### VRManager

VR 管理器。

```typescript
constructor(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  options?: VROptions,
  eventBus?: EventBus
)

static async isVRSupported(): Promise<boolean>
async initialize(): Promise<void>
async enterVR(): Promise<void>
async exitVR(): Promise<void>
isActive(): boolean
getController(index: number): THREE.Group | undefined
```

---

### HDRRenderer

HDR 渲染器。

```typescript
constructor(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  options?: HDROptions
)

async loadHDR(url: string): Promise<THREE.DataTexture>
setToneMapping(type: ToneMappingType): void
setExposure(exposure: number): void
applyEnvironmentMap(texture: THREE.Texture): void
```

**ToneMappingType**:
```typescript
type ToneMappingType = 'none' | 'linear' | 'reinhard' | 'cineon' | 'aces' | 'custom';
```

---

### PostProcessing

后处理效果。

```typescript
constructor(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  options?: PostProcessingOptions
)

initialize(): void
render(deltaTime?: number): void
setEnabled(enabled: boolean): void
setBloomParams(params: {...}): void
setDepthOfFieldParams(params: {...}): void
resize(width: number, height: number): void
```

---

### AdvancedCamera

高级相机控制。

```typescript
constructor(camera: THREE.PerspectiveCamera)

async smoothMoveTo(
  position: THREE.Vector3,
  rotation?: THREE.Euler,
  fov?: number,
  duration?: number
): Promise<void>

addKeyframe(keyframe: Omit<CameraKeyframe, 'timestamp'>): void
playPath(options: CameraPathOptions): void
stopPath(): void

startRecording(): void
stopRecording(): CameraKeyframe[]
loadRecording(keyframes: CameraKeyframe[]): void

setTarget(target: CameraTarget): void
clearTarget(): void

exportPath(): string
importPath(json: string): void

update(): void
```

---

### TileManager

多分辨率瓦片管理。

```typescript
constructor(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  format: TileFormat
)

update(): void
async preloadLevel(level: number): Promise<void>
getStats(): {...}
```

**TileFormat**:
```typescript
interface TileFormat {
  type: 'google' | 'marzipano' | 'krpano' | 'custom';
  urlTemplate: string;
  maxLevel: number;
  tileSize: number;
  dimensions?: { cols: number; rows: number }[];
}
```

---

### MeasureTool

测量工具。

```typescript
constructor(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement,
  eventBus?: EventBus
)

activate(type: 'distance' | 'angle'): void
deactivate(): void
clearAll(): void
removeMeasurement(id: string): void
getMeasurements(): Measurement[]
exportData(): string
update(): void
```

---

### PluginManager

插件管理器。

```typescript
constructor(eventBus: EventBus)

setContext(context: PluginContext): void
register(plugin: Plugin): void
async install(nameOrPlugin: string | Plugin, options?: PluginOptions): Promise<void>
async uninstall(name: string): Promise<void>
isInstalled(name: string): boolean
getInstalled(): PluginMetadata[]
update(deltaTime: number): void
resize(width: number, height: number): void
```

**Plugin 接口**:
```typescript
interface Plugin {
  metadata: PluginMetadata;
  install(context: PluginContext): void | Promise<void>;
  uninstall?(): void | Promise<void>;
  onUpdate?(deltaTime: number): void;
  onResize?(width: number, height: number): void;
}
```

---

## 工具函数

### 防抖/节流

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void

function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

### 取消令牌

```typescript
class CancellationToken {
  get isCancelled(): boolean
  cancel(): void
  onCancel(callback: () => void): () => void
  throwIfCancelled(): void
  reset(): void
}
```

### 异步工具

```typescript
async function delay(ms: number, token?: CancellationToken): Promise<void>

async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T>

async function promiseAllLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]>
```

### 数学工具

```typescript
function lerp(start: number, end: number, t: number): number
function clamp(value: number, min: number, max: number): number
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number
```

### 缓动函数

```typescript
const easing = {
  linear: (t: number) => number,
  easeInQuad: (t: number) => number,
  easeOutQuad: (t: number) => number,
  easeInOutQuad: (t: number) => number,
  easeInCubic: (t: number) => number,
  easeOutCubic: (t: number) => number,
  easeInOutCubic: (t: number) => number,
  easeInQuart: (t: number) => number,
  easeOutQuart: (t: number) => number,
  easeInOutQuart: (t: number) => number,
  easeInElastic: (t: number) => number,
  easeOutElastic: (t: number) => number,
}
```

### 设备检测

```typescript
function isMobile(): boolean
function isTouchDevice(): boolean
```

### 格式化工具

```typescript
function formatBytes(bytes: number, decimals?: number): string
function formatDuration(ms: number): string
```

---

## 对象池

### Vector3Pool / Vector2Pool / EulerPool / QuaternionPool / Matrix4Pool / ColorPool / RaycasterPool

```typescript
class XxxPool {
  static getInstance(): XxxPool
  acquire(): THREE.Xxx
  release(obj: THREE.Xxx): void
  getStats(): { pooled: number; created: number }
}
```

**示例**:
```typescript
const v3Pool = Vector3Pool.getInstance();
const vec = v3Pool.acquire();
vec.set(1, 2, 3);
// 使用...
v3Pool.release(vec);
```

### getAllPoolStats()

获取所有对象池的统计信息。

```typescript
function getAllPoolStats(): {
  Vector3: { pooled: number; created: number };
  Vector2: { pooled: number; created: number };
  // ... 其他池
}
```

---

## 类型定义

### ViewerOptions

```typescript
interface ViewerOptions {
  container: HTMLElement;
  image: string | CubemapImages;
  format?: 'equirectangular' | 'cubemap';
  fov?: number;
  minFov?: number;
  maxFov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  gyroscope?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
  viewLimits?: ViewLimits;
  keyboardControls?: boolean;
  onProgress?: (progress: number) => void;
  renderOnDemand?: boolean;
  maxTextureSize?: number;
  enablePerformanceMonitor?: boolean;
  showPerformanceStats?: boolean;
  enableAdaptiveQuality?: boolean;
  qualityPreset?: 'ultra' | 'high' | 'medium' | 'low';
  useWebWorker?: boolean;
  advancedGestures?: boolean;
  useGPUInstancing?: boolean;
  preloadImages?: string[];
}
```

### ViewLimits

```typescript
interface ViewLimits {
  minTheta?: number;
  maxTheta?: number;
  minPhi?: number;
  maxPhi?: number;
}
```

### CubemapImages

```typescript
interface CubemapImages {
  px: string; // positive x
  nx: string; // negative x
  py: string; // positive y
  ny: string; // negative y
  pz: string; // positive z
  nz: string; // negative z
}
```

---

## 高级配置示例

### 完整配置

```typescript
const viewer = new PanoramaViewer({
  // 必需
  container: document.getElementById('viewer'),
  image: 'panorama.jpg',
  
  // 格式
  format: 'equirectangular',
  
  // 相机
  fov: 75,
  minFov: 30,
  maxFov: 100,
  
  // 自动旋转
  autoRotate: true,
  autoRotateSpeed: 0.5,
  
  // 控制
  gyroscope: true,
  keyboardControls: true,
  enableDamping: true,
  dampingFactor: 0.05,
  
  // 视图限制
  viewLimits: {
    minPhi: -Math.PI / 4,
    maxPhi: Math.PI / 4,
  },
  
  // 性能
  renderOnDemand: true,
  maxTextureSize: 4096,
  enablePerformanceMonitor: true,
  enableAdaptiveQuality: true,
  qualityPreset: 'high',
  
  // 高级
  useWebWorker: true,
  advancedGestures: true,
  useGPUInstancing: true,
  
  // 预加载
  preloadImages: [
    'scene1.jpg',
    'scene2.jpg',
  ],
  
  // 回调
  onProgress: (progress) => {
    console.log(`Loading: ${progress}%`);
  },
}, eventBus);
```

---

## 📚 更多文档

- [快速开始](./QUICK_START.md)
- [迁移指南](../MIGRATION_GUIDE.md)
- [优化进度](../OPTIMIZATION_PROGRESS.md)
- [示例代码](../examples/)

---

**文档版本**: v2.0  
**最后更新**: 2024-01-XX

