---
title: "pnpm -r, --recursive"
headingIds: ["options","--link-workspace-packages","--workspace-concurrency","--no-bail","--no-sort","--reverse","--filter-package_selector"]
---

别名： `m`, `multi`, `recursive`, `<command> -r`

与以下命令搭配使用时，在工作区的每个项目中运行命令：

- `install`
- `list`
- `outdated`
- `publish`
- `pack`
- `rebuild`
- `remove`
- `unlink`
- `update`
- `why`

与以下命令搭配使用时，在工作区的每个项目（不含根项目）中运行命令：

- `exec`
- `run`
- `test`
- `add`

如果希望运行脚本时也包含根项目，将 [includeWorkspaceRoot](/docs/workspaces#includeworkspaceroot) 设置为 `true`。

用法示例：

```
pnpm -r publish
```

## 选项

### --link-workspace-packages

- 默认值：**false**
- 类型：**true, false, deep**

将 monorepo 工作区中本地可用的包链接到 `node_modules`，而不是从 registry 重新下载。这模拟了与 `yarn workspaces` 类似的功能。

将其设为 deep 时，本地包也可以链接到子依赖。

建议改为在 [pnpm-workspace.yaml](/docs/workspaces#linkworkspacepackages) 中设置此项，以便在所有环境中强制相同行为。此选项的存在只是为了让你在必要时进行覆盖。

### --workspace-concurrency

- 默认值：**4**
- 类型：**数字**

设置同时运行的最大任务数。如需不限并发，使用 `Infinity`。

你可以将 `workspace-concurrency` 设为 `<= 0`，此时按宿主机核心数使用：`max(1, (number of cores) - abs(workspace-concurrency))`

### --[no-]bail

- 默认值：**true**
- 类型：**布尔值**

为 true 时，任一任务抛出错误即停止。

此配置不影响退出码。即使使用 `--no-bail`，所有任务也会全部完成，但若其中任一任务失败，命令仍以非零码退出。

示例（在每个包中运行测试，其中一个失败时继续）：

```bash
pnpm -r --no-bail test
```

### --[no-]sort

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，命令遵循工作区依赖图。递归 `run` 还会应用 [tasks 设置](/docs/workspace-task-orchestration) 中的关系。传入 `--no-sort` 可移除图排序，这同时会使 `tasks`、`--reverse` 和 `--resume-from` 不再适用。

Example:

```bash
pnpm -r --no-sort test
```

### --reverse

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，依赖边会被反转。对于递归 `run`，这会反转解析后的任务图，包括通过 `dependsOn` 声明的关系。

```
pnpm -r --reverse run clean
```

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
