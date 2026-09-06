---
title: "与 TypeScript 配合使用"
headingIds: ["do-not-preserve-symlinks","workspace-usage"]
---

大多数情况下，pnpm 无需额外配置就能与 TypeScript 良好配合。

## 不要保留符号链接

你不应在 [preserveSymlinks](https://www.typescriptlang.org/tsconfig/#preserveSymlinks) 设为 `true` 的情况下使用 TypeScript。TypeScript 将无法在链接的 `node_modules` 中正确解析类型依赖。如果出于某些原因你确实需要保留符号链接，那么应将 pnpm 的 `nodeLinker` 设置设为 `hoisted`。

## 工作区用法

如果工作区中存在 `@types/` 依赖的不同版本，你有时可能会遇到问题。这些问题发生在某个包需要这些类型，但其依赖中却没有该类型依赖时。例如，如果你的依赖中有 `antd`，而 `antd` 依赖于 `@types/react`，当你的工作区中存在多个 `@types/react` 版本时，你可能会遇到编译错误。这其实是 `antd` 端的问题，因为它本应将 `@types/react` 添加到 `peerDependencies`。好在，你可以通过为 `antd` 扩展缺失的对等依赖来修复它。你可以把下面这段内容添加到 `pnpm-workspace.yaml` 来实现：

```yaml
packageExtensions:
  antd:
    peerDependencies:
      '@types/react': '*'
```

或者，你可以安装我们为处理这些问题创建的一个配置依赖 [@pnpm/plugin-types-fixer](https://github.com/pnpm/plugin-types-fixer)。运行：

```bash
pnpm add @pnpm/plugin-types-fixer --config
```
