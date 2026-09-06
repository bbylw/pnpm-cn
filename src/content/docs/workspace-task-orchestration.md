---
title: "工作区任务编排"
headingIds: ["configure-task-dependencies","projects-without-a-script","limit-concurrency-for-one-task","inspect-the-task-graph","cycles","recursive-run-options","--resume-from-package_name","--reverse","--no-bail","output","commands-that-do-not-use-tasks","other-dependency-aware-workspace-commands"]
---

`pnpm -r run <script>` 会调度一个工作区任务图。一个任务是某个工作区项目中的一个脚本，标识为 `<project>#<script>`。当它所依赖的每个任务都成功完成后它就就绪，而就绪的任务在 [--workspace-concurrency](/docs/cli/recursive#--workspace-concurrency) 限制下运行。

相互独立的任务不会等待一个无关的项目完成。因此它们的启动和完成顺序不保证。

## 配置任务依赖

在 `pnpm-workspace.yaml` 的 `tasks` 下声明任务之间的关系：

pnpm-workspace.yaml

```yaml
packages:
  - packages/*

tasks:
  build:
    dependsOn:
      - ^build
  test:
    dependsOn:
      - build
```

每个 `dependsOn` 条目都有以下几种形式之一：

| **Entry** | **Meaning** |
| --- | --- |
| `build` | 同一项目中的 `build` 任务 |
| `^build` | 项目每个被选中的工作区依赖中的 `build` 任务 |

在本例中，`pnpm -r run test` 会在每个项目中先运行 `build`。某个项目的 `build` 会等待其工作区依赖中的 `build`。

在 `tasks` 下没有条目的任务，默认依赖于其工作区依赖中的同名任务。例如，一个未配置的 `build` 的行为等同于 `dependsOn: ['^build']`，保留了通常的“依赖先于依赖方”行为。

:::warning[warning]

一旦某个任务在 `tasks` 下有了条目，省略 `dependsOn` 就等同于 `dependsOn: []`。如果你配置了其他字段但仍想要默认的拓扑关系，就显式声明它：

pnpm-workspace.yaml

```yaml
tasks:
  build:
    concurrency: 2
    dependsOn:
      - ^build
```

:::

任务依赖保持在 `--filter` 和 `includeWorkspaceRoot` 所选中的项目之内。一个 `dependsOn` 条目不会扩大该选择范围。

### 没有该脚本的项目

如果某个被选中的项目没有图中所指名称的脚本，pnpm 会把该任务视为透传。该任务在其自身依赖完成后会被报告为已跳过，因此一个没有 `build` 的包不会切断其工作区依赖与依赖方之间的构建链。

## 限制单个任务的并发

将 `concurrency` 设为一个正整数，以限制一个具名任务在各工作区项目中一次最多可运行多少个实例：

pnpm-workspace.yaml

```yaml
tasks:
  build:
    concurrency: 2
    dependsOn:
      - ^build
```

此限制与工作区范围的 [--workspace-concurrency](/docs/cli/recursive#--workspace-concurrency) 限制是分开的。一个正在等待其两个槽位之一的 `build` 不会占用工作区槽位，因此一个无关的就绪任务仍可运行。

## 查看任务图

使用 `--dry-run` 在不运行脚本的情况下解析图：

```bash
pnpm -r run --dry-run build
```

输出是一个稳定的拓扑排序，平局时按项目目录打破。它不是对分发顺序的预测：独立任务可以按任意顺序运行。

添加 `--json` 以接收图的节点和边：

```bash
pnpm -r run --dry-run --json test
```

```json
{
  "tasks": [
    {
      "project": "packages/app",
      "script": "build",
      "missingScript": false,
      "dependsOn": [
        { "project": "packages/lib", "script": "build" }
      ]
    },
    {
      "project": "packages/app",
      "script": "test",
      "missingScript": false,
      "dependsOn": [
        { "project": "packages/app", "script": "build" }
      ]
    }
  ]
}
```

`project` 相对于工作区根目录。`tasks` 数组和每个 `dependsOn` 数组都按项目和脚本排序，从而使输出稳定。

## 循环

pnpm 在项目选择和任务展开之后检查图。一个循环会在任何脚本启动之前以 `ERR_PNPM_TASK_CYCLE` 失败，并且错误会指明参与的任务。

只有在循环是有意为之的情况下，才将 [ignoreWorkspaceCycles](/docs/workspaces#ignoreworkspacecycles) 设为 `true`。此后 pnpm 会发出警告，去除循环成员之间的顺序，并可能以任意相互顺序运行它们。

## 递归运行选项

### `--resume-from <package_name>`

所指定包的所请求任务即为恢复点。

pnpm 会在一次递归 `run` 或 `exec` 进行中记录哪些任务通过。当该记录属于同一次调用——相同的所选项目、命令、参数以及影响执行的设置（包括 `run` 的脚本内容）——`--resume-from` 会准确地跳过记录显示已通过的任务，无论它们在图中的位置，并运行其他所有任务。由不同调用留下的记录会被忽略而不被信任。

在没有可用记录时——首次运行、在有任何任务通过之前被中断的运行，或 pnpm 无法写入的 `node_modules` 目录——pnpm 会退回到图位置：它省略恢复点的传递依赖，将它们视为已完成，但仍会运行恢复任务、它的依赖方以及所选图中无关的任务。该假设在一次失败的运行后成立，而在一次被取消的运行后不成立，因为在被取消的运行中某个依赖可能从未开始。

### `--reverse`

pnpm 会反转解析后任务图中的每条边，包括用 `dependsOn` 声明的关系。通常依赖于另一个任务的任务会在其之前运行。

### `--no-bail`

在一个任务失败后，依赖于它的任务会被跳过。使用 `--no-bail` 时，独立的就绪任务会继续运行，命令在它们全部结束后以非零代码退出。

在默认的 `--bail` 下，pnpm 会在首次失败后停止分发新任务，并取消已在运行的任务及其启动的进程。否则，一个不会自行退出的任务，比如 watcher 或 dev server，会让一次失败的运行无限期地保持存活。被取消的任务不会被报告为其自身的失败；导致运行停止的那次失败才是被报告的那一个。

### 输出

当任意时刻最多只能有一个脚本在运行时——要么因为工作区并发为 `1`，要么因为图构成一条串行链——pnpm 会直接继承脚本的输出。当脚本可以重叠运行时，pnpm 会以管道方式处理它们的输出，以便为其加前缀或聚合。使用 [--stream](/docs/cli/run#--stream) 可获得即时加前缀的输出，或使用 [--aggregate-output](/docs/cli/run#--aggregate-output) 在每个任务结束后将其输出集中打印。

## 不使用 `tasks` 的命令

`tasks` 声明配置的是递归 `run`。递归 `exec` 遵循工作区项目依赖，但没有脚本任务名称，因此它不会加入已声明的 `dependsOn` 关系。它仍会使用上述的依赖感知调度器和持久化的 `--resume-from` 状态。

`--no-sort` 会去除图排序，而 `--parallel` 隐含 `--no-sort`。因此，这两个选项都会忽略 `tasks` 声明；`--reverse` 和 `--resume-from` 也没有可供转换的顺序边。

## 其他依赖感知的工作区命令

工作区的安装、重建、打包、发布、暂存和生命周期工作使用相同的就绪队列调度原则：一个项目的工作会在其工作区依赖一完成就启动。这些命令遵循工作区包图，而不是 `tasks` 下的脚本关系，不再先等待一个无关的拓扑组完成。
