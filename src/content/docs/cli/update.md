---
title: "pnpm update"
headingIds: ["tldr", "what-an-update-writes", "updating-to-a-specific-version", "selecting-dependencies-with-patterns", "updating-github-actions", "options", "--recursive--r", "--depth-number", "--latest--l", "--tag-tag", "--patches", "--pnpr-server-url", "--global--g", "--workspace", "--prod--p---production", "--dev--d", "--no-optional", "--optional", "--peer", "--save-exact--e", "--lockfile-only", "--lockfile-dir-dir", "--interactive--i", "--long", "--no-save", "--changeset", "--no-changeset", "--include-github-actions", "supply-chain-policy-flags", "--minimum-release-age-minutes---minimum-release-age-exclude-package-spec", "--cpu---os---libc---ignore-scripts---ignore-pnpmfile", "--filter-package_selector"]
---

别名： `up`, `upgrade`

`pnpm update` 根据指定范围将包更新到其最新版本

不带参数使用时，更新所有依赖

## TL;DR

| **Command** | **Meaning** |
| --- | --- |
| `pnpm up` | 更新所有依赖，遵循 `package.json` 中声明的范围 |
| `pnpm up --latest` | 把所有依赖更新到最新版本 |
| `pnpm up --tag next` | 把所有依赖更新到其 `next` 标签背后的版本 |
| `pnpm up foo@2` | 把 `foo` 更新到 v2 上的最新版本 |
| `pnpm up "@babel/*"` | 更新 `@babel` scope 下的所有依赖 |

## 一次更新写入了什么

除了把 `pnpm-lock.yaml` 移到新解析的版本外，`pnpm update` 还会把新的范围写回依赖被声明的地方：

- 在 `package.json` 中，范围移到已解析的版本，同时保留依赖已声明的操作符，因此 `^1.1.0` 仍是插入符范围。
- 通过 [catalog 协议](/docs/catalogs)声明的依赖不会在 `package.json` 中被重写，而是改为更新它所指向的目录条目，位于 `pnpm-workspace.yaml` 中。
- 通过 [`jsr:` 协议](/docs/package-sources)声明的依赖会保留其 `jsr:` 前缀，其范围像 npm 范围一样移动。
- 通过 dist-tag（例如 `"foo": "latest"`）声明的依赖继续跟踪该标签。标签留在 `package.json` 中，只有锁文件移到它背后的版本，即使使用 `--latest` 也是如此。
- 自 v12.12.0 起，[配置依赖](/docs/config-dependencies#how-to-update-config-dependencies)也会被更新，其新范围会写入 `pnpm-workspace.yaml`。
- 运行时（声明在 `devEngines.runtime`、`engines.runtime` 中，或通过 `runtime:` / `tool:` 协议声明的 `node`、`deno`、`bun`）和包管理器（声明在 `devEngines.packageManager` 或 `packageManager` 中的 `pnpm`、`npm`、`yarn`、`bun`）也会被更新，其新版本或新范围会写回 `package.json`（如果该固定记录在 `pnpm-lock.yaml` 中，也会写入锁文件）。像 `>=20 <23` 这样的 Node.js 运行时范围，在更新后的稳定版本仍满足它时会保留其上下界。`engines.pnpm` 范围会随 pnpm 固定版本一起移动，就像 [`pnpm self-update`](/docs/cli/self-update) 所做的那样。
- 当 [`cargo.enabled`](/docs/cargo#cargoenabled) 为 `true` 时，`Cargo.toml` 和 `Cargo.lock` 中的 Cargo 依赖也会被更新。传入 `crate:<name>`（或 `crate:<name>@<req>`）可定位特定的 crate。
- 当 [`python.enabled`](/docs/python#pythonenabled) 为 `true` 时，`pyproject.toml` 和 `pylock.toml` 中的 Python 依赖也会被更新。传入 `pypi:<name>`（或 `pypi:<requirement>`）可定位特定的 Python 分发包。

递归更新和带过滤器的更新也包含独立的 Python 与 Cargo 工作区成员。Python 名称模式忽略大小写，并把连续的句点、下划线和连字符视作一个连字符。Cargo 选择器同时匹配依赖别名和 crate 名。

- 自 v12.6.0 起，说明符来自 [`packageExtensions`](/docs/settings/dependency-resolution#packageextensions) 条目、[`readPackage`](/docs/pnpmfile#hooks) 钩子或 [`override`](/docs/settings/dependency-resolution#overrides) 的依赖不会写回 `package.json`。锁文件保留该说明符。`pnpm update` 和 `pnpm audit --fix=update` 仍会在该范围之内移动它。

来自这些来源的精确固定版本保持不变。当该固定版本是一个存在漏洞的版本时，`pnpm audit --fix=update` 会给出警告并指向 `pnpm audit --fix`，后者会写入一条 override。override 在 `packageExtensions` 和 `readPackage` 之后应用，因此会替换它们所提供的说明符。

传递 [--no-save](#--no-save) 可只更新锁文件而保持声明的范围不变。

自 v12.0.0 起，[--patches](#--patches) 做的事情与上述全都不同：它不改变任何版本或声明的范围，只刷新每个已锁定版本解析到的 registry 产物。这仍然会重写锁文件元数据，包括 `integrity`、`revision` 及其周围的包快照，因为产物修订可能声明不同的依赖。见 [Registry revisions](/docs/registry-revisions)。

## 更新到特定版本

自 v11.23.0 起，当该包不是任何被选项目的直接依赖时，`pnpm update <name>@<version>` 会以 `ERR_PNPM_UPDATE_VERSION_ON_INDIRECT_DEP` 失败。这种情况下无处记录该版本；应改用 [覆盖](/docs/settings/dependency-resolution#overrides) 来锁定间接依赖。范围和标签不受影响。

## 用模式选择依赖

你可以使用模式来更新特定的依赖

更新所有 `babel` 包：

```bash
pnpm update "@babel/*"
```

更新所有依赖，但 `webpack` 除外：

```bash
pnpm update "\!webpack"
```

模式也可以组合，因此下一条命令会更新所有 `babel` 包，但 `core` 除外：

```bash
pnpm update "@babel/*" "\!@babel/core"
```

## 更新 GitHub Actions

自 v11.16.0 起提供

[pnpm outdated](/docs/cli/outdated) 可以检查仓库工作流文件所引用的 GitHub Actions 是否有可用更新，`pnpm update` 可以更新它们。对每个命令而言这都是需主动选择的：传递 [--include-github-actions](#--include-github-actions)，或在 `pnpm-workspace.yaml` 中把 [update.githubActions](/docs/settings/dependency-resolution#updategithubactions) 设为 `true` 以默认启用。

更新后的 action 被锁定到确切的 commit 哈希，并在注释中保留其发布标签：

```yaml
- uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.0
```

本地 action 会被跟随而不是被查找：`./` 开头的相对引用，以及自 v12.3.0 起 GitHub 自身的仓库写法（`uses: $/.github/actions/setup`），都会在仓库内部解析。

检查更新会对每个被引用的仓库运行 `git ls-remote`。那些 ref 无法读取的 action，例如私有仓库中的 action，会被跳过并发出警告。如果 actions 托管在不同的 GitHub 服务器上（例如 GitHub Enterprise Server），设置 [update.githubActionsServer](/docs/settings/dependency-resolution#updategithubactionsserver)（自 v11.17.0 起提供）。

## 选项

### --recursive, -r

并发地在所有含 `package.json` 的子目录（不含 node_modules）中运行 update。

用法示例：

```sh
pnpm --recursive update
# updates direct dependencies only
pnpm --recursive update --depth 0
# update typescript to the latest version in every package
pnpm --recursive update typescript@latest
```

### --depth <number>

- 默认值：**Infinity**
- 类型：**数字**

在依赖树中更新到多深。`0` 只更新直接依赖。

### --latest, -L

只要 `package.json` 中指定的版本范围低于 `latest` 标签，就把依赖更新到由其 `latest` 标签判定的最新稳定版本（可能跨主版本升级包）（即它不会降级预发布版本）。

自 v12.6.0 起，`--latest` 不会把依赖移出 `packageExtensions`、`readPackage` 钩子或覆盖所给出的说明符范围。锁文件会停留在该范围之内。

自 v12.23.0 起，`pnpm update --latest <名称>` 会移动该依赖裸名称所对应的覆盖。覆盖保留其范围写法，因此 `1.0.0` 变为新的精确版本，而 `^1.0.0` 变为 `^<新版本>`。`package.json` 中的条目保持不变。`pnpm update --interactive --latest` 对你选中的依赖同样如此。当它无法移动该覆盖时（例如 `npm:` 别名、`$` 引用或 `catalog:` 值），pnpm 会打印警告。不带选择器的 `--latest` 不会改动覆盖。

Cargo 的版本要求在更新时保留其运算符，因此 `~1.0` 变为 `~1.1`，`=1.0.0` 仍保持精确。只有上界的要求（例如 `<2`）在新版本仍满足它时保持不变，而当 `--latest` 越过它时会变为插入号要求，例如 `^2.0.0`。选择器中的要求（如 `pnpm update crate:foo@^2`）会替换它。`savePrefix` 和 `saveExact` 只作用于新的 Cargo 依赖。保存的 Cargo 要求不包含构建元数据。

Python 的版本要求同样保留其运算符和精度，因此 `~=1.0` 变为 `~=2.0`，`==1.*` 变为 `==2.*`。只有上界的要求（例如 `<2`），或带多个子句的要求（例如 `>=1.0,<2`），在 `--latest` 越过它时会变为 `>=2.0`。若选中的预发布版本没有被该要求指明（例如 `==1.*` 对应的 `1.4rc1`），则会追加一个指明它的子句，例如 `==1.*,>=1.4rc1`。`savePrefix` 和 `saveExact` 不适用于 Python 的版本要求。

### --tag <tag>

自 v12.23.0 起提供

把依赖更新到给定 dist-tag 对应的版本，并按该依赖已声明的范围运算符把该版本写入 `package.json`。即使该 tag 的版本低于已安装版本，也会使用它。`pnpm up --tag next foo` 与 `pnpm up foo@next` 效果相同。

跟踪某个 dist-tag 的依赖（例如 `"foo": "latest"`）会切换到给定的 tag。通过 `catalog:`、`workspace:` 或 `npm:` 协议声明的依赖，通过具名 registry 声明的依赖，以及以路径或 Git URL 声明的依赖，都不会被改写。配置依赖不会被更新。未发布该 tag 的包会导致更新失败。

配合 `--global` 时，未发布该 tag 的包会保留其范围，其他包则会被更新。全局包在该 tag 版本更低时也会保留其已安装版本。

该值必须是 dist-tag 名称。版本或范围（例如 `1.2.3` 或 `*`）会被拒绝（`ERR_PNPM_UPDATE_INVALID_TAG`）。`--tag` 不能与 `--latest`、`--workspace`、`--patches` 或指明版本的选择器（例如 `foo@2`）组合（`ERR_PNPM_TAG_WITH_SPEC`）。

### --patches

自 v12.0.0 起提供

刷新 [registry 修订](/docs/registry-revisions)而不改变任何包版本：对每个已锁定的 registry 包，pnpm 解析相同 `name@version` 的当前元数据，并在 registry 当前选择的产物发生变化时采用它。版本和声明的范围保持不变，但锁文件条目会被整体重写，包括 `integrity`、`revision` 及其周围的包快照，因为修订可能声明不同的依赖。

不能与包选择器、`--latest`、`--tag`、`--interactive` 或 `--global` 组合（`ERR_PNPM_PATCHES_WITH_SELECTOR`）。这些选项中的每一个都会缩小或重定向一次更新所针对的目标，即某个包子集、最新版本、交互式选择、全局安装，而 `--patches` 被定义为以当前版本覆盖当前项目的每个已锁定包。

### --pnpr-server <url>

自 v12.0.0 起提供

把 `--patches` 刷新的解析卸载到一个 [pnpr](https://pnpm.io/pnpr) 服务器，就像 [pnprServer](https://pnpm.io/pnpr/install-acceleration) 对安装做的那样。

### --global, -g

更新全局包。pnpm 10 的全局布局中的包会被迁移到当前布局。迁移成功后，pnpm 会从 `PNPM_HOME` 中移除旧的安装及其符号链接、shim 和硬链接的可执行文件。

### --workspace

尝试链接工作区中的所有包。版本会被更新以匹配工作区内各包的版本

如果更新特定的包，当任何被更新的依赖在工作区内找不到时，命令会失败。例如，如果 `express` 不是工作区包，以下命令会失败：

```bash
pnpm up -r --workspace express
```

### --prod, -P, --production

只更新 `dependencies` 和 `optionalDependencies` 中的包

### --dev, -D

只更新 `devDependencies` 中的包

### --no-optional

不更新 `optionalDependencies` 中的包

### --optional

只更新 `optionalDependencies` 中的包

### --peer

同时更新 `peerDependencies` 中的包。它不能与 `--interactive` 组合（`ERR_PNPM_INTERACTIVE_PEER_UNSUPPORTED`）。

### --save-exact, -E

配合 `--latest` 或 `--tag` 时，把解析出的版本不带范围运算符地写入 `package.json`。已声明 `^`、`~` 或精确范围的依赖会保留该运算符。

### --lockfile-only

只更新 `pnpm-lock.yaml`，不下载依赖，也不改动 `node_modules`。

### --lockfile-dir <dir>

创建 `pnpm-lock.yaml` 的目录。它不能与 `--global` 组合。

### --interactive, -i

显示过时的依赖并选择要更新哪些。

对于来自以 [`serverType: pnpr`](/docs/registries#servertype) 声明的 registry 的包，当光标停留在该包上时，会在列表下方显示已安装版本与所提供版本之间的发布说明。

使用 [`trustPolicy: no-downgrade`](/docs/settings/dependency-resolution#trustpolicy) 时，依赖列表只提供信任策略所接受的版本，并有一个 `Trust` 列。`--global` 的包分组列表没有这一列。该列指明所提供版本最强的可信依据：`staged publish`、`trusted publisher`、`provenance` 或 `none`。若 [`trustPolicyExclude`](/docs/settings/dependency-resolution#trustpolicyexclude) 中的某个包被提供了比已安装版本更弱的依据的版本，该单元格会显示为黄色，并同时指明已安装版本的依据。

自 v11.21.0 起，与 `--global` 结合时，每个[隔离安装组](/docs/global-packages#isolated-installations)作为一个可选项呈现：共享一个全局安装的包会作为一个整体一起更新。

### --long

在交互式更新列表中显示包的首页或仓库 URL：

```sh
pnpm update --interactive --long
```

URL 列默认隐藏。该选项会拉取完整的包元数据，仅影响 `--interactive`。它不能与 `--global` 组合，后者选择的是包分组。

### --no-save

不更新 `package.json` 中的范围

### --changeset

自 v11.16.0 起提供

更新完成后，写入一个[变更意图](/docs/versioning)，即一个与 changesets 兼容的 `.changeset/*.md` 文件，为每个其 `dependencies` 或 `optionalDependencies` 被该更新改变的工作区包声明 `patch` 提升，并在其 `peerDependencies` 改变时声明 `major` 提升。通过 `catalog:` 协议使用被更新目录条目的包也会被纳入。私有包、无名称或无有效 semver 版本的包，以及列在 [`versioning.ignore`](/docs/settings/versioning#versioningignore) 或 `.changeset/config.json` 的 `ignore` 数组中的包会被跳过。如果 `.changeset` 目录和 `pnpm-workspace.yaml` 中的 `versioning` 都不存在，会打印警告且不生成变更集。

在 `pnpm-workspace.yaml` 中把 [update.changeset](/docs/settings/dependency-resolution#updatechangeset) 设为 `true` 以默认启用此行为，并用 `--no-changeset` 为单次更新覆盖该设置。

### --no-changeset

即使 [`update.changeset`](/docs/settings/dependency-resolution#updatechangeset) 为 `true`，也不写入变更意图。

### --include-github-actions

自 v11.16.0 起提供

同时更新仓库工作流文件所引用的 GitHub Actions。见 [更新 GitHub Actions](#updating-github-actions)。

### 供应链策略标志

自 v12.3.0 起提供

`pnpm update` 接受与 `pnpm install` 和 `pnpm add` 相同的策略覆盖项：`--trust-lockfile`、`--no-trust-lockfile`、[`--trust-policy`](/docs/settings/dependency-resolution#trustpolicy)、[`--trust-policy-exclude`](/docs/settings/dependency-resolution#trustpolicyexclude) 和 [`--trust-policy-ignore-after`](/docs/settings/dependency-resolution#trustpolicyignoreafter)，因此无需编辑 `pnpm-workspace.yaml` 就能在单次运行中放宽或收紧策略。

### --minimum-release-age <minutes>, --minimum-release-age-exclude <package-spec>

自 v12.23.0 起提供

为本次运行设置 [`minimumReleaseAge`](/docs/settings/dependency-resolution#minimumreleaseage) 和 [`minimumReleaseAgeExclude`](/docs/settings/dependency-resolution#minimumreleaseageexclude)，与 [`pnpm install`](/docs/cli/install) 的行为相同。

### --cpu, --os, --libc, --ignore-scripts, --ignore-pnpmfile

这些选项的行为与 [`pnpm install`](/docs/cli/install) 相同。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
