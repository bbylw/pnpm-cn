---
title: "支持的包源"
headingIds: ["trusted-sources","npm-registry","jsr-registry","cratesio-and-pypi","provisioned-tools","named-registries","workspace","local-file-system","exotic-sources","remote-tarball","git-repository","install-from-a-git-repository-using-semver","install-from-a-subdirectory-of-a-git-repository","install-from-a-git-repository-via-a-full-url","install-from-a-git-repository-using-hosting-providers-shorthand","install-from-a-git-repository-combining-different-parameters","how-git-dependencies-are-resolved","using-ssh-for-private-repositories","repositories-on-other-hosts","how-a-git-dependency-is-built"]
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

要从 [JSR](https://jsr.io/) registry 安装依赖包，使用 `jsr:` 协议前缀：

```sh
pnpm add jsr:@hono/hono
pnpm add jsr:@hono/hono@4
pnpm add jsr:@hono/hono@latest
```

这与从 npm 安装一样，只是会告知 pnpm 转而通过 JSR 解析该包。

### crates.io 与 PyPI

自 v12.4.0 起提供（仅 pnpm v12）

`crate:` 或 `pypi:` 前缀用于请求另一种生态系统的包，前提是该生态系统已在 `pnpm-workspace.yaml` 中启用：

```sh
pnpm add crate:serde
pnpm add pypi:httpx
```

这类依赖会记录在该生态系统自己的清单和锁文件中，而不是 `package.json` 或 `pnpm-lock.yaml`。参见 [Cargo 依赖](/docs/cargo)和 [Python 依赖](/docs/python)。

### 预置工具

自 v12.13.0 起提供（仅 pnpm v12）

`tool:` 协议用于请求由 pnpm 从该工具自己的发布渠道（而不是 npm）下载的工具：Node.js、Bun、Deno 和 Yarn。

```sh
pnpm add node@tool:24
pnpm add bun@tool:1.3.0
pnx node@tool:22 --version
pnx yarn@tool:4 --version
```

`yarn@tool:<版本>` 会像 `yarn@<版本>` 那样，从该 Yarn 系列实际发布的任何位置选取 Yarn。

`runtime:` 是 `tool:` 的别名，在此前可用的地方依然可用。`pnpm-lock.yaml` 仍以 `runtime:` 记录这些条目，例如 `node@runtime:24.6.0`，因此锁文件仍可被更早的 pnpm 版本读取。

### 命名 registry

[命名 registry](/docs/settings/dependency-resolution#namedregistries) 别名会在指定的 registry 中解析依赖包，而不管默认 registry 是哪个：

```sh
pnpm add work:@corp/lib@^2.0.0
pnpm add gh:@my-org/private-pkg
pnpm add npmjs:left-pad
```

`gh:`（GitHub Packages）和 `npmjs:`（公共 npm registry）无需配置即可使用。其他任何别名都必须在 `pnpm-workspace.yaml` 的 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 下映射，或在[全局配置文件](/docs/cli/config)（`config.yaml`）中映射。

### 工作区

注意，在[工作区](/docs/workspaces)内添加依赖时，包将从已配置的源安装，具体取决于是否设置了 [linkWorkspacePackages](/docs/workspaces#linkworkspacepackages)，以及是否使用了 [workspace: 范围协议](/docs/workspaces#workspace-protocol-workspace)。

### 本地文件系统

从本地文件系统安装有两种方式：

1. 从 tarball 文件（`.tar`、`.tar.gz` 或 `.tgz`）
2. 从目录

示例：

```sh
pnpm add ./package.tar.gz
pnpm add ./some-directory
```

`pnpm add ./some-directory` 会用 `link:` 协议记录该依赖。pnpm 会在当前项目的 `node_modules` 中创建符号链接，因此等同于运行 `pnpm link`。

若要把目录作为包来安装，请改用 `file:` 协议，例如 `pnpm add file:./some-directory`。pnpm 会把该目录复制到虚拟存储中，并安装它的依赖。

## 非常规源

非常规源对开发很有用，但被传递依赖使用时可能存在供应链风险。

### 远程 tarball

pnpm 会为通过 HTTPS 或回环 HTTP 的 tarball 下载发送 registry 凭据。重定向只在同一来源上的已配置 registry 路径内才能获得凭据。

参数必须是可拉取的 URL，以 "http://" 或 "https://" 开头。

示例：

```sh
pnpm add https://github.com/indexzero/forever/tarball/v0.5.6
```

### Git 仓库

```sh
pnpm add <git remote url>
```

从给定 URL 的 Git 仓库安装依赖包。视仓库而定，pnpm 要么从 Git 托管方下载源码归档，要么使用 Git 克隆仓库，参见[Git 依赖如何解析](#how-git-dependencies-are-resolved)。

你可以通过以下方式从 Git 安装依赖包：

- 默认分支的最新提交：

```sh
pnpm add kevva/is-positive
```

- Git 提交哈希：

```sh
pnpm add kevva/is-positive#97edff6f525f192a3f83cea1944765f769ae2678
```

- Git 分支：

```sh
pnpm add kevva/is-positive#master
```

- 相对于 refs 的 Git 分支：

```sh
pnpm add zkochan/is-negative#heads/canary
```

- Git 标签：

```sh
pnpm add zkochan/is-negative#2.0.1
```

- 带 V 前缀的 Git 标签：

```sh
pnpm add andreineculau/npm-publish-git#v0.0.7
```

#### 使用 semver 从 Git 仓库安装

可以使用 `semver:` 参数指定要安装的版本（范围）。例如：

- 精确 semver：

```sh
pnpm add zkochan/is-negative#semver:1.0.0
```

- 带 V 前缀的精确 semver：

```sh
pnpm add andreineculau/npm-publish-git#semver:v0.0.7
```

- semver 版本范围：

```sh
pnpm add kevva/is-positive#semver:^2.0.0
```

- 带 V 前缀的 semver 版本范围：

```sh
pnpm add andreineculau/npm-publish-git#semver:<=v0.0.7
```

#### 从 Git 仓库的子目录安装

也可以使用 `path:` 参数只安装 Git 托管 monorepo 中的某个子目录。例如：

```sh
pnpm add RexSkz/test-git-subfolder-fetch#path:/packages/simple-react-app
```

#### 通过完整 URL 从 Git 仓库安装

如果想更明确，或使用了其他 Git 托管服务，可以写出完整的 Git URL：

```sh
# git+ssh
pnpm add git+ssh://git@github.com:zkochan/is-negative.git#2.0.1

# https
pnpm add https://github.com/zkochan/is-negative.git#2.0.1
```

#### 使用托管服务商简写从 Git 仓库安装

对某些 Git 服务商，可以使用协议简写 `[provider]:`：

```sh
pnpm add github:zkochan/is-negative
pnpm add bitbucket:pnpmjs/git-resolver
pnpm add gitlab:pnpm/git-resolver
pnpm add gist:106cfef49f8476b753a9cbbf9c65aff1
```

省略 `[provider]:` 时，默认为 `github:`。

#### 组合不同参数从 Git 仓库安装

可以用 `&` 分隔并组合多个参数。这对 monorepo 的 fork 很有用：

```sh
pnpm add RexSkz/test-git-subdir-fetch.git#beta\&path:/packages/simple-react-app
```

从 `beta` 分支安装，且仅安装 `/packages/simple-react-app` 子目录。

pnpm 也接受 npm 的语法，用 `::` 分隔参数：

```sh
pnpm add RexSkz/test-git-subdir-fetch.git#beta::path:packages/simple-react-app
```

#### Git 依赖如何解析

自 v12.0.0 起提供（仅 pnpm v12）

对于 GitHub、GitLab、Bitbucket 和 GitHub Gist 上的仓库，说明符是一种**标识**，而不是传输方式的选择。以下写法都指向同一个依赖，且解析结果完全相同：

```text
kevva/is-positive
github:kevva/is-positive
git+https://github.com/kevva/is-positive.git
https://github.com/kevva/is-positive.git
git+ssh://git@github.com/kevva/is-positive.git
```

每种写法都通过托管方的规范 HTTPS URL 解析，锁文件会记录以下两种形式之一：

- **托管方的源码归档**，即普通的 tarball 下载。只有当对该归档 URL 的匿名请求成功时才会记录，因此被记录的归档 URL 必然可拉取。
- 否则为**基于规范 HTTPS URL 的 git 解析**，任何能访问该仓库的机器都可拉取。

pnpm 从不为这些托管方记录 SSH URL。某台机器用哪种传输方式访问托管方，属于该机器的 Git 配置，而不是项目的属性。

##### 为私有仓库使用 SSH

在机器上通过 Git 自身的配置设置 URL 重写：

```bash
git config --global url."git@github.com:".insteadOf https://github.com/
```

pnpm 会调用外部的 `git`，因此该重写会自动应用于 pnpm 的所有 Git 操作。CI 上同理：给运行器配置 SSH 密钥加这条重写，或一个 HTTPS 凭据助手即可，两种情况下锁文件完全一致。

##### 其他托管方的仓库

不指向已知托管方的 URL（自托管的 GitLab、Gitea 或任何内部 Git 服务器）会原样保留，包括传输方式。对这些 URL 而言，URL 本身*就是*标识。内嵌凭据的 URL 同样逐字保留，且永远不会解析为托管方的归档。

:::info[信息]

现有锁文件条目保持不变。上述规则仅在新增条目或重新解析时适用，而 `pnpm update <package>` 会把 SSH URL 重新记录为 HTTPS。

:::

#### Git 依赖的构建方式

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

托管在 Git 上的依赖若交付的是源码而非构建好的包，必须先执行 prepare（安装其依赖并运行其构建脚本）才能被安装。pnpm 会使用该依赖所要求的那个包管理器来准备它。参见[准备 Git 托管的依赖](/docs/package-managers#preparing-a-git-hosted-dependency)。
