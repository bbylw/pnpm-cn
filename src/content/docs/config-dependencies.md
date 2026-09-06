---
title: "配置依赖"
headingIds: ["how-to-add-a-config-dependency","platform-specific-binaries-via-optionaldependencies","usage","installing-dependencies-used-in-hooks","updating-pnpm-settings-dynamically","loading-patch-files"]
---

配置依赖（config dependencies）允许你在多个项目之间共享并集中管理配置文件、设置和钩子。它们在所有常规依赖（「dependencies」「devDependencies」「optionalDependencies」）之前安装，因此非常适合用于设置自定义钩子、补丁和 catalog 条目。

配置依赖帮助你把钩子、设置、补丁、覆盖、catalog、规则集中在一处，并在多个仓库之间使用。

如果你的配置依赖按 `pnpm-plugin-*`、`@*/pnpm-plugin-*` 或 `@pnpm/plugin-*` 模式命名，pnpm 会自动从包根目录加载其 `pnpmfile.mjs`（回退到 `pnpmfile.cjs`）。

## 如何添加配置依赖

配置依赖定义在你的 `pnpm-workspace.yaml` 中。其完整性校验和存储在 `pnpm-lock.yaml`（位于专门的 [env 锁文件文档](/docs/lockfile)中）。

例如，运行 `pnpm add --config my-configs` 会将以下条目添加到你的 `pnpm-workspace.yaml`：

pnpm-workspace.yaml

```yaml
configDependencies:
  my-configs: "1.0.0"
```

**Important:**

- 配置依赖**不能**拥有自己的常规 `dependencies`。**可以**声明 `optionalDependencies`，但只有一层，`optionalDependencies` 的 `optionalDependencies` 会被忽略。
- 配置依赖**不能**定义生命周期脚本（如 `preinstall`、`postinstall` 等）。

### 通过 `optionalDependencies` 提供平台特定二进制

配置依赖可以像 esbuild、swc 等工具一样，通过 `optionalDependencies` 分发平台特定二进制。每个平台二进制包用 `os`、`cpu` 和/或 `libc` 字段声明其支持的平台，pnpm 只安装与当前主机匹配的变体。匹配的二进制会以符号链接放置在全局虚拟存储中父配置依赖的旁边，因此在配置依赖内部调用 `require('my-config-platform-arch')` 可在运行时解析。

env 锁文件会记录所有平台变体，与主机平台无关，因此锁文件可以跨机器移植。

`optionalDependencies` 中的每个条目都必须以**确切**版本声明（如 `"1.2.3"`），不接受范围（`"^1.0.0"`、`"~1.0.0"`）和标签（`"latest"`）。这保证了配置依赖的安装可复现：对于被完整性校验锁定的父包，其解析出的子依赖不会在不同机器之间漂移。

## 用法

### 安装钩子中使用的依赖

配置依赖会在你的 [.pnpmfile.mjs](/docs/pnpmfile) 中的钩子被加载**之前**安装，因此你可以从配置包中导入逻辑。

Example:

.pnpmfile.mjs

```js
import { readPackage } from '.pnpm-config/my-hooks'

export const hooks = {
  readPackage
}
```

### 动态更新 pnpm 设置

借助 [updateConfig](/docs/pnpmfile#hooksupdateconfigconfig-config--promiseconfig) 钩子，你可以利用配置依赖动态更新 pnpm 的设置。

例如，以下 `pnpmfile` 会向 pnpm 配置添加一个新的 [catalog](/docs/catalogs) 条目：

@myorg/pnpm-plugin-my-catalogs/pnpmfile.mjs

```js
export const hooks = {
  updateConfig (config) {
    config.catalogs.default ??= {}
    config.catalogs.default['is-odd'] = '1.0.0'
    return config
  }
}
```

如果你将其作为配置依赖安装：

```
pnpm add --config @myorg/pnpm-plugin-my-catalogs
```

然后即可运行：

```
pnpm add is-odd@catalog:
```

这将安装 `is-odd@1.0.0` 并在你的 `package.json` 中添加以下内容：

```json
{
  "dependencies": {
    "is-odd": "catalog:"
  }
}
```

这让跨项目维护和共享集中式配置与依赖版本变得简单。

### 加载补丁文件

你可以引用存储在配置依赖内部的[补丁文件](/docs/cli/patch)。

Example:

pnpm-workspace.yaml

```yaml
configDependencies:
  my-patches: "1.0.0"
patchedDependencies:
  react: "node_modules/.pnpm-config/my-patches/react.patch"
```
