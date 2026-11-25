---
title: "pnpm -r, --recursive"
headingIds: ["options","--workspace-concurrency","--no-bail","--no-sort","--reverse","--parallel","--resume-from-package_name","--stream","--aggregate-output","--report-summary","-w---workspace-root","--filter-package_selector","--filter-prod-package_selector"]
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

```sh
pnpm -r publish
```

默认情况下，递归的 `run`、`exec` 和 `test` 按拓扑顺序执行项目：依赖先于依赖它们的项目运行。使用 `--no-sort` 可禁用图排序，或使用 `--parallel` 无需等待依赖即可启动任务。递归的 `list` 也按相同顺序打印项目。

## 选项

要链接工作区包，请设置 [`linkWorkspacePackages`](/docs/workspaces#linkworkspacepackages) 或在安装时传入 `--link-workspace-packages`。

### --workspace-concurrency

- 默认值：**4 与可用 CPU 核心数中的较小者**
- 类型：**数字**

设置同时运行的最大任务数。如需不限并发，使用 `Infinity`。

在设有 CPU 配额的容器中（例如 Kubernetes 的 CPU limit），当配额小于容器可使用的 CPU 数量时，可用核心数即为该配额。小数配额向下取整，且至少为 1。

取值小于等于 0 时，任务数为可用 CPU 核心数减去该值的绝对值，且至少为 `1`。对应的设置是 `workspaceConcurrency`。

### --[no-]bail

- 默认值：**true**
- 类型：**布尔值**

为 true 时，某个任务抛出错误即停止。仍在运行的任务也会被停止：在 Unix 上它们会收到 `SIGTERM`，两秒后仍在运行的则收到 `SIGKILL`；在 Windows 上，它们连同启动的每个进程会被立即结束。

`--no-bail` 仅被 `run`、`exec`、`test`、`start`、`stop`、`rebuild`、`install-test` 以及 `pnpm <script>` 简写接受。其他命令会拒绝它。

使用 `--no-bail` 时，依赖于失败任务的任务会被跳过，而相互独立的任务会继续运行。
此配置不影响退出码：只要有任一任务失败，命令就以非零码退出。
参见 [`--no-bail`](/docs/workspace-task-orchestration#--no-bail)。

示例（在每个包中运行测试，其中一个失败时继续）：

```sh
pnpm -r --no-bail test
```

### --[no-]sort

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，命令遵循工作区依赖图。递归 `run` 还会应用 [`tasks` 设置](/docs/workspace-task-orchestration) 中的关系。传入 `--no-sort` 可移除图排序，这同时会使 `tasks`、`--reverse` 和 `--resume-from` 不再适用。

示例：

```sh
pnpm -r --no-sort test
```

### --reverse

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，依赖边会被反转。对于递归 `run`，这会反转解析后的任务图，包括通过 `dependsOn` 声明的关系。

```sh
pnpm -r --reverse run clean
```

### --parallel

参见 [`pnpm run --parallel`](/docs/cli/run#--parallel)。

### --resume-from <package_name>

参见 [`pnpm run --resume-from`](/docs/cli/run#--resume-from-package_name)。

### --stream

参见 [`pnpm run --stream`](/docs/cli/run#--stream)。

### --aggregate-output

参见 [`pnpm run --aggregate-output`](/docs/cli/run#--aggregate-output)。

### --report-summary

参见 [`pnpm run --report-summary`](/docs/cli/run#--report-summary)。

### -w, --workspace-root

参见 [`--workspace-root`](/docs/pnpm-cli#-w---workspace-root)。

### --filter <package_selector>

更多过滤说明见[过滤](/docs/filtering)。

### --filter-prod <package_selector>

参见 [`--filter-prod`](/docs/filtering#--filter-prod-filtering_pattern)。
