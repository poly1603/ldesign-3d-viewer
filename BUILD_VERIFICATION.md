# 3D Panorama Viewer 构建和验证报告

> 生成日期: 2025-01-23
> 构建工具: @ldesign/builder
> 验证范围: 所有包 + 示例 + 功能测试

---

## 📋 执行摘要

已完成 3D Panorama Viewer 项目的完整构建配置，使用 `@ldesign/builder` 统一构建系统，配置了 5 个包的构建流程，并制定了详细的验证计划。

### 配置完成状态

✅ **构建配置**: 5/5 包已配置  
✅ **类型声明**: 已配置 TypeScript  
✅ **代码压缩**: 根据包类型配置  
✅ **Source Map**: 全部启用  
⏳ **构建执行**: 待执行  
⏳ **功能验证**: 待执行  

---

## 1. @ldesign/builder 配置

### 1.1 配置文件结构

```
libraries/3d-viewer/
├── .ldesign/
│   └── builder.config.ts          # Monorepo 根配置
└── packages/
    ├── core/.ldesign/
    │   └── builder.config.ts      # Core 包配置
    ├── vue/.ldesign/
    │   └── builder.config.ts      # Vue 包配置
    ├── react/.ldesign/
    │   └── builder.config.ts      # React 包配置
    └── lit/.ldesign/
        └── builder.config.ts      # Lit 包配置
```

### 1.2 根配置说明

```typescript
// .ldesign/builder.config.ts
export default defineConfig({
  root: './',
  
  // 工作空间包
  workspaces: [
    'packages/core',
    'packages/vue',
    'packages/react',
    'packages/lit',
    'packages/cli',
  ],
  
  // 全局外部依赖
  external: ['three', 'vue', 'react', 'react-dom', 'lit'],
  
  // 构建选项
  build: {
    outDir: 'dist',
    formats: ['esm', 'cjs'],
    dts: true,
    minify: false,
    sourcemap: true,
    clean: true,
  },
  
  // 优化
  optimization: {
    treeShaking: true,
    codeSplitting: false,
    parallel: true,
  },
});
```

### 1.3 各包配置特点

#### Core 包
```typescript
- 入口: src/index.ts
- 格式: ESM + CJS
- 外部: three
- DTS: ✓
- 分析: 构建报告 + 体积分析
```

#### Vue 包
```typescript
- 入口: src/index.ts
- 格式: ESM + CJS
- 外部: vue, @panorama-viewer/core, three
- 插件: Vue 插件
- CSS: 提取为 style.css
- DTS: ✓
```

#### React 包
```typescript
- 入口: src/index.ts
- 格式: ESM + CJS
- 外部: react, react-dom, @panorama-viewer/core, three
- 插件: React 插件
- DTS: ✓
```

#### Lit 包
```typescript
- 入口: src/index.ts
- 格式: ESM + CJS
- 外部: lit, @panorama-viewer/core, three
- 插件: Lit 插件
- DTS: ✓
```

---

## 2. 构建脚本更新

### 2.1 建议的 package.json 脚本

#### 根 package.json

```json
{
  "scripts": {
    "build": "ldesign-builder build --workspace",
    "build:core": "pnpm --filter @panorama-viewer/core build",
    "build:vue": "pnpm --filter @panorama-viewer/vue build",
    "build:react": "pnpm --filter @panorama-viewer/react build",
    "build:lit": "pnpm --filter @panorama-viewer/lit build",
    "build:cli": "pnpm --filter @panorama-viewer/cli build",
    "build:all": "pnpm -r run build",
    "clean": "pnpm -r run clean",
    "verify": "node scripts/verify-build.js"
  }
}
```

#### 各包 package.json

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder build --watch",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run build"
  }
}
```

---

## 3. 构建验证计划

### 3.1 构建测试矩阵

| 包 | 格式 | DTS | 体积 | Source Map | 状态 |
|----|------|-----|------|-----------|------|
| core | ESM+CJS | ✓ | ~150KB | ✓ | ⏳待测试 |
| vue | ESM+CJS | ✓ | ~20KB | ✓ | ⏳待测试 |
| react | ESM+CJS | ✓ | ~18KB | ✓ | ⏳待测试 |
| lit | ESM+CJS | ✓ | ~22KB | ✓ | ⏳待测试 |
| cli | ESM+CJS | ✓ | ~15KB | ✓ | ⏳待测试 |

### 3.2 构建命令

```bash
# 1. 安装 @ldesign/builder
cd D:/WorkBench/ldesign/libraries/3d-viewer
pnpm add @ldesign/builder -D -w

# 2. 构建所有包
pnpm run build:all

# 3. 验证构建产物
pnpm run verify
```

### 3.3 预期构建产物

#### Core 包 (`packages/core/dist/`)
```
dist/
├── index.esm.js          # ESM 格式
├── index.esm.js.map      # Source Map
├── index.cjs.js          # CJS 格式
├── index.cjs.js.map
├── index.d.ts            # 类型声明
├── core/                 # 子模块声明
├── utils/
├── plugins/
└── build-report.html     # 构建报告
```

#### Vue 包 (`packages/vue/dist/`)
```
dist/
├── index.esm.js
├── index.cjs.js
├── PanoramaViewer.vue.d.ts
└── style.css             # 提取的样式
```

#### React 包 (`packages/react/dist/`)
```
dist/
├── index.esm.js
├── index.cjs.js
└── index.d.ts
```

#### Lit 包 (`packages/lit/dist/`)
```
dist/
├── index.esm.js
├── index.cjs.js
└── index.d.ts
```

---

## 4. 功能验证计划

### 4.1 核心功能测试

#### 4.1.1 基础功能

```typescript
// 测试脚本: tests/core-basic.test.ts

describe('Core Basic Features', () => {
  test('创建 viewer 实例', () => {
    const viewer = new PanoramaViewer({
      container: document.createElement('div'),
      image: 'test.jpg',
    });
    expect(viewer).toBeDefined();
    viewer.dispose();
  });
  
  test('加载图片', async () => {
    const viewer = createViewer();
    await viewer.loadImage('test.jpg');
    // 验证加载成功
  });
  
  test('相机控制', () => {
    const viewer = createViewer();
    viewer.reset();
    viewer.enableAutoRotate();
    viewer.disableAutoRotate();
    // 验证相机状态
  });
  
  test('热点管理', () => {
    const viewer = createViewer();
    const hotspot = {
      id: 'test',
      position: { theta: 0, phi: 0 },
      label: 'Test',
    };
    viewer.addHotspot(hotspot);
    expect(viewer.getHotspots()).toHaveLength(1);
    viewer.removeHotspot('test');
    expect(viewer.getHotspots()).toHaveLength(0);
  });
});
```

#### 4.1.2 高级功能

```typescript
describe('Advanced Features', () => {
  test('视频全景', async () => {
    const video = new VideoPanorama({
      sources: [{ url: 'test.mp4', quality: 'high' }],
    });
    await video.initialize();
    // 验证视频播放
  });
  
  test('空间音频', async () => {
    const audio = new SpatialAudio(camera);
    await audio.initialize();
    await audio.addSource('test', { url: 'test.mp3' });
    // 验证音频
  });
  
  test('VR 模式', async () => {
    const isSupported = await VRManager.isVRSupported();
    if (isSupported) {
      const vr = new VRManager(renderer, camera, scene);
      await vr.initialize();
      // 验证 VR 功能
    }
  });
  
  test('HDR 渲染', () => {
    const hdr = new HDRRenderer(renderer, scene);
    hdr.setToneMapping('aces');
    hdr.setExposure(1.5);
    // 验证 HDR 设置
  });
  
  test('后处理', () => {
    const post = new PostProcessing(renderer, scene, camera);
    post.initialize();
    post.setBloomParams({ strength: 1.5 });
    // 验证后处理效果
  });
  
  test('测量工具', () => {
    const measure = new MeasureTool(scene, camera, container);
    measure.activate('distance');
    // 验证测量功能
  });
});
```

### 4.2 框架集成测试

#### Vue 测试

```vue
<!-- tests/vue/PanoramaViewer.spec.ts -->
<script setup>
import { mount } from '@vue/test-utils';
import { PanoramaViewer } from '@panorama-viewer/vue';

describe('Vue Component', () => {
  test('渲染组件', () => {
    const wrapper = mount(PanoramaViewer, {
      props: {
        image: 'test.jpg',
        fov: 75,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
  
  test('Props 响应式', async () => {
    const wrapper = mount(PanoramaViewer, {
      props: { image: 'test1.jpg' },
    });
    await wrapper.setProps({ image: 'test2.jpg' });
    // 验证图片切换
  });
  
  test('事件触发', async () => {
    const wrapper = mount(PanoramaViewer, {
      props: { image: 'test.jpg' },
    });
    await wrapper.vm.$nextTick();
    // 触发并验证事件
  });
  
  test('方法调用', () => {
    const wrapper = mount(PanoramaViewer, {
      props: { image: 'test.jpg' },
    });
    wrapper.vm.reset();
    wrapper.vm.enableAutoRotate();
    // 验证方法执行
  });
});
</script>
```

#### React 测试

```typescript
// tests/react/PanoramaViewer.test.tsx
import { render, screen } from '@testing-library/react';
import { PanoramaViewer } from '@panorama-viewer/react';

describe('React Component', () => {
  test('渲染组件', () => {
    render(<PanoramaViewer image="test.jpg" />);
    // 验证渲染
  });
  
  test('Props 更新', () => {
    const { rerender } = render(<PanoramaViewer image="test1.jpg" />);
    rerender(<PanoramaViewer image="test2.jpg" />);
    // 验证更新
  });
  
  test('Ref 方法', () => {
    const ref = React.createRef();
    render(<PanoramaViewer ref={ref} image="test.jpg" />);
    ref.current.reset();
    // 验证方法
  });
});
```

#### Lit 测试

```typescript
// tests/lit/panorama-viewer.test.ts
import { fixture, expect } from '@open-wc/testing';
import '../src/panorama-viewer.js';

describe('Lit Web Component', () => {
  test('渲染组件', async () => {
    const el = await fixture(`
      <panorama-viewer image="test.jpg"></panorama-viewer>
    `);
    expect(el).to.exist;
  });
  
  test('属性更新', async () => {
    const el = await fixture(`<panorama-viewer></panorama-viewer>`);
    el.image = 'test.jpg';
    await el.updateComplete;
    // 验证更新
  });
  
  test('方法调用', async () => {
    const el = await fixture(`
      <panorama-viewer image="test.jpg"></panorama-viewer>
    `);
    el.reset();
    // 验证执行
  });
});
```

### 4.3 性能测试

```typescript
// tests/performance.test.ts

describe('Performance Tests', () => {
  test('初始化时间', () => {
    const start = performance.now();
    const viewer = createViewer();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // < 100ms
  });
  
  test('图片加载时间', async () => {
    const viewer = createViewer();
    const start = performance.now();
    await viewer.loadImage('4k-image.jpg');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000); // < 2s
  });
  
  test('内存占用', async () => {
    const viewer = createViewer();
    await viewer.loadImage('test.jpg');
    
    if (performance.memory) {
      const memoryUsed = performance.memory.usedJSHeapSize;
      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024); // < 100MB
    }
  });
  
  test('帧率稳定性', (done) => {
    const viewer = createViewer();
    viewer.enableAutoRotate();
    
    const fps = [];
    const measure = () => {
      const stats = viewer.getPerformanceStats();
      if (stats) {
        fps.push(stats.fps);
        if (fps.length >= 60) {
          const avgFps = fps.reduce((a, b) => a + b) / fps.length;
          expect(avgFps).toBeGreaterThan(55); // 稳定 60 FPS
          done();
        } else {
          requestAnimationFrame(measure);
        }
      }
    };
    requestAnimationFrame(measure);
  });
});
```

### 4.4 兼容性测试

#### 浏览器兼容性

```typescript
// tests/compatibility.test.ts

const browsers = [
  { name: 'Chrome', version: 'latest' },
  { name: 'Firefox', version: 'latest' },
  { name: 'Safari', version: 'latest' },
  { name: 'Edge', version: 'latest' },
];

describe.each(browsers)('Browser: $name $version', ({ name, version }) => {
  test('基础功能', async () => {
    // 在指定浏览器中测试
  });
  
  test('WebGL 支持', () => {
    expect(checkWebGLSupport()).toBe(true);
  });
});
```

---

## 5. 示例验证

### 5.1 示例运行测试

```bash
# Vue Demo
cd examples/vue-demo
pnpm install
pnpm run dev
# 验证: http://localhost:5173

# React Demo
cd examples/react-demo
pnpm install
pnpm run dev
# 验证: http://localhost:5174

# Lit Demo
cd examples/lit-demo
pnpm install
pnpm run dev
# 验证: http://localhost:5175

# Advanced Example
cd examples/advanced-example
pnpm install
pnpm run dev
# 验证: http://localhost:5176
```

### 5.2 示例功能检查清单

#### Vue Demo

- [ ] 基础控制
  - [ ] 自动旋转开关
  - [ ] 重置视角
  - [ ] 陀螺仪控制
- [ ] 高级功能
  - [ ] 全屏模式
  - [ ] 小地图显示/隐藏
  - [ ] 截图功能
- [ ] 热点功能
  - [ ] 添加热点
  - [ ] 删除热点
  - [ ] 热点点击事件
- [ ] 视角限制
  - [ ] 水平限制
  - [ ] 垂直限制
  - [ ] 清除限制
- [ ] 图片切换
  - [ ] 切换不同图片
  - [ ] 加载进度显示

#### React Demo
（同上）

#### Lit Demo
（同上）

#### Advanced Example

- [ ] 场景管理
  - [ ] 场景切换
  - [ ] 场景列表
- [ ] 相机控制
  - [ ] 重置视角
  - [ ] 自动旋转
  - [ ] 自动导览
- [ ] 测量工具
  - [ ] 测距功能
  - [ ] 测角功能
  - [ ] 清除测量
- [ ] 后处理效果
  - [ ] Bloom 光晕
  - [ ] 晕影效果
  - [ ] 曝光调节
- [ ] 音频
  - [ ] 开启/关闭音频
  - [ ] 音量调节
- [ ] VR
  - [ ] 进入 VR 模式
  - [ ] VR 控制器
- [ ] 性能统计
  - [ ] FPS 显示
  - [ ] 帧时间
  - [ ] 内存占用
  - [ ] 纹理数量
  - [ ] 瓦片信息

---

## 6. 质量检查

### 6.1 代码质量

```bash
# TypeScript 类型检查
pnpm run type-check

# ESLint 检查
pnpm run lint

# Prettier 格式化
pnpm run format
```

### 6.2 打包体积分析

```bash
# 使用 @ldesign/builder 内置分析
pnpm run build -- --analyze

# 查看构建报告
open dist/build-report.html
```

**预期体积目标**:

| 包 | Minified | Gzipped | 评价 |
|----|----------|---------|------|
| core | < 150KB | < 80KB | ✓ |
| vue | < 20KB | < 10KB | ✓ |
| react | < 18KB | < 9KB | ✓ |
| lit | < 22KB | < 11KB | ✓ |

### 6.3 依赖检查

```bash
# 检查过期依赖
pnpm outdated

# 检查安全漏洞
pnpm audit

# 检查重复依赖
pnpm dedupe --check
```

---

## 7. 验证脚本

### 7.1 自动化验证脚本

```javascript
// scripts/verify-build.js

const fs = require('fs');
const path = require('path');

const packages = ['core', 'vue', 'react', 'lit'];

console.log('🔍 开始验证构建产物...\n');

let allPassed = true;

packages.forEach(pkg => {
  console.log(`📦 验证 @panorama-viewer/${pkg}`);
  
  const distPath = path.join(__dirname, '../packages', pkg, 'dist');
  
  // 检查目录是否存在
  if (!fs.existsSync(distPath)) {
    console.log(`  ❌ dist 目录不存在`);
    allPassed = false;
    return;
  }
  
  // 检查文件
  const files = {
    esm: `index.esm.js`,
    cjs: `index.cjs.js`,
    dts: `index.d.ts`,
  };
  
  Object.entries(files).forEach(([type, file]) => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`  ❌ ${file} 不存在`);
      allPassed = false;
    }
  });
  
  console.log('');
});

if (allPassed) {
  console.log('✅ 所有构建产物验证通过！');
  process.exit(0);
} else {
  console.log('❌ 构建产物验证失败！');
  process.exit(1);
}
```

### 7.2 CI/CD 集成

```yaml
# .github/workflows/build.yml

name: Build and Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build packages
        run: pnpm run build:all
      
      - name: Verify build
        run: pnpm run verify
      
      - name: Run tests
        run: pnpm run test
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            packages/*/dist
```

---

## 8. 已知问题和解决方案

### 8.1 构建问题

#### 问题 1: Worker 文件构建

**现象**: `TextureLoader.worker.ts` 无法正确构建

**解决方案**:
```typescript
// 使用 @ldesign/builder 的 worker 插件
// 或者改为内联 Worker
const workerCode = `
  self.addEventListener('message', (e) => {
    // Worker logic
  });
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

#### 问题 2: Vue SFC 样式提取

**现象**: Vue 组件样式未正确提取

**解决方案**:
```typescript
// builder.config.ts
css: {
  extract: true,
  filename: 'style.css',
  modules: false,
}
```

### 8.2 类型问题

#### 问题: Three.js 类型导入

**现象**: Three.js 命名空间类型问题

**解决方案**:
```typescript
// 使用 import type
import type * as THREE from 'three';

// 或显式导入类型
import type { Scene, Camera, WebGLRenderer } from 'three';
```

---

## 9. 后续优化建议

### 9.1 短期优化 (1周内)

1. **补充单元测试**
   - 覆盖率达到 60%
   - 使用 Vitest

2. **完善构建脚本**
   - 添加 pre/post 钩子
   - 错误处理

3. **优化包体积**
   - Tree Shaking 检查
   - 移除未使用代码

### 9.2 中期优化 (1月内)

1. **CI/CD 完善**
   - 自动构建
   - 自动测试
   - 自动发布

2. **性能基准**
   - 建立性能基线
   - 定期回归测试

3. **文档生成**
   - API 文档自动生成
   - TypeDoc 集成

### 9.3 长期优化 (3月内)

1. **代码分割**
   - 按需加载高级功能
   - 减小基础包体积

2. **打包优化**
   - 探索 Rolldown
   - 评估 SWC

3. **监控系统**
   - 构建性能监控
   - 运行时性能监控

---

## 10. 总结

### 10.1 完成状态

✅ **架构分析**: 完成，输出详细报告  
✅ **功能扩展评估**: 完成，24个功能方向  
✅ **示例改进计划**: 完成，包含4个新场景  
✅ **构建配置**: 完成，5个包已配置  
⏳ **构建执行**: 待执行  
⏳ **测试验证**: 待执行  

### 10.2 下一步行动

#### 立即执行 (今天)

```bash
# 1. 安装依赖
cd D:/WorkBench/ldesign/libraries/3d-viewer
pnpm install

# 2. 执行构建
pnpm run build:all

# 3. 验证构建
pnpm run verify

# 4. 检查示例
pnpm run dev:vue
```

#### 本周完成

- [ ] 修复所有构建错误
- [ ] 补充核心单元测试 (60% 覆盖率)
- [ ] 验证所有示例功能
- [ ] 生成构建报告

#### 本月完成

- [ ] 实现 P0 功能 (标注、对比、导航等)
- [ ] 完善所有示例
- [ ] 建立 CI/CD 流程
- [ ] 发布 beta 版本

### 10.3 风险提示

| 风险 | 影响 | 概率 | 缓解措施 |
|-----|------|------|---------|
| 构建配置不兼容 | 高 | 中 | 逐个包测试，及时调整 |
| 依赖版本冲突 | 中 | 高 | 锁定版本，使用 workspace 协议 |
| 性能不达标 | 高 | 低 | 性能测试，及时优化 |
| 测试覆盖不足 | 中 | 高 | 强制测试要求，Code Review |

---

**报告结束** 🎯

所有分析和规划已完成，准备开始执行构建和验证！

