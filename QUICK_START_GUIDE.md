# 🚀 3D Panorama Viewer 快速执行指南

> 这是基于完整分析后的快速执行指南  
> 完整报告请查看: [README_ANALYSIS.md](./README_ANALYSIS.md)

---

## 📋 项目现状

**综合评分**: 3.6/5.0  
**架构**: ⭐⭐⭐⭐⭐ (优秀)  
**测试**: ⭐⭐☆☆☆ (严重不足)  
**构建**: ⚠️ 需要统一  

---

## ⚡ 5分钟快速上手

### 1. 安装依赖和Builder

```bash
cd D:/WorkBench/ldesign/libraries/3d-viewer
pnpm install
pnpm add @ldesign/builder -D -w
```

### 2. 构建所有包

```bash
# 方式1: 使用新的 builder
pnpm run build:all

# 方式2: 单独构建
pnpm --filter @panorama-viewer/core build
pnpm --filter @panorama-viewer/vue build
pnpm --filter @panorama-viewer/react build
pnpm --filter @panorama-viewer/lit build
```

### 3. 验证构建

```bash
# 检查构建产物
ls packages/core/dist
ls packages/vue/dist
ls packages/react/dist
ls packages/lit/dist

# 或运行验证脚本 (需要创建)
node scripts/verify-build.js
```

### 4. 运行示例

```bash
# Vue 示例
cd examples/vue-demo && pnpm dev

# React 示例  
cd examples/react-demo && pnpm dev

# Lit 示例
cd examples/lit-demo && pnpm dev
```

---

## 📊 本周任务清单

### Day 1-2: 构建修复 ✅

- [ ] 安装 @ldesign/builder
- [ ] 构建所有包
- [ ] 修复构建错误
- [ ] 验证所有dist目录

**目标**: 所有包构建成功

### Day 3-4: 测试补充 ✅

- [ ] 为核心类添加测试 (PanoramaViewer, EventBus, etc.)
- [ ] 为工具函数添加测试
- [ ] 运行测试确保通过
- [ ] 生成覆盖率报告

**目标**: 达到 40% 覆盖率

### Day 5-7: 示例修复 ✅

- [ ] Vue Demo: 拆分组件，添加 Composables
- [ ] React Demo: 添加自定义 Hooks
- [ ] Advanced: 重构为模块化结构
- [ ] 验证所有示例功能

**目标**: 所有示例无bug

---

## 🎯 本月目标

```
Week 1: 构建 + 测试 + 示例修复
Week 2: 架构优化 + 文档整理
Week 3: 实现标注工具 + 缩略图导航
Week 4: 实现双全景对比 + Beta 发布
```

---

## 🔧 必备脚本

将这些添加到根 `package.json`:

```json
{
  "scripts": {
    "build": "ldesign-builder build --workspace",
    "build:all": "pnpm -r run build",
    "build:core": "pnpm --filter @panorama-viewer/core build",
    "build:vue": "pnpm --filter @panorama-viewer/vue build",
    "build:react": "pnpm --filter @panorama-viewer/react build",
    "build:lit": "pnpm --filter @panorama-viewer/lit build",
    
    "dev:vue": "pnpm --filter vue-demo dev",
    "dev:react": "pnpm --filter react-demo dev",
    "dev:lit": "pnpm --filter lit-demo dev",
    
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    
    "lint": "eslint packages/*/src --ext .ts,.tsx,.vue",
    "type-check": "pnpm -r run type-check",
    
    "clean": "pnpm -r run clean",
    "verify": "node scripts/verify-build.js"
  }
}
```

将这些添加到各包 `package.json`:

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder build --watch",
    "clean": "rimraf dist",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 📝 验证脚本

创建 `scripts/verify-build.js`:

```javascript
const fs = require('fs');
const path = require('path');

const packages = ['core', 'vue', 'react', 'lit'];

console.log('🔍 验证构建产物...\n');

let allPassed = true;

packages.forEach(pkg => {
  console.log(`📦 @panorama-viewer/${pkg}`);
  const distPath = path.join(__dirname, '../packages', pkg, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log(`  ❌ dist 目录不存在`);
    allPassed = false;
    return;
  }
  
  const files = ['index.esm.js', 'index.cjs.js', 'index.d.ts'];
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ✓ ${file} (${(stats.size/1024).toFixed(2)} KB)`);
    } else {
      console.log(`  ❌ ${file} 不存在`);
      allPassed = false;
    }
  });
  
  console.log('');
});

if (allPassed) {
  console.log('✅ 验证通过！');
  process.exit(0);
} else {
  console.log('❌ 验证失败！');
  process.exit(1);
}
```

---

## 🐛 常见问题

### Q1: 构建失败 - "Cannot find module '@ldesign/builder'"

**解决**:
```bash
pnpm add @ldesign/builder -D -w
```

### Q2: TypeScript 错误 - Three.js 类型问题

**解决**:
```typescript
// 使用 import type
import type * as THREE from 'three';
```

### Q3: Vue 组件样式未提取

**解决**: 检查 `.ldesign/builder.config.ts`:
```typescript
css: {
  extract: true,
  filename: 'style.css',
}
```

### Q4: Worker 构建失败

**解决**: 暂时改为内联 Worker:
```typescript
const workerCode = `self.addEventListener('message', ...)`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

---

## 📚 详细文档

- [完整分析总结](./README_ANALYSIS.md) - 快速浏览
- [架构深度分析](./ARCHITECTURE_ANALYSIS.md) - 15,000字详细分析
- [功能扩展评估](./FEATURE_EXPANSION.md) - 24个功能方向
- [示例完善计划](./EXAMPLE_IMPROVEMENT.md) - 示例改进方案
- [构建验证计划](./BUILD_VERIFICATION.md) - 完整测试计划
- [综合实施报告](./FINAL_ANALYSIS_REPORT.md) - 完整总结

---

## ✅ 检查清单

### 构建检查

- [ ] 安装了 @ldesign/builder
- [ ] 创建了所有 builder 配置文件
- [ ] 更新了 package.json 脚本
- [ ] 所有包构建成功
- [ ] 产物验证通过

### 测试检查

- [ ] 设置了 Vitest
- [ ] 添加了核心测试
- [ ] 测试全部通过
- [ ] 覆盖率 >= 40%

### 示例检查

- [ ] Vue Demo 运行正常
- [ ] React Demo 运行正常
- [ ] Lit Demo 运行正常
- [ ] Advanced Example 运行正常
- [ ] 所有功能可用

---

## 🚀 开始执行

```bash
# 复制以下命令，逐条执行

# 1. 安装
cd D:/WorkBench/ldesign/libraries/3d-viewer
pnpm install
pnpm add @ldesign/builder -D -w

# 2. 构建
pnpm run build:all

# 3. 验证
ls packages/core/dist
ls packages/vue/dist

# 4. 测试示例
cd examples/vue-demo
pnpm dev

# 5. 运行测试
cd ../..
pnpm test
```

---

## 💬 需要帮助？

遇到问题：
1. 查看详细报告找解决方案
2. 检查 builder 配置是否正确
3. 查看构建日志定位错误
4. 参考 @ldesign/builder 文档

---

**祝你顺利！** 🎉

*更新时间: 2025-01-23*

