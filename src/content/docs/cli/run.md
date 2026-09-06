---
title: "pnpm run"
headingIds: ["examples","running-multiple-scripts","details","environment","options","--recursive--r","--if-present","--no-bail","--parallel","--sequential--s","--stream","--aggregate-output","--resume-from-package_name","--dry-run","--json","--report-summary","--reporter-hide-prefix","--filter-package_selector","pnpm-workspaceyaml-settings","enableprepostscripts","scriptshell","shellemulator"]
---

别名： `run-script`

运行包 manifest 文件中定义的脚本。

## 示例

假设你在 `package.json` 中配置了 `watch` 脚本，如下所示：

```json
"scripts": {
    "watch": "webpack --watch"
}
```

现在你可以用 `pnpm run watch` 运行该脚本！很简单，对吧？对于想少按键、省时间的人，另需注意：所有脚本都会被别名为 pnpm 命令，因此 `pnpm watch` 只是 `pnpm run watch` 的简写（仅限与现有 pnpm 命令不同名的脚本）。

## 运行多个脚本

你可以用正则表达式代替脚本名，同时运行多个脚本。

```bash
pnpm run "/<regex>/"
```

运行所有以 `watch:` 开头的脚本：

```bash
pnpm run "/^watch:.*/"
```

选择器必须写成正则表达式字面量（即用斜杠包裹）并加上引号，以免被 shell 破坏。普通字符串始终被视为字面脚本名，名称与参数完全匹配的脚本优先于正则匹配。

匹配不锚定，因此 `"/build:.*/"` 也会匹配 `prebuild:web`。需要精确前缀时，用 `^` 和 `$` 锚定模式。

匹配到的脚本按字典序运行，因此无论脚本在 `package.json` 中以何种顺序出现，选择结果都是确定性的。如需严格逐个运行，添加 [--sequential](#--sequential--s)。

不支持正则表达式标志：`pnpm run "/^build:.*/i"` 会失败并报 `ERR_PNPM_UNSUPPORTED_SCRIPT_COMMAND_FORMAT` 错误。

## 详情

除了 shell 原有的 `PATH` 之外，`pnpm run` 还会将 `node_modules/.bin` 包含在提供给 `scripts` 的 `PATH` 中。这意味着只要安装了某个包，你就可以在脚本中像使用常规命令一样使用它。例如，如果你安装了 `eslint`，可以这样编写脚本：

```json
"lint": "eslint src --fix"
```

即使 `eslint` 没有在 shell 中全局安装，它也能运行。

对于工作区，`<workspace root>/node_modules/.bin` 也会被添加到 `PATH` 中，因此只要工具安装在工作区根目录，它就可以在任意工作区包的 `scripts` 中被调用。

## 环境

pnpm 会为被执行的脚本自动创建一些环境变量。你可以使用这些环境变量获取运行进程的上下文信息。

以下是 pnpm 创建的环境变量：

- **npm_command** - 包含被执行的命令名。如果执行的命令是 `pnpm run`，则该变量的值为 "run-script"。

## 选项

`run` 命令的任何选项都应写在脚本名之前。写在脚本名之后的选项会传给被执行的脚本。

以下写法都会以 `--silent` 选项运行 pnpm CLI：

```bash
pnpm run --silent watch
pnpm --silent run watch
pnpm --silent watch
```

命令名之后的任何参数都会追加给被执行的脚本。因此如果 `watch` 运行的是 `webpack --watch`，那么此命令：

```bash
pnpm run watch --no-color
```

将运行：

```bash
webpack --watch --no-color
```

### --recursive, -r

这会运行每个包 "scripts" 对象中的任意命令。如果某个包没有该命令，则跳过它。如果所有包都没有该命令，则命令失败。

默认情况下，递归运行使用感知依赖的任务图。通过 [tasks 设置](/docs/workspace-task-orchestration) 配置脚本之间的关系。`--no-sort` 以及隐含它的 `--parallel` 会移除该排序，并随之忽略 `tasks` 声明。

### --if-present

你可以使用 `--if-present` 标志，避免脚本未定义时以非零退出码退出。这让你可以运行可能未定义的脚本而不中断执行链。

### --no-bail

即使其中一个失败，也继续运行其余匹配的脚本。只要有脚本失败，命令仍以非零退出码退出。

### --parallel

完全忽略并发与拓扑排序，立即在所有匹配的包中运行给定脚本，并以带前缀的流式方式输出。对于要在许多包中长期运行的进程，这是首选标志，例如耗时的构建过程。

### --sequential, -s

自 v11.14.0 起提供

逐个运行选中的脚本。这会将 [--workspace-concurrency](/docs/cli/recursive#--workspace-concurrency) 强制设为 `1`，因此 [正则选择器](#running-multiple-scripts) 匹配到的脚本绝不会重叠运行，无论是在不同工作区包之间还是在单个包内。

```bash
pnpm run --sequential "/^build:.*/"
```

在递归运行中，这会在各工作区项目之间以及每个项目内部串行化脚本。`--sequential` 优先于 `--parallel`：只要设置了它，并发数就被固定为 `1`，与两个标志出现的顺序无关。

:::note[说明]

对于 `pnpm run`，`-s` 是 `--sequential` 的简写。在 CLI 的其他所有位置，`-s` 仍是 `--reporter=silent` 的简写。长格式 `--silent` 在所有命令中均不受影响。

:::

### --stream

立即流式输出子进程的输出，并以来源包目录作为前缀。这允许不同包的输出交错出现。

### --aggregate-output

聚合并行运行的子进程的输出，仅在子进程结束后打印。这让在使用 `--parallel` 或 `--workspace-concurrency=<number>` 运行 `pnpm -r <command>` 后阅读大量日志变得容易得多（尤其在 CI 上）。仅支持 `--reporter=append-only`。

### --resume-from <package_name>

从指定包被请求的任务处恢复运行。pnpm 会跳过上次运行的匹配记录中已通过的任务；若没有这样的记录，则改为省略该任务的传递依赖，将其视为已完成。无论哪种情况，该任务本身、依赖它的任务以及所选图中的无关任务仍会运行。参见[工作区任务编排](/docs/workspace-task-orchestration#--resume-from-package_name)。

### --dry-run

解析递归运行的任务图但不执行脚本。普通输出是一种稳定的拓扑顺序，并非对独立任务派发顺序的预测。

```bash
pnpm -r run --dry-run build
```

`--dry-run` 仅支持递归运行。

### --json

配合 `--dry-run` 使用时，以 JSON 打印解析出的任务及其依赖边。结构定义与示例见[检查任务图](/docs/workspace-task-orchestration#inspect-the-task-graph)。

### --report-summary

将脚本执行结果记录到 `pnpm-exec-summary.json` 文件。

`pnpm-exec-summary.json` 文件示例：

```json
{
  "executionStatus": {
    "/Users/zoltan/src/pnpm/pnpm/cli/command": {
      "status": "passed",
      "duration": 1861.143042
    },
    "/Users/zoltan/src/pnpm/pnpm/cli/common-cli-options-help": {
      "status": "passed",
      "duration": 1865.914958
    }
  }
```

`status` 的可能取值：'passed'、'queued'、'running'。

### --reporter-hide-prefix

隐藏并行运行的子进程输出中的工作区前缀，仅打印原始输出。在 CI 上运行且输出必须为不带任何前缀的特定格式时，这会很有用（例如 [GitHub Actions 注解](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message)）。仅支持 `--reporter=append-only`。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

## pnpm-workspace.yaml 设置

[tasks 设置](/docs/workspace-task-orchestration) 为递归运行配置依赖关系和单任务并发上限。

### enablePrePostScripts

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，pnpm 会自动运行任何前后脚本。因此运行 `pnpm foo` 相当于运行 `pnpm prefoo && pnpm foo && pnpm postfoo`。

### scriptShell

- 默认值：**null**
- 类型：**路径**

使用 `pnpm run` 命令运行脚本时所用的 shell。

例如，要在 Windows 上强制使用 Git Bash：

```
pnpm config set scriptShell "C:\\Program Files\\git\\bin\\bash.exe"
```

### shellEmulator

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，pnpm 会使用 [类 bash shell](https://www.npmjs.com/package/@yarnpkg/shell) 的 JavaScript 实现来执行脚本。

此选项简化了跨平台脚本编写。例如，默认情况下，以下脚本会在非 POSIX 兼容系统上失败：

```json
"scripts": {
  "test": "NODE_ENV=test node test.js"
}
```

但如果将 `shellEmulator` 设置为 `true`，它就能在所有平台上工作。

:::note[说明]

Node.js 22 及更高版本支持在不借助 pnpm 的情况下运行脚本。对于上面的示例，你可以用 `node --run test` 运行 `test` 脚本。但 `shellEmulator` 选项对此无效。依赖 POSIX 特性的脚本必须用 `pnpm run` 而非 `node --run` 运行，才能在非 POSIX 兼容环境中工作。

:::
