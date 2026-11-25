---
title: "pnpm approve-builds"
headingIds: ["usage","options","--all","--global--g"]
---

自 v10.1.0 起提供

批准依赖在安装期间运行脚本。

已批准的依赖会以 `true` 的值加入 `pnpm-workspace.yaml` 中的 [allowBuilds](/docs/settings/build#allowbuilds) 映射，未批准的则以 `false` 保存。如果你愿意，也可以手动更新这些设置。

自 v12.11.0 起，当 `pnpm-workspace.yaml` 中已经存在 [permissions](/docs/settings/build#permissions) 设置时，这些决策会改为以 `build` 能力的形式写入其中。若还要审查 Agent 技能，请使用 [pnpm approve](/docs/cli/permissions)。

## 用法

你可以在不带参数的情况下运行 `pnpm approve-builds` 以获得交互式提示，或将包名作为位置参数传入：

```bash
pnpm approve-builds esbuild fsevents !core-js
```

裸包名只批准默认 registry 上的依赖。若要批准 `file:`、git 或 tarball 依赖，请使用 `pnpm ignored-builds` 所显示的完整选择器。例如，运行 `pnpm approve-builds 'example@file:../example'`。

当还有包等待批准时，不带包参数也不带 `--all` 运行 `pnpm approve-builds`，需要在 CI 之外拥有交互式终端（`ERR_PNPM_APPROVE_BUILDS_NON_INTERACTIVE`）。

在包名前加 `!` 以拒绝它。只有被提及的包会受影响，其余保持不变。被批准且正在等待批准的包会立即重建。同时把某个包既标为批准又标为拒绝会失败，错误码为 `ERR_PNPM_APPROVE_BUILDS_CONTRADICTING_ARGS`。

自 v12.4.0 起，即使没有包等待批准也会保存决策，因此可以在包被安装之前就写入策略。被指名但并未等待批准的包只会给出警告而不是错误，也不会被重建：它可能尚未安装，而重建它需要项目可能并不具备的 lockfile。完全不指名任何包的参数会在写入任何内容之前被拒绝。

在安装期间，构建被忽略且尚未列入 `allowBuilds` 的包会自动以占位值 `set this to true or false` 加入 `pnpm-workspace.yaml`，因此你可以手动将它们设为 `true` 或 `false`。

写入 `allowBuilds` 同时会从 `pnpm-workspace.yaml` 中移除已被忽略的旧设置 `onlyBuiltDependencies`、`onlyBuiltDependenciesFile`、`neverBuiltDependencies` 和 `ignoredBuiltDependencies`。

## 选项

### --all

自 v10.32.0 起提供

批准所有待处理构建，无需交互式提示。不能与包名一起使用（`ERR_PNPM_APPROVE_BUILDS_ALL_WITH_ARGS`）。

### --global, -g

为[全局安装的包](/docs/global-packages)批准构建。

pnpm 会在**每一个** [isolated install group](/docs/global-packages#isolated-installations) 中收集待批准的包，只询问一次，并把决策写入全局 `config.yaml` 中的 [globalPackagesConfig.permissions](/docs/configuring#settings-for-global-packages)。随后只有实际包含被批准包的组会被重建。
