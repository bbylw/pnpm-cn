---
title: "pnpm tasks"
headingIds: ["commands","status","examples","see-also"]
---

自 v12.6.0 起提供

查看[并发组](/docs/workspace-task-orchestration#concurrencygroups)中的任务。

:::note[说明]

如果你的包或工作区在 `package.json` 中定义了名为 `"tasks"` 的脚本，那么运行 `pnpm tasks` 时该脚本优先生效。使用 [`pnpm pm tasks`](/docs/cli/pm) 可强制使用内置命令。

:::

## 命令

必须指定子命令。不带子命令或带未知子命令的 `pnpm tasks` 会执行失败。

### status

显示[并发组](/docs/workspace-task-orchestration#concurrencygroups)中正在运行和等待的任务。

```sh
pnpm tasks status [groups...]
```

列出各[并发组](/docs/workspace-task-orchestration#concurrencygroups)中正在运行（占用中的持有者）和等待中的任务，包括每个任务已运行或已等待的时长、进程 ID 以及工作目录。当优先级不为 0 时，等待中的任务还会显示其[任务优先级](/docs/workspace-task-orchestration#task-priority)。

#### 示例

显示共享同一[`stateDir`](/docs/settings/other#statedir)的 pnpm 进程正在使用的全部活跃并发组：

```sh
pnpm tasks status
```

当前没有并发组在使用时，pnpm 输出：

```text
No concurrency groups are in use.
```

查看指定的并发组：

```sh
pnpm tasks status cargo typescript
```

指定组名时，pnpm 仅输出这些组的状态，包括处于空闲状态的组：

```text
cargo
  running
    build:native  12s
      pid 45123 in /workspace/crates/native
  waiting
    1. test:native  3s  priority 2
      pid 45201 in /workspace/crates/native
    2. bench:native  1s
      pid 45210 in /workspace/crates/native

typescript: idle
```

## 参见

* [工作区任务编排](/docs/workspace-task-orchestration#concurrencygroups)
* [任务优先级](/docs/workspace-task-orchestration#task-priority)
* [pnpm pm](/docs/cli/pm)
