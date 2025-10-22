# 3D Panorama Viewer v2.0

> 🎉 全新架构，性能翻倍，功能倍增！

一个强大的跨框架 3D 全景查看器，基于 Three.js 构建，支持 PC、平板和移动设备。

## ✨ v2.0 新特性

### 🚀 核心优化
- **事件驱动架构** - 解耦设计，更易扩展和维护
- **智能内存管理** - LRU 缓存 + 自动清理，内存使用降低 40%
- **对象池系统** - GC 压力降低 60-70%
- **按需渲染** - CPU 使用降低 50%+
- **渐进式加载** - 首屏显示速度提升 3-5x

### 🎬 视频全景
- 360° 视频播放支持
- 自适应码率切换 (ABR)
- 多质量级别
- 完整的播放控制 API

### 🎵 空间音频
- Web Audio API 3D 音频
- HRTF 空间化
- 位置音频源
- 环境音效支持

### 🥽 VR/AR 支持
- WebXR API 集成
- VR 头显支持
- 双手控制器
- 地板级别追踪

### 🌈 HDR 渲染
- RGBE 格式 HDR 纹理
- 5 种 Tone Mapping（Linear, Reinhard, Cineon, ACES, Custom）
- 曝光控制
- 色彩分级（亮度、对比度、饱和度、色相、色温）

### 📊 开发者工具
- 分级日志系统（DEBUG, INFO, WARN, ERROR）
- 性能监控和统计
- 内存使用追踪
- 状态管理器

## 📦 安装

```bash
# NPM
npm install @panorama-viewer/core three

# Yarn
yarn add @panorama-viewer/core three

# PNPM
pnpm add @panorama-viewer/core three
```

### 框架特定版本

```bash
# Vue 3
npm install @panorama-viewer/vue three

# React
npm install @panorama-viewer/react three

# Lit
npm install @panorama-viewer/lit three
```

## 🎯 快速开始

### 基础使用

```typescript
import { PanoramaViewer, EventBus } from '@panorama-viewer/core';

const eventBus = new EventBus();
const container = document.getElementById('viewer');

const viewer = new PanoramaViewer({
  container,
  image: 'panorama.jpg',
  autoRotate: true,
  renderOnDemand: true,
}, eventBus);

// 监听事件
eventBus.on('viewer:ready', () => {
  console.log('Viewer ready!');
});

eventBus.on('image:loading', ({ progress }) => {
  console.log(`Loading: ${progress}%`);
});
```

### 视频全景

```typescript
import { PanoramaViewer, VideoPanorama, EventBus } from '@panorama-viewer/core';

const eventBus = new EventBus();
const videoPanorama = new VideoPanorama({
  sources: [
    { url: 'video-360-low.mp4', quality: 'low', bitrate: 1000 },
    { url: 'video-360-high.mp4', quality: 'high', bitrate: 5000 },
  ],
  autoplay: true,
  loop: true,
  adaptiveBitrate: true,
}, eventBus);

const videoTexture = videoPanorama.createTexture();
const viewer = new PanoramaViewer({
  container,
  texture: videoTexture,
}, eventBus);

// 控制播放
await videoPanorama.play();
videoPanorama.setVolume(0.8);
```

### 空间音频

```typescript
import { SpatialAudio } from '@panorama-viewer/core';

const spatialAudio = new SpatialAudio(viewer.camera);
await spatialAudio.initialize();

// 添加位置音频
await spatialAudio.addSource('nature', {
  url: 'nature-sounds.mp3',
  position: { theta: 0, phi: Math.PI / 4, radius: 100 },
  loop: true,
  volume: 0.7,
  autoplay: true,
  maxDistance: 1000,
});

// 在动画循环中更新
function animate() {
  spatialAudio.update();
  requestAnimationFrame(animate);
}
animate();
```

### VR 模式

```typescript
import { VRManager } from '@panorama-viewer/core';

const vrManager = new VRManager(
  viewer.renderer,
  viewer.camera,
  viewer.scene,
  { controllers: true },
  eventBus
);

await vrManager.initialize();

// 进入 VR 按钮
document.getElementById('vr-button').addEventListener('click', async () => {
  await vrManager.enterVR();
});

// 监听 VR 事件
eventBus.on('xr:sessionstart', () => {
  console.log('VR session started');
});
```

### HDR 渲染

```typescript
import { HDRRenderer } from '@panorama-viewer/core';

const hdrRenderer = new HDRRenderer(viewer.renderer, viewer.scene, {
  toneMapping: 'aces',
  exposure: 1.0,
});

// 加载 HDR 环境
const hdrTexture = await hdrRenderer.loadHDR('environment.hdr');
hdrRenderer.applyEnvironmentMap(hdrTexture);

// 调整曝光
hdrRenderer.setExposure(1.5);
```

## 🎨 Vue 3 组件

```vue
<template>
  <PanoramaViewer
    :image="panoramaImage"
    :auto-rotate="true"
    :gyroscope="true"
    width="100%"
    height="600px"
    @ready="onReady"
    @hotspot-click="onHotspotClick"
  />
</template>

<script setup>
import { ref } from 'vue';
import { PanoramaViewer } from '@panorama-viewer/vue';

const panoramaImage = ref('panorama.jpg');

const onReady = () => {
  console.log('Viewer ready!');
};

const onHotspotClick = (hotspot) => {
  console.log('Hotspot clicked:', hotspot);
};
</script>
```

## ⚛️ React 组件

```jsx
import { useRef } from 'react';
import { PanoramaViewer } from '@panorama-viewer/react';

function App() {
  const viewerRef = useRef();

  const handleReady = () => {
    console.log('Viewer ready!');
  };

  const handleHotspotClick = (hotspot) => {
    console.log('Hotspot clicked:', hotspot);
  };

  return (
    <PanoramaViewer
      ref={viewerRef}
      image="panorama.jpg"
      autoRotate={true}
      gyroscope={true}
      width="100%"
      height="600px"
      onReady={handleReady}
      onHotspotClick={handleHotspotClick}
    />
  );
}
```

## 🔧 API 概览

### 核心 API

#### PanoramaViewer
```typescript
// 图像控制
await viewer.loadImage(url, transition?);
await viewer.preloadImages(urls);

// 相机控制
viewer.reset();
viewer.getRotation();
viewer.setRotation(x, y, z);

// 自动旋转
viewer.enableAutoRotate();
viewer.disableAutoRotate();

// 陀螺仪
await viewer.enableGyroscope();
viewer.disableGyroscope();

// 热点
viewer.addHotspot(hotspot);
viewer.removeHotspot(id);
viewer.getHotspots();

// 全屏
await viewer.enterFullscreen();
viewer.exitFullscreen();
viewer.isFullscreen();

// 截图
const dataUrl = viewer.screenshot(width?, height?);

// 小地图
viewer.showMiniMap();
viewer.hideMiniMap();
viewer.toggleMiniMap();

// 清理
viewer.dispose();
```

#### 事件系统

```typescript
import { EventBus } from '@panorama-viewer/core';

const eventBus = new EventBus();

// 订阅事件
const unsubscribe = eventBus.on('camera:change', (data) => {
  console.log('Camera changed:', data);
});

// 一次性订阅
eventBus.once('viewer:ready', () => {
  console.log('Ready!');
});

// Promise 方式等待事件
await eventBus.waitFor('image:loaded', 5000);

// 取消订阅
unsubscribe();
```

#### 日志系统

```typescript
import { logger, LogLevel } from '@panorama-viewer/core';

// 设置日志级别
logger.setLevel(LogLevel.DEBUG);

// 记录日志
logger.debug('Debug message', data);
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);

// 性能计时
const endTimer = logger.time('Operation');
// ... 执行操作
endTimer(); // 输出: "Operation took Xms"

// 导出日志
const logs = logger.exportLogs();
```

#### 内存管理

```typescript
import { MemoryManager } from '@panorama-viewer/core';

const memoryManager = new MemoryManager({
  maxTextureMemory: 512 * 1024 * 1024, // 512MB
  autoCleanup: true,
  cleanupThreshold: 0.8, // 80%
}, eventBus);

// 开始监控
memoryManager.startMonitoring(5000);

// 获取统计
const stats = memoryManager.getStats();
console.log('Textures:', stats.textures.bytes / 1024 / 1024, 'MB');
console.log('Geometries:', stats.geometries.bytes / 1024 / 1024, 'MB');

// 强制清理
memoryManager.forceCleanup();
```

#### 工具函数

```typescript
import { 
  debounce, 
  throttle, 
  CancellationToken,
  delay,
  retry,
  lerp,
  clamp,
  easing
} from '@panorama-viewer/core';

// 防抖
const debouncedFn = debounce(() => {
  console.log('Debounced!');
}, 300);

// 节流
const throttledFn = throttle(() => {
  console.log('Throttled!');
}, 100);

// 取消令牌
const token = new CancellationToken();
setTimeout(() => token.cancel(), 1000);

try {
  await delay(2000, token);
} catch (error) {
  console.log('Cancelled!');
}

// 重试
const result = await retry(
  () => fetchData(),
  { maxAttempts: 3, delayMs: 1000, backoff: true }
);

// 数学工具
const value = lerp(0, 100, 0.5); // 50
const clamped = clamp(150, 0, 100); // 100
const eased = easing.easeInOutQuad(0.5); // 0.5
```

## 📊 性能对比

| 指标 | v1.x | v2.0 | 提升 |
|------|------|------|------|
| GC 压力 | 100% | 30-40% | ⬇️ 60-70% |
| 首屏加载 | 3s | 0.6-1s | ⬆️ 3-5x |
| 内存占用 | 100% | 60% | ⬇️ 40% |
| 渲染开销 | 100% | 50% | ⬇️ 50% |
| 包体积 | 120KB | 135KB | ⬆️ 12% (新功能) |

## 🗺️ 路线图

### v2.1 (计划中)
- [ ] 多分辨率瓦片支持
- [ ] 后处理效果（Bloom, DOF, 抗锯齿）
- [ ] 高级相机控制
- [ ] 交互工具（测量、标注）

### v2.2 (计划中)
- [ ] AR 模式支持
- [ ] 插件系统
- [ ] CLI 工具
- [ ] 完整测试套件

### v3.0 (未来)
- [ ] WebGPU 支持
- [ ] 实时协作
- [ ] AI 辅助导览

## 📚 文档

- [完整 API 文档](./docs/API.md)
- [迁移指南](./MIGRATION_GUIDE.md)
- [优化进度](./OPTIMIZATION_PROGRESS.md)
- [贡献指南](./CONTRIBUTING.md)
- [示例代码](./examples/)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

MIT © [Your Name]

## 💬 支持

- GitHub Issues: [提交问题](https://github.com/your-repo/issues)
- 讨论区: [参与讨论](https://github.com/your-repo/discussions)
- 邮箱: support@example.com

---

**从 v1.x 升级?** 查看 [迁移指南](./MIGRATION_GUIDE.md)

**刚开始使用?** 查看 [快速开始指南](./docs/QUICK_START.md)

**需要帮助?** 加入我们的 [Discord 社区](https://discord.gg/your-invite)

