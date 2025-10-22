# 快速开始指南

## 📦 安装

```bash
# 使用 npm
npm install @panorama-viewer/core three

# 使用 yarn
yarn add @panorama-viewer/core three

# 使用 pnpm
pnpm add @panorama-viewer/core three
```

## 🚀 基础使用

### 1. 最简单的示例

```typescript
import { PanoramaViewer } from '@panorama-viewer/core';

const container = document.getElementById('viewer');

const viewer = new PanoramaViewer({
  container,
  image: 'path/to/panorama.jpg',
});
```

### 2. 带事件监听

```typescript
import { PanoramaViewer, EventBus } from '@panorama-viewer/core';

const eventBus = new EventBus();
const container = document.getElementById('viewer');

// 订阅事件
eventBus.on('viewer:ready', () => {
  console.log('Viewer is ready!');
});

eventBus.on('image:loading', ({ progress }) => {
  console.log(`Loading: ${progress.toFixed(1)}%`);
});

eventBus.on('camera:change', ({ rotation, fov }) => {
  console.log('Camera changed:', rotation, fov);
});

const viewer = new PanoramaViewer({
  container,
  image: 'panorama.jpg',
  autoRotate: true,
  renderOnDemand: true, // 性能优化
}, eventBus);
```

### 3. 启用性能优化

```typescript
import { 
  PanoramaViewer, 
  EventBus,
  MemoryManager,
  logger,
  LogLevel 
} from '@panorama-viewer/core';

// 设置日志级别
logger.setLevel(LogLevel.INFO);

const eventBus = new EventBus();

// 创建内存管理器
const memoryManager = new MemoryManager({
  maxTextureMemory: 512 * 1024 * 1024, // 512MB
  autoCleanup: true,
}, eventBus);

memoryManager.startMonitoring(5000); // 每 5 秒检查

const viewer = new PanoramaViewer({
  container,
  image: 'panorama.jpg',
  renderOnDemand: true, // 按需渲染
  maxTextureSize: 4096, // 限制纹理大小
  enablePerformanceMonitor: true, // 性能监控
}, eventBus);

// 查看内存统计
setInterval(() => {
  const stats = memoryManager.getStats();
  console.log('Memory:', {
    textures: `${(stats.textures.bytes / 1024 / 1024).toFixed(2)} MB`,
    total: `${(stats.total / 1024 / 1024).toFixed(2)} MB`,
  });
}, 10000);
```

## 🎬 视频全景

```typescript
import { PanoramaViewer, VideoPanorama, EventBus } from '@panorama-viewer/core';

const eventBus = new EventBus();

// 创建视频全景
const videoPanorama = new VideoPanorama({
  sources: [
    { url: 'video-360-480p.mp4', quality: 'low', bitrate: 1000 },
    { url: 'video-360-720p.mp4', quality: 'medium', bitrate: 3000 },
    { url: 'video-360-1080p.mp4', quality: 'high', bitrate: 6000 },
  ],
  autoplay: false,
  loop: true,
  muted: false,
  volume: 0.8,
  adaptiveBitrate: true, // 自动根据带宽切换质量
}, eventBus);

// 监听视频事件
eventBus.on('video:play', () => {
  console.log('Video playing');
});

eventBus.on('video:timeupdate', ({ currentTime, duration }) => {
  console.log(`Progress: ${currentTime}/${duration}`);
});

// 创建视频纹理
const videoTexture = videoPanorama.createTexture();

// 创建 viewer（使用视频纹理）
const viewer = new PanoramaViewer({
  container,
  // 注意：需要在 PanoramaViewer 中添加对视频纹理的支持
}, eventBus);

// 播放控制
document.getElementById('play-btn').addEventListener('click', async () => {
  await videoPanorama.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
  videoPanorama.pause();
});

document.getElementById('volume-slider').addEventListener('input', (e) => {
  videoPanorama.setVolume(parseFloat(e.target.value));
});
```

## 🎵 空间音频

```typescript
import { SpatialAudio } from '@panorama-viewer/core';

const spatialAudio = new SpatialAudio(viewer.camera);

// 初始化（需要用户交互触发）
document.getElementById('init-audio').addEventListener('click', async () => {
  await spatialAudio.initialize();

  // 添加位置音频源
  await spatialAudio.addSource('nature', {
    url: 'nature-sounds.mp3',
    position: { theta: 0, phi: Math.PI / 4, radius: 100 },
    loop: true,
    volume: 0.7,
    autoplay: true,
    maxDistance: 1000,
    refDistance: 10,
  });

  // 添加环境音效
  await spatialAudio.addAmbientSound('background-music.mp3', {
    loop: true,
    volume: 0.3,
    autoplay: true,
  });

  console.log('Spatial audio initialized');
});

// 在动画循环中更新
function animate() {
  spatialAudio.update(); // 更新音频位置
  requestAnimationFrame(animate);
}
animate();
```

## 🥽 VR 模式

```typescript
import { VRManager } from '@panorama-viewer/core';

const vrManager = new VRManager(
  viewer.renderer,
  viewer.camera,
  viewer.scene,
  { 
    controllers: true,
    floorLevel: true,
  },
  eventBus
);

// 检查 VR 支持
const supported = await VRManager.isVRSupported();

if (supported) {
  await vrManager.initialize();

  // VR 按钮
  document.getElementById('vr-btn').addEventListener('click', async () => {
    try {
      await vrManager.enterVR();
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  });

  // 监听 VR 事件
  eventBus.on('xr:sessionstart', ({ mode }) => {
    console.log('XR session started:', mode);
  });

  eventBus.on('xr:sessionend', () => {
    console.log('XR session ended');
  });
} else {
  console.log('VR not supported');
  document.getElementById('vr-btn').style.display = 'none';
}
```

## 🌈 HDR 渲染

```typescript
import { HDRRenderer } from '@panorama-viewer/core';

const hdrRenderer = new HDRRenderer(
  viewer.renderer,
  viewer.scene,
  {
    toneMapping: 'aces',
    exposure: 1.0,
  }
);

// 加载 HDR 环境
const hdrTexture = await hdrRenderer.loadHDR('environment.hdr');
hdrRenderer.applyEnvironmentMap(hdrTexture);

// 曝光控制滑块
document.getElementById('exposure-slider').addEventListener('input', (e) => {
  const exposure = parseFloat(e.target.value);
  hdrRenderer.setExposure(exposure);
});

// Tone Mapping 选择
document.getElementById('tone-mapping').addEventListener('change', (e) => {
  hdrRenderer.setToneMapping(e.target.value as any);
});
```

## 🎨 后处理效果

```typescript
import { PostProcessing } from '@panorama-viewer/core';

const postProcessing = new PostProcessing(
  viewer.renderer,
  viewer.scene,
  viewer.camera,
  {
    antialiasing: 'smaa',
    bloom: {
      enabled: true,
      strength: 1.5,
      radius: 0.4,
      threshold: 0.85,
    },
    depthOfField: {
      enabled: true,
      focus: 500,
      aperture: 0.025,
      maxBlur: 0.01,
    },
    vignette: {
      enabled: true,
      offset: 1.0,
      darkness: 1.0,
    },
  }
);

postProcessing.initialize();

// 在动画循环中渲染
function animate() {
  postProcessing.render();
  requestAnimationFrame(animate);
}
animate();

// 实时调整 Bloom
document.getElementById('bloom-strength').addEventListener('input', (e) => {
  postProcessing.setBloomParams({
    strength: parseFloat(e.target.value),
  });
});
```

## 📐 测量工具

```typescript
import { MeasureTool } from '@panorama-viewer/core';

const measureTool = new MeasureTool(
  viewer.scene,
  viewer.camera,
  viewer.container,
  eventBus
);

// 激活距离测量
document.getElementById('measure-distance').addEventListener('click', () => {
  measureTool.activate('distance');
  console.log('Click two points to measure distance');
});

// 激活角度测量
document.getElementById('measure-angle').addEventListener('click', () => {
  measureTool.activate('angle');
  console.log('Click three points to measure angle');
});

// 清除所有测量
document.getElementById('clear-measurements').addEventListener('click', () => {
  measureTool.clearAll();
});

// 导出测量数据
document.getElementById('export-measurements').addEventListener('click', () => {
  const data = measureTool.exportData();
  console.log(data);
});

// 在动画循环中更新
function animate() {
  measureTool.update(); // 更新标签位置
  requestAnimationFrame(animate);
}
animate();
```

## 🔌 使用插件

```typescript
import { PluginManager, SharePlugin } from '@panorama-viewer/core';

const pluginManager = new PluginManager(eventBus);

// 设置插件上下文
pluginManager.setContext({
  viewer,
  eventBus,
  scene: viewer.scene,
  camera: viewer.camera,
  renderer: viewer.renderer,
  container: viewer.container,
});

// 安装分享插件
await pluginManager.install(SharePlugin);

// 查看已安装插件
const installed = pluginManager.getInstalled();
console.log('Installed plugins:', installed);

// 在动画循环中更新插件
function animate() {
  pluginManager.update(deltaTime);
  requestAnimationFrame(animate);
}
animate();
```

## 🎥 相机路径动画

```typescript
import { AdvancedCamera } from '@panorama-viewer/core';

const advancedCamera = new AdvancedCamera(viewer.camera);

// 添加关键帧
advancedCamera.addKeyframe({
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  fov: 75,
});

advancedCamera.addKeyframe({
  position: new THREE.Vector3(10, 5, 0),
  rotation: new THREE.Euler(0.5, 1.0, 0),
  fov: 60,
});

// 播放路径
advancedCamera.playPath({
  duration: 5000,
  easing: 'easeInOutQuad',
  loop: true,
  onUpdate: (progress) => {
    console.log(`Animation progress: ${(progress * 100).toFixed(1)}%`);
  },
  onComplete: () => {
    console.log('Animation completed');
  },
});

// 录制路径
document.getElementById('start-recording').addEventListener('click', () => {
  advancedCamera.startRecording();
  console.log('Recording started. Move the camera...');
});

document.getElementById('stop-recording').addEventListener('click', () => {
  const keyframes = advancedCamera.stopRecording();
  console.log(`Recorded ${keyframes.length} keyframes`);
  
  // 保存路径
  const json = advancedCamera.exportPath();
  localStorage.setItem('camera-path', json);
});

// 在动画循环中更新
function animate() {
  advancedCamera.update();
  requestAnimationFrame(animate);
}
animate();
```

## 🗺️ 大型全景瓦片

```typescript
import { TileManager } from '@panorama-viewer/core';

const tileManager = new TileManager(
  viewer.scene,
  viewer.camera,
  {
    type: 'google',
    urlTemplate: 'https://example.com/tiles/{l}/{x}_{y}.jpg',
    maxLevel: 5,
    tileSize: 512,
  }
);

// 预加载第一层
await tileManager.preloadLevel(0);

// 在动画循环中更新
function animate() {
  tileManager.update(); // 动态加载可见瓦片
  
  // 查看统计
  const stats = tileManager.getStats();
  console.log('Tiles:', stats);
  
  requestAnimationFrame(animate);
}
animate();
```

## 🎛️ 完整示例：所有功能

```typescript
import {
  PanoramaViewer,
  EventBus,
  MemoryManager,
  PostProcessing,
  AdvancedCamera,
  SpatialAudio,
  VRManager,
  MeasureTool,
  PluginManager,
  SharePlugin,
  logger,
  LogLevel,
} from '@panorama-viewer/core';

// 设置日志
logger.setLevel(LogLevel.DEBUG);

// 创建事件总线
const eventBus = new EventBus();

// 创建 viewer
const viewer = new PanoramaViewer({
  container: document.getElementById('viewer'),
  image: 'panorama.jpg',
  autoRotate: true,
  renderOnDemand: true,
  enablePerformanceMonitor: true,
  enableAdaptiveQuality: true,
}, eventBus);

// 内存管理
const memoryManager = new MemoryManager({
  maxTextureMemory: 512 * 1024 * 1024,
  autoCleanup: true,
}, eventBus);
memoryManager.startMonitoring();

// 后处理
const postProcessing = new PostProcessing(
  viewer.renderer,
  viewer.scene,
  viewer.camera,
  {
    antialiasing: 'smaa',
    bloom: { enabled: true, strength: 1.5 },
    vignette: { enabled: true },
  }
);
postProcessing.initialize();

// 高级相机
const advancedCamera = new AdvancedCamera(viewer.camera);

// 空间音频
const spatialAudio = new SpatialAudio(viewer.camera);

// VR 管理器
const vrManager = new VRManager(
  viewer.renderer,
  viewer.camera,
  viewer.scene,
  { controllers: true },
  eventBus
);

// 测量工具
const measureTool = new MeasureTool(
  viewer.scene,
  viewer.camera,
  viewer.container,
  eventBus
);

// 插件管理器
const pluginManager = new PluginManager(eventBus);
pluginManager.setContext({
  viewer,
  eventBus,
  scene: viewer.scene,
  camera: viewer.camera,
  renderer: viewer.renderer,
  container: viewer.container,
});
await pluginManager.install(SharePlugin);

// 动画循环
function animate() {
  advancedCamera.update();
  spatialAudio.update();
  measureTool.update();
  pluginManager.update(16);
  postProcessing.render();
  
  requestAnimationFrame(animate);
}
animate();

// 清理
window.addEventListener('beforeunload', () => {
  viewer.dispose();
  memoryManager.dispose();
  postProcessing.dispose();
  spatialAudio.dispose();
  vrManager.dispose();
  measureTool.dispose();
  pluginManager.dispose();
});
```

## 🎯 常见用例

### 用例 1: 房地产虚拟看房

```typescript
const viewer = new PanoramaViewer({
  container,
  image: 'living-room.jpg',
  autoRotate: true,
  autoRotateSpeed: 0.3,
}, eventBus);

// 添加房间热点
viewer.addHotspot({
  id: 'kitchen',
  position: { theta: Math.PI / 2, phi: Math.PI / 2 },
  label: '🍳 厨房',
});

viewer.addHotspot({
  id: 'bedroom',
  position: { theta: -Math.PI / 2, phi: Math.PI / 2 },
  label: '🛏️ 卧室',
});

// 监听热点点击
eventBus.on('hotspot:click', ({ id }) => {
  if (id === 'kitchen') {
    viewer.loadImage('kitchen.jpg', true);
  } else if (id === 'bedroom') {
    viewer.loadImage('bedroom.jpg', true);
  }
});

// 启用测量工具
const measureTool = new MeasureTool(viewer.scene, viewer.camera, viewer.container);
document.getElementById('measure-btn').addEventListener('click', () => {
  measureTool.activate('distance');
});
```

### 用例 2: 博物馆虚拟导览

```typescript
// HDR 高质量渲染
const hdrRenderer = new HDRRenderer(viewer.renderer, viewer.scene, {
  toneMapping: 'aces',
  exposure: 1.2,
});

const hdrTexture = await hdrRenderer.loadHDR('museum-hall.hdr');
hdrRenderer.applyEnvironmentMap(hdrTexture);

// 空间音频讲解
const spatialAudio = new SpatialAudio(viewer.camera);
await spatialAudio.initialize();

await spatialAudio.addSource('exhibit1', {
  url: 'exhibit1-audio.mp3',
  position: { theta: 0, phi: Math.PI / 2, radius: 50 },
  loop: false,
  volume: 0.8,
});

// 自动导览路径
const advancedCamera = new AdvancedCamera(viewer.camera);

// 预定义路径关键帧
const tourKeyframes = [
  { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, 0, 0), fov: 75 },
  { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0), fov: 60 },
  { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, Math.PI, 0), fov: 75 },
];

tourKeyframes.forEach((kf) => advancedCamera.addKeyframe(kf));

// 开始导览
document.getElementById('start-tour').addEventListener('click', () => {
  advancedCamera.playPath({
    duration: 20000,
    easing: 'easeInOutQuad',
    loop: true,
  });
});
```

## 🔧 性能优化技巧

### 1. 启用按需渲染
```typescript
const viewer = new PanoramaViewer({
  renderOnDemand: true, // 仅在需要时渲染
});
```

### 2. 使用对象池
```typescript
import { Vector3Pool, EulerPool } from '@panorama-viewer/core';

// 不推荐
const pos = new THREE.Vector3(x, y, z);

// 推荐
const pos = Vector3Pool.getInstance().acquire();
pos.set(x, y, z);
// 使用...
Vector3Pool.getInstance().release(pos);
```

### 3. 渐进式加载大图
```typescript
import { ProgressiveTextureLoader } from '@panorama-viewer/core';

const loader = new ProgressiveTextureLoader();
const texture = await loader.load({
  previewUrl: 'panorama-512.jpg',
  fullUrl: 'panorama-8k.jpg',
  onProgress: (stage, progress) => {
    console.log(`${stage}: ${progress}%`);
  },
});
```

### 4. 超大全景使用瓦片
```typescript
// 对于 16K+ 全景，使用瓦片系统
const tileManager = new TileManager(scene, camera, {
  type: 'google',
  urlTemplate: '/tiles/{l}/{x}_{y}.jpg',
  maxLevel: 5,
  tileSize: 512,
});
```

## 📱 移动端优化

```typescript
import { isMobile } from '@panorama-viewer/core';

const viewer = new PanoramaViewer({
  container,
  image: 'panorama.jpg',
  gyroscope: isMobile(), // 仅移动端启用陀螺仪
  renderOnDemand: true,
  maxTextureSize: isMobile() ? 2048 : 4096, // 移动端降低纹理尺寸
  qualityPreset: isMobile() ? 'medium' : 'high',
}, eventBus);
```

## 🐛 调试技巧

```typescript
import { logger, LogLevel } from '@panorama-viewer/core';

// 开发环境启用详细日志
if (process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.DEBUG);
}

// 性能计时
const endTimer = logger.time('Load panorama');
await viewer.loadImage('large-panorama.jpg');
endTimer(); // 输出: "Load panorama took 1234.56ms"

// 查看内存统计
const stats = memoryManager.getStats();
console.log('Memory usage:', stats);

// 查看对象池统计
import { getAllPoolStats } from '@panorama-viewer/core';
console.log('Object pools:', getAllPoolStats());

// 查看纹理缓存统计
import { TextureCache } from '@panorama-viewer/core';
const cacheStats = TextureCache.getInstance().getStats();
console.log('Texture cache:', cacheStats);
```

## 🔗 相关资源

- [完整 API 文档](./API.md)
- [迁移指南](../MIGRATION_GUIDE.md)
- [优化进度](../OPTIMIZATION_PROGRESS.md)
- [示例代码](../examples/)

---

**Happy Coding! 🎉**

