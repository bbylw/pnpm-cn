---
title: "pnpm CLI"
headingIds: ["short-aliases","differences-vs-npm","boolean-flags","which-project-a-command-acts-on","options","-c-path---dir-path","-w---workspace-root","--ignore-workspace","--workspace-packages-glob","-y---yes","--env-file-path","commands","environment-variables"]
---

## 短别名

`pn` 是 `pnpm` 的短别名，[pnx](/docs/cli/pnx) 是 `pnpm dlx` 的短别名。凡是能用 `pnpm` 或 `pnpx` 的地方都可以使用它们：

```bash
pn install
pn add express
pn build
pn test
pnx create-vue my-app
```

## 与 npm 的差异

与 npm 不同，pnpm 会校验所有选项。例如，`pnpm install --target_arch x64` 会失败，因为 `--target_arch` 不是 `pnpm install` 的有效选项。

某些依赖在构建时会读取 `npm_config_` 环境变量。pnpm 不会用自己的选项去设置这些变量，因此请自行设置：`npm_config_target_arch=x64 pnpm install`。

## 布尔标志

布尔标志可以单独写、用 `no-` 前缀取反，或者给出显式值：

```sh
pnpm install --prod            # 跳过 devDependencies
pnpm install --no-prod         # 安装 devDependencies
pnpm install --prod=false      # 同上，自 v12.4.0 起
pnpm install --prod=true       # 与 --prod 相同
```

`--config.` 这个「逃生通道」同样以这种方式取值：`--config.trust-lockfile=false`。

## 命令作用于哪个项目

在某个项目的子目录中运行时，命令会作用于最近的、带清单的祖先目录，因此从 `packages/app/src` 执行 `pnpm bin` 会报告 `packages/app` 下的路径。有两个命令会留在原地：`pnpm init` 在当前目录创建清单，`pnpm exec` 也在当前目录运行命令。

## 选项

### -C <path>, --dir <path>

视同 pnpm 从 `<path>` 而非当前工作目录启动来执行。

### -w, --workspace-root

视同 pnpm 从[工作区](/docs/workspaces)根目录而非当前工作目录启动来执行。

### --ignore-workspace

视同当前项目是独立项目来执行。pnpm 不会在父目录中查找 `pnpm-workspace.yaml`，因此工作区的设置和其他项目都不作用于该命令。

例如，即使当前目录位于某个工作区内部，下面的命令也只安装当前目录中的项目：

```sh
pnpm install --ignore-workspace
```

### --workspace-packages <glob>

用 glob 模式选择工作区的项目，覆盖 `pnpm-workspace.yaml` 中的 [`packages`](/docs/settings#packages) 字段。重复该标志可添加更多模式。

### -y, --yes

自动对提示回答「是」。

### --env-file <path>

自 v12.16.0 起提供

运行前从 dotenv 风格的文件中加载环境变量。重复该标志可叠加更多文件：

```sh
pnpm --env-file .env run build
pnpm --env-file .env --env-file .env.local install
```

后面的文件会覆盖前面文件中定义的变量，而环境中已有的变量永远不会被覆盖。相对路径基于调用 `pnpm` 时的工作目录解析。加载的变量对配置解析可见（`PNPM_CONFIG_<KEY>` 覆盖项以及用户级 [`.npmrc`](/docs/npmrc) 文件中的 `${VAR}` 令牌，因此 registry 令牌可以放在 env 文件中而不必放在 shell 里）、对生命周期脚本可见，也对该命令派发出的任何 pnpm 可见。

这些文件的读取方式与 `node --env-file` 相同。值按原样取用，`$VAR` 不会被展开。开头处的 UTF-8 字节序标记会被忽略。文件缺失会使命令失败。

该标志是 pnpm 自己的：shim 调用会把参数原样转发给 shim 目标，永远不会加载 env 文件。

## 命令

更多信息见各个 CLI 命令的文档。以下是一份实用的 npm 等价命令列表，供你快速上手：

| **npm 命令** | **pnpm 等价命令** |
| --- | --- |
| `npm install` | [pnpm install](/docs/cli/install) |
| `npm i <pkg>` | [pnpm add <pkg>](/docs/cli/add) |
| `npm run <cmd>` | [pnpm <cmd>](/docs/cli/run) |
| `npx <pkg>` | [pnx <pkg>](/docs/cli/pnx) |

使用未知命令时，pnpm 会查找同名的脚本，因此 `pnpm run lint` 与 `pnpm lint` 等价。若不存在指定名称的脚本，pnpm 会将该命令作为 shell 脚本执行，所以你可以运行 `pnpm eslint` 这类命令（参见 [pnpm exec](/docs/cli/exec)）。

## 环境变量

一些与 pnpm 无关的环境变量也可能改变 pnpm 的行为：

- [CI](/docs/cli/install#--frozen-lockfile)
- `NO_COLOR` 关闭彩色输出。

以下环境变量用于配置 pnpm 本身：

- `pnpm_config_<设置名>` 设置某项配置。参见[环境变量](/docs/configuring#environment-variables)。
- `PNPM_HOME` 设置 pnpm 主目录，其中存放全局包、它们的 bin 文件和默认存储。
- `PNPM_SHIM_BYPASS=1` 让全局 shim 运行其全局目标，并忽略项目的固定版本。参见[感知项目的全局 bin](/docs/global-packages#project-aware-global-bins)。

以下环境变量可能影响 pnpm 存储全局信息所使用的目录：

- `XDG_CACHE_HOME`
- `XDG_CONFIG_HOME`
- `XDG_DATA_HOME`
- `XDG_STATE_HOME`

你可以搜索文档，找到利用这些环境变量的设置。
