---
title: "pnx"
headingIds: ["running-a-package-manager-or-a-runtime","running-a-rust-release","options","--package-name","--allow-build","--shell-mode--c","--minimum-release-age-minutes---minimum-release-age-exclude-package-spec","--cpu---os---libc","--silent--s","security-and-trust-policies"]
---

别名： `pnpm dlx`, `pnpx`

从 registry 拉取一个包但不将其安装为依赖，热加载它并运行其暴露的默认命令二进制文件。

例如，要在任意位置使用 `create-vue` 初始化一个 Vue 项目，而不必将其安装到另一个项目下，可以运行：

```sh
pnx create-vue my-app
```

这将从 registry 拉取 `create-vue` 并使用给定的参数运行它。

你也可以指定要使用的包的精确版本：

```sh
pnx create-vue@next my-app
```

同样支持 `catalog:` 协议，可以使用工作区 catalog 中定义的版本：

```sh
pnx shx@catalog:
```

## 运行包管理器或运行时

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

指名 [pnpm 提供的包管理器](/docs/package-managers) 之一（`pnpm`、`npm`、`yarn`、`bun`）或运行时（`node`、`deno`、`bun`）时，会配置真正的工具，而不是安装同名的 npm 包：

```sh
pnx yarn@4 install
pnx npm@11 ci
pnx bun@1.3.0 install
pnx node@22 --version
```

那些 npm 包要么是该工具的另一条产品线，要么是负责下载的包装器。例如，Yarn 4 以 `@yarnpkg/cli-dist` 发布，因此 `pnx yarn@4` 运行的就是 Yarn 4 本身，而 `pnx node@22` 运行的是该 Node.js 发布版本。

对于定位某个包而非请求已发布版本的说明符，会原样安装它所指定的内容：

```sh
pnx yarn@npm:yarn@1.22.22
pnx yarn@yarnpkg/berry
```

当 `--package` 指名一个包管理器时，会选择运行它的哪个命令：

```sh
pnx --package npm@11 npx create-something
```

### 运行 Rust 发布版

自 v12.11.1 起提供

`--package=rust@<渠道>` 会运行该 [Rust 工具链](/docs/cargo#rust-toolchain) 发布版中的工具，例如 `cargo` 或 `rustc`。pnpm 会先把这个发布版安装到存储中。渠道的写法与 `rust-toolchain.toml` 一致，裸写 `rust` 表示 `stable`。

```sh
pnx --package=rust@nightly-2026-01-01 cargo build --target wasm32-unknown-unknown
```

该发布版会使用管辖当前目录的 `rust-toolchain.toml` 中的 profile、组件和目标平台，外加每个 `--target` 参数所指定的目标。

## 选项

### --package <name>

运行命令前要安装的包。

示例：

```sh
pnx --package=@pnpm/meta-updater meta-updater --help
pnx --package=@pnpm/meta-updater@0 meta-updater --help
```

可以提供多个待安装的包：

```sh
pnx --package=yo --package=generator-webapp yo webapp --skip-install
```

### --allow-build

允许在安装期间运行构建脚本的包名列表。可以重复该选项，或自 v12.23.0 起用逗号分隔多个名称。

示例：

```sh
pnx --allow-build=esbuild my-bundler bundle
```

`pnx` 实际执行的包默认被允许运行构建脚本。因此在上面的示例中，如果 `my-bundler` 必须在执行前构建，它就会被构建。

给名称加上 `!` 前缀则拒绝其构建脚本，包括被执行包自身：

```sh
pnx --allow-build=!my-bundler my-bundler bundle
```

当某个依赖的构建脚本被跳过时，`pnx` 会在交互式终端中提示你批准它们。复用已缓存的安装（其中仍有待批准的构建）时也是如此。被批准的脚本会在所请求的命令之前运行。

批准结果保存在隔离的 `pnx` 缓存中，不会改变调用项目的构建设置。

在没有交互式终端的情况下，未经批准的构建脚本仍会被跳过。使用 `--allow-build` 允许命令所需的依赖运行脚本。

### --shell-mode, -c

在 shell 中运行命令。在 UNIX 上使用 `/bin/sh`，在 Windows 上使用 `\cmd.exe`。

示例：

```sh
pnx --package cowsay --package lolcatjs -c 'echo "hi pnpm" | cowsay | lolcatjs'
```

### --minimum-release-age <minutes>, --minimum-release-age-exclude <package-spec>

自 v12.23.0 起提供

为本次运行设置 [`minimumReleaseAge`](/docs/settings/dependency-resolution#minimumreleaseage) 和 [`minimumReleaseAgeExclude`](/docs/settings/dependency-resolution#minimumreleaseageexclude)，其行为与 [`pnpm install`](/docs/cli/install) 相同。

### --cpu, --os, --libc

通过 CPU 架构、操作系统和 C 库（`glibc` 或 `musl`）选择 `pnx` 安装时保留哪些带平台标签的可选依赖。可以重复该选项，或用逗号分隔多个值：

```sh
pnx --cpu arm64,x64 --os linux some-cli
```

### --silent, -s

仅打印被执行命令的输出。

## 安全与信任策略

自 v11.0.0 起，`pnx`（及其 `pnpm dlx` / `pnpx` 别名）在解析和拉取所请求的包时，会遵循项目级的安全与信任策略设置：

- [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage), [minimumReleaseAgeExclude](/docs/settings/dependency-resolution#minimumreleaseageexclude), [minimumReleaseAgeStrict](/docs/settings/dependency-resolution#minimumreleaseagestrict)
- [trustPolicy](/docs/settings/dependency-resolution#trustpolicy), [trustPolicyExclude](/docs/settings/dependency-resolution#trustpolicyexclude), [trustPolicyIgnoreAfter](/docs/settings/dependency-resolution#trustpolicyignoreafter)

这意味着 `pnx` 会像常规 `pnpm install` 一样，拒绝执行新发布或信任度不足的包。

`pnx` 会忽略当前目录中其他项目本地的执行、钩子和目录设置（`pnpmfile`、`globalPnpmfile`、`configDependencies`、`scriptShell`、`cacheDir`、`storeDir`、`ignoreScripts`、`overrides`、`packageExtensions` 和 `patchedDependencies`），同时保持用户级的全局配置生效。
