---
title: "CLI 与 Node.js 设置"
headingIds: ["cli-settings", "no-color", "progress", "loglevel", "reporter", "usebetacli", "recursiveinstall", "enginestrict", "npmpath", "pmonfail", "nodejs-settings", "nodeversion", "runtime", "runtimeonfail", "tools", "nodedownloadmirrors"]
---

## CLI 设置

### [no-]color

- 默认值：**auto**
- 类型：**auto**、**always**、**never**

控制输出中的颜色。

- **auto** - 当标准输出是终端或 TTY 时，输出使用颜色。
- **always** - 忽略终端与管道之间的差异。你很少需要这个；在大多数场景下，如果你想在重定向的输出中要颜色码，可以改为给 pnpm 命令传一个 `--color` 标志，强制其使用颜色码。默认设置几乎总是你想要的。
- **never** - 关闭颜色。这就是 `--no-color` 所使用的设置。

### progress

自 v12.6.0 起提供

- 默认值：**true**
- 类型：**布尔值**

控制安装期间是否打印依赖与下载的进度行。设为 `false`（或传入 `--no-progress`）时，进度输出会被抑制。警告、生命周期脚本输出和依赖汇总仍会打印。

### loglevel

- 默认值：**info**
- 类型：**debug**、**info**、**warn**、**error**

等于或高于给定级别的任何日志都会被显示。你可以改传 `--silent` 以关闭所有输出日志。

### reporter

选择日志报告器。可用的报告器以及依赖终端的默认值见 [`--reporter`](/docs/cli/install#--reportername)。

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

启用后，若项目或依赖声明的 `engines.node` 范围不接受当前的 Node.js 版本，安装就会失败。禁用时安装会继续：一个不兼容的项目会打印一条警告，而不兼容的必需依赖会列在安装输出的末尾。

无论此设置如何，若项目的 `engines.pnpm` 不接受正在运行的 pnpm 版本，安装总是会以失败告终。

可选依赖被豁免，因为一个 pnpm 可能跳过的包不要求是兼容的。自 v12.0.0 起，该豁免跟随的是边（edge）而非子树：一个通过正在安装的包的某个常规 `dependencies` 边抵达的不兼容包会使安装失败，即使它所在的子树挂在一个 `optionalDependencies` 条目之下。pnpm 11 会安装它并改为打印一个安装检查警告。一个只能经由可选边抵达、或经由一个自身被跳过的包抵达的包，在两个版本中仍然会被跳过（[#13286](https://github.com/pnpm/pnpm/issues/13286)）。

### npmPath

- 类型：**路径**

pnpm 用于某些操作（如发布）的 npm 二进制文件的位置。

### pmOnFail


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
pnpm config set --global pm-on-fail ignore
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

## Node.js 设置

### nodeVersion

- 默认值：**node -v** 返回的值，不带 v 前缀
- 类型：**精确的 semver 版本（非范围）**

检查某个包的 `engines` 设置时所使用的 Node.js 版本。

它不会改变为全局虚拟存储目录命名的 Node.js 版本，也不会改变作为副作用缓存键的 Node.js 版本——这两者跟随的是 pnpm 为该项目安装的 Node.js 运行时，然后是 `PATH` 上的 `node`。

如果你想阻止你项目的贡献者添加新的不兼容依赖，请在项目根目录的 `pnpm-workspace.yaml` 文件中使用 `nodeVersion` 和 `engineStrict`：

```yaml
nodeVersion: 12.22.0
engineStrict: true
```

这样一来，即使某人使用 Node.js v22，他们也无法安装一个不支持 Node.js v12.22.0 的新依赖。

### runtime

- 默认值：**true**
- 类型：**布尔值**

为 `false` 时，`pnpm install`、`pnpm add`、`pnpm dedupe` 等安装类命令会跳过 [`devEngines.runtime`](/docs/package_json#devenginesruntime) 与 `engines.runtime` 中声明的运行时。其效果与 [`--no-runtime`](/docs/cli/install#--no-runtime) 相同。pnpm 从 `pnpm-workspace.yaml`、`pnpm_config_runtime` 和 `--config.runtime` 读取该设置，而不读取全局配置文件。

```yaml
runtime: false
```

### runtimeOnFail


- 默认值：**undefined**
- 类型：**download**、**error**、**warn**、**ignore**

覆盖根项目 `package.json` 中 [devEngines.runtime](/docs/package_json#devenginesruntime)（以及 `engines.runtime`）的 `onFail` 字段。当你想要一个不同于清单中所写的本地行为时很有用——例如，即便清单设置了 `onFail: "warn"`，也强制 pnpm 下载所声明的运行时：

pnpm-workspace.yaml

```yaml
runtimeOnFail: download
```

自 v12.5.0 起，该设置还控制 Python 解释器的下载——当没有已安装的解释器满足项目要求时。未设置的默认值允许下载 Python。`warn` 与 `ignore` 会使用一个可用的解释器，即使它不满足 `requires-python`；`error` 则拒绝安装。

自 v12.11.0 起，`error`、`warn` 与 `ignore` 也会阻止 pnpm 安装工具链文件所指定的 [Rust 工具链](/docs/cargo#rust-toolchain)。

### tools

自 v12.5.0 起提供

- 默认值：**undefined**
- 类型：**对象**

配置 pnpm 所安装程序的下载来源。可在[全局配置文件](/docs/cli/config)中用 `pnpm config set --global --json tools` 设置 `tools`，或以 JSON 形式放在 `PNPM_CONFIG_TOOLS` 中。`pnpm-workspace.yaml` 中的工具镜像会被忽略。

```yaml
tools:
  node:
    mirror: https://mirror.example.com/node/download
    channels:
      nightly: https://nightly.example.com/
  bun:
    mirror: https://mirror.example.com/bun
  python:
    mirror: https://mirror.example.com/python-build-standalone/releases
  rust:
    mirror: https://mirror.example.com/rust
```

`mirror` 提供该工具自身下载布局的基础 URL。只接受 `node`、`bun`、`python` 和 `rust`。Rust 镜像提供的是 `https://static.rust-lang.org` 的布局，就像 rustup 的 `RUSTUP_DIST_SERVER` 一样。只有 Node.js 支持 `channels`：渠道条目会覆盖该发布渠道的镜像，其他渠道仍使用 `mirror`。

对 Node.js 而言，发布渠道会追加到 `mirror` 之后。例如 `mirror: https://mirror.example.com/node/download` 对稳定版会使用 `https://mirror.example.com/node/download/release/`。`channels` 条目则是该渠道完整的基础 URL。若要使用稳定版位于 `/node/` 下的镜像，请配置 `channels.release`：

```yaml
tools:
  node:
    channels:
      release: https://npmmirror.com/mirrors/node/
      rc: https://npmmirror.com/mirrors/node-rc/
      nightly: https://npmmirror.com/mirrors/node-nightly/
```

`pnpm pack-app` 通过 `tools.node` 下载其内嵌的 Node.js。旧的 `node-mirror:<channel>` 设置仍可作为渠道镜像使用。

### nodeDownloadMirrors


- 默认值：**undefined**
- 类型：**Record<string, string>**

:::note[说明]

自 v12.5.0 起，机器级镜像请优先使用 [`tools.node`](#tools)。`nodeDownloadMirrors` 仅为兼容性而保留。`pnpm pack-app` 只使用 `tools.node`。

:::

在 `pnpm-workspace.yaml` 中配置自定义 Node.js 下载镜像。键是发布通道（`release`、`rc`、`nightly`、`v8-canary` 等），每个值都是该通道的完整基础 URL。例如，下面的 `release` URL 会从 `https://npmmirror.com/mirrors/node/v<version>/SHASUMS256.txt` 下载校验和。

感知项目的全局 `node` 命令不会自动加载工作区的镜像设置。请在全局配置文件或环境中配置它的镜像。工作区目录级的环境变量覆盖以及 `pnpm: failed to prepare node@runtime:...` 之类的失败，参见[运行时下载镜像](/docs/global-packages#runtime-download-mirrors)。

当配置了多个镜像设置时，`tools.node.channels.<channel>` 优先于 `nodeDownloadMirrors.<channel>`，后者又优先于 `tools.node.mirror`。

下面是如何配置 pnpm 从中国的一个镜像下载 Node.js 的示例：

```yaml
nodeDownloadMirrors:
  release: https://npmmirror.com/mirrors/node/
  rc: https://npmmirror.com/mirrors/node-rc/
  nightly: https://npmmirror.com/mirrors/node-nightly/
```

自 v12.4.0 起，镜像同样是机器级配置：可以用 `pnpm config set --global node-download-mirrors` 在[全局配置文件](/docs/cli/config)中设置，或在环境中使用 `PNPM_CONFIG_NODE_DOWNLOAD_MIRRORS`，这样机器上的每个项目都从它下载 Node.js。

自 v12.2.0 起，从镜像进行的下载会带上为该 URL 配置的 npm registry 凭据，包括 bearer token、基本认证与 `tokenHelper`，因此位于需要认证的代理之后的镜像无需单独配置凭据即可工作。
