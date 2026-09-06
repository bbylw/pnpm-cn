---
title: "pnpm update"
headingIds: ["tldr","what-an-update-writes","updating-to-a-specific-version","selecting-dependencies-with-patterns","updating-github-actions","options","--recursive--r","--latest--l","--patches","--pnpr-server-url","--global--g","--workspace","--prod--p","--dev--d","--no-optional","--interactive--i","--no-save","--changeset","--include-github-actions","--filter-package_selector"]
---

别名： `up`, `upgrade`

`pnpm update` 根据指定范围将包更新到其最新版本

不带参数使用时，更新所有依赖

## TL;DR

| **Command** | **Meaning** |
| --- | --- |
| `pnpm up` | 更新所有依赖，遵循 `package.json` 中声明的范围 |
| `pnpm up --latest` | 把所有依赖更新到最新版本 |
| `pnpm up foo@2` | 把 `foo` 更新到 v2 上的最新版本 |
| `pnpm up "@babel/*"` | 更新 `@babel` scope 下的所有依赖 |

## 一次更新写入了什么

除了把 `pnpm-lock.yaml` 移到新解析的版本外，`pnpm update` 还会把新的范围写回依赖被声明的地方：

- 在 `package.json` 中，范围移到已解析的版本，同时保留依赖已声明的操作符，因此 `^1.1.0` 仍是插入符范围。
- 通过 [catalog 协议](/docs/catalogs)声明的依赖不会在 `package.json` 中被重写，而是改为更新它所指向的目录条目，位于 `pnpm-workspace.yaml` 中。
- 通过 dist-tag（例如 `"foo": "latest"`）声明的依赖继续跟踪该标签。标签留在 `package.json` 中，只有锁文件移到它背后的版本，即使使用 `--latest` 也是如此。

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

检查更新会对每个被引用的仓库运行 `git ls-remote`。那些 ref 无法读取的 action，例如私有仓库中的 action，会被跳过并发出警告。如果 actions 托管在不同的 GitHub 服务器上（例如 GitHub Enterprise Server），设置 [update.githubActionsServer](/docs/settings/dependency-resolution#updategithubactionsserver)（自 v11.17.0 起提供）。

## 选项

### --recursive, -r

在所有含 `package.json` 的子目录（不含 node_modules）中并发运行 update

用法示例：

```bash
pnpm --recursive update
# updates all packages up to 100 subdirectories in depth
pnpm --recursive update --depth 100
# update typescript to the latest version in every package
pnpm --recursive update typescript@latest
```

### --latest, -L

只要 `package.json` 中指定的版本范围低于 `latest` 标签，就把依赖更新到由其 `latest` 标签判定的最新稳定版本（可能跨主版本升级包）（即它不会降级预发布版本）。

### --patches

自 v12.0.0 起提供

刷新 [registry 修订](/docs/registry-revisions)而不改变任何包版本：对每个已锁定的 registry 包，pnpm 解析相同 `name@version` 的当前元数据，并在 registry 当前选择的产物发生变化时采用它。版本和声明的范围保持不变，但锁文件条目会被整体重写，包括 `integrity`、`revision` 及其周围的包快照，因为修订可能声明不同的依赖。

不能与包选择器、`--latest`、`--interactive` 或 `--global` 组合（`ERR_PNPM_PATCHES_WITH_SELECTOR`）。这些选项中的每一个都会缩小或重定向一次更新所针对的目标，即某个包子集、最新版本、交互式选择、全局安装，而 `--patches` 被定义为以当前版本覆盖当前项目的每个已锁定包。

### --pnpr-server <url>

自 v12.0.0 起提供

把 `--patches` 刷新的解析卸载到一个 [pnpr](https://pnpm.io/pnpr) 服务器，就像 [pnprServer](https://pnpm.io/pnpr/install-acceleration) 对安装做的那样。

### --global, -g

更新全局包

### --workspace

尝试链接工作区中的所有包。版本会被更新以匹配工作区内各包的版本

如果更新特定的包，当任何被更新的依赖在工作区内找不到时，命令会失败。例如，如果 `express` 不是工作区包，以下命令会失败：

```bash
pnpm up -r --workspace express
```

### --prod, -P

只更新 `dependencies` 和 `optionalDependencies` 中的包

### --dev, -D

只更新 `devDependencies` 中的包

### --no-optional

不更新 `optionalDependencies` 中的包

### --interactive, -i

显示过时的依赖并选择要更新哪些

自 v11.21.0 起，与 `--global` 结合时，每个[隔离安装组](/docs/global-packages#isolated-installations)作为一个可选项呈现：共享一个全局安装的包会作为一个整体一起更新。

### --no-save

不更新 `package.json` 中的范围

### --changeset

自 v11.16.0 起提供

更新完成后，写入一个[变更意图](/docs/versioning)，即一个与 changesets 兼容的 `.changeset/*.md` 文件，为每个其 `dependencies` 或 `optionalDependencies` 被该更新改变的工作区包声明 `patch` 提升，并在其 `peerDependencies` 改变时声明 `major` 提升。通过 `catalog:` 协议使用被更新目录条目的包也会被纳入。私有包、无名称的包，以及列在 `.changeset/config.json` 的 `ignore` 数组中的包会被跳过。如果 `.changeset/config.json` 不存在，会打印警告且不生成变更集。

在 `pnpm-workspace.yaml` 中把 [update.changeset](/docs/settings/dependency-resolution#updatechangeset) 设为 `true` 以默认启用此行为，并用 `--no-changeset` 为单次更新覆盖该设置。

### --include-github-actions

自 v11.16.0 起提供

同时更新仓库工作流文件所引用的 GitHub Actions。见 [更新 GitHub Actions](#updating-github-actions)。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
