---
title: "pnx"
headingIds: ["running-a-package-manager-or-a-runtime","options","--package-name","--allow-build","--shell-mode--c","--silent--s","security-and-trust-policies"]
---

别名： `pnpm dlx`, `pnpx`

从 registry 拉取一个包但不将其安装为依赖，热加载它并运行其暴露的默认命令二进制文件。

例如，要在任意位置使用 `create-vue` 初始化一个 Vue 项目，而不必将其安装到另一个项目下，可以运行：

```
pnx create-vue my-app
```

这将从 registry 拉取 `create-vue` 并使用给定的参数运行它。

你也可以指定要使用的包的精确版本：

```
pnx create-vue@next my-app
```

同样支持 `catalog:` 协议，可以使用工作区 catalog 中定义的版本：

```
pnx shx@catalog:
```

## 运行包管理器或运行时

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

指名 [pnpm 提供的包管理器](/docs/package-managers) 之一（`npm`、`yarn`、`bun`）或运行时（`node`、`deno`、`bun`）时，会配置真正的工具，而不是安装同名的 npm 包：

```
pnx yarn@4 install
pnx npm@11 ci
pnx bun@1.3.0 install
pnx node@22 --version
```

那些 npm 包要么是该工具的另一条产品线，要么是负责下载的包装器，因此指名它们本就应该得到真正的工具：`pnx yarn@4` 过去会因版本缺失而失败，因为 Yarn 4 以 `@yarnpkg/cli-dist` 发布；`pnx node@22` 过去运行的是一个下载 Node.js 构建的包装器，而不是该发布版本本身。

对于定位某个包而非请求已发布版本的说明符，会原样安装它所指定的内容：

```
pnx yarn@npm:yarn@1.22.22
pnx yarn@yarnpkg/berry
```

当 `--package` 指名一个包管理器时，会选择运行它的哪个命令：

```
pnx --package npm@11 npx create-something
```

## 选项

### --package <name>

运行命令前要安装的包。

Example:

```
pnx --package=@pnpm/meta-updater meta-updater --help
pnx --package=@pnpm/meta-updater@0 meta-updater --help
```

可以提供多个待安装的包：

```
pnx --package=yo --package=generator-webapp yo webapp --skip-install
```

### --allow-build

自 v10.2.0 起提供

允许在安装期间运行 postinstall 脚本的包名列表。

Example:

```
pnx --allow-build=esbuild my-bundler bundle
```

默认允许 `dlx` 实际执行的包运行 postinstall 脚本。因此在上面的示例中，如果 `my-bundler` 必须在执行前构建，它就会被构建。

### --shell-mode, -c

在 shell 中运行命令。在 UNIX 上使用 `/bin/sh`，在 Windows 上使用 `\cmd.exe`。

Example:

```
pnx --package cowsay --package lolcatjs -c 'echo "hi pnpm" | cowsay | lolcatjs'
```

### --silent, -s

仅打印被执行命令的输出。

## 安全与信任策略

自 v11.0.0 起，`pnx`（及其 `pnpm dlx` / `pnpx` 别名）在解析和拉取所请求的包时，会遵循项目级的安全与信任策略设置：

- [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage), [minimumReleaseAgeExclude](/docs/settings/dependency-resolution#minimumreleaseageexclude), [minimumReleaseAgeStrict](/docs/settings/dependency-resolution#minimumreleaseagestrict)
- [trustPolicy](/docs/settings/dependency-resolution#trustpolicy), [trustPolicyExclude](/docs/settings/dependency-resolution#trustpolicyexclude), [trustPolicyIgnoreAfter](/docs/settings/dependency-resolution#trustpolicyignoreafter)

这意味着 `pnx` 会像常规 `pnpm install` 一样，拒绝执行新发布或信任度不足的包。
