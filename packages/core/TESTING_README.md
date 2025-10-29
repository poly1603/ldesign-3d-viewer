# 测试系统文档中心

> 3D Viewer Core 包的完整测试系统

## 🎯 快速导航

### 🚀 新手入门
👉 **[快速入门指南](./TESTING_QUICK_START.md)** - 5分钟快速上手

### 📊 了解现状
👉 **[工作总结](./TEST_SUMMARY.md)** - 完整的测试工作总结

### 📁 查看清单
👉 **[交付清单](./DELIVERABLES.md)** - 所有文件和成果

## 📚 文档索引

### 核心文档

| 文档 | 用途 | 推荐阅读顺序 |
|------|------|-------------|
| **[TESTING_QUICK_START.md](./TESTING_QUICK_START.md)** | 快速入门指南 | ⭐ 第1个 |
| **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** | 完整工作总结 | ⭐ 第2个 |
| **[DELIVERABLES.md](./DELIVERABLES.md)** | 交付清单 | 第3个 |
| **[TEST_PROGRESS.md](./TEST_PROGRESS.md)** | 开发进度追踪 | 第4个 |
| **[TEST_COVERAGE_REPORT.md](./TEST_COVERAGE_REPORT.md)** | 覆盖率报告 | 第5个 |
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | 完整测试指南 | 深入学习 |

## 📊 核心数据

### 测试成果

```
✅ 187 个测试通过
✅ 0 个失败
✅ 94.1% 核心模块覆盖率
✅ ~7 秒执行时间
```

### 测试模块

1. **EventBus** - 事件系统 (32个测试)
2. **Logger** - 日志系统 (19个测试)
3. **ObjectPool** - 对象池 (43个测试)
4. **PluginManager** - 插件管理 (31个测试)
5. **HotspotManager** - 热点管理 (27个测试)
6. **MemoryManager** - 内存管理 (35个测试)

## 🚀 快速命令

```bash
# 运行所有测试
pnpm test

# 监听模式（开发推荐）
pnpm test -- --watch

# 查看覆盖率
pnpm test -- --coverage

# UI 界面
pnpm test -- --ui

# 运行特定测试
pnpm test EventBus
```

## 📁 文件结构

```
packages/core/
├── __tests__/              # 测试文件目录
│   ├── core/              # 核心模块测试
│   ├── plugins/           # 插件测试
│   ├── utils/             # 工具测试
│   ├── camera/            # 相机测试
│   └── setup.ts           # 测试环境配置
│
├── 📖 文档中心
├── TESTING_README.md      # 本文档 - 入口
├── TESTING_QUICK_START.md # 快速入门 ⭐
├── TEST_SUMMARY.md        # 工作总结 ⭐
├── DELIVERABLES.md        # 交付清单
├── TEST_PROGRESS.md       # 进度追踪
├── TEST_COVERAGE_REPORT.md # 覆盖率报告
└── TESTING_GUIDE.md       # 完整指南
```

## 🎯 使用场景

### 场景1: 第一次接触
1. 阅读 [快速入门指南](./TESTING_QUICK_START.md)
2. 运行 `pnpm test` 验证环境
3. 查看 [工作总结](./TEST_SUMMARY.md) 了解全貌

### 场景2: 日常开发
1. 使用 `pnpm test -- --watch` 监听模式
2. 参考现有测试编写新测试
3. 查看 [进度文档](./TEST_PROGRESS.md) 了解待办

### 场景3: 深入学习
1. 阅读 [完整指南](./TESTING_GUIDE.md)
2. 研究 [覆盖率报告](./TEST_COVERAGE_REPORT.md)
3. 查看 `__tests__/` 目录下的测试代码

### 场景4: 问题排查
1. 查阅 [快速入门](./TESTING_QUICK_START.md) 的 FAQ
2. 检查 `__tests__/setup.ts` 配置
3. 参考文档中的解决方案

## 💡 最佳实践

### ✅ 推荐做法

- 开发时使用 `--watch` 模式
- 提交前运行完整测试
- 定期检查覆盖率
- 遵循现有测试风格
- 为新功能编写测试

### ❌ 避免做法

- 不要跳过测试就提交
- 不要忽略测试失败
- 不要写相互依赖的测试
- 不要忽略资源清理
- 不要写过于复杂的测试

## 📖 学习路径

### 初级（第1周）
1. ✅ 熟悉测试命令
2. ✅ 运行现有测试
3. ✅ 阅读测试代码
4. ✅ 理解测试结构

### 中级（第2-3周）
1. 📝 编写简单测试
2. 📝 使用 Mock 功能
3. 📝 处理异步测试
4. 📝 编写边界测试

### 高级（第4周+）
1. ⏳ 优化测试性能
2. ⏳ 设计测试架构
3. ⏳ 编写复杂场景测试
4. ⏳ 提升覆盖率

## 🔗 相关资源

### 官方文档
- [Vitest 官方文档](https://vitest.dev/)
- [Three.js 文档](https://threejs.org/docs/)
- [TypeScript 文档](https://www.typescriptlang.org/)

### 最佳实践
- [JavaScript 测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [测试驱动开发](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

### 工具
- [Vitest](https://vitest.dev/) - 测试框架
- [Happy DOM](https://github.com/capricorn86/happy-dom) - DOM 环境
- [@vitest/ui](https://vitest.dev/guide/ui.html) - UI 界面

## 🐛 常见问题

### Q: 测试无法运行？
A: 检查是否有 rollup 依赖问题，运行 `cd D:\WorkBench\ldesign && pnpm install`

### Q: 测试失败怎么办？
A: 查看错误信息，检查代码变更，参考 [快速入门](./TESTING_QUICK_START.md) FAQ

### Q: 如何提高覆盖率？
A: 查看 [覆盖率报告](./TEST_COVERAGE_REPORT.md)，为未覆盖模块编写测试

### Q: 测试太慢？
A: 当前测试很快（~7秒），如果变慢检查是否有死循环

### Q: 如何调试测试？
A: 参考 [快速入门](./TESTING_QUICK_START.md) 中的调试部分

## 📞 获取帮助

### 文档
- 快速问题 → [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)
- 详细信息 → [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- 进度查询 → [TEST_PROGRESS.md](./TEST_PROGRESS.md)

### 支持
- 查看文档中的 FAQ
- 检查现有测试代码
- 参考最佳实践指南

## 📊 项目状态

### Phase 1: 核心基础设施 ✅ 已完成
- EventBus、Logger、ObjectPool
- PluginManager、HotspotManager、MemoryManager
- 187个测试，94.1%覆盖率

### Phase 2: 相机系统 📝 进行中
- AdvancedCamera 测试已创建（46个）
- 待验证和完善

### Phase 3-6: 计划中
- 渲染和性能模块
- 高级功能模块
- 工具和辅助模块
- 集成测试

## 🎯 质量目标

- **短期**: 覆盖率达到 25%
- **中期**: 覆盖率达到 50%
- **长期**: 覆盖率达到 80%+

---

## ⚡ 快速开始

```bash
# 1. 进入目录
cd packages/core

# 2. 运行测试
pnpm test

# 3. 查看结果
# 终端会显示测试结果和覆盖率

# 4. 开始开发
pnpm test -- --watch
```

## 📝 更新日志

### 2025-10-29
- ✅ 创建完整文档体系
- ✅ 完成 Phase 1 所有测试
- 📝 创建 AdvancedCamera 测试
- 📝 编写 6 个核心文档

### 2025-10-28
- ✅ 完成 6 个核心模块测试（187个）
- ✅ 建立测试基础设施
- ✅ 创建 WebGL Mock 环境

---

**项目**: @panorama-viewer/core v2.0.0  
**测试框架**: Vitest + Happy DOM  
**状态**: Phase 1 完成，Phase 2 进行中  
**最后更新**: 2025-10-29

**开始使用**: [快速入门指南](./TESTING_QUICK_START.md) 👈
