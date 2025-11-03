# API 文档生成指南

本项目使用 TypeDoc 生成 API 文档。

## 安装 TypeDoc

由于项目结构原因，需要手动安装 TypeDoc：

```bash
npm install --save-dev typedoc
```

或使用 pnpm（如果是 monorepo）：

```bash
pnpm add -D typedoc
```

## 生成文档

### 一次性生成

```bash
npm run docs
```

文档将生成到 `docs/` 目录。

### 监听模式（自动重新生成）

```bash
npm run docs:watch
```

## 配置说明

TypeDoc 配置文件为 `typedoc.json`，包含以下主要配置：

- **入口点**: `src/index.ts`
- **输出目录**: `docs/`
- **包含版本**: 是
- **排除私有成员**: 是
- **排除内部成员**: 是

## 文档分类

文档按以下类别组织：

1. Core - 核心模块（EventBus, StateManager, MemoryManager等）
2. Viewer - 查看器主类
3. Controls - 控制器（OrbitControls, TouchControls等）
4. Hotspots - 热点管理
5. Video - 视频全景
6. VR/AR - VR/AR支持
7. Plugins - 插件系统
8. Utilities - 工具函数

## 查看文档

生成后，在浏览器中打开 `docs/index.html` 即可查看完整的 API 文档。

## 文档注释规范

为了生成高质量的文档，请遵循以下规范：

```typescript
/**
 * 类或函数的简短描述
 * 
 * @remarks
 * 更详细的说明（可选）
 * 
 * @param paramName - 参数说明
 * @returns 返回值说明
 * 
 * @example
 * ```typescript
 * // 使用示例
 * const instance = new MyClass()
 * ```
 * 
 * @category 类别名称
 */
```

### 常用标签

- `@param` - 参数说明
- `@returns` - 返回值说明
- `@throws` - 可能抛出的错误
- `@example` - 使用示例
- `@category` - 分类
- `@deprecated` - 标记为已废弃
- `@see` - 参考链接
- `@internal` - 内部使用（不会出现在文档中）
- `@public` / `@private` / `@protected` - 访问修饰符

## 部署文档

可以将生成的 `docs/` 目录部署到：

- GitHub Pages
- Netlify
- Vercel
- 或任何静态网站托管服务

### GitHub Pages 部署示例

1. 在 `.github/workflows/docs.yml` 中添加工作流
2. 推送到 GitHub
3. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

文档工作流已在 `.github/workflows/ci.yml` 中配置。
