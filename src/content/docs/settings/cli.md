---
title: "CLI 与 Node.js 设置"
headingIds: ["cli-settings","no-color","loglevel","usebetacli","recursiveinstall","enginestrict","npmpath","pmonfail","ignoreworkspacerootcheck","nodejs-settings","nodeversion","runtimeonfail","nodedownloadmirrors"]
---

## CLI 设置

### [no-]color

- 默认值：**auto**
- 类型：**auto**、**always**、**never**

控制输出中的颜色。

- **auto** - 当标准输出是终端或 TTY 时，输出使用颜色。
- **always** - 忽略终端与管道之间的差异。你很少需要这个；在大多数场景下，如果你想在重定向的输出中要颜色码，可以改为给 pnpm 命令传一个 `--color` 标志，强制其使用颜色码。默认设置几乎总是你想要的。
- **never** - 关闭颜色。这就是 `--no-color` 所使用的设置。

### loglevel

- 默认值：**info**
- 类型：**debug**、**info**、**warn**、**error**

等于或高于给定级别的任何日志都会被显示。你可以改传 `--silent` 以关闭所有输出日志。

### useBetaCli

- 默认值：**false**
- 类型：**布尔值**

一个启用 CLI 测试版特性的实验性选项。这意味着你可能会遇到一些对 CLI 功能而言是破坏性变更的改动，或潜在的缺陷。

### recursiveInstall

- 默认值：**true**
- 类型：**布尔值**

如果启用，`pnpm install` 的主要行为会变成 `pnpm install -r` 的行为，意味着安装会在所有工作区或子目录包上执行。

否则，`pnpm install` 将只构建当前目录中的包。

### engineStrict

- 默认值：**false**
- 类型：**布尔值**

如果启用，pnpm 将不会安装任何声称与当前 Node 版本不兼容的包。

无论此配置如何，如果一个项目（而非依赖）在其 `engines` 字段中指定了一个不兼容的版本，安装总是会以失败告终。

可选依赖被豁免，因为一个 pnpm 可能跳过的包不要求是兼容的。自 v12.0.0 起，该豁免跟随的是边（edge）而非子树：一个通过正在安装的包的某个常规 `dependencies` 边抵达的不兼容包会使安装失败，即使它所在的子树挂在一个 `optionalDependencies` 条目之下。pnpm 11 会安装它并改为打印一个安装检查警告。一个只能经由可选边抵达、或经由一个自身被跳过的包抵达的包，在两个版本中仍然会被跳过（[#13286](https://github.com/pnpm/pnpm/issues/13286)）。

### npmPath

- 类型：**路径**

pnpm 用于某些操作（如发布）的 npm 二进制文件的位置。

### pmOnFail

自 v11.0.0 起提供

- 默认值：**download**
- 类型：**download**、**error**、**warn**、**ignore**

当正在运行的 pnpm 版本与所声明的版本不匹配时，覆盖 `packageManager` 字段和 `devEngines.packageManager` 两者的 `onFail` 行为。

- `download` — 下载并运行所声明的 pnpm 版本（这是默认值，与之前的 `managePackageManagerVersions: true` 行为一致）。
- `error` — 使命令失败（等同于之前的 `packageManagerStrictVersion: true`）。
- `warn` — 打印一条警告但继续（等同于之前的 `packageManagerStrict: false` 或 `COREPACK_ENABLE_STRICT=0`）。
- `ignore` — 完全跳过检查（等同于之前的 `managePackageManagerVersions: false`）。当版本管理由外部工具（如 asdf、mise 或 Volta）处理时很有用。

可通过 CLI 标志、环境变量或 `pnpm-workspace.yaml` 设置：

```bash
pnpm install --pm-on-fail=ignore
pnpm_config_pm_on_fail=ignore pnpm install
```

pnpm-workspace.yaml

```yaml
pmOnFail: ignore
```

此设置取代了已移除的 `managePackageManagerVersions`、`packageManagerStrict` 和 `packageManagerStrictVersion` 设置，以及 `COREPACK_ENABLE_STRICT` 环境变量。

Migration:

| **已移除的设置** | **替换为** |
| --- | --- |
| `managePackageManagerVersions: true` | `pmOnFail: download` (default) |
| `managePackageManagerVersions: false` | `pmOnFail: ignore` |
| `packageManagerStrict: false` | `pmOnFail: warn` |
| `packageManagerStrictVersion: true` | `pmOnFail: error` |
| `COREPACK_ENABLE_STRICT=0` | `pmOnFail: warn` |

另见 [pnpm with](/docs/cli/with)，可在不更改此设置的情况下以某个特定版本运行 pnpm。

### ignoreWorkspaceRootCheck

- 默认值：**false**
- 类型：**布尔值**

如果启用，从项目根目录运行 `pnpm install`/`pnpm add` 在未提供 `-w`/`--ignore-workspace-root-check` 时将不再报错。

## Node.js 设置

### nodeVersion

- 默认值：**node -v** 返回的值，不带 v 前缀
- 类型：**精确的 semver 版本（非范围）**

检查某个包的 `engines` 设置时所使用的 Node.js 版本。

如果你想阻止你项目的贡献者添加新的不兼容依赖，请在项目根目录的 `pnpm-workspace.yaml` 文件中使用 `nodeVersion` 和 `engineStrict`：

```yaml
nodeVersion: 12.22.0
engineStrict: true
```

这样一来，即使某人使用 Node.js v22，他们也无法安装一个不支持 Node.js v12.22.0 的新依赖。

### runtimeOnFail

自 v11.0.0 起提供

- 默认值：**undefined**
- 类型：**download**、**error**、**warn**、**ignore**

覆盖根项目 `package.json` 中 [devEngines.runtime](/docs/package_json#devenginesruntime)（以及 `engines.runtime`）的 `onFail` 字段。当你想要一个不同于清单中所写的本地行为时很有用——例如，即便清单设置了 `onFail: "warn"`，也强制 pnpm 下载所声明的运行时：

pnpm-workspace.yaml

```yaml
runtimeOnFail: download
```

### nodeDownloadMirrors

自 v11.0.0 起提供

- 默认值：**undefined**
- 类型：**Record<string, string>**

在 `pnpm-workspace.yaml` 中配置自定义 Node.js 下载镜像。键是发布通道（`release`、`rc`、`nightly`、`v8-canary` 等），值是基础 URL。

下面是如何配置 pnpm 从中国的一个镜像下载 Node.js 的示例：

```yaml
nodeDownloadMirrors:
  release: https://npmmirror.com/mirrors/node/
  rc: https://npmmirror.com/mirrors/node-rc/
  nightly: https://npmmirror.com/mirrors/node-nightly/
```
