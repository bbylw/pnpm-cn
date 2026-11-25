---
title: "pnpm deploy"
headingIds: ["options","--force","--ignore-scripts","--dev--d","--no-optional","--prod--p","--filter-package_selector","--legacy","what-the-deployed-project-gets","reproducible-output","files-included-in-the-deployed-project","configuration","forcelegacydeploy"]
---

从工作区部署一个包。部署期间，被部署包的文件会被复制到目标目录。被部署包的所有依赖（包括来自工作区的依赖）都会安装在目标目录下隔离的 `node_modules` 目录中。目标目录将包含一个可移植的包，可直接复制到服务器并执行，无需额外步骤。

当被选中的项目声明了指向工作区项目之外目录的 `link:` 依赖时，pnpm 会解析该依赖的依赖关系，并把这个包包含进部署结果。

:::note[说明]

自 v12.2.0 起，`pnpm deploy` 不再需要 [`injectWorkspacePackages`](/docs/workspaces#injectworkspacepackages)。在部署专用的 lockfile 中，被链接的工作区依赖会被改写为 `file:` 依赖。它所声明的对等依赖会像注入式安装那样绑定：绑定到父包提供的版本。如果父包并不依赖该对等依赖，pnpm 会继续向上查找，直到被部署的项目。如果没有任何祖先提供该对等依赖，则绑定到被部署依赖图自身的解析结果。这也包括仅在 [`peerDependenciesMeta`](/docs/package_json#peerdependenciesmeta) 中声明的可选对等依赖。

当祖先提供了多个包或多个版本，或者没有任何祖先提供该对等依赖而部署依赖图中存在多个版本时，绑定会产生歧义。此时部署会失败并报 `ERR_PNPM_DEPLOY_AMBIGUOUS_PEER`，错误信息会指出相关的包、对等依赖以及存在竞争的解析结果。你可以用 [`overrides`](/docs/settings/dependency-resolution#overrides) 条目把该对等依赖固定到一个版本，或者打开 `injectWorkspacePackages` 设置——正是该设置来决定在这些候选之间如何取舍。

在 v12.2.0 之前，该命令会直接拒绝所有非注入式的工作区。`--legacy` 或 `forceLegacyDeploy: true` 仍然会选择旧版实现。

:::

:::note[说明]

设置了 [enableGlobalVirtualStore](/docs/settings/node-modules#enableglobalvirtualstore) 选项时，`pnpm deploy` 会忽略它，并始终在部署目录内创建一个本地化的虚拟存储。这使部署目录保持自包含且可移植。

:::

Usage:

```sh
pnpm --filter=<deployed project name> deploy <target directory>
```

过滤器必须恰好选中一个项目。没有选中任何项目会以 `ERR_PNPM_NOTHING_TO_DEPLOY` 失败；选中多个项目会以 `ERR_PNPM_CANNOT_DEPLOY_MANY` 失败。目标目录如果不适宜写入（例如工作区根目录），会以 `ERR_PNPM_INVALID_DEPLOY_TARGET` 失败。

根级 `overrides` 中的相对 `file:` 路径按源工作区解析。它们的依赖会被包含进被部署的包。

如果你在部署前先构建项目，还应使用 `--prod` 选项以跳过 `devDependencies` 的安装。

```sh
pnpm --filter=<deployed project name> --prod deploy <target directory>
```

在 docker 镜像中的用法。在构建完 monorepo 中的所有内容后，在一个将 monorepo 基础镜像作为构建上下文的第二个镜像中，或在额外的构建阶段中执行以下操作：

```dockerfile
# syntax=docker/dockerfile:1.4

# The workspace image must use WORKDIR /app
FROM workspace as pruned
RUN pnpm --filter <your package name> --prod deploy pruned

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=pruned /app/pruned .

ENTRYPOINT ["node", "index.js"]
```

指向项目内部目录的符号链接，即使该目录本身没有被部署，也会被保留。指向项目内部已不存在的路径的符号链接（例如指向已被删除的 `node_modules` 的链接）同样会被保留。指向 `node_modules` 的链接会解析为输出目录中安装的依赖。指向未被部署文件的符号链接会被该文件的副本替换。

要在不使用 registry 元数据的情况下部署，请保留源 lockfile，并在运行 `pnpm deploy --offline` 之前用 `pnpm install` 或 `pnpm fetch` 填充存储目录。这同样适用于每个项目各自保存 lockfile 的情况以及 `--legacy`。如果希望部署跳过对已锁定依赖的供应链策略检查，请使用 `--trust-lockfile`。新增或发生变化的依赖可能仍然需要 registry 元数据。

部署会保留被注入的工作区包已记录的绑定关系，在使用 [`lockfile.format: v13`](/docs/settings/store#lockfileformat) 时也是如此。

## 选项

`pnpm deploy` 接受 [`pnpm install`](/docs/cli/install) 的那些选项，用于它安装到目标目录的那次安装。

### --force

允许部署到非空的目标目录。没有这个标志时，如果目标目录不为空，pnpm 会以 `ERR_PNPM_DEPLOY_DIR_NOT_EMPTY` 失败。

### --ignore-scripts

部署期间跳过生命周期脚本，包括依赖的构建脚本。参见 [`pnpm install --ignore-scripts`](/docs/cli/install#--ignore-scripts)。

### --dev, -D

仅安装 `devDependencies`。

### --no-optional

不安装 `optionalDependencies`。

### --prod, -P

不安装 `devDependencies` 中的包。

### --filter <package_selector>

更多过滤说明见[过滤](/docs/filtering)。

### --legacy

强制使用旧版部署实现。

默认情况下，`pnpm deploy` 会尝试为部署从共享锁文件创建一个专用锁文件。`--legacy` 标志会禁用此行为，并允许在未设置 `inject-workspace-packages=true` 的情况下使用 deploy 命令。

旧版 deploy 只会针对被部署依赖图中的包名检查补丁的使用情况。未匹配到部署包的补丁仍然会触发未使用补丁的诊断信息。

自 v12.4.1 起，旧版实现会优先使用源工作区 lockfile 所固定的版本，只要它们仍满足被部署项目的版本范围。

自 v12.16.0 起，它会先像 `pnpm install` 那样，按照 [`minimumReleaseAge`](/docs/settings/dependency-resolution#minimumreleaseage) 以及其它解析策略检查源工作区的 lockfile，若其中某项策略拒绝了一个已锁定的版本，则部署失败。[`trustLockfile`](/docs/settings/dependency-resolution#trustlockfile) 或 `--trust-lockfile` 可以跳过该检查。

## 被部署的项目会得到什么

- 工作区根 `package.json` 的 `packageManager` 与 `devEngines.packageManager` 字段不会被复制进被部署的 `package.json`。
- 虚拟存储目录位于 [`virtualStoreDir`](/docs/settings/node-modules#virtualstoredir)，按部署目录解析。启用全局虚拟存储或使用绝对路径的 `virtualStoreDir` 时，它仍位于 `node_modules/.pnpm`。
- 被部署项目的 `prepare` 脚本不会被运行。
- deploy 作为 `file:` 依赖安装的工作区项目会运行它的构建脚本。pnpm 按依赖路径在 [`allowBuilds`](/docs/settings/build#allowbuilds) 设置中批准它。`allowBuilds` 中拒绝该项目的条目仍然生效。
- 带有 [`publishConfig.directory`](/docs/package_json#publishconfigdirectory) 的工作区项目会从该目录安装。它的构建脚本只有在该目录位于项目内部、且不在 `node_modules` 内部时才会运行。

## 可复现的输出

自 v12.15.0 起，当设置了 [`SOURCE_DATE_EPOCH`](https://reproducible-builds.org/docs/source-date-epoch/) 环境变量时，`pnpm deploy` 和 `pnpm install` 会把它作为 `node_modules/.modules.yaml` 与 `node_modules/.pnpm-workspace-state-v1.json` 中时间戳的上限。只要部署目标的准备方式相同，且该 epoch 不晚于原本会被记录的时间戳，用同一个 lockfile 部署同一个项目就会产生完全相同的文件，因此基于部署目录构建的 Docker 层可以保持缓存命中。

在该目录中随后执行的下一次 `pnpm install` 或 `pnpm run` 会依据 lockfile 检查已安装的依赖，而不再信任文件的修改时间。

## 部署项目中包含的文件

默认情况下，pnpm 复制的是 `pnpm pack` 会包含的文件。它们按以下*一种*方式选取，依次解析：

1. 项目的 `package.json` 可以包含一个 "files" 字段，列出应被复制的文件和目录。
2. 如果应用目录中有 `.npmignore` 文件，则此处列出的任何文件都会被忽略。
3. 如果应用目录中有 `.gitignore` 文件，则此处列出的任何文件都会被忽略。

要复制项目的所有文件，请把 [`deployAllFiles`](/docs/settings/other#deployallfiles) 设为 `true`。

## 配置

### forceLegacyDeploy

- 默认值：**false**
- 类型：**Boolean**

默认情况下，`pnpm deploy` 会尝试为部署从共享锁文件创建一个专用锁文件。如果将此设置设为 `true`，则使用旧版 `deploy` 行为。
