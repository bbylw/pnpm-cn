---
title: "pnpm add <pkg>"
headingIds: ["tldr","supported-package-sources","package-aliases","adding-a-package-manager-or-a-runtime","adding-the-rust-toolchain","protocol-prefixed-selectors","package-urls","options","--save-prod--p--p","--save-dev--d--d","--save-optional--o--o","--save-exact--e--e","--save-build","--save-peer","--save-types","--save-prefix-prefix","--tilde","--save-catalog","--save-catalog-name-catalog_name","--config","--ignore-workspace-root-check","--global--g","--workspace","--allow-build","--minimum-release-age-minutes---minimum-release-age-exclude-package-spec","--lockfile-only","--force","--lockfile-dir-dir","--prod---production","--dev","--no-optional","--no-auto-dedupe","--ignore-scripts","--ignore-pnpmfile","--registry","--filter-package_selector","--cpuname","--osname","--libcname"]
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
| `pnpm add lodash@npm:awesome-lodash` | 把 `awesome-lodash` 作为 `lodash` 安装 |
| `pnpm add crate:serde` | 添加一个 [Cargo](/docs/cargo) crate |
| `pnpm add pypi:httpx` | 添加一个 [Python](/docs/python) 包 |

## 支持的包来源

pnpm 支持从各种来源安装包。详细文档见 [Supported package sources](/docs/package-sources) 页面，内容包括：

- npm registry
- JSR registry
- 工作区包
- 本地文件系统（tarball 和目录）
- 远程 tarball
- Git 仓库（支持 semver、子目录等）
- 通过 `crate:` 和 `pypi:` 前缀访问 crates.io 与 PyPI

## 包别名

要以不同的本地名称安装某个 npm 包，请使用 `npm:` 别名：

```sh
pnpm add <alias>@npm:<package>
pnpm add <alias>@npm:<package>@<version-or-tag>
```

`npm:` 之后的包可以带 scope，也可以带版本。例如：

```sh
pnpm add babel-core@npm:@babel/core@8.0.6
```

这会把 `babel-core` 写为依赖名，同时把 `@babel/core@8.0.6` 解析为目标包。`npm:` 部分是 npm 的包别名协议，而不是[具名 registry](/docs/package-sources#named-registries)；registry 路由仍遵循目标包的默认或按 scope 配置的 npm registry。

更多示例见[别名](/docs/aliases)。

## 添加包管理器或运行时

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

指明一个[包管理器](/docs/package-managers)（`npm`、`yarn` 或 `bun`）会记录项目所使用的管理器，而不是安装与之同名的 npm 包：

```sh
pnpm add yarn@4
```

这会写入 `"packageManager": "yarn@4.18.0"`。npm 和 Bun 则改为作为范围记录在 [`devEngines.packageManager`](/docs/package_json#devenginespackagemanager) 中；每次写入都会移除另一个字段。指明一个运行时（`node`、`deno`）会将其记录在 `engines.runtime` 下，正如自 v12.13.0 起的显式 [`node@tool:22`](/docs/package-sources#provisioned-tools) 写法所做的那样。`bun` 二者皆是，除非你指明运行时（`pnpm add bun@tool:1.3.0`），否则它被声明为项目的包管理器。

在全局环境下，`pnpm add -g yarn` 安装的是当前的 Yarn 系列，而不是仅支持 Classic 的 `yarn` 包；`pnpm add -g node@22` 安装的是那个 Node.js 版本，而不是一个下载版本的包装器。

用于定位某个包而非请求某个已发布版本的说明符（如 `pnpm add yarn@npm:yarn@1.22.22`、`pnpm add yarn@yarnpkg/berry`），会按普通依赖安装它所指向的包。

## 添加 Rust 工具链

自 v12.11.0 起提供

`rust` 指的是 [Rust 工具链](/docs/cargo#rust-toolchain)，而不是同名的 npm 包。版本号是 Rust 发布渠道：一个版本（`1.95.0` 或 `1.95`）、`stable`、`beta`、`nightly`，或诸如 `nightly-2026-01-01` 的带日期渠道。裸写 `rust` 表示请求 `stable`。

在项目中，`pnpm add rust@1.95` 会把工具链固定在管辖该项目的 `rust-toolchain.toml` 中，即工作区中位于项目之上最近的那个。若项目中不存在，就创建一个，并且只修改 `channel`，保留文件中的其余内容。启用 [`cargo.enabled`](/docs/cargo#cargoenabled) 时，工具链也会一并安装。`package.json` 中不会添加任何内容。

`pnpm add -g rust@stable` 会全局安装该工具链。在自身 `rust-toolchain.toml` 指定了工具链的项目之外，`cargo`、`rustc` 等 Rust 命令会运行它。`pnpm update -g rust` 会安装其渠道的最新发布版，`pnpm ls -g` 会列出它，`pnpm remove -g rust` 会移除它。

## 带协议前缀的选择器

选择器也可以把协议写在名称之前，而不是之后：

```sh
pnpm add jsr:@scope/pkg
pnpm add npm:pkg@^1.0.0
pnpm add workspace:pkg@*
```

## Package URL

自 v12.5.0 起提供

`pnpm add` 接受 npm、Cargo 和 Python 包的 [Package URL](https://github.com/package-url/purl-spec)：

```sh
pnpm add pkg:npm/express@4.18.2
pnpm add pkg:cargo/serde@1.0.188
pnpm add pkg:pypi/requests@2.31.0
```

它们分别把依赖保存到 `package.json`、`Cargo.toml` 和 `pyproject.toml`。Cargo 和 Python 使用各自生态系统的配置。`pkg` 是保留的说明符前缀（不区分大小写），不能用作具名 registry 的别名。

## 选项

### --save-prod, -P, -p

将指定的包作为普通 `dependencies` 安装。

### --save-dev, -D, -d

将指定的包作为 `devDependencies` 安装。

### --save-optional, -O, -o

将指定的包作为 `optionalDependencies` 安装。

### --save-exact, -E, -e

保存的依赖将配置为精确版本，而不是使用 pnpm 默认的 semver 范围运算符。

### --save-build

把 `crate:` 包安装为 Cargo 构建依赖。

### --save-peer

使用 `--save-peer` 会将一个或多个包加入 `peerDependencies` 并作为开发依赖安装。`--no-save-peer` 会覆盖 `savePeer: true` 设置。

### --save-types

自 v12.6.0 起提供

在保存 registry 依赖的同时，把可用的 `@types/*` 包保存到 `devDependencies`。已经声明了内置 TypeScript 类型的包会被跳过。

```sh
pnpm add express --save-types
# saves express to dependencies, @types/express to devDependencies
```

在 `pnpm-workspace.yaml` 中设置 [`saveTypes: true`](/docs/settings/other#savetypes) 可默认启用该行为。`--no-save-types` 会覆盖该设置。

### --save-prefix <prefix>

保存版本范围时使用的前缀：`^`、`~`、表示显式精确固定的 `=`，或表示裸精确版本的空字符串。覆盖 [`savePrefix`](/docs/settings/other#saveprefix) 设置。

### --tilde

自 v12.6.0 起提供

`--save-prefix=~` 的别名。保存的依赖会配置为波浪号范围（`~1.2.3`），而不是默认的插入号范围（`^1.2.3`）。

### --save-catalog

将新依赖保存到默认 [catalog](/docs/catalogs)。

### --save-catalog-name <catalog_name>

将新依赖保存到指定的 [catalog](/docs/catalogs)。

### --config

将依赖保存到 [configDependencies](/docs/config-dependencies)。

自 v12.12.0 起，保存的范围遵循与 `package.json` 中依赖相同的规则。

### --ignore-workspace-root-check

向工作区根包添加新依赖会失败，除非你传入 `--ignore-workspace-root-check`，或用 `-w`（`--workspace-root`）指向根包。

例如，`pnpm add debug -w`。

### --global, -g

全局安装一个包。详情见 [Global Packages](/docs/global-packages)。

每个以空格分隔的包都会安装到各自独立的隔离目录。若要把多个包捆绑进一次隔离安装（使它们共享依赖并一起被移除），请将它们以逗号分隔的列表传入，例如 `pnpm add -g eslint,prettier`。

### --workspace

仅当在工作区中找到该新依赖时才添加。该依赖会以 [`workspace:` 协议](/docs/workspaces#workspace-protocol-workspace)保存，并由提供它的工作区项目链接。当没有工作区项目提供该包时，命令会直接失败，而不会回退到 registry。

### --allow-build

允许在安装期间运行 postinstall 脚本的包名列表。

Example:

```sh
pnpm --allow-build=esbuild add my-bundler
```

这会运行 `esbuild` 的 postinstall 脚本，并将其加入 `pnpm-workspace.yaml` 的 `allowBuilds` 字段。因此 `esbuild` 今后将始终被允许运行其脚本。

自 v12.4.0 起，给名称加上 `!` 前缀则改为拒绝该构建：

```sh
pnpm add --allow-build=!core-js my-bundler
```

这会写入 `allowBuilds: { core-js: false }`，因此不会再询问该包。全局安装（`pnpm add -g`）会把两类决策都记录在全局 `config.yaml` 的 [`globalPackagesConfig.permissions`](/docs/configuring#settings-for-global-packages) 中。

自 v12.23.0 起，该选项除可重复使用外，也接受逗号分隔的列表：

```sh
pnpm add my-bundler --allow-build=esbuild,sharp
```

若要传入 git 或 tarball 的键，请为它单独使用一个 `--allow-build`。包含此类键的值不会在逗号处被拆分。

### --minimum-release-age <minutes>, --minimum-release-age-exclude <package-spec>

自 v12.23.0 起提供

为本次运行设置 [`minimumReleaseAge`](/docs/settings/dependency-resolution#minimumreleaseage) 和 [`minimumReleaseAgeExclude`](/docs/settings/dependency-resolution#minimumreleaseageexclude)，与 [`pnpm install`](/docs/cli/install) 中的做法相同。

### --lockfile-only

更新 `package.json` 和 `pnpm-lock.yaml`，但不下发依赖，也不写入 `node_modules`。

### --force

重新安装锁文件中列出的每个包，重新链接此前某次安装已链接的包。

### --lockfile-dir <dir>

创建 `pnpm-lock.yaml` 的目录。与 [`lockfileDir`](/docs/settings/store#lockfiledir) 设置相同。

### --prod, --production

把 `devDependencies` 留在 `node_modules` 之外。

### --dev

把 `dependencies` 留在 `node_modules` 之外。

### --[no-]optional

把 `optionalDependencies` 纳入或排除在 `node_modules` 之外。

### --[no-]auto-dedupe

为本次安装启用或禁用 [`autoDedupe`](/docs/settings/dependency-resolution#autodedupe) 设置。

### --ignore-scripts

不运行项目及其依赖的生命周期脚本。与 [`ignoreScripts`](/docs/settings/build#ignorescripts) 设置相同。

### --ignore-pnpmfile

禁用 [pnpmfile](/docs/pnpmfile) 钩子，包括配置依赖的 pnpmfile。

### --registry

指定本次安装使用的 registry：

```sh
pnpm add --registry=https://registry.npmjs.org/ lodash
```

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
