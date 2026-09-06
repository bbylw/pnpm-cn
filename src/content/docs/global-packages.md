---
title: "全局包"
headingIds: ["installing-global-packages","isolated-installations","directory-layout","listing-global-packages","managing-global-packages","binaries-location","project-aware-global-bins","how-a-version-is-chosen","trust","which-packages-participate","global-virtual-store","registering-local-packages-globally","build-script-approval"]
---

全局包是通过 `pnpm add -g` 在系统范围内安装的 CLI 工具和实用程序。在 pnpm v11 中，全局包管理经过重新设计，以实现更好的隔离性和可靠性。

## 安装全局包

```bash
pnpm add -g <pkg>
```

例如：

```bash
pnpm add -g typescript prettier eslint
```

:::caution[注意]

不要通过 `sudo` 运行这些命令。pnpm 将全局包和配置保存在调用用户的家目录中。在 `sudo` 下修改全局安装的命令会以 `ERR_PNPM_SUDO_NOT_SUPPORTED` 失败；`pnpm bin -g` 等只读命令不受影响。

:::

## 隔离安装

每个全局安装的包（或一起安装的一组包）都会获得自己的隔离安装目录，其中包含各自的 `package.json`、`node_modules/` 和锁文件。这可以防止全局包通过对等依赖冲突、依赖提升变化或版本解析偏移而相互干扰。

隔离安装存储在 `{pnpmHomeDir}/global/v11/{hash}/`，其中 hash 由一起安装的那组包派生而来。

例如，运行以下两条命令：

```bash
pnpm add -g typescript
pnpm add -g prettier
```

会创建两个独立的隔离安装，`typescript` 和 `prettier` 各自拥有自己的 `node_modules` 树，无法影响对方的依赖解析。

在单条命令中安装多个以**空格分隔**的包，也会为每一个创建一个独立的隔离安装：

```bash
pnpm add -g eslint prettier
```

`eslint` 和 `prettier` 各自拥有自己的 `node_modules` 树和锁文件，可以独立移除，`pnpm remove -g eslint` 不会影响 `prettier`。

若要把多个包打包进*同一个*隔离安装，让它们共享 `node_modules` 树和锁文件、互相解析对等依赖并一起被移除，请以**逗号分隔**的列表传入：

```bash
pnpm add -g eslint,prettier
```

这里 `eslint` 和 `prettier` 构成一个安装组。用 `pnpm remove -g` 移除其中任意一个都会移除整个组。

两种写法可以混用。例如：

```bash
pnpm add -g eslint,prettier typescript
```

会把 `eslint` 和 `prettier` 打包进一个隔离安装，同时单独安装 `typescript`。

## 目录结构

`{pnpmHomeDir}/global/v11/` 的内容如下所示：

```
{pnpmHomeDir}/global/v11/
├── {hash-A}              → symlink → ./{hash-A-target}/
├── {hash-A-target}/      ← isolated install dir
│   ├── package.json      ← lists the packages installed together
│   ├── pnpm-lock.yaml    ← lockfile for this install group
│   └── node_modules/
│       ├── <pkg>/        ← top-level dep, symlinked into the global virtual store
│       └── .pnpm/
├── {hash-B}              → symlink → ./{hash-B-target}/
├── {hash-B-target}/      ← another isolated install dir
└── store/                ← shared global virtual store
    └── ...
```

- `{hash}` 条目是符号链接；pnpm 通过扫描它们来枚举当前生效的安装。
- 链接目标是真实目录，它们的行为就像普通的 pnpm 项目，各自都有自己的 `package.json` 和锁文件。
- 共享的 `store/` 目录存放[全局虚拟存储](/docs/global-virtual-store)。每个安装组的直接依赖，也就是其 `node_modules/` 根目录下的条目，都是指向该存储的符号链接，因此实际的包内容是共享的，而不是每个组各自复制一份。
- bin shim 位于 `{pnpmHomeDir}/bin/`，并通过相应安装组的 `node_modules` 指向目标。

当某个包被移除或其安装组被替换时，hash 符号链接会更新，成为孤儿的目标目录最终由 `pnpm store prune` 清理。

## 列出的全局包

```bash
pnpm list -g
pnpm list -g --json        # machine-readable
pnpm list -g --parseable   # paths only
```

由于每个安装组都有自己的锁文件，跨多个组列出时只能可靠地汇总它们安装时的顶层包，不同组的传递依赖树无法连贯地合并。因此：

- `pnpm list -g`（默认 `--depth=0`）始终可用，并显示每个全局安装的包。
- pnpm list -g --depth=<n>
  (with
  n > 0
  ）仅在以下情况下显示完整的依赖树：
  - 只有一个全局安装组，或
  - 位置参数将请求缩小到单个安装组，例如 `pnpm list -g eslint --depth=1`。

如果请求了 `--depth>0`，但无法将请求缩小到单个安装组，pnpm 会以 `ERR_PNPM_GLOBAL_LS_DEPTH_NOT_SUPPORTED` 报错。

## 管理全局包

| **Command** | **Description** |
| --- | --- |
| `pnpm add -g <pkg>` | 全局安装一个包 |
| `pnpm remove -g <pkg>` | 移除全局安装的包（若它被打包进某个安装组，则整个组都会被移除） |
| `pnpm update -g [pkg]` | 更新全局包（重新安装到新的隔离目录中） |
| `pnpm list -g` | 列出所有全局安装的包 |

:::note[说明]

`pnpm install -g`（不带参数）不受支持。请使用 `pnpm add -g <pkg>` 安装指定的包。

:::

## 二进制文件的位置

全局安装的二进制文件存放在 `PNPM_HOME` 下的 `bin` 子目录中（即 `$PNPM_HOME/bin/`）。这能让 `PNPM_HOME` 目录保持干净：当 `PNPM_HOME` 在 PATH 中时，`global/` 和 `store/` 等内部目录不会污染 shell 自动补全。

升级到 pnpm v11 后，运行 [pnpm setup](/docs/cli/setup) 更新你的 shell 配置，让 `$PNPM_HOME/bin` 出现在你的 PATH 中。

可以用以下命令查看当前的全局 bin 目录：

```bash
pnpm bin -g
```

## 感知项目的全局 bin

自 v12.0.0-rc.2 起提供（仅 pnpm v12）

全局命令可以跟随你所在的项目。当你在某个项目内运行一条全局命令、而该项目要求同一工具的不同版本时，pnpm 会运行项目所要求的版本。

最有用的场景是 Node.js 本身。假设一个项目锁定了自己的运行时：

package.json

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "^22.0.0",
      "onFail": "download"
    }
  }
}
```

即使你的全局 Node.js 是不同的主版本，在该目录内直接运行 `node` 也会使用 Node.js 22：

```bash
cd ~/projects/legacy-app
node --version   # v22.x.x — the version the project pins
cd ~
node --version   # your globally installed version
```

这无需 shell 钩子、无需修改 `.bashrc`、也无需 `use` 类命令，pnpm 写入全局 bin 目录的 shim 会自行完成派发。

### 版本的选择方式

pnpm 从当前工作目录逐级向上查找，直到找到最近的一个提供该命令的项目，然后：

- 对于**运行时**（`node`、`deno`、`bun`），只有清单中的锁定值生效：先看 [devEngines.runtime](/docs/package_json#devenginesruntime)，再看 `engines.runtime`。锁定的版本会按需下载到[全局虚拟存储](/docs/global-virtual-store)并直接执行。运行时绝不会查看项目的 `node_modules/.bin`，因此依赖无法提供你所运行的 `node`。
- 对于**包管理器**（`npm`、`yarn`、`bun`），自 v12.0.0-rc.6 起提供，项目的 `packageManager` 或 [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 锁定值生效，pnpm 会按需准备该版本。该锁定值优先于全局安装的同款包管理器副本，因为它是项目自身关于「由谁安装」的声明。
- 对于**其他任意包**，使用项目的 `node_modules/.bin/<name>`。

pnpm home 内的目录会被跳过，因为全局安装不是项目。

如果项目没有提供该命令，或该查找被拒绝，则运行全局安装的版本。命令绝不会仅仅因为派发未生效而失败。

### 信任

你 `cd` 进入的项目并不会自动被允许用自身的二进制文件取代你的全局二进制文件。

本节描述默认的 `auto` 策略。在 `auto` 下：

- 一个**稳定的 Node.js 发布版**在运行前会依据 Node.js 发布团队的签名进行验证，因此它会不经询问直接切换。（在基于 musl 的系统上，对应的构建未签名，因此改为受提示约束。）
- **其他一切**，包括 Deno、Bun、Node.js 预发布版，以及你启用的任何普通包，都会按项目和按候选各询问一次：
  ```
  The project at "/home/user/projects/app" provides its own "tsc", which will be used
  instead of the globally installed one.
  Do you trust this project? [y/N]
  ```

回答会记录在一个机器本地的注册表中，同时以项目目录和该二进制文件的精确指纹为键。如果该二进制文件或提供它的包发生变化，pnpm 会重新询问，而不是复用旧的批准。

在 CI 及任何非交互式会话中，无法提出该问题，因此会运行全局版本，并且不记录任何内容。

另外两种[策略](/docs/settings/other#globalshims)改变的是哪些候选会到达该问题。`prompt` 会把每个候选都送过去询问，包括经签名验证的稳定 Node.js 发布版；回答仍会被记住，所以它按项目和候选各询问一次，而不是每次运行都问。`always` 完全跳过询问并立即切换，这也正是它可用于 CI 的原因。在 CI 中，提示否则会退回全局版本。

还有一道与策略无关的护栏：项目的命令必须来自与全局命令**同一个包**。某个项目用其他包提供的形似 `tsc` 不会匹配，此时运行你的全局 `tsc`。

### 哪些包参与其中

默认只有运行时参与。自 v12.0.0-rc.6 起，全局安装某个包管理器（`pnpm add -g yarn`）也会为它新增一个条目，使其像全局安装的 Node.js 跟随 `devEngines.runtime` 那样跟随项目的锁定值。你自己设置的条目，包括 `false`，都会按你设定的原样保留。

通过 [globalShims](/docs/settings/other#globalshims) 启用其他项，以提供该命令的包名为键：

~/.config/pnpm/config.yaml

```yaml
globalShims:
  typescript: true
```

由于 pnpm 在安装时就决定哪些 bin 要配备派发 shim，已经全局安装的包在你启用它之后需要重新安装：

```bash
pnpm add -g typescript
```

把某个包*关掉*无需重装，该设置在每次派发时都会重新读取。同一设置可按包禁用派发，或用 `globalShims: false` 完全禁用。对于单条命令，设置 `PNPM_SHIM_BYPASS=1`：

```bash
PNPM_SHIM_BYPASS=1 node --version
```

一个根本没有全局安装的包，仍然可以通过 [pnpm shim add](/docs/cli/shim) 获得一个派发命令，这正是让 `yarn` 在只装有 pnpm 的机器上的 Yarn 项目内可用的原因。

:::note[说明]

`globalShims` 有意不从项目的 `pnpm-workspace.yaml` 读取，只从全局配置文件、pnpm home 目录自身的 `pnpm-workspace.yaml` 以及环境中读取。详情见该[设置的文档](/docs/settings/other#globalshims)。

:::

## 全局虚拟存储

全局安装使用[全局虚拟存储](/docs/global-virtual-store)。包存放在 `{storeDir}/links` 中，并在各全局安装之间共享。这避免了多个全局包依赖同一库时的重复拉取。

## 将本地包注册到全局

要让本地包的二进制文件在系统范围内可用，请在该包目录中运行 `pnpm add -g .`：

```bash
cd ~/projects/my-tool
pnpm add -g .
```

这会注册该包的 `bin` 条目，使它们可以从任何地方调用。更多细节见 [pnpm link](/docs/cli/link#add-a-binary-globally)。

## 构建脚本批准

带有构建脚本的全局包（例如 `postinstall`）需要批准。当你安装一个需要运行构建脚本的全局包时，pnpm 会以交互式提示你批准或拒绝该构建。

你也可以使用 `--allow-build` 标志预先批准构建：

```bash
pnpm add -g --allow-build=esbuild esbuild
```

自 v11.24.0 起，[pnpm approve-builds --global](/docs/cli/approve-builds#--global--g) 让你改为事后决定。它从每个安装组收集待批准的包，一次性询问，并把一条 `allowBuilds` 策略写入全局包目录的 `pnpm-workspace.yaml`，然后只重建包含你所批准内容的组：

```bash
pnpm approve-builds -g
```
