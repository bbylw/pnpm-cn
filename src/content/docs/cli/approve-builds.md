---
title: "pnpm approve-builds"
headingIds: ["usage","options","--all","--global--g"]
---

自 v10.1.0 起提供

批准依赖在安装期间运行脚本。

已批准的依赖会以 `true` 的值加入 `pnpm-workspace.yaml` 中的 [allowBuilds](/docs/settings/build#allowbuilds) 映射，未批准的则以 `false` 保存。如果你愿意，也可以手动更新这些设置。

## 用法

你可以在不带参数的情况下运行 `pnpm approve-builds` 以获得交互式提示，或将包名作为位置参数传入：

```bash
pnpm approve-builds esbuild fsevents !core-js
```

在包名前加 `!` 以拒绝它。只有被提及的包会受影响，其余保持不变。

在安装期间，构建被忽略且尚未列入 `allowBuilds` 的包会自动以占位值加入 `pnpm-workspace.yaml`，因此你可以手动将它们设为 `true` 或 `false`。

自 v11.23.0 起，写入 `allowBuilds` 同时会从 `pnpm-workspace.yaml` 中移除 `onlyBuiltDependencies`、`onlyBuiltDependenciesFile`、`neverBuiltDependencies` 和 `ignoredBuiltDependencies`。`allowBuilds` 在 pnpm 11 中取代了这些设置，此后它们一直被忽略，因此从 pnpm 10 迁移过来的工作区会保留它们并看起来仍然生效。

## 选项

### --all

自 v10.32.0 起提供

批准所有待处理构建，无需交互式提示。

### --global, -g

为[全局安装的包](/docs/global-packages)批准构建。

pnpm 会在**每一个** [isolated install group](/docs/global-packages#isolated-installations) 中收集待批准的包，只询问一次，并把单一策略写入全局包目录的 `pnpm-workspace.yaml`。随后只有实际包含被批准包的组会被重建。

:::info[在 v11.0.0 移除，v11.24.0 恢复]

隔离的全局安装曾让每个安装组拥有各自的清单，`pnpm approve-builds -g` 因此被移除，而不是去猜测该写入哪一个。自 v11.24.0 起它为所有组写入单一策略，所以又能用了。在此之间，以及若你更倾向于在安装时决定，可在安装全局包时使用 `--allow-build`（例如 `pnpm add -g --allow-build=esbuild esbuild`），或响应 pnpm 在全局安装期间显示的提示。

:::
