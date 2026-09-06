---
title: "pnpm exec"
headingIds: ["examples","options","--recursive--r","examples-1","--no-reporter-hide-prefix","--resume-from-package_name","--parallel","--shell-mode--c","--report-summary","--filter-package_selector"]
---

在某个项目范围内执行 shell 命令。

`node_modules/.bin` 会被添加到 `PATH` 中，因此 `pnpm exec` 允许执行依赖的命令。

## 示例

如果你的项目将 Jest 作为依赖，就无需全局安装 Jest，直接用 `pnpm exec` 运行它即可：

```
pnpm exec jest
```

当命令与内置 pnpm 命令不冲突时，`exec` 部分其实是可选的，因此你也可以直接运行：

```
pnpm jest
```

## 选项

`exec` 命令的任何选项都应列在 `exec` 关键字之前。列在 `exec` 关键字之后的选项会传给被执行的命令。

正确。pnpm 会递归运行：

```
pnpm -r exec jest
```

错误，pnpm 不会递归运行，但 `jest` 会带着 `-r` 选项被执行：

```
pnpm exec jest -r
```

### --recursive, -r

在工作区的每个项目中执行该 shell 命令。

当前包的名称可通过环境变量 `PNPM_PACKAGE_NAME` 获取。

#### 示例

清理所有包的 `node_modules` 安装：

```
pnpm -r exec rm -rf node_modules
```

查看所有包的包信息。为了让环境变量生效，这应与 `--shell-mode`（或 `-c`）选项一起使用。

```
pnpm -rc exec pnpm view \$PNPM_PACKAGE_NAME
```

### --no-reporter-hide-prefix

并行运行命令时不隐藏前缀。

### --resume-from <package_name>

从某个特定项目恢复执行。pnpm 会跳过之前递归 `exec` 的匹配记录中已显示通过的项目。若没有这样的记录，它会省略被点名项目的传递性依赖，但仍会运行被点名的项目、它的依赖方以及所选图中无关的项目。参见[工作区任务
编排](/docs/workspace-task-orchestration#--resume-from-package_name)。

### --parallel

完全忽略并发和拓扑排序，在所有匹配的包中立即运行给定脚本。对于跨越许多包的长时间运行进程，例如冗长的构建过程，这是首选标志。

### --shell-mode, -c

在 shell 中运行命令。在 UNIX 上使用 `/bin/sh`，在 Windows 上使用 `\cmd.exe`。

### --report-summary

[Read about this option in the run command docs](/docs/cli/run#--report-summary)

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
