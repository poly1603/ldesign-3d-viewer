# 下一步任务执行计划

> 优先级排序的任务清单

## 🚨 立即执行（Priority 1）

### 1. 修复依赖问题 ⚠️

**问题**: `@rollup/rollup-win32-x64-msvc` 模块缺失

**解决方案**:
```bash
cd D:\WorkBench\ldesign
pnpm install
```

**验证**:
```bash
cd packages/core
pnpm test
```

**预期结果**: 所有187个测试通过

---

### 2. 清理遗留文件 🧹

**待清理**:
```bash
# 删除早期版本的测试文件
rm __tests__/EventBus.test.ts         # 已有改进版在 core/
rm __tests__/ObjectPool.test.ts       # 已有改进版在 utils/
```

**原因**: 这些是早期原型版本，已有完善的版本在子目录中

---

### 3. 验证 AdvancedCamera 测试 ✅

**命令**:
```bash
pnpm test AdvancedCamera.test.ts
```

**预期**: 46个测试通过

**如果失败**: 检查 AdvancedCamera 源码是否有所需的方法

---

## 📋 短期任务（本周）

### Phase 2: 相机和控制系统

#### 4. 查找控制系统模块

```bash
# 查找相关文件
find src -name "*Control*" -o -name "*Touch*" -o -name "*Keyboard*"
```

**预期模块**:
- [ ] CameraControls
- [ ] TouchControls
- [ ] KeyboardControls
- [ ] GyroscopeControls

#### 5. 为每个控制模块创建测试

**模板**:
```typescript
describe('ModuleName', () => {
  // 基本功能测试
  // 事件处理测试
  // 边界情况测试
  // 性能测试
})
```

**目标**: 每个模块 20-30个测试

---

## 📊 中期任务（本月）

### Phase 3: 渲染和性能

#### 6. TextureCache 测试

**文件**: `src/utils/TextureCache.ts`  
**当前覆盖率**: 32.53%  
**目标**: 80%+

#### 7. ResourcePreloader 测试

**文件**: `src/utils/ResourcePreloader.ts`  
**目标**: 完整功能测试

#### 8. AdaptiveQuality 测试

**文件**: `src/utils/AdaptiveQuality.ts`  
**目标**: 自适应逻辑测试

#### 9. PerformanceMonitor 测试

**目标**: 性能指标追踪测试

---

## 🎯 具体执行步骤

### 步骤1: 环境准备

```bash
# 1. 修复依赖
cd D:\WorkBench\ldesign
pnpm install

# 2. 验证测试环境
cd packages/core
pnpm test

# 3. 清理遗留文件
Remove-Item __tests__/EventBus.test.ts
Remove-Item __tests__/ObjectPool.test.ts
```

### 步骤2: 验证现有测试

```bash
# 运行所有测试
pnpm test -- --run

# 检查覆盖率
pnpm test -- --coverage

# 验证新测试
pnpm test AdvancedCamera.test.ts
```

### 步骤3: 创建新测试

```bash
# 1. 查找待测试模块
ls src/ -Recurse -Filter "*Control*.ts"

# 2. 为每个模块创建测试文件
# __tests__/controls/ModuleName.test.ts

# 3. 运行并验证
pnpm test -- --watch
```

---

## 📈 进度追踪

### 已完成 ✅

- [x] Phase 1: 核心基础设施（187个测试）
- [x] 测试基础设施
- [x] 完整文档体系
- [x] WebGL Mock 环境

### 进行中 🚧

- [ ] 修复依赖问题
- [ ] 验证 AdvancedCamera 测试
- [ ] 清理遗留文件

### 待开始 📝

- [ ] Phase 2: 相机和控制系统（+100个测试）
- [ ] Phase 3: 渲染和性能（+80个测试）
- [ ] Phase 4-6: 高级功能和集成测试

---

## 🎯 本周目标

### 必须完成 (Must Have)

1. ✅ 修复依赖问题
2. ✅ 清理遗留文件
3. ✅ 验证所有现有测试通过

### 应该完成 (Should Have)

4. 📝 验证 AdvancedCamera 测试
5. 📝 查找并列出所有控制系统模块
6. 📝 为至少1个控制模块编写测试

### 可以完成 (Could Have)

7. 开始 TextureCache 测试
8. 更新覆盖率报告
9. 添加 CI/CD 配置

---

## 📊 预期成果

### 本周结束时

- **测试文件**: 8个 → 10个（+2）
- **测试用例**: 187个 → 230个（+43）
- **覆盖率**: 12.75% → 15%（+2.25%）

### 本月结束时

- **测试文件**: 10个 → 15个（+5）
- **测试用例**: 230个 → 350个（+120）
- **覆盖率**: 15% → 25%（+10%）

---

## 🔧 工具和资源

### 测试命令

```bash
# 基础命令
pnpm test                    # 运行所有测试
pnpm test -- --watch        # 监听模式
pnpm test -- --coverage     # 覆盖率
pnpm test -- --ui           # UI界面

# 特定测试
pnpm test AdvancedCamera    # 运行特定测试
pnpm test -- --grep "基本功能" # 匹配描述

# 调试
pnpm test -- --reporter=verbose  # 详细输出
```

### 文件位置

```
packages/core/
├── __tests__/          # 测试目录
├── src/                # 源代码
└── *.md               # 文档文件
```

### 参考文档

- `TESTING_README.md` - 文档中心
- `TESTING_QUICK_START.md` - 快速入门
- `TEST_PROGRESS.md` - 进度追踪
- `DELIVERABLES.md` - 交付清单

---

## ⚠️ 注意事项

### 依赖问题

如果 `pnpm install` 遇到网络问题：

1. **检查网络**: 确保能访问 npm registry
2. **使用镜像**: `pnpm config set registry https://registry.npmmirror.com`
3. **重试**: 多次尝试安装
4. **清理缓存**: `pnpm store prune`

### 测试失败

如果测试失败：

1. **检查错误信息**: 查看具体失败原因
2. **查看文档**: 参考 TESTING_QUICK_START.md FAQ
3. **隔离问题**: 单独运行失败的测试
4. **检查Mock**: 确认 setup.ts 配置正确

### 覆盖率下降

- **原因**: 添加新源码但未添加测试
- **解决**: 为新功能补充测试
- **目标**: 保持核心模块 >85% 覆盖率

---

## 📞 获取帮助

### 文档

- 快速问题 → `TESTING_QUICK_START.md`
- 详细指南 → `TESTING_GUIDE.md`
- 进度查询 → `TEST_PROGRESS.md`

### 调试技巧

1. 使用 `console.log` 输出中间值
2. 使用 `it.only` 隔离单个测试
3. 使用 `--reporter=verbose` 查看详细信息
4. 检查 `__tests__/setup.ts` Mock 配置

---

## ✅ 验收标准

### 每个任务完成后

- [ ] 所有测试通过
- [ ] 覆盖率不降低
- [ ] 代码通过 lint 检查
- [ ] 更新相关文档
- [ ] 提交代码到版本控制

### 本周验收

- [ ] 依赖问题已修复
- [ ] 187个测试全部通过
- [ ] AdvancedCamera 测试验证通过
- [ ] 遗留文件已清理
- [ ] 至少1个新控制模块测试完成

---

**创建时间**: 2025-10-29  
**优先级**: P1 - 立即执行  
**负责人**: Development Team  
**预计完成**: 本周内
