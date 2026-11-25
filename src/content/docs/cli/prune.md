---
title: "pnpm prune"
headingIds: ["options","--prod--p---production","--dev--d","--no-optional","--ignore-scripts","--trust-lockfile","--recursive--r","--filter-package_selector"]
---

从 `node_modules` 中移除多余的包：即不再出现在锁文件中的包。

```sh
pnpm prune
```

当 `nodeLinker: hoisted` 时，pnpm 会移除所选项目的 `node_modules` 目录中多余的包链接，而链接目标仍保留在磁盘上。

## 选项

### --prod, -P, --production

移除 `devDependencies` 中指定的包。

### --dev, -D

只保留 `devDependencies` 中指定的包。

### --no-optional

移除 `optionalDependencies` 中指定的包。

### --ignore-scripts

不运行生命周期脚本。即使 `ignoreScripts` 设置为 `true`，`--no-ignore-scripts` 也会运行它们。

### --trust-lockfile

自 v12.15.0 起提供

跳过对锁文件的供应链策略校验。`pnpm prune` 同时遵循配置中的 [`trustLockfile`](/docs/settings/dependency-resolution#trustlockfile)。`--no-trust-lockfile` 则会在配置信任锁文件时仍然校验它。

### --recursive, -r

在每个子目录中找到的包中运行 `pnpm prune`；在工作区中执行时，则作用于每个工作区包。在工作区根目录运行 `pnpm prune` 时默认就在整个工作区上递归执行。

### --filter <package_selector>

将 `pnpm prune` 限制到所选的工作区项目。更多过滤说明见[过滤](/docs/filtering)。
