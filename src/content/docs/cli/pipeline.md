---
title: "pnpm pipeline"
headingIds: ["declaring-a-pipeline","what-a-run-does","caching-a-task","reusing-cargo-build-state","sharing-the-cache-between-machines","reporting-a-run","watching-a-repository","options","--dry-run","--json","--full","--base-ref","--no-cache","--report","--report-to-url","--repo-repo","--watch","--branch-name","--interval-seconds","--once","errors","settings","pipelines","pipelinebase"]
---

自 v12.4.0 起提供（仅 pnpm v12）

:::warning[警告]

`pnpm pipeline` 仍是实验性的。它的配置和输出可能变化。

:::

像 CI 作业那样运行一组命名的工作区任务：先做冻结安装，然后运行受影响项目的任务图，并从缓存恢复结果而不是重新运行。

```sh
pnpm pipeline [name]
```

不指定名称时运行名为 `default` 的流水线。

## 声明流水线

流水线是一组任务名，写在 `pnpm-workspace.yaml` 的 `pipelines` 中。它是一个集合而非序列：任务的运行顺序由 [`tasks.dependsOn`](/docs/workspace-task-orchestration#configure-task-dependencies) 决定。

```yaml
tasks:
  build:
    dependsOn: ['^build']
    outputs: ['dist/**']
  test:
    dependsOn: ['build']
    outputs: []
  lint:
    outputs: []

pipelines:
  default: [build, test, lint]
  release: [build]
```

```sh
pnpm pipeline          # build, test and lint
pnpm pipeline release  # build only
```

## 一次运行做了什么

1. 以冻结的锁文件执行安装。
2. 选出自基准修订以来受影响的项目，以及依赖它们的项目。
3. 在选中的范围内构建任务图并运行。
4. 恢复此前见过的关键键所对应的可缓存任务，其余任务照常运行。
5. 任务失败后继续执行，这样一次运行会报告所有失败，而不是只报第一个。

除非 [`includeWorkspaceRoot`](/docs/workspaces#includeworkspaceroot) 为 `true`，或者 `packages` 被省略或只列出根项目，否则工作区根目录不会进入选择范围。显式过滤器也可以选中根目录。

`--filter` 和 `--filter-prod` 会收窄流水线所请求的项目，`--full` 也同样适用。使用 `--base` 时，流水线会把该选择与受影响项目求交集。通过 `dependsOn` 引入的任务仍会运行，即使其项目在过滤器之外。除非被 git 忽略，受影响项目的选择会包含未跟踪的文件。

使用 `--dry-run` 可以在不安装配置依赖、不运行工作区钩子、也不执行任何任务的情况下查看任务图。加上 `--json` 可以输出节点和边。

## 缓存任务

通过声明 `outputs`，任务就变成可缓存的。声明 `outputs: []` 是对「该任务不产出文件」的明确表述，这正是让 lint 或测试运行可缓存的关键。没有 `outputs` 键的任务每次都会运行。

```yaml
tasks:
  build:
    dependsOn: ['^build']
    outputs: ['dist/**']
    inputs: ['src/**', 'tsconfig.json']
    env: ['NODE_ENV']
```

| 键 | 含义 |
| --- | --- |
| `outputs` | 相对于项目目录的 glob，表示任务产出的文件。以 `!` 前缀开头表示排除匹配的文件。这些文件的存在使任务可缓存。 |
| `inputs` | 收窄哪些内容进入缓存键的 glob。若不声明，已跟踪和未跟踪的文件都算在内，但排除被 gitignore 的文件以及项目中各任务声明的 outputs；`[]` 表示不包含任何文件。以 `+` 前缀开头的条目会在基础集合之外额外包含磁盘上的匹配文件（例如被 gitignore 的文件，或项目之外的工作区路径）。以 `!` 前缀开头的条目排除匹配文件。 |
| `env` | 参与键计算的环境变量名称。其值会被哈希，不会被存储。 |
| `cache` | `false` 会把已声明 `outputs` 的任务排除出缓存。 |

除声明的 inputs 外，任务的键还涵盖脚本文本、它所依赖任务的键、锁文件以及运行时。它也涵盖通过 `--env-file` 和 `extraEnv` 提供的值，以及 `NODE_OPTIONS`、`shellEmulator` 和 `scriptShell`。当任务依赖某个不可缓存的任务时，它同样不会从缓存恢复。缓存命中会恢复输出文件并重放记录的日志，因此无论是否命中，运行结果读起来都一样。

`--no-cache` 会运行全部任务，且既不读取也不写入缓存条目。

## 复用 Cargo 构建状态

[Cargo](/docs/cargo) 任务可以在多次运行之间、以及同一仓库的不同 git worktree 之间保留本地的构建状态：

```yaml
tasks:
  build:
    cargoTargetDir: target
```

pnpm 会让 Cargo 的 target 和构建目录指向该路径，并始终执行该任务，恢复上一次构建状态的不可变快照，而不是任务自身的输出。该目录必须相对项目，且被 git 忽略。快照与已安装的包分开存放，因此清理其中一个绝不会破坏安装。

## 在多台机器之间共享缓存

自 v12.12.0 起提供

可缓存任务的结果也可以通过服务器 [`remoteCache`](/docs/settings/build#remotecache) 所指的服务器共享：即支持 Turborepo Remote Cache API 的服务器（如 Vercel Remote Cache），或 [pnpr](https://pnpm.io/pnpr) 服务器。发布过结果的 CI 运行，可以让另一台机器上的后续运行直接恢复它们，而不必重新执行任务。

结果以签名产物的形式保存，与[远程副作用缓存](/docs/settings/build#sideeffectscacheremote)使用的形式相同。机器只有在结果由其某个 `trustedKeys` 签名时才会恢复，因此只有持有私钥的机器才能发布他人会使用的结果。配置见 [`remoteCache`](/docs/settings/build#remotecache)。

在发布结果的机器上（通常是 CI），添加私钥并开启发布。发布的结果包含任务的输出文件和捕获的终端输出，因此只应从日志所有人都可以看到机器上发布：

```sh
export PNPM_REMOTE_CACHE_URL=https://vercel.com/api
export PNPM_REMOTE_CACHE_TEAM=team_abc123
export PNPM_REMOTE_CACHE_TRUSTED_KEYS="{\"ci-2026\":\"$PUBLIC_KEY\"}"
export PNPM_REMOTE_CACHE_PRIVATE_KEY="$PRIVATE_KEY"
export PNPM_REMOTE_CACHE_KEY_ID=ci-2026
export PNPM_REMOTE_CACHE_BUILDER_ID=ci
export PNPM_REMOTE_CACHE_PUBLISH=true
env "pnpm_config_//vercel.com/api/:_authToken=$VERCEL_TOKEN" pnpm pipeline
```

如何生成密钥对，参见[共享副作用缓存](https://pnpm.io/pnpr/shared-side-effects-cache#publishing-from-a-builder)。

远程结果缺失、不受信任或校验失败都算作未命中，任务会照常运行。无法访问服务器不会导致运行失败。当任务的输出不超过 10,000 个文件、单个不超过 4 GiB、合计不超过 16 GiB 时，其输出会被发布。[Cargo 构建状态](#reusing-cargo-build-state)始终留在本地机器上。

## 上报运行结果

每次运行都会在 `<cacheDir>/pipeline/<工作区路径哈希>` 下写入一份摘要和一个事件流，该目录同时保存任务缓存。`--report` 会把它们提交给 [`pnprServer`](https://pnpm.io/pnpr/install-acceleration) 指定的 [pnpr](https://pnpm.io/pnpr/pipeline-runs) 服务器，归入 [`remoteCache.org`](/docs/settings/build#remotecache) 指定的组织；`--report-to <url>` 则提交到别处，当存放运行记录的服务器不是加速安装的那个服务器时，用这种写法更合适。运行失败会在命令以非零状态退出之前被上报。

## 观察仓库

```sh
pnpm pipeline --repo https://github.com/acme/app.git --watch
```

观察代理会轮询仓库，并对所跟踪分支的每个新修订运行流水线。它是一个概念验证，而不是托管的 CI 服务。

## 选项

`pnpm pipeline` 会先执行一次冻结安装，并接受所有 [`pnpm install`](/docs/cli/install) 选项来调整这次安装。

### --dry-run

打印任务图后退出，不安装也不运行任何东西。

### --json

与 `--dry-run` 一起使用时，以 JSON 打印任务及其解析出的依赖边。

### --full

对每个工作区项目运行，而不是只运行自基准以来受影响的项目。

### --base <ref>

受影响项目所对比的 git 修订，取其与 `HEAD` 的合并基点。会覆盖 `pipelineBase` 设置，而后者默认是 `origin/main`。

### --no-cache

运行每个任务，既不读取也不写入任务结果和 Cargo 快照。

### --report

运行结束后，把本次运行的摘要和事件流发布到配置的 pnpr 服务器。

### --report-to <url>

把本次运行发布到这个 pnpr 服务器，而不是 `pnpmServer` 中的那一个。

### --repo <repo>

观察代理轮询的仓库：URL 或本地路径，任何 git 接受为远程地址的形式即可。

### --watch

观察 `--repo` 并为每个新修订运行流水线，而不是在当前目录只运行一次。需要配合 `--repo`。

### --branch <name>

观察代理跟踪的分支。默认是 `main`。

### --interval <seconds>

轮询被观察仓库的间隔秒数。必须至少为 `1`。默认是 `30`。

### --once

与 `--watch` 一起使用时，轮询一次，有新修订就构建，然后退出。需要配合 `--watch`。

## 错误

* `ERR_PNPM_NO_PIPELINES`：`pnpm-workspace.yaml` 中没有 `pipelines` 设置。
* `ERR_PNPM_UNKNOWN_PIPELINE`：没有名为所请求名称的流水线。
* `ERR_PNPM_PIPELINE_FAIL`：至少有一个任务失败。命令以非零状态退出。

## 设置

### pipelines

- 默认值：**未定义**
- 类型：**Record&lt;string, string[]&gt;**

以流水线名为键的一组组任务名。

### pipelineBase

- 默认值：**origin/main**
- 类型：**字符串**

受影响项目解析合并基点时所用的 git 修订。
