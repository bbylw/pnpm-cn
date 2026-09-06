---
title: "pnpm self-update"
headingIds: ["behavior","in-a-project-that-pins-pnpm","outside-a-project-or-when-the-pnpm-pin-is-ignored","project-settings-are-ignored","installing-pnpm-v12"]
---

将 pnpm 更新到最新版本或指定版本

```
pnpm self-update [<version>]
```

用法示例：

```
pnpm self-update
pnpm self-update 10
pnpm self-update next-10
pnpm self-update 10.6.5
```

## 行为

`pnpm self-update` 的行为取决于项目上下文：

### 在锁定 pnpm 版本的项目中

当项目的 `package.json` 将 `packageManager` 字段设为 pnpm（或有针对 pnpm 的 `devEngines.packageManager` 条目）时，`self-update` 只会把 `package.json` 中锁定的版本更新为解析出的版本，不会全局安装 pnpm。下次你运行 pnpm 命令时，pnpm 会自动下载并切换到指定的版本。

### 在项目外部（或 pnpm 锁定被忽略时）

如果项目没有锁定 pnpm，或通过 [pmOnFail: ignore](/docs/settings/cli#pmonfail) 忽略了该锁定，`self-update` 会全局安装解析出的 pnpm 版本，并将其链接到 `PNPM_HOME`，使其成为你系统上生效的 pnpm 二进制文件。

## 忽略项目设置

自 v11.18.0 起，`pnpm self-update` 不接受其运行所在项目的任何指示：

- pnpm 通过切换 pnpm 版本时所用的同一受信任 registry 和身份验证配置来拉取，因此项目的 `.npmrc` 或 `pnpm-workspace.yaml` 无法重定向下载或为其附加凭据，项目的默认 `.pnpmfile.(c|m)js` 也不会被加载。来自受信任来源的 pnpmfile（[pnpmfile](/docs/pnpmfile#pnpmfile) 设置、全局 pnpmfile、config 依赖）仍然生效。
- 项目的 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage)、[trustPolicy](/docs/settings/dependency-resolution#trustpolicy) 和 `ci` 设置不影响 `self-update`。它们仍然管理项目自身的依赖；对 `self-update` 而言，这些值来自内置默认值、你的全局配置、`PNPM_CONFIG_*` 环境变量或命令行标志。这防止某个仓库要么放宽版本发布冷却期，要么通过调高它把你困在过时的 pnpm 上，也防止削弱守护 pnpm 下载的信任检查。

当 `self-update` 拒绝一个比 `minimumReleaseAge` 截止时间更晚的版本时，交互式运行会询问是否仍要更新；非交互式运行仍然失败。即使在附加了 TTY 的 runner 上，CI 也从不提示。

## 安装 pnpm v12

pnpm 12 以 `latest-12` dist-tag 下的 `pnpm` 和 `@pnpm/exe` 两个名称发布：

```
pnpm self-update latest-12
```

v12 将原生二进制以 `@pnpm/exe.<platform>-<arch>` 包提供，由 pnpm 内置的安装程序直接链接。没有 Node.js 启动器，因此命令没有 Node.js 启动开销。自 v12 起，安装收敛到不带作用域的 `pnpm` 包（Rust 可执行文件），即使是 `@pnpm/exe` 的 SEA 构建也一样。
