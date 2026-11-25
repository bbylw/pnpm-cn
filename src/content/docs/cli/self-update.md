---
title: "pnpm self-update"
headingIds: ["behavior","in-a-project-that-pins-pnpm","outside-a-project-or-when-the-pnpm-pin-is-ignored","when-homebrew-or-corepack-manages-pnpm","when-another-pnpm-comes-first-on-path","project-settings-are-ignored","what-gets-installed"]
---

将 pnpm 更新到最新版本或指定版本。

不带版本号时，pnpm 会更新到 `latest` dist-tag，并且不会降级。要回到更旧的版本，请显式传入该版本。

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

当项目的清单中有指向 pnpm 的 `packageManager` 字段（或针对 pnpm 的 `devEngines.packageManager` 条目）时，`self-update` 会把该清单中锁定的版本更新为解析出的版本。在工作区中，即使命令运行在工作区包内，更新的也是工作区根目录的清单。同一清单中的 `engines.pnpm` 范围也会改为解析出的版本。精确版本，或基于完整版本的 `^`、`~` 范围会保持原有形式。其他范围如果接受解析出的版本就保持不变；否则会改为解析出的版本，并沿用其形式所隐含的运算符。例如，`12.2` 会变成 `~13.0.0`，而 `>=12.0.0 <13.0.0` 这样的比较器范围会变成 `^13.0.0`。它同时也会像在项目外部那样全局安装解析出的版本。锁定信息在全局安装之后才写入，因此安装失败时项目不会被改动。

### 在项目外部（或 pnpm 锁定被忽略时）

如果项目没有锁定 pnpm，或通过 [pmOnFail: ignore](/docs/settings/cli#pmonfail) 忽略了该锁定，`self-update` 会全局安装解析出的 pnpm 版本，并将其链接到 `PNPM_HOME`，使其成为你系统上生效的 pnpm 二进制文件。

### 当 Homebrew 或 Corepack 管理 pnpm 时

如果 pnpm 是由 Homebrew 安装的，或是由 Corepack 运行的，`pnpm self-update` 不会动全局的 pnpm。在锁定了 pnpm 的项目中，它仍会更新锁定信息；在这样的项目之外，它会失败。更新 Homebrew 安装请使用 `brew upgrade pnpm`（对于带版本的 formula，则是 `brew upgrade pnpm@<major>`）。

### 当 `PATH` 上有另一个 pnpm 排在前面时

安装完成后，`self-update` 会在 `PATH` 上查找 `pnpm`。如果另一个安装器提供的副本排在全局 bin 目录之前，你的 shell 会继续运行那份副本，`self-update` 会打印一条指明它的警告。如果 pnpm 认出了该安装器，警告中会给出移除那份副本的命令；否则它会告诉你把全局 bin 目录移到 `PATH` 中它之前的位置。[`pnpm setup`](/docs/cli/setup) 会打印同样的警告。当它写入的 shell 配置把全局 bin 目录放在最前面时，它会跳过这条警告。在 Windows 上，它改为检查已保存的系统级和用户级 `Path`，只有当那份副本仍排在前面时才保留警告。

## 忽略项目设置

自 v11.18.0 起，`pnpm self-update` 不接受其运行所在项目的任何指示：

- pnpm 通过切换 pnpm 版本时所用的同一受信任 registry 和身份验证配置来拉取，因此项目的 `.npmrc` 或 `pnpm-workspace.yaml` 无法重定向下载或为其附加凭据，项目的默认 `.pnpmfile.(c|m)js` 也不会被加载。来自受信任来源的 pnpmfile（[pnpmfile](/docs/pnpmfile#pnpmfile) 设置、全局 pnpmfile、config 依赖）仍然生效。
- 项目的 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage)、[trustPolicy](/docs/settings/dependency-resolution#trustpolicy) 和 `ci` 设置不影响 `self-update`。它们仍然管理项目自身的依赖；对 `self-update` 而言，这些值来自内置默认值、你的全局配置、`PNPM_CONFIG_*` 环境变量或命令行标志。这防止某个仓库要么放宽版本发布冷却期，要么通过调高它把你困在过时的 pnpm 上，也防止削弱守护 pnpm 下载的信任检查。

当 `self-update` 拒绝一个比 `minimumReleaseAge` 截止时间更早的版本时，交互式运行会询问是否仍要更新；非交互式运行仍然失败。即使在附加了 TTY 的 runner 上，CI 也从不提示。拒绝该提示会以 `ERR_PNPM_MINIMUM_RELEASE_AGE_DENIED` 失败。违反这些策略的版本会以 `ERR_PNPM_PNPM_RELEASE_POLICY_VIOLATION` 失败。pnpm 会在安装之前校验发布版本的身份。不匹配会以 `ERR_PNPM_PNPM_ENGINE_IDENTITY_MISMATCH` 失败，无法校验的发布会以 `ERR_PNPM_PNPM_ENGINE_IDENTITY_UNVERIFIABLE` 失败。

## 安装的内容

对于 pnpm 12 及更新的版本，`self-update` 安装的是不带作用域的 `pnpm` 包。它的原生二进制以 `@pnpm/exe.<platform>-<arch>` 包的形式发布，由 pnpm 直接链接，没有 Node.js 启动器。更旧的版本在可运行的平台上以 `@pnpm/exe` 安装，在其他平台上则以 `pnpm` 安装。
