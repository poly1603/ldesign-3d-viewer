# 测试快速入门指南

> 5分钟快速了解和使用测试系统

## 🚀 快速开始

### 运行测试

```bash
# 进入 core 包目录
cd packages/core

# 运行所有测试
pnpm test

# 运行特定测试
pnpm test EventBus

# 监听模式（开发时推荐）
pnpm test -- --watch

# 查看覆盖率
pnpm test -- --coverage

# UI界面
pnpm test -- --ui
```

## 📊 当前状态

- ✅ **187个测试通过**
- ✅ **0个失败**
- ✅ **核心模块94.1%覆盖率**
- ✅ **执行时间~7秒**

## 📁 测试文件位置

```
__tests__/
├── core/
│   ├── EventBus.test.ts         (32个测试) ✅
│   ├── Logger.test.ts           (19个测试) ✅
│   └── MemoryManager.test.ts    (35个测试) ✅
├── plugins/
│   └── PluginManager.test.ts    (31个测试) ✅
├── utils/
│   ├── HotspotManager.test.ts   (27个测试) ✅
│   └── ObjectPool.test.ts       (43个测试) ✅
├── camera/
│   └── AdvancedCamera.test.ts   (46个测试) 📝待验证
└── setup.ts                      (测试环境配置)
```

## 📖 文档位置

| 文档 | 用途 |
|------|------|
| `TESTING_QUICK_START.md` | 本文档 - 快速入门 |
| `TEST_SUMMARY.md` | 完整工作总结 |
| `TEST_PROGRESS.md` | 开发进度追踪 |
| `TEST_COVERAGE_REPORT.md` | 覆盖率详细报告 |
| `TESTING_GUIDE.md` | 完整测试指南 |
| `__tests__/README.md` | 测试目录说明 |

## 🎯 测试的模块

### ✅ 已完成（6个核心模块）

1. **EventBus** - 事件系统
   - 订阅/发布
   - 一次性监听
   - Promise等待
   - 历史记录

2. **Logger** - 日志系统
   - 多级日志
   - 格式化
   - 历史管理
   - 性能优化

3. **ObjectPool** - 对象池
   - 通用对象池
   - Three.js对象池（Vector3, Quaternion等）
   - 内存优化
   - 性能基准

4. **PluginManager** - 插件管理
   - 注册/安装/卸载
   - 依赖管理
   - 生命周期
   - 事件系统

5. **HotspotManager** - 热点管理
   - 添加/移除热点
   - DOM标记
   - 位置更新
   - 事件处理

6. **MemoryManager** - 内存管理
   - 内存追踪
   - 警告机制
   - 自动清理
   - 监控系统

## 🔧 常见问题

### Q: 如何运行单个测试文件？

```bash
pnpm test EventBus.test.ts
```

### Q: 如何查看测试覆盖率？

```bash
pnpm test -- --coverage
```

覆盖率报告位置：`coverage/index.html`

### Q: 如何调试测试？

1. 在测试代码中添加 `debugger`
2. 运行：`node --inspect-brk node_modules/.bin/vitest`
3. 打开 Chrome DevTools

### Q: 测试执行太慢怎么办？

当前测试执行很快（~7秒），如果变慢：
- 使用 `--run` 而不是 watch 模式
- 只运行需要的测试文件
- 检查是否有无限循环

### Q: 如何跳过某个测试？

```typescript
it.skip('这个测试暂时跳过', () => {
  // ...
})
```

### Q: 如何只运行某个测试？

```typescript
it.only('只运行这个测试', () => {
  // ...
})
```

## 📝 编写新测试

### 1. 创建测试文件

在 `__tests__/` 下创建对应目录和文件：

```
__tests__/
└── your-module/
    └── YourModule.test.ts
```

### 2. 基本模板

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { YourModule } from '../../src/your-module/YourModule'

describe('YourModule', () => {
  let instance: YourModule
  
  beforeEach(() => {
    instance = new YourModule()
  })
  
  afterEach(() => {
    instance.dispose()
  })
  
  describe('功能名称', () => {
    it('应该能够执行某功能', () => {
      // Arrange
      const input = 'test'
      
      // Act
      const result = instance.doSomething(input)
      
      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### 3. 运行你的测试

```bash
pnpm test YourModule.test.ts
```

## 🎨 测试最佳实践

### ✅ 推荐

- 使用描述性的中文测试名称
- 一个测试只验证一个功能点
- 使用 beforeEach/afterEach 清理资源
- 测试正常路径和异常路径
- 包含边界情况测试

### ❌ 避免

- 测试之间相互依赖
- 不清理资源导致内存泄漏
- 测试名称模糊不清
- 测试过于复杂
- 忽略异步操作

## 🐛 遇到问题？

### 1. Rollup 依赖问题

如果遇到 `@rollup/rollup-win32-x64-msvc` 错误：

```bash
cd D:\WorkBench\ldesign
pnpm install
```

### 2. 测试超时

增加超时时间：

```typescript
it('长时间运行的测试', async () => {
  // ...
}, 10000) // 10秒超时
```

### 3. Mock不工作

确保在 `__tests__/setup.ts` 中正确配置了 mock

### 4. WebGL相关错误

查看 `__tests__/setup.ts` 中的 WebGL mock 配置

## 📊 查看测试报告

### 终端输出

运行测试后直接在终端查看结果

### 覆盖率报告

```bash
pnpm test -- --coverage
# 打开 coverage/index.html
```

### UI界面

```bash
pnpm test -- --ui
# 浏览器中打开 http://localhost:51204/__vitest__/
```

## 🔗 相关链接

- [Vitest 文档](https://vitest.dev/)
- [完整测试指南](./TESTING_GUIDE.md)
- [测试进度](./TEST_PROGRESS.md)
- [覆盖率报告](./TEST_COVERAGE_REPORT.md)

## 💡 提示

- 开发时使用 `--watch` 模式自动运行测试
- 提交代码前运行 `pnpm test` 确保所有测试通过
- 定期检查覆盖率报告，补充缺失的测试
- 遇到问题先查看文档，再寻求帮助

---

**快速命令备忘录**:

```bash
pnpm test              # 运行所有测试
pnpm test -- --watch   # 监听模式
pnpm test -- --ui      # UI界面
pnpm test EventBus     # 运行特定测试
```

**最后更新**: 2025-10-29
