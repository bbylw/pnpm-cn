---
title: "支持的包源"
headingIds: ["trusted-sources","npm-registry","jsr-registry","named-registries","workspace","local-file-system","exotic-sources","remote-tarball","git-repository","install-from-a-git-repository-using-semver","install-from-a-subdirectory-of-a-git-repository","install-from-a-git-repository-via-a-full-url","install-from-a-git-repository-using-hosting-providers-shorthand","install-from-a-git-repository-combining-different-parameters","how-git-dependencies-are-resolved","using-ssh-for-private-repositories","repositories-on-other-hosts","how-a-git-dependency-is-built"]
---

pnpm 支持从多种源安装依赖包。这些源分为两类：**受信任的源**与**非常规源**。

非常规源（如 Git 仓库或直接的 tarball URL）被传递依赖使用时可能引入供应链风险。将 [blockExoticSubdeps](/docs/settings/dependency-resolution#blockexoticsubdeps) 设为 `true`，即可阻止传递依赖使用非常规源。

## 受信任的源

无论直接依赖还是传递依赖，受信任的源都被视为安全的。

### npm registry

默认情况下，`pnpm add package-name` 会从 [npm registry](https://www.npmjs.com/) 安装 `package-name` 的最新版本。

如果在工作区中执行，此命令会先检查工作区内的其他项目是否使用了指定包。若有，则安装已在使用的版本范围。

你还可以通过以下方式安装依赖包：

- tag: `pnpm add express@nightly`
- version: `pnpm add express@1.0.0`
- 版本范围：`pnpm add express@2 react@">=0.1.0 <0.2.0"`

### JSR registry

自 v10.9.0 起提供

要从 [JSR](https://jsr.io/) registry 安装依赖包，使用 `jsr:` 协议前缀：

```
pnpm add jsr:@hono/hono
pnpm add jsr:@hono/hono@4
pnpm add jsr:@hono/hono@latest
```

这与从 npm 安装一样，只是会告知 pnpm 转而通过 JSR 解析该包。

### 命名 registry

自 v11.1.0 起提供

[命名 registry](/docs/settings/dependency-resolution#namedregistries) 别名会在指定的 registry 中解析依赖包，而不管默认 registry 是哪个：

```bash
pnpm add work:@corp/lib@^2.0.0
pnpm add gh:@my-org/private-pkg
pnpm add npmjs:left-pad
```

`gh:`（GitHub Packages）以及自 v11.20.0 起的 `npmjs:`（公共 npm registry）无需配置即可使用。其他任何别名都必须在 `pnpm-workspace.yaml` 的 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 下映射，或自 v11.11.0 起在[全局配置文件](/docs/cli/config)（`config.yaml`）中映射。

### 工作区

注意，在[工作区](/docs/workspaces)内添加依赖时，包将从已配置的源安装，具体取决于是否设置了 [linkWorkspacePackages](/docs/workspaces#linkworkspacepackages)，以及是否使用了 [workspace: 范围协议](/docs/workspaces#workspace-protocol-workspace)。

### 本地文件系统

从本地文件系统安装有两种方式：

1. 从 tarball 文件（`.tar`、`.tar.gz` 或 `.tgz`）
2. 从目录

Examples:

```bash
pnpm add ./package.tar.gz
pnpm add ./some-directory
```

从目录安装时，会在当前项目的 `node_modules` 中创建符号链接，因此等同于运行 `pnpm link`。

## 非常规源

非常规源对开发很有用，但被传递依赖使用时可能存在供应链风险。

### 远程 tarball

参数必须是可拉取的 URL，以 "http://" 或 "https://" 开头。

Example:

```bash
pnpm add https://github.com/indexzero/forever/tarball/v0.5.6
```

### Git 仓库

```bash
pnpm add <git remote url>
```

从给定 URL 的 Git 仓库安装依赖包。视仓库而定，pnpm 要么从 Git 托管方下载源码归档，要么使用 Git 克隆仓库，参见[Git 依赖如何解析](#how-git-dependencies-are-resolved)。

你可以通过以下方式从 Git 安装依赖包：

- 默认分支的最新提交：

```
pnpm add kevva/is-positive
```

- Git 提交哈希：

```
pnpm add kevva/is-positive#97edff6f525f192a3f83cea1944765f769ae2678
```

- Git 分支：

```
pnpm add kevva/is-positive#master
```

- 相对于 refs 的 Git 分支：

```
pnpm add zkochan/is-negative#heads/canary
```

- Git 标签：

```
pnpm add zkochan/is-negative#2.0.1
```

- 带 V 前缀的 Git 标签：

```
pnpm add andreineculau/npm-publish-git#v0.0.7
```

#### 使用 semver 从 Git 仓库安装

可以使用 `semver:` 参数指定要安装的版本（范围）。例如：

- 精确 semver：

```
pnpm add zkochan/is-negative#semver:1.0.0
```

- 带 V 前缀的精确 semver：

```
pnpm add andreineculau/npm-publish-git#semver:v0.0.7
```

- semver 版本范围：

```
pnpm add kevva/is-positive#semver:^2.0.0
```

- 带 V 前缀的 semver 版本范围：

```
pnpm add andreineculau/npm-publish-git#semver:<=v0.0.7
```

#### 从 Git 仓库的子目录安装

也可以使用 `path:` 参数只安装 Git 托管 monorepo 中的某个子目录。例如：

```
pnpm add RexSkz/test-git-subfolder-fetch#path:/packages/simple-react-app
```

#### 通过完整 URL 从 Git 仓库安装

如果想更明确，或使用了其他 Git 托管服务，可以写出完整的 Git URL：

```
# git+ssh
pnpm add git+ssh://git@github.com:zkochan/is-negative.git#2.0.1

# https
pnpm add https://github.com/zkochan/is-negative.git#2.0.1
```

#### 使用托管服务商简写从 Git 仓库安装

对某些 Git 服务商，可以使用协议简写 `[provider]:`：

```
pnpm add github:zkochan/is-negative
pnpm add bitbucket:pnpmjs/git-resolver
pnpm add gitlab:pnpm/git-resolver
```

省略 `[provider]:` 时，默认为 `github:`。

#### 组合不同参数从 Git 仓库安装

可以用 `&` 分隔并组合多个参数。这对 monorepo 的 fork 很有用：

```
pnpm add RexSkz/test-git-subdir-fetch.git#beta\&path:/packages/simple-react-app
```

从 `beta` 分支安装，且仅安装 `/packages/simple-react-app` 子目录。

#### Git 依赖如何解析

自 v12.0.0 起提供（仅 pnpm v12）

对于 GitHub、GitLab 和 Bitbucket 上的仓库，说明符是一种**标识**，而不是传输方式的选择。以下写法都指向同一个依赖，且解析结果完全相同：

```
kevva/is-positive
github:kevva/is-positive
git+https://github.com/kevva/is-positive.git
git+ssh://git@github.com/kevva/is-positive.git
```

每种写法都通过托管方的规范 HTTPS URL 解析，锁文件会记录以下两种形式之一：

- **托管方的源码归档**，即普通的 tarball 下载。只有当对该归档 URL 的匿名请求成功时才会记录，因此被记录的归档 URL 必然可拉取。
- 否则为**基于规范 HTTPS URL 的 git 解析**，任何能访问该仓库的机器都可拉取。

pnpm 从不为这些托管方记录 SSH URL。某台机器用哪种传输方式访问托管方，属于该机器的 Git 配置，而不是项目的属性。

pnpm 11 会将说明符的传输方式保留为记录 URL 的一部分，但自 v11.21.0 起，只有当说明符本身要求使用 SSH（`git+ssh://` 或 `git@host:...`）时才记录 SSH URL：`owner/repo` 这类简写会通过 HTTPS 解析并记录，因此在装有 SSH 密钥的机器上写入的锁文件，仍能安装到没有 SSH 密钥的 CI 运行器上。旧版 pnpm 记录的 SSH URL 可以通过 `pnpm update <package>` 以 HTTPS 重新记录。

##### 为私有仓库使用 SSH

在机器上通过 Git 自身的配置设置 URL 重写：

```bash
git config --global url."git@github.com:".insteadOf https://github.com/
```

pnpm 会调用外部的 `git`，因此该重写会自动应用于 pnpm 的所有 Git 操作。CI 上同理：给运行器配置 SSH 密钥加这条重写，或一个 HTTPS 凭据助手即可，两种情况下锁文件完全一致。

##### 其他托管方的仓库

不指向已知托管方的 URL（自托管的 GitLab、Gitea 或任何内部 Git 服务器）会原样保留，包括传输方式。对这些 URL 而言，URL 本身*就是*标识。内嵌凭据的 URL 同样逐字保留，且永远不会解析为托管方的归档。

:::info[info]

在 pnpm v11 及更早版本中，解析过程会探测网络以在 HTTPS 和 SSH 之间做出选择。这可能会记录运行安装的机器上恰好可用的那种传输方式，最常见的是 `ssh://` URL，随后在没有 SSH 密钥的 CI 运行器上失败。pnpm v12 移除了探测。现有锁文件条目保持不变，上述规则仅在新增条目或重新解析时适用。

:::

#### Git 依赖的构建方式

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

托管在 Git 上的依赖若交付的是源码而非构建好的包，必须先执行 prepare（安装其依赖并运行其构建脚本）才能被安装。pnpm 会使用该依赖自己要求的包管理器来准备它，而不是假定主机上装了正确的那一个：

- 依赖自身的 `packageManager` / [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 锁定优先，其作者正是用它进行测试的；
- 没有锁定时，其自带的锁文件会指明包管理器。`yarn.lock` 还会指明是*哪个* Yarn 系列：Yarn Berry 会在其写入的每个锁文件中打上 `__metadata:` 标记，两个系列无法互读对方的锁文件，因此 Berry 不再安装 Classic 锁文件。

当依赖锁定了版本，或主机无法满足依赖所需时，pnpm 会[提供该包管理器](/docs/package-managers)。因此用 Yarn 构建的仓库也能在只装有 pnpm 的机器上安装；而主机若已装有合适的包管理器（覆盖构建可能调用的所有名称），则继续使用自己的。
