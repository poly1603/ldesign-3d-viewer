# TypeScript 错误修复进度

## 总览
- **总错误数**: 88个
- **已修复**: 3个 (RGBFormat问题)
- **待修复**: 85个

## 修复优先级

### ✅ 已完成
1. ✅ RGBFormat废弃问题 (3处) - 已改为RGBAFormat
2. ✅ 安装@types/node依赖

### 🔴 高优先级 (阻塞性错误)

#### 1. EventMap事件名称不匹配 (~30个错误)
需要在EventMap中添加缺失的事件类型定义
- `analytics:tracking-started`
- `scene:preloaded`
- `plugin:installed`/`plugin:uninstalled`
- `annotation:added`/`annotation:removed`/`annotation:updated`
- `snapshot:created`
- `tour:started`/`tour:ended`/`tour:step-changed`
- 等等...

#### 2. TouchControls未初始化属性 (3个错误)
```
src/controls/TouchControls.ts:40:11
- boundTouchStart
- boundTouchMove  
- boundTouchEnd
```

#### 3. TextureCache API不匹配 (4个错误)
SceneManager中调用了不存在的`unload`方法
```
src/managers/SceneManager.ts:73, 75, 375, 377
```

### 🟡 中优先级

#### 4. Three.js类型问题
- Camera缺少near/far属性 (DynamicLighting.ts)
- VR相关的XR类型问题 (VRManager.ts)

#### 5. 接口签名不匹配
- PanoramaViewer.setViewLimits返回类型
- OfflineManager异步函数Promise类型
- Plugin接口缺少方法定义

### 🟢 低优先级

#### 6. PostProcessing参数类型
- BokehPass参数
- 各种uniforms类型

#### 7. 可选类型处理
- undefined检查
- 可选参数处理

## 修复策略

1. 先修复EventMap，这是最多的错误来源
2. 修复类初始化问题
3. 修复API调用不匹配
4. 修复复杂的Three.js类型问题
5. 最后处理细节类型问题

## 下一步
开始修复EventMap事件定义
