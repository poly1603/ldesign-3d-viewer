# 原生JavaScript演示

这是一个使用纯HTML + JavaScript的3D全景查看器演示，无需任何构建工具。

## 🚀 快速开始

### 方式1: 使用本地构建（开发）

1. 确保已构建core包：
```bash
cd ../../packages/core
pnpm build
```

2. 直接在浏览器中打开 `index.html`

### 方式2: 使用CDN（生产）

编辑 `index.html`，取消注释CDN引入：

```html
<!-- 使用CDN -->
<script src="https://cdn.jsdelivr.net/npm/@panorama-viewer/core@2.0.0/dist/panorama-viewer.min.js"></script>
```

注释掉本地引入：

```html
<!-- 使用本地构建（开发时） -->
<!-- <script src="../../packages/core/dist/panorama-viewer.js"></script> -->
```

## 📦 UMD构建说明

Core包提供了UMD格式的构建文件，可以直接在浏览器中使用：

- `panorama-viewer.js` - 未压缩版本（用于开发调试）
- `panorama-viewer.min.js` - 压缩版本（用于生产环境）

### 全局对象

UMD构建会在全局作用域创建 `PanoramaViewer` 对象，包含所有导出的类和函数：

```javascript
// 主类
const viewer = new PanoramaViewer.PanoramaViewer({...});

// 工具函数和管理器
const capability = PanoramaViewer.deviceCapability;
const formats = PanoramaViewer.formatDetector;
const power = PanoramaViewer.powerManager;

// 其他导出
const { EventBus, Logger, StateManager, ... } = PanoramaViewer;
```

## 🎯 特性演示

这个示例演示了以下功能：

### 基础功能
- ✅ 鼠标拖拽旋转
- ✅ 滚轮缩放
- ✅ 键盘控制
- ✅ 触屏手势
- ✅ 陀螺仪支持

### 高级功能
- ✅ 自动旋转
- ✅ 全屏模式
- ✅ 小地图导航
- ✅ 热点标记
- ✅ 视角限制
- ✅ 截图功能
- ✅ 图片切换

### 优化功能（v2.1新增）
- ✅ 设备性能检测
- ✅ 自动格式检测（WebP/AVIF）
- ✅ 电源管理（省电模式）
- ✅ 加载进度显示
- ✅ 智能质量调整

## 📖 API使用示例

### 基本初始化

```javascript
const viewer = new PanoramaViewer.PanoramaViewer({
  container: document.getElementById('viewer'),
  image: 'path/to/panorama.jpg',
  fov: 75,
  autoRotate: false,
  onProgress: (progress) => {
    console.log('Loading:', progress + '%');
  }
});
```

### 使用设备能力检测

```javascript
// 获取推荐设置
const settings = PanoramaViewer.deviceCapability.getRecommendedSettings();

const viewer = new PanoramaViewer.PanoramaViewer({
  container: document.getElementById('viewer'),
  image: 'panorama.jpg',
  ...settings  // 应用推荐设置
});

// 获取设备报告
const report = PanoramaViewer.deviceCapability.generateReport();
console.log(report);
```

### 电源管理

```javascript
// 启动电源监控
PanoramaViewer.powerManager.startMonitoring();

// 监听电源模式变化
PanoramaViewer.powerManager.onChange((mode) => {
  console.log('Power mode:', mode.mode);
  console.log('Target FPS:', mode.targetFPS);
});

// 停止监控
PanoramaViewer.powerManager.stopMonitoring();
```

### 格式检测

```javascript
// 检测浏览器支持的图片格式
const support = PanoramaViewer.formatDetector.getSupport();
console.log('WebP support:', support.webp);
console.log('AVIF support:', support.avif);

// 选择最佳格式
const bestFormat = PanoramaViewer.formatDetector.getBestFormat(['webp', 'jpg']);
console.log('Best format:', bestFormat);
```

### 热点管理

```javascript
// 添加热点
viewer.addHotspot({
  id: 'hotspot-1',
  position: { theta: 0, phi: Math.PI / 2 },
  label: '📍 景点1',
  data: { name: '景点名称', description: '描述' }
});

// 获取所有热点
const hotspots = viewer.getHotspots();

// 移除热点
viewer.removeHotspot('hotspot-1');
```

### 视角控制

```javascript
// 启用自动旋转
viewer.enableAutoRotate();

// 禁用自动旋转
viewer.disableAutoRotate();

// 重置视角
viewer.reset();

// 设置视角限制
viewer.setViewLimits({
  minTheta: -Math.PI / 4,
  maxTheta: Math.PI / 4,
  minPhi: Math.PI / 3,
  maxPhi: 2 * Math.PI / 3
});

// 清除限制
viewer.setViewLimits(null);
```

### 全屏和截图

```javascript
// 进入全屏
await viewer.enterFullscreen();

// 退出全屏
viewer.exitFullscreen();

// 检查是否全屏
const isFullscreen = viewer.isFullscreen();

// 截图
const dataURL = viewer.screenshot(1920, 1080);
```

### 清理资源

```javascript
// 销毁查看器
viewer.dispose();

// 停止电源监控
PanoramaViewer.powerManager.stopMonitoring();
```

## 🌐 CDN链接

### jsDelivr
```html
<!-- Three.js -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- Panorama Viewer -->
<script src="https://cdn.jsdelivr.net/npm/@panorama-viewer/core@2.0.0/dist/panorama-viewer.min.js"></script>
```

### unpkg
```html
<!-- Three.js -->
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>

<!-- Panorama Viewer -->
<script src="https://unpkg.com/@panorama-viewer/core@2.0.0/dist/panorama-viewer.min.js"></script>
```

## 📱 移动端支持

- ✅ 触屏手势（拖拽、缩放）
- ✅ 设备方向感应
- ✅ 响应式布局
- ✅ 性能优化（低端设备自动降级）

## ⚠️ 注意事项

1. **依赖**: 必须先加载Three.js，再加载Panorama Viewer
2. **CORS**: 加载外部图片时需要正确配置CORS
3. **HTTPS**: 陀螺仪功能需要HTTPS环境
4. **性能**: 大图片可能需要较长加载时间，建议使用适当大小的图片

## 📚 更多资源

- [完整API文档](../../README.md)
- [Vue示例](../vue-demo)
- [React示例](../react-demo)
- [Lit示例](../lit-demo)

