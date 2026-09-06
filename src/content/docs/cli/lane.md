---
title: "pnpm lane"
headingIds: ["usage","show-lane-membership","move-packages-onto-a-lane","move-packages-back-to-the-main-lane","versions-on-a-lane","options","--filter-package_selectorgt"]
---

自 v11.13.0 起提供

管理按包划分的发布轨道（lane）。lane 是一条平行的发布轨道：当某个包位于某条 lane 上时，不带 lane 选项的 [pnpm version -r](/docs/cli/version#recursive-releases) 会把它发布为 `X.Y.Z-<lane>.N` 预发布版本，而工作区的其余包继续发布稳定版本。将包移回主 lane 后，下一次运行时将发布其积累的稳定版本。

```bash
pnpm lane
pnpm lane <name> --filter <pattern>
pnpm lane main --filter <pattern>
```

lane 的归属信息保存在 `pnpm-workspace.yaml` 的 [versioning.lanes](/docs/settings/versioning#versioninglanes) 键下；此命令是用于编辑该键的便捷工具。

## 用法

### 查看 lane 归属

```bash
pnpm lane
```

```
Lanes:
  alpha:
    @example/cli
    @example/napi
```

如果没有包被分配到 lane，此命令会打印 `All packages are on the main lane.`

### 将包移入 lane

```bash
pnpm lane alpha --filter @example/cli
```

必须提供 `--filter`，它选择要移动的包。lane 名称只能包含字母数字字符和连字符，且不能是纯数字。

### 将包移回主 lane

```bash
pnpm lane main --filter @example/cli
```

`main` 是默认 lane 的保留名称。除非被分配到其他 lane，每个包都在 `main` 上，且其上的包发布稳定版本。让包毕业，会在下一次 `pnpm version -r` 运行时发布其预发布版本一直在构建的稳定版本。

## lane 上的版本

位于 lane 上的包发布 `X.Y.Z-<lane>.N`，其中 `X.Y.Z` 是该 lane 正在构建面向的稳定版本，`N` 从 `0` 开始递增：

| **当前版本** | **待定意图** | **Lane** | **新版本** |
| --- | --- | --- | --- |
| `2.0.0` | minor | `alpha` | `2.1.0-alpha.0` |
| `2.1.0-alpha.0` | patch | `alpha` | `2.1.0-alpha.1` |
| `2.1.0-alpha.1` | major | `alpha` | `3.0.0-alpha.0` |
| `3.0.0-alpha.0` | — | `main` | `3.0.0` |

每当稳定目标版本变化时，`N` 都从 `0` 重新开始。当版本提升抬高了目标时（例如 lane 原本在构建 minor，而提升意图是 `major`），目标会重新计算，计数也会重置。

同一[固定组](/docs/versioning#fixed-groups)中的包必须一起在各 lane 之间移动。

## 选项

### --filter <package_selector&gt;

选择在 lane 之间移动的包。分配 lane 时必需。

[Read more about filtering.](/docs/filtering)
