---
title: "pnpm add <pkg>"
headingIds: ["tldr","supported-package-sources","adding-a-package-manager-or-a-runtime","options","--save-prod--p--p","--save-dev--d--d","--save-optional--o--o","--save-exact--e--e","--save-peer","--save-catalog","--save-catalog-name-catalog_name","--config","--ignore-workspace-root-check","--global--g","--workspace","--allow-build","--filter-package_selector","--cpuname","--osname","--libcname"]
---

安装一个包以及它所依赖的任何包。默认情况下，任何新包都作为生产依赖安装。

## TL;DR

| **Command** | **Meaning** |
| --- | --- |
| `pnpm add sax` | 保存到 `dependencies` |
| `pnpm add -D sax` | 保存到 `devDependencies` |
| `pnpm add -O sax` | 保存到 `optionalDependencies` |
| `pnpm add -g sax` | 全局安装包 |
| `pnpm add sax@next` | 从 `next` tag 安装 |
| `pnpm add sax@3.0.0` | 指定版本 `3.0.0` |

## 支持的包来源

pnpm 支持从各种来源安装包。详细文档见 [Supported package sources](/docs/package-sources) 页面，内容包括：

- npm registry
- JSR registry
- 工作区包
- 本地文件系统（tarball 和目录）
- 远程 tarball
- Git 仓库（支持 semver、子目录等）

## 添加包管理器或运行时

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

指明一个[包管理器](/docs/package-managers)（`npm`、`yarn` 或 `bun`）会记录项目所使用的管理器，而不是安装与之同名的 npm 包：

```bash
pnpm add yarn@4
```

写入 `"packageManager": "yarn@4.18.0"`，其他每个包管理器都会作为范围记录在 [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 中。指明一个运行时（`node`、`deno`）会将其记录在 `engines.runtime` 下，一如显式的 `node@runtime:22` 写法所做的那样。`bun` 二者皆是，除非你指明运行时（`pnpm add bun@runtime:1.3.0`），否则它被声明为项目的包管理器。

在全局环境下，`pnpm add -g yarn` 安装的是当前的 Yarn 系列，而不是仅支持 Classic 的 `yarn` 包；`pnpm add -g node@22` 安装的是那个 Node.js 版本，而不是一个下载版本的包装器。

用于定位某个包而非请求某个已发布版本的说明符（如 `pnpm add yarn@npm:yarn@1.22.22`、`pnpm add yarn@yarnpkg/berry`），会按普通依赖安装它所指向的包。

## 选项

### --save-prod, -P, -p

将指定的包作为普通 `dependencies` 安装。

### --save-dev, -D, -d

将指定的包作为 `devDependencies` 安装。

### --save-optional, -O, -o

将指定的包作为 `optionalDependencies` 安装。

### --save-exact, -E, -e

保存的依赖将配置为精确版本，而不是使用 pnpm 默认的 semver 范围运算符。

### --save-peer

使用 `--save-peer` 会将一个或多个包加入 `peerDependencies` 并作为开发依赖安装。

### --save-catalog

自 v10.12.1 起提供

将新依赖保存到默认 [catalog](/docs/catalogs)。

### --save-catalog-name <catalog_name>

自 v10.12.1 起提供

将新依赖保存到指定的 [catalog](/docs/catalogs)。

### --config

自 v10.8.0 起提供

将依赖保存到 [configDependencies](/docs/config-dependencies)。

### --ignore-workspace-root-check

向工作区根包添加新依赖会失败，除非使用 `--ignore-workspace-root-check` 或 `-w` 标志。

例如，`pnpm add debug -w`。

### --global, -g

全局安装一个包。详情见 [Global Packages](/docs/global-packages)。

每个以空格分隔的包都会安装到各自独立的隔离目录。若要把多个包捆绑进一次隔离安装（使它们共享依赖并一起被移除），请将它们以逗号分隔的列表传入，例如 `pnpm add -g eslint,prettier`。

### --workspace

仅当在工作区中找到该新依赖时才添加。

### --allow-build

自 v10.4.0 起提供

允许在安装期间运行 postinstall 脚本的包名列表。

Example:

```
pnpm --allow-build=esbuild add my-bundler
```

这会运行 `esbuild` 的 postinstall 脚本，并将其加入 `pnpm-workspace.yaml` 的 `allowBuilds` 字段。因此 `esbuild` 今后将始终被允许运行其脚本。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --cpu=<name>

自 v10.14.0 起提供

覆盖所安装原生模块的 CPU 架构。可接受的值与 `package.json` 的 `cpu` 字段相同，后者来自 `process.arch`。

### --os=<name>

自 v10.14.0 起提供

覆盖所安装原生模块的操作系统。可接受的值与 `package.json` 的 `os` 字段相同，后者来自 `process.platform`。

### --libc=<name>

自 v10.14.0 起提供

覆盖所安装原生模块的 libc。可接受的值与 `package.json` 的 `libc` 字段相同。
