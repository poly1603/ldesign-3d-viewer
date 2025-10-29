# 3D Viewer Build Guide

## 项目结构

```
3d-viewer/
├── packages/
│   ├── core/          # 框架无关核心 (@panorama-viewer/core)
│   ├── vue/           # Vue 3 wrapper (@ldesign/3d-viewer-vue)
│   ├── react/         # React wrapper (@ldesign/3d-viewer-react)
│   ├── angular/       # Angular wrapper (@ldesign/3d-viewer-angular)
│   ├── solid/         # Solid.js wrapper (@ldesign/3d-viewer-solid)
│   ├── svelte/        # Svelte wrapper (@ldesign/3d-viewer-svelte)
│   ├── qwik/          # Qwik wrapper (@ldesign/3d-viewer-qwik)
│   └── lit/           # Lit wrapper (@ldesign/3d-viewer-lit)
├── examples/          # 演示项目
├── docs/              # VitePress文档
├── tests/             # 集成测试
└── tools/             # 构建工具
```

## 构建命令

### 安装依赖
```bash
pnpm install
```

### 构建所有包
```bash
pnpm build
```

### 构建特定包
```bash
pnpm build:core        # 核心包
pnpm build:vue         # Vue包
pnpm build:react       # React包
pnpm build:angular     # Angular包
pnpm build:solid       # Solid.js包
pnpm build:svelte      # Svelte包
pnpm build:qwik        # Qwik包
pnpm build:lit         # Lit包
```

### 开发模式
```bash
pnpm dev              # 所有包watch模式
pnpm dev:core         # 核心包watch模式
```

### 测试
```bash
pnpm test             # 运行所有测试
pnpm test:unit        # 单元测试
pnpm test:e2e         # E2E测试
pnpm test:visual      # 可视化回归测试
pnpm test:perf        # 性能测试
```

### 代码质量
```bash
pnpm lint             # ESLint检查
pnpm lint:fix         # 自动修复ESLint问题
pnpm typecheck        # TypeScript类型检查
pnpm format           # 代码格式化
```

### 文档
```bash
pnpm docs:dev         # 本地预览文档
pnpm docs:build       # 构建文档
```

## 包依赖关系

```
core (独立)
  ↓
  ├── vue → core
  ├── react → core
  ├── angular → core
  ├── solid → core
  ├── svelte → core
  ├── qwik → core
  └── lit → core
```

## 构建顺序
1. **core包** - 必须首先构建
2. **框架包** - 并行构建,依赖core

## 发布流程

### 1. 版本更新
```bash
pnpm version:patch    # 补丁版本 x.x.X
pnpm version:minor    # 次版本 x.X.0
pnpm version:major    # 主版本 X.0.0
```

### 2. 构建和测试
```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

### 3. 发布
```bash
pnpm publish:all      # 发布所有包
```

## 性能优化检查清单

### 构建优化
- [ ] Tree-shaking配置正确
- [ ] 无循环依赖
- [ ] External配置完整
- [ ] Bundle大小合理

### 代码优化
- [ ] 无内存泄漏
- [ ] 资源正确释放
- [ ] 事件监听器清理
- [ ] Three.js对象dispose

### 类型安全
- [ ] 无TypeScript错误
- [ ] 完整的类型导出
- [ ] 正确的泛型使用
- [ ] JSDoc注释完整

### 代码质量
- [ ] 无ESLint错误
- [ ] 无ESLint警告
- [ ] 代码格式统一
- [ ] 注释清晰完整

## 测试覆盖率目标
- **单元测试**: ≥ 80%
- **集成测试**: ≥ 70%
- **E2E测试**: 核心流程100%
- **性能测试**: 所有关键路径

## CI/CD配置

### GitHub Actions工作流
1. **Pull Request检查**
   - Lint
   - TypeCheck
   - Unit Tests
   - Build

2. **主分支合并**
   - 所有PR检查
   - E2E Tests
   - Performance Tests
   - Build All Packages

3. **发布流程**
   - 版本标签
   - NPM发布
   - 文档部署
   - Changelog生成

## 常见问题

### Q: 构建失败怎么办?
A: 
1. 清理node_modules: `pnpm clean:all && pnpm install`
2. 检查TypeScript错误: `pnpm typecheck`
3. 检查ESLint错误: `pnpm lint`

### Q: 如何调试某个包?
A:
```bash
cd packages/{package-name}
pnpm dev
```

### Q: 如何添加新的框架支持?
A: 参考现有框架包的结构,创建新包目录并配置package.json和builder.config.ts

## 开发规范

### 提交信息
使用Conventional Commits格式:
```
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 分支策略
- `main`: 稳定版本
- `dev`: 开发分支
- `feature/*`: 新功能
- `fix/*`: Bug修复

## 性能基准

### 目标指标
- **Core包大小**: < 200KB (gzipped)
- **框架包大小**: < 50KB (gzipped)
- **初始化时间**: < 100ms
- **FPS**: ≥ 60fps (1080p)
- **内存占用**: < 100MB (单场景)

### 监控工具
- Chrome DevTools Performance
- Lighthouse
- Bundle Analyzer
- Memory Profiler

---
*更新时间: 2025-10-28*
