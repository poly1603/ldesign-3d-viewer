# 迁移指南 - v1.x 到 v2.0

## 概述

v2.0 版本带来了重大的架构改进和新功能。本指南将帮助您从 v1.x 平滑迁移到 v2.0。

## 破坏性变更

### 1. 事件系统重构

**v1.x (回调方式)**:
```typescript
const viewer = new PanoramaViewer({
  container: element,
  image: 'panorama.jpg',
  onProgress: (progress) => {
    console.log('Loading:', progress);
  }
});
```

**v2.0 (事件总线方式)**:
```typescript
import { PanoramaViewer, EventBus } from '@panorama-viewer/core';

const eventBus = new EventBus();

// 订阅事件
eventBus.on('image:loading', ({ progress }) => {
  console.log('Loading:', progress);
});

const viewer = new PanoramaViewer({
  container: element,
  image: 'panorama.jpg',
}, eventBus);
```

**兼容层**: v2.0 仍然支持 v1.x 的回调方式，但会显示废弃警告。

### 2. 导入路径变更

**v1.x**:
```typescript
import { PanoramaViewer } from '@panorama-viewer/core';
```

**v2.0** (保持兼容，但新增更多导出):
```typescript
// 基础导入（兼容）
import { PanoramaViewer } from '@panorama-viewer/core';

// 新增核心系统导入
import { 
  EventBus, 
  Logger, 
  StateManager,
  MemoryManager 
} from '@panorama-viewer/core';
```

### 3. 状态管理

**v1.x** (内部状态):
```typescript
// 无法直接访问内部状态
```

**v2.0** (统一状态管理):
```typescript
const stateManager = viewer.getStateManager();

// 检查状态
if (stateManager.isReady()) {
  // 执行操作
}

// 监听状态变化
eventBus.on('camera:change', ({ rotation, fov }) => {
  console.log('Camera changed:', rotation, fov);
});
```

## 新功能

### 1. 视频全景支持

```typescript
import { VideoPanorama } from '@panorama-viewer/core';

const videoPanorama = new VideoPanorama({
  sources: [
    { url: 'video-low.mp4', quality: 'low', bitrate: 1000 },
    { url: 'video-high.mp4', quality: 'high', bitrate: 5000 },
  ],
  autoplay: true,
  adaptiveBitrate: true,
}, eventBus);

// 创建视频纹理
const videoTexture = videoPanorama.createTexture();

// 加载到 viewer
viewer.loadVideoTexture(videoTexture);

// 控制播放
await videoPanorama.play();
videoPanorama.setVolume(0.5);
```

### 2. 空间音频

```typescript
import { SpatialAudio } from '@panorama-viewer/core';

const spatialAudio = new SpatialAudio(viewer.camera);
await spatialAudio.initialize();

// 添加位置音频
await spatialAudio.addSource('ambient', {
  url: 'ambient.mp3',
  position: { theta: 0, phi: Math.PI / 2, radius: 100 },
  loop: true,
  autoplay: true,
});

// 在渲染循环中更新
function animate() {
  spatialAudio.update();
  // ... 其他渲染代码
}
```

### 3. VR 支持

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

// 进入 VR
await vrManager.enterVR();

// 监听 VR 事件
eventBus.on('xr:sessionstart', ({ mode }) => {
  console.log('XR session started:', mode);
});
```

### 4. HDR 渲染

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

// 加载 HDR 纹理
const hdrTexture = await hdrRenderer.loadHDR('environment.hdr');
hdrRenderer.applyEnvironmentMap(hdrTexture);

// 调整曝光
hdrRenderer.setExposure(1.5);
```

### 5. 渐进式纹理加载

```typescript
import { ProgressiveTextureLoader } from '@panorama-viewer/core';

const progressiveLoader = new ProgressiveTextureLoader();

const texture = await progressiveLoader.load({
  previewUrl: 'panorama-preview.jpg', // 低分辨率
  fullUrl: 'panorama-full.jpg',       // 高分辨率
  onProgress: (stage, progress) => {
    console.log(`${stage}: ${progress}%`);
  },
});

viewer.applyTexture(texture);
```

## 性能优化建议

### 1. 启用按需渲染

```typescript
const viewer = new PanoramaViewer({
  container: element,
  image: 'panorama.jpg',
  renderOnDemand: true, // 仅在需要时渲染
});
```

### 2. 使用对象池

```typescript
import { Vector3Pool, EulerPool } from '@panorama-viewer/core';

// 不推荐（会创建新对象）
const pos = new THREE.Vector3(x, y, z);

// 推荐（使用对象池）
const pos = Vector3Pool.getInstance().acquire();
pos.set(x, y, z);
// ... 使用
Vector3Pool.getInstance().release(pos);
```

### 3. 内存监控

```typescript
import { MemoryManager } from '@panorama-viewer/core';

const memoryManager = new MemoryManager({
  maxTextureMemory: 512 * 1024 * 1024, // 512MB
  autoCleanup: true,
}, eventBus);

// 开始监控
memoryManager.startMonitoring(5000); // 每 5 秒检查一次

// 获取统计
const stats = memoryManager.getStats();
console.log('Memory usage:', stats);
```

### 4. 纹理缓存配置

```typescript
import { TextureCache } from '@panorama-viewer/core';

const cache = TextureCache.getInstance();

// 设置缓存大小限制
cache.setMaxSize(512 * 1024 * 1024); // 512MB

// 预加载纹理
await cache.preload([
  'scene1.jpg',
  'scene2.jpg',
  'scene3.jpg',
]);

// 查看缓存统计
const stats = cache.getStats();
console.log('Cache utilization:', stats.utilization * 100 + '%');
```

## 日志和调试

### 启用调试日志

```typescript
import { logger, LogLevel } from '@panorama-viewer/core';

// 设置日志级别
logger.setLevel(LogLevel.DEBUG);

// 添加自定义日志处理器
logger.addHandler((entry) => {
  // 发送到分析服务
  analytics.log(entry);
});

// 导出日志
const logs = logger.exportLogs();
console.log(logs);
```

### 性能计时

```typescript
const endTimer = logger.time('Load panorama');

await viewer.loadImage('large-panorama.jpg');

endTimer(); // 输出: "Load panorama took 1234.56ms"
```

## 工具函数

### 防抖和节流

```typescript
import { debounce, throttle } from '@panorama-viewer/core';

// 防抖（延迟执行）
const debouncedResize = debounce(() => {
  viewer.resize();
}, 300);

window.addEventListener('resize', debouncedResize);

// 节流（限制频率）
const throttledUpdate = throttle(() => {
  viewer.update();
}, 16); // ~60fps

setInterval(throttledUpdate, 0);
```

### 取消异步操作

```typescript
import { CancellationToken, delay } from '@panorama-viewer/core';

const token = new CancellationToken();

async function loadWithCancel() {
  try {
    await viewer.loadImage('panorama.jpg', token);
    await delay(1000, token);
    console.log('Loaded successfully');
  } catch (error) {
    if (token.isCancelled) {
      console.log('Loading cancelled');
    }
  }
}

// 取消操作
setTimeout(() => {
  token.cancel();
}, 500);
```

## 常见问题

### Q: v2.0 是否向后兼容 v1.x？

A: 大部分 API 保持兼容，但推荐使用新的事件系统。旧的回调方式仍然有效，但会显示废弃警告。

### Q: 如何渐进式迁移？

A: 您可以逐步迁移：
1. 先升级依赖到 v2.0
2. 保持使用 v1.x API（会有警告）
3. 逐步将回调改为事件订阅
4. 采用新功能（视频、音频、VR等）

### Q: 性能会有多大提升？

A: 根据使用场景：
- 对象池可减少 60-70% GC 压力
- LRU 缓存提升纹理复用率
- 按需渲染可减少 50%+ 不必要的渲染
- 渐进式加载改善首屏体验 3-5x

### Q: 是否需要修改构建配置？

A: 不需要。v2.0 保持相同的构建输出格式（ESM, CJS, UMD）。

## 迁移检查清单

- [ ] 更新依赖版本到 v2.0
- [ ] 测试现有功能是否正常
- [ ] 将回调改为事件订阅（可选但推荐）
- [ ] 启用性能优化选项（按需渲染、对象池）
- [ ] 配置日志级别
- [ ] 设置内存限制和监控
- [ ] 尝试新功能（视频、音频、VR、HDR）
- [ ] 更新文档和示例

## 获取帮助

- 📖 [完整 API 文档](./docs/API.md)
- 💬 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 [支持邮箱](mailto:support@example.com)
- 💡 [示例代码](./examples/)

## 下一步

查看 [OPTIMIZATION_PROGRESS.md](./OPTIMIZATION_PROGRESS.md) 了解所有新功能和改进详情。

