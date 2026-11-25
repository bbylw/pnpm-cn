---
title: "从 pnpm 11 迁移"
headingIds: ["steps","behavior-changes","unrecognized-settings-fail","boolean-flags-with-a-separate-value","git-hosted-dependencies","pnpmfile-hooks","enginestrict","package-managers-and-runtimes-named-as-packages","global-nodejs-follows-the-project","global-commands-under-sudo","pnpm-doctor-checks-the-default-store","tls-certificates","connections-per-origin","shellemulator","scriptsprependnodepath","packageimportmethod-auto-on-linux","lockfile-entries-for-dependency-cycles","pnpm-dlx-and-pnx","pnpm-pack-app","--frozen-store"]
---

pnpm 12 与 pnpm 11 读取相同的 `pnpm-lock.yaml`、`pnpm-workspace.yaml` 和存储，因此大多数项目无需改动即可升级。本页列出升级步骤以及可能需要处理的行为变化。

## 步骤

1. 如果项目还在使用 pnpm 10，请先按照[从 v10 迁移](/docs/migration)操作。它的 codemod 在迁移到 pnpm 12 时同样适用。从 pnpm 11 升级没有对应的 codemod。
2. 更新 pnpm。如果项目通过 `packageManager` 或 `devEngines.packageManager` 固定了 pnpm 版本，请在工作区根目录运行下面的命令，一并更新该固定版本：

   ```sh
   pnpm self-update 12
   ```

   安装 pnpm 12 的其他方式见[安装](/docs/installation)。如果你用其他方式安装，也要更新固定版本，例如用 pnpm 12 运行 `pnpm self-update 12`。否则 pnpm 12 会运行被固定的 pnpm 11。pnpm 12 是原生可执行文件，运行它不需要 Node.js。
3. 运行 `pnpm install`，并修复它报告为无法识别的 `pnpm-workspace.yaml` 设置。参见[无法识别的设置会报错](#unrecognized-settings-fail)。
4. 阅读下面的[行为变化](#behavior-changes)，处理其中适用于你的项目的部分。CI 脚本、私有 Git 依赖和 pnpmfile 钩子通常是需要重点检查的地方。
5. 提交更新后的 `package.json` 和 `pnpm-lock.yaml`。

## 行为变化

### 无法识别的设置会报错

pnpm 11 会对 `pnpm-workspace.yaml` 中无法识别的设置给出警告。在 pnpm 12 中，如果项目固定了一个当前运行的 pnpm 能满足的版本，该警告会变成错误 `ERR_PNPM_UNRECOGNIZED_WORKSPACE_SETTINGS`；否则仍是警告。pnpm 12 还会拒绝 pnpm 11 的 `confirmModulesPurge` 设置。请删除该设置或修正拼写。`pnpm config` 相关命令不会因此报错。

### 布尔标志不能单独跟一个值

pnpm 会拒绝把布尔标志和它的值作为两个参数分开的写法，例如 `--frozen-lockfile false` 或 `--prod false`。请改写为 `--frozen-lockfile=false` 或 `--no-frozen-lockfile`。

### Git 托管的依赖

GitHub、GitLab 或 Bitbucket 上的依赖始终通过该主机的 HTTPS URL 解析，锁文件也不会为其记录 SSH URL。pnpm 不再探测网络来在 HTTPS 与 SSH 之间做选择。自行托管的 Git 服务器以及内嵌凭据的 URL 会保持原样。已经存在于锁文件中的 SSH URL 只会在 pnpm 重新解析该条目时改变。

要通过 SSH 获取私有的托管仓库，请在机器上配置 Git。参见[对私有仓库使用 SSH](/docs/package-sources#using-ssh-for-private-repositories)。

### pnpmfile 钩子

- `importPackage` 不再执行。请用 [`packageImportMethod`](/docs/settings/node-modules#packageimportmethod) 选择导入方式。
- pnpm 会忽略 `filterLog`，并在 pnpmfile 定义了它时给出警告。请改用 [`loglevel`](/docs/settings/cli#loglevel)。

### `engineStrict`

- 当通过常规 `dependencies` 边接触到不兼容的包时，安装会失败，即便该子树挂在 `optionalDependencies` 条目下也是如此。pnpm 11 会安装该包并给出警告。仅通过可选边可达的包仍会被跳过。
- 使用 [`--no-runtime`](/docs/cli/install#--no-runtime) 或 `runtime: false` 时，pnpm 会把根项目的 `engines.node` 与当前使用的 Node.js 比对，而不是与 `devEngines.runtime` 或 `engines.runtime` 中固定的版本比对。

### 以包名形式出现的包管理器与运行时

`pnpm add yarn`、`pnpm add -g node`、`pnx node` 等命令会安装对应的包管理器或运行时，而不是安装同名的 npm 包。参见[从 v11 迁移过来的项目会有哪些变化](/docs/package-managers#what-changes-for-a-project-coming-from-v11)。

### 全局 Node.js 跟随项目

用 pnpm 全局安装的 Node.js 会运行当前项目在 `devEngines.runtime`、`engines.runtime`、`.node-version` 或 `.nvmrc` 中固定的版本。pnpm 会在首次使用时下载该版本。像 Node.js 预发布版这类没有发布者签名的版本，会询问一次你是否信任该项目。参见[感知项目的全局 bin](/docs/global-packages#project-aware-global-bins)。要关闭该行为，请在全局配置中设置 [`globalShims: false`](/docs/settings/other#globalshims)，或对单条命令设置 `PNPM_SHIM_BYPASS=1`。

### `sudo` 下的全局命令

通过 `sudo` 运行 `pnpm setup`、`pnpm self-update` 以及会修改全局安装的命令（如 `pnpm add --global`）时，会以 `ERR_PNPM_SUDO_NOT_SUPPORTED` 失败。请以你自己的用户身份运行。只读的全局命令仍然可用。

### `pnpm doctor` 会检查默认存储

pnpm 12 会把存储目录的可写性作为一项独立检查，包括使用默认存储的情况。pnpm 11 则把存储访问包含在文件系统能力探测中。如果 `pnpm doctor` 失败，请检查[存储目录](/docs/settings/store#storedir)的权限。

### TLS 证书

pnpm 对 registry 连接信任操作系统的证书库。如果 pnpm 无法加载该证书库，则使用内置的一份 Mozilla CA 证书。pnpm 11 使用的是 Node.js 附带的 CA 证书。[`ca`](/docs/npmrc#ca) 或 [`cafile`](/docs/npmrc#cafile) 设置仍会替换这些默认值。

### 每个来源的连接数

[`maxsockets`](/docs/settings/network#maxsockets) 不再默认为 50。未设置时，只有 [`networkConcurrency`](/docs/settings/network#networkconcurrency) 会限制直连数量。通过代理的连接仍然限制为每个来源 50 个。如果 registry 限制并发连接数，请设置 `maxsockets`。

### `shellEmulator`

[`shellEmulator`](/docs/settings/other#shellemulator) 使用 pnpm 内置的 shell 而不是 `@yarnpkg/shell` 来运行脚本。在该 shell 中：

- 命令会把 `${NAME:=word}`、`${NAME=word}` 和 `${#NAME}` 当作字面文本接收。
- shell 无法解析的脚本会以 `ERR_PNPM_EXECUTOR_SHELL_EMULATOR_PARSE` 失败。

### `scriptsPrependNodePath`

pnpm 会忽略 `scriptsPrependNodePath` 设置。脚本使用 `PATH` 中找到的 `node` 运行。

### Linux 上的 `packageImportMethod: auto`

在 Linux 上，`auto` 会先尝试硬链接，再尝试克隆。在支持克隆的文件系统（如 btrfs）上，请设置 [`packageImportMethod: clone`](/docs/settings/node-modules#packageimportmethod)，让 `node_modules` 中保留写时复制文件。

### 依赖环的锁文件条目

无论安装顺序如何，pnpm 打破依赖环的方式都一样。第一次重新解析依赖的安装可能会重写环内包的 peer 变体一次。冻结锁文件的安装会原样使用现有锁文件。参见[循环依赖](/docs/how-peers-are-resolved#cyclic-dependencies)。

### `pnpm dlx` 与 `pnx`

`pnpm dlx` 和 `pnx` 不使用[全局虚拟存储](/docs/global-virtual-store)。每个缓存条目拥有自己的虚拟存储，它运行的命令也不会获得全局虚拟存储的模块解析钩子。

### `pnpm pack-app`

不带 `--runtime` 或 `pnpm.app.runtime` 时，[`pnpm pack-app`](/docs/cli/pack-app) 会内嵌 Node.js 25.5.0。pnpm 11 内嵌的是运行 pnpm 的那个 Node.js 版本。pnpm 会自行下载所需的 Node.js，因此宿主机不需要安装 Node.js。

### `--frozen-store`

[`--frozen-store`](/docs/cli/install#--frozen-store) 不再对 Node.js 版本有要求。`ERR_PNPM_FROZEN_STORE_UNSUPPORTED_NODE` 错误已不存在。

另见 [12.0.0 的发布说明](https://github.com/pnpm/pnpm/releases/tag/v12.0.0)。
