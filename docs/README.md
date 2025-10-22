# 3D Panorama Viewer 文档中心

## 📚 文档导航

### 🚀 快速开始
- [快速开始指南](./QUICK_START.md) - 5 分钟上手
- [API 参考文档](./API_REFERENCE.md) - 完整 API 文档
- [迁移指南](../MIGRATION_GUIDE.md) - v1 到 v2 升级

### 📖 深入学习
- [优化进度报告](../OPTIMIZATION_PROGRESS.md) - 详细的优化内容
- [性能最佳实践](./PERFORMANCE_BEST_PRACTICES.md) - 性能优化技巧
- [实施总结](../实施总结.md) - 中文实施总结

### 💡 示例代码
- [高级示例](../examples/advanced-example/) - 完整功能演示
- [Vue 示例](../examples/vue-demo/) - Vue 3 集成
- [React 示例](../examples/react-demo/) - React 集成
- [Lit 示例](../examples/lit-demo/) - Web Components

---

## 🎯 按主题浏览

### 核心功能
- [事件系统使用](./guides/EVENT_SYSTEM.md)
- [状态管理](./guides/STATE_MANAGEMENT.md)
- [内存管理](./guides/MEMORY_MANAGEMENT.md)
- [日志系统](./guides/LOGGING.md)

### 高级功能
- [视频全景](./guides/VIDEO_PANORAMA.md)
- [空间音频](./guides/SPATIAL_AUDIO.md)
- [VR/AR 支持](./guides/VR_AR.md)
- [HDR 渲染](./guides/HDR_RENDERING.md)

### 交互工具
- [测量工具](./guides/MEASURE_TOOL.md)
- [相机控制](./guides/CAMERA_CONTROL.md)
- [后处理效果](./guides/POST_PROCESSING.md)
- [瓦片系统](./guides/TILE_SYSTEM.md)

### 扩展开发
- [插件开发指南](./guides/PLUGIN_DEVELOPMENT.md)
- [自定义着色器](./guides/CUSTOM_SHADERS.md)
- [框架集成](./guides/FRAMEWORK_INTEGRATION.md)

---

## 🔍 按角色浏览

### 初学者 👶
1. 阅读 [快速开始指南](./QUICK_START.md)
2. 运行基础示例
3. 了解核心 API

### 开发者 👨‍💻
1. 学习 [API 参考](./API_REFERENCE.md)
2. 掌握 [性能最佳实践](./PERFORMANCE_BEST_PRACTICES.md)
3. 查看高级示例

### 架构师 🏗️
1. 研究 [架构设计](../OPTIMIZATION_PROGRESS.md)
2. 了解 [插件系统](./guides/PLUGIN_DEVELOPMENT.md)
3. 阅读源码

---

## 📊 功能速查

### 基础功能
```typescript
import { PanoramaViewer } from '@panorama-viewer/core';

const viewer = new PanoramaViewer({
  container,
  image: 'panorama.jpg',
});
```

### 视频全景
```typescript
import { VideoPanorama } from '@panorama-viewer/core';

const video = new VideoPanorama({
  sources: [...],
  adaptiveBitrate: true,
});
```

### 空间音频
```typescript
import { SpatialAudio } from '@panorama-viewer/core';

const audio = new SpatialAudio(camera);
await audio.initialize();
await audio.addSource('id', options);
```

### VR 模式
```typescript
import { VRManager } from '@panorama-viewer/core';

const vr = new VRManager(renderer, camera, scene);
await vr.enterVR();
```

### 后处理
```typescript
import { PostProcessing } from '@panorama-viewer/core';

const post = new PostProcessing(renderer, scene, camera, {
  bloom: { enabled: true },
});
```

### 测量工具
```typescript
import { MeasureTool } from '@panorama-viewer/core';

const measure = new MeasureTool(scene, camera, container);
measure.activate('distance');
```

### 插件
```typescript
import { PluginManager, SharePlugin } from '@panorama-viewer/core';

const plugins = new PluginManager(eventBus);
await plugins.install(SharePlugin);
```

---

## 🆘 获取帮助

### 常见问题
- [FAQ](./FAQ.md)
- [故障排除](./TROUBLESHOOTING.md)
- [性能问题](./PERFORMANCE_ISSUES.md)

### 社区支持
- 💬 [GitHub Discussions](https://github.com/your-repo/discussions)
- 🐛 [Bug 报告](https://github.com/your-repo/issues/new?template=bug_report.md)
- 💡 [功能请求](https://github.com/your-repo/issues/new?template=feature_request.md)

### 联系方式
- 📧 Email: support@example.com
- 💬 Discord: [加入社区](https://discord.gg/your-invite)
- 🐦 Twitter: [@panorama_viewer](https://twitter.com/panorama_viewer)

---

## 🎓 教程系列

### 入门教程
1. [安装和基础使用](./tutorials/01-installation.md)
2. [添加热点和交互](./tutorials/02-hotspots.md)
3. [配置和定制](./tutorials/03-configuration.md)

### 进阶教程
4. [使用事件系统](./tutorials/04-events.md)
5. [性能优化技巧](./tutorials/05-performance.md)
6. [视频全景集成](./tutorials/06-video.md)

### 高级教程
7. [VR 体验开发](./tutorials/07-vr.md)
8. [空间音频设计](./tutorials/08-audio.md)
9. [自定义插件开发](./tutorials/09-plugins.md)
10. [瓦片系统使用](./tutorials/10-tiles.md)

---

## 📦 版本说明

### v2.0 (当前版本)
- ✅ 全新架构
- ✅ 性能大幅提升
- ✅ 丰富的高级功能
- ✅ 完整的文档

### v1.x (旧版本)
- [v1.x 文档](./v1/)
- [升级到 v2.0](../MIGRATION_GUIDE.md)

---

## 🗺️ 文档地图

```
docs/
├── README.md (本文档)
├── QUICK_START.md (快速开始)
├── API_REFERENCE.md (API 参考)
├── PERFORMANCE_BEST_PRACTICES.md (性能最佳实践)
├── guides/ (详细指南)
│   ├── EVENT_SYSTEM.md
│   ├── VIDEO_PANORAMA.md
│   ├── SPATIAL_AUDIO.md
│   ├── VR_AR.md
│   ├── PLUGIN_DEVELOPMENT.md
│   └── ...
├── tutorials/ (教程系列)
│   ├── 01-installation.md
│   ├── 02-hotspots.md
│   └── ...
└── examples/ (示例代码)
    ├── advanced-example/
    ├── vue-demo/
    └── react-demo/
```

---

## 🌟 推荐阅读路径

### 路径 1: 快速上手 (30 分钟)
1. [快速开始](./QUICK_START.md) (10 分钟)
2. [基础示例](../examples/vue-demo/) (10 分钟)
3. [API 参考](./API_REFERENCE.md) (10 分钟)

### 路径 2: 深入理解 (2 小时)
1. [优化进度](../OPTIMIZATION_PROGRESS.md) (30 分钟)
2. [性能最佳实践](./PERFORMANCE_BEST_PRACTICES.md) (30 分钟)
3. [高级示例](../examples/advanced-example/) (30 分钟)
4. [源码阅读](../packages/core/src/) (30 分钟)

### 路径 3: 专家进阶 (1 周)
1. 完整 API 学习
2. 所有教程学习
3. 插件开发实践
4. 性能优化实践
5. 贡献代码

---

## 🎁 资源下载

### 示例资源
- [示例全景图](https://example.com/assets/panoramas.zip)
- [示例视频](https://example.com/assets/videos.zip)
- [示例音频](https://example.com/assets/audio.zip)
- [HDR 环境贴图](https://example.com/assets/hdri.zip)

### 工具
- [全景图转换工具](https://example.com/tools/converter)
- [瓦片生成器](https://example.com/tools/tile-generator)
- [性能分析工具](https://example.com/tools/profiler)

---

## 📝 参与贡献

我们欢迎各种形式的贡献！

- 📖 [改进文档](https://github.com/your-repo/blob/main/CONTRIBUTING.md#documentation)
- 🐛 [修复 Bug](https://github.com/your-repo/blob/main/CONTRIBUTING.md#bug-fixes)
- ✨ [添加功能](https://github.com/your-repo/blob/main/CONTRIBUTING.md#features)
- 🧪 [编写测试](https://github.com/your-repo/blob/main/CONTRIBUTING.md#tests)

---

**Happy Learning! 🎉**

有任何问题或建议，欢迎[提 Issue](https://github.com/your-repo/issues/new)！

