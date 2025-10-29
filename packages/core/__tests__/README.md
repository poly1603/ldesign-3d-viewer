# Core Package 测试文档

## 📁 测试结构

```
__tests__/
├── setup.ts                    # 测试环境配置
├── core/                       # 核心模块测试
│   ├── EventBus.test.ts       # ✅ 事件总线测试
│   ├── Logger.test.ts         # ✅ 日志系统测试
│   ├── StateManager.test.ts   # TODO
│   └── MemoryManager.test.ts  # TODO
├── controls/                   # 控制模块测试
│   ├── MouseControls.test.ts  # TODO
│   ├── TouchControls.test.ts  # TODO
│   └── GyroControls.test.ts   # TODO
├── managers/                   # 管理器测试
│   ├── HotspotManager.test.ts # TODO
│   └── SceneManager.test.ts   # TODO
├── utils/                      # 工具函数测试
│   ├── TextureCache.test.ts   # TODO
│   └── helpers.test.ts        # TODO
└── integration/                # 集成测试
    └── PanoramaViewer.test.ts # TODO
```

## ✅ 已完成的测试

### 1. EventBus (245行)
- ✅ 基础事件订阅和触发
- ✅ once 一次性事件
- ✅ off 取消订阅  
- ✅ waitFor Promise接口
- ✅ 事件历史记录
- ✅ 错误处理
- ✅ 性能测试
- ✅ 边界情况

**测试覆盖**:
- 25个测试用例
- 覆盖所有主要功能
- 包含性能和边界测试

### 2. Logger (255行)
- ✅ 日志级别过滤
- ✅ 日志格式化
- ✅ 历史记录
- ✅ 性能测试
- ✅ 错误对象处理
- ✅ 边界情况

**测试覆盖**:
- 22个测试用例
- 测试所有日志级别
- 性能基准测试

## 🚀 运行测试

### 基础命令

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# UI 界面
npm run test:ui
```

### 运行特定测试

```bash
# 只运行 EventBus 测试
npx vitest EventBus

# 只运行 core 模块测试
npx vitest core/

# 运行匹配模式的测试
npx vitest --grep="事件订阅"
```

## 📊 测试指标

### 目标

- **代码覆盖率**: > 80%
- **核心模块覆盖率**: > 90%
- **测试用例数**: > 200
- **测试通过率**: 100%

### 当前状态

- ✅ EventBus: 25/25 测试通过
- ✅ Logger: 22/22 测试通过
- ⏳ 其他模块: 待开发

## 📝 编写测试指南

### 测试文件命名

- 测试文件应与源文件对应
- 使用 `.test.ts` 后缀
- 放在与源文件相同的相对路径下

### 测试结构

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('ModuleName', () => {
  beforeEach(() => {
    // 每个测试前的准备工作
  })

  describe('功能分组', () => {
    it('应该...[具体行为]', () => {
      // Arrange (准备)
      const input = ...
      
      // Act (执行)
      const result = ...
      
      // Assert (断言)
      expect(result).toBe(...)
    })
  })
})
```

### 最佳实践

1. **AAA模式**: Arrange, Act, Assert
2. **独立性**: 每个测试应该独立运行
3. **清晰描述**: 测试名称应清楚描述行为
4. **边界测试**: 包含边界和错误情况
5. **Mock适度**: 只mock必要的依赖
6. **性能意识**: 避免过慢的测试

### Mock示例

```typescript
import { vi } from 'vitest'

// Mock 函数
const mockFn = vi.fn()

// Mock 模块
vi.mock('./module', () => ({
  default: {
    method: vi.fn(() => 'mocked'),
  },
}))

// Spy on 方法
const spy = vi.spyOn(object, 'method')
```

## 🎯 待完成的测试

### 高优先级
- [ ] StateManager.test.ts
- [ ] HotspotManager.test.ts
- [ ] TextureCache.test.ts
- [ ] helpers.test.ts (工具函数)

### 中优先级
- [ ] MemoryManager.test.ts
- [ ] SceneManager.test.ts
- [ ] MouseControls.test.ts
- [ ] TouchControls.test.ts

### 低优先级
- [ ] PostProcessing.test.ts
- [ ] VRManager.test.ts
- [ ] OfflineManager.test.ts

### 集成测试
- [ ] PanoramaViewer 完整流程
- [ ] 多场景切换
- [ ] 性能压力测试

## 🐛 测试环境配置

测试环境已配置：
- ✅ Vitest 1.0+
- ✅ jsdom/happy-dom 浏览器环境
- ✅ WebGL context mock
- ✅ 覆盖率报告 (v8)
- ✅ UI 界面

## 📚 参考资料

- [Vitest 文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)

---

**最后更新**: 2025-10-28
**测试框架**: Vitest 1.0+
**覆盖率**: 待提升
