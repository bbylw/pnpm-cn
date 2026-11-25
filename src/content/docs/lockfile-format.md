---
title: "锁文件格式"
headingIds: ["overview","top-level-keys","settings","catalogs","importers","boot-document-importers","package-keys","platform-variants-in-older-lockfiles","peer-suffixes","packages","resolution","snapshots","dependencies-of-a-snapshot","transitivepeerdependencies","fields-of-older-lockfiles","how-a-peer-dependency-ends-up-in-the-lockfile","invariants"]
---

本页规定 `pnpm-lock.yaml` 文档的内容：它的键、包键的语法，以及各条目之间如何相互引用。它面向解析锁文件的工具。[读取 `pnpm-lock.yaml`](/docs/lockfile)一文介绍如何把文件拆分成多个文档、工具需要哪些文档，以及 `integrity` 固定的是哪种哈希。

本页涵盖默认的 `v9` 格式，包括 boot 文档和项目文档。实验性的 `v13` 格式见 [`lockfile.format`](/docs/settings/store#lockfileformat)。示例使用虚构的包名。

## 概览

一个锁文件文档记录三层内容：

| 键 | 记录内容 | 以什么为键 |
| --- | --- | --- |
| [`importers`](#importers) | 每个项目的直接依赖 | 项目目录 |
| [`packages`](#packages) | 与安装位置无关的包版本事实 | 不带后缀的[包键](#package-keys) |
| [`snapshots`](#snapshots) | 某个包在特定 peer 上下文中解析出的依赖 | 完整的[包键](#package-keys) |

项目的依赖指向一个 snapshot，snapshot 的依赖又指向其他 snapshot。每个 snapshot 都有一个 `packages` 条目，多个 snapshot 可以共用它。

```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      plugin:
        specifier: ^2.0.0
        version: 2.1.0(host@5.0.0)
      host:
        specifier: ^5.0.0
        version: 5.0.0

packages:

  host@5.0.0:
    resolution: {integrity: sha512-...}

  plugin@2.1.0:
    resolution: {integrity: sha512-...}
    peerDependencies:
      host: '>=4'

  util@1.0.0:
    resolution: {integrity: sha512-...}

snapshots:

  host@5.0.0: {}

  plugin@2.1.0(host@5.0.0):
    dependencies:
      host: 5.0.0
      util: 1.0.0

  util@1.0.0: {}
```

## 顶层键

项目文档可以包含以下键。

| 键 | 值 |
| --- | --- |
| `lockfileVersion` | 格式版本，诸如 `'9.0'` 的字符串。当前该格式的锁文件使用 `'9.0'`，包含带具名 registry 键的锁文件。pnpm 也读取更旧的 `'12.0'` 锁文件。 |
| `settings` | 解析锁文件时所用的设置。参见 [settings](#settings)。 |
| `catalogs` | 已解析的[目录](./catalogs)条目。参见 [catalogs](#catalogs)。 |
| `overrides` | 生效的 [`overrides`](/docs/settings/dependency-resolution#overrides)，按声明顺序排列。 |
| `packageExtensionsChecksum` | 生效的 [`packageExtensions`](/docs/settings/dependency-resolution#packageextensions) 的哈希。 |
| `pnpmfileChecksum` | pnpmfile 定义钩子时的哈希。 |
| `untrackedPnpmfileReadPackageHook` | 未被计入 `pnpmfileChecksum` 的钩子源是否提供 `readPackage` 钩子。不存在这样的源时省略。 |
| `ignoredOptionalDependencies` | 生效的 [`ignoredOptionalDependencies`](/docs/settings/dependency-resolution#ignoredoptionaldependencies)。 |
| `patchedDependencies` | 每个[打过补丁的依赖](./cli/patch#patcheddependencies)选择器映射到其补丁文件的 SHA-256 十六进制摘要。 |
| `importers` | 参见 [importers](#importers)。 |
| `packages` | 参见 [packages](#packages)。 |
| `snapshots` | 参见 [snapshots](#snapshots)。 |
| `time` | 每个直接依赖的发布时间，格式为 `<名称>@<版本>: <ISO 8601 日期>`。当 [`resolutionMode`](/docs/settings/other#resolutionmode) 为 `time-based` 时写入。 |

pnpm 会把记录的 `settings`、`catalogs`、`overrides`、各校验和、`ignoredOptionalDependencies` 和 `patchedDependencies` 与当前配置比较。只要其中一项不同，锁文件就过期了，`pnpm install --frozen-lockfile` 会失败。

加载并保存已有的项目文档时，无法识别的顶层键会被保留。全新解析可以省略这些键。读取方可以按名称查找键，与顺序无关。

### settings

| 键 | 何时写入 |
| --- | --- |
| `autoInstallPeers` | 总是写入。值为 [`autoInstallPeers`](/docs/settings/peer-dependencies#autoinstallpeers)。 |
| `excludeLinksFromLockfile` | 总是写入。值为 [`excludeLinksFromLockfile`](/docs/settings/store#excludelinksfromlockfile)。 |
| `dedupePeers` | 当 [`dedupePeers`](/docs/settings/peer-dependencies#dedupepeers) 开启时写为 `true`。 |
| `addMissingPeerTypes` | 当 [`addMissingPeerTypes`](/docs/settings/peer-dependencies#addmissingpeertypes) 开启时写为 `true`。 |
| `projectScopedOptionalPeers` | 当 [`projectScopedOptionalPeers`](/docs/settings/peer-dependencies#projectscopedoptionalpeers) 生效时写为 `true`。 |
| `injectWorkspacePackages` | 当 [`injectWorkspacePackages`](/docs/workspaces#injectworkspacepackages) 开启时写为 `true`。 |
| `peersSuffixMaxLength` | 当 [`peersSuffixMaxLength`](/docs/settings/store#peerssuffixmaxlength) 不是默认值时写入。 |
| `integrityTarget` | 当 [`lockfile.integrityTarget`](/docs/settings/store#lockfileintegritytarget) 为 `tar` 时写为 `tar`。 |
| `autoDedupe`、`dedupeInjectedDeps`、`dedupePeerDependents`、`linkWorkspacePackages` | 当 [`lockfile.includeResolutionSettings`](/docs/settings/store#lockfileincluderesolutionsettings) 开启时写入。 |

### catalogs

```yaml
catalogs:
  default:
    example-even:
      specifier: ^1.0.0
      version: 1.0.0
```

键先是目录名（默认目录为 `default`），然后是依赖名。`specifier` 是目录中的范围，`version` 是它解析到的版本。

## importers

键是项目目录，相对于存放锁文件的目录，使用 `/` 作分隔符。工作区根目录为 `.`。

```yaml
importers:

  .:
    dependencies:
      my-example-utils:
        specifier: npm:example-utils@4.17.21
        version: example-utils@4.17.21
    devDependencies:
      example-odd:
        specifier: 3.0.1
        version: 3.0.1(patch_hash=580339f3...)
    optionalDependencies:
      example-file-watcher:
        specifier: 2.3.3
        version: 2.3.3

  packages/app:
    dependencies:
      lib:
        specifier: workspace:*
        version: link:../lib
```

| 键 | 值 |
| --- | --- |
| `dependencies`、`devDependencies`、`optionalDependencies` | 该类型的项目直接依赖。每个键是该依赖在项目 `node_modules` 中安装时使用的名称。 |
| `dependenciesMeta` | 项目声明的 `dependenciesMeta`。 |
| `publishDirectory` | 项目的 `publishConfig.directory`。 |
| `linkDirectory` | 当指向该项目的 workspace 链接忽略 `publishDirectory` 时为 `false`。 |

每个依赖有两个字段：

- `specifier`：来自项目 `package.json` 的值。
- `version`：它解析到的结果，形式见下表。

| `version` 形式 | 示例 | 含义 |
| --- | --- | --- |
| 版本号，可带后缀 | `2.1.0(host@5.0.0)` | snapshot 键为 `<依赖名>@<版本>`。 |
| `<名称>@<版本>` | `example-utils@4.17.21` | 别名依赖。snapshot 键就是该值本身。 |
| `link:<路径>` | `link:../lib` | 指向目录的符号链接，相对于项目目录。没有对应的 snapshot。 |
| `file:<路径>`，可带后缀 | `file:packages/lib(host@5.0.0)` | 注入的工作区项目、本地目录或本地 tarball。路径相对于锁文件所在目录。snapshot 键为 `<依赖名>@<版本>`。 |
| URL | `https://codeload.github.com/...` | 来自 URL 的包，例如 git 托管平台的归档。snapshot 键为 `<依赖名>@<版本>`。 |

当包名出现在版本之前时，该值是别名：它以 `@` 开头，或在任何 `(` 或 `:` 之前包含 `@`。

### Boot 文档的 importers

[boot 文档](/docs/lockfile)有一个 importer `.`，它带有自己的依赖组。

| 键 | 值 |
| --- | --- |
| `configDependencies` | 已解析的[配置依赖](/docs/config-dependencies)。该映射可以为空。 |
| `packageManagerDependencies` | 来自 `packageManager` 或 `devEngines.packageManager` 的已解析包管理器依赖。不存在时省略。 |

每个组把依赖名映射到 `{specifier, version}` 条目。`specifier` 记录请求的版本或范围，`version` 记录选中的版本。这些依赖使用 boot 文档自己的 `packages` 和 `snapshots` 映射。

## 包键

`snapshots` 的键是完整的包键：

```text
<名称>@<版本>[(patch_hash=<哈希>)][(<peer>)...]
```

| 部分 | 内容 |
| --- | --- |
| `<名称>` | 包清单中的包名。 |
| `<版本>` | 以下之一：语义化版本；来自[具名 registry](./settings/dependency-resolution#named-registries-in-the-lockfile)的包的 `<registry>:<版本>`；[运行时](./cli/runtime)的 `runtime:<版本>`；本地目录或 tarball 的 `file:<路径>`；或非 registry 包的 URL。 |
| `(patch_hash=<哈希>)` | 该包被打了补丁时存在。`<哈希>` 是记录在 `patchedDependencies` 中的十六进制摘要。 |
| `(<peer>)` | 该包或其依赖从包外解析到的每个 peer 依赖各占一组。参见 [peer 后缀](#peer-suffixes)。 |

`packages` 的键相同，但不含补丁哈希和 peer 后缀。要找到某个 snapshot 的 `packages` 条目，去掉末尾的括号组即可。更旧的锁文件还可能带有[平台变体段](#platform-variants-in-older-lockfiles)。

```text
snapshots:  example-linter@9.39.5(example-color@7.2.0)
packages:   example-linter@9.39.5

snapshots:  example-odd@3.0.1(patch_hash=580339f3...)
packages:   example-odd@3.0.1
```

### 更旧锁文件中的平台变体

更旧的锁文件可能包含 `example-image@1.0.0/variants/linux-x64(example-host@2.0.0)` 这样的键。`/variants/<标签>` 段出现在 registry 版本之后、任何括号后缀之前。元数据位于 `example-image@1.0.0` 之下。使用 `file:` 路径或 URL 的包可能把 `/variants/` 作为路径的一部分包含进来。

对于这类锁文件，pnpm 曾用目标平台从包的 `resolution.variants` 中选择变体。如果该变体有自己的 snapshot，pnpm 会用它自己的依赖映射代替基础 snapshot 的映射。要覆盖所有目标的依赖图读取器也需要访问这些变体 snapshot。

### Peer 后缀

一个 peer 组通常包含提供方的完整包键（含它自己的后缀），因此组可以嵌套。

```text
@example/lint-plugin@8.0.0(example-compiler@5.6.3)(example-linter@9.39.5(example-color@7.2.0))
```

使用 [`dedupePeers`](/docs/settings/peer-dependencies#dedupepeers) 时，或在打破 peer 环时，pnpm 可能只使用提供方的名称和版本。对于被链接的提供方，组中包含依赖名和编码后的链接路径。例如，以 `link:packages/host` 链接的 `example-host` 会写作 `(example-host@packages+host)`。

pnpm 会对组内容排序并用 `)(` 连接。该主体包含任何嵌套的括号，但不含最外层的一对。如果其 UTF-8 字节长度超过 [`peersSuffixMaxLength`](/docs/settings/store#peerssuffixmaxlength)，pnpm 会用其 SHA-256 摘要的前 32 位十六进制字符替换该主体。pnpm 会把得到的主体包在括号中。请通过依赖映射来跟踪已解析的边，包括 peer 组被缩短或哈希的情形。

没有 peer 依赖、且其依赖也没有从外部解析到任何 peer 的包，没有后缀。同一个包版本会针对它被解析时的每组不同 peer 各有一个 snapshot。

## packages

与安装位置无关、对该包版本每个 snapshot 都相同的事实。

```yaml
packages:

  example-logger@4.4.3:
    resolution: {integrity: sha512-...}
    engines: {node: '>=6.0'}
    peerDependencies:
      example-color: '*'
    peerDependenciesMeta:
      example-color:
        optional: true

  example-file-watcher@2.3.3:
    resolution: {integrity: sha512-...}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]
```

| 键 | 值 |
| --- | --- |
| `resolution` | 从哪里获取该包。参见 [resolution](#resolution)。 |
| `version` | 清单中的版本。当键的 `<版本>` 是 URL、`file:` 路径或 `runtime:` 版本时写入。目录则不写入。 |
| `engines`、`cpu`、`os`、`libc` | 复制自清单。若可选包的 `cpu`、`os` 或 `libc` 与当前系统不匹配，pnpm 会跳过它。 |
| `deprecated` | registry 给出的废弃说明。 |
| `hasBin` | 该包声明了可执行文件时为 `true`。 |
| `bundledDependencies` | 该包捆绑的依赖：名称列表，或 `true`。 |
| `peerDependencies` | 该包的 peer 依赖及其范围。 |
| `peerDependenciesMeta` | 哪些 peer 依赖是可选的。可选 peer 同时出现在 `peerDependencies` 和 `peerDependenciesMeta` 中。 |

### resolution

| 形式 | 字段 | 适用于 |
| --- | --- | --- |
| Registry | `integrity`，可选 `revision` | 来自 registry 的包。tarball 的 URL 由 registry 和包键推导得出。 |
| Tarball | `tarball`，可选 `integrity`、`gitHosted`、`path`、`revision` | 位于 URL 或本地路径的 tarball。`gitHosted: true` 表示 git 托管平台的归档。`path` 是 tarball 内的子目录。 |
| `type: directory` | `directory` | 本地目录，相对于锁文件所在目录。 |
| `type: git` | `repo`、`commit`，可选 `path` | 在 `commit` 处克隆的 git 仓库。 |
| `type: binary` | `url`、`integrity`、`bin`、`archive`，可选 `prefix` | 二进制归档，例如运行时。 |
| `type: variations` | `variants` | 运行时或更旧锁文件中 registry 包的平台相关解析结果。每个变体都有其 `resolution` 以及适用的 `targets`。 |

除上述之外的 `type` 值是自定义解析，由[解析器插件](./pnpmfile)定义。它的其他字段属于该解析器。

关于 `revision`，参见[带修订的解析结果](/docs/lockfile#resolutions-that-carry-a-revision)。关于 `integrity` 固定的内容，参见[`integrity` 固定的是哪种哈希](/docs/lockfile#which-hash-integrity-pins)。

## snapshots

snapshot 记录某个包在特定 peer 上下文中解析出的依赖。例如，`pnpm install --lockfile-only` 会写出 snapshot 而不安装包。当[隔离 linker](/docs/settings/node-modules#nodelinker)安装某个包时，会使用它的 snapshot 在[虚拟存储](/docs/settings/node-modules#virtualstoredir)中链接该包的依赖。

```yaml
snapshots:

  example-logger@4.4.3(example-color@7.2.0):
    dependencies:
      example-duration: 2.1.3
    optionalDependencies:
      example-color: 7.2.0

  example-file-watcher@2.3.3:
    optional: true

  example-utils@4.17.21: {}
```

| 键 | 值 |
| --- | --- |
| `dependencies` | 与它并排链接的包。参见下文。 |
| `optionalDependencies` | 同上，但对应可能安装失败的边。参见下文。 |
| `transitivePeerDependencies` | 参见 [transitivePeerDependencies](#transitivepeerdependencies)。 |
| `optional` | 当从项目到该 snapshot 的每条路径都经过可选依赖时为 `true`。此时若该包无法安装或构建，pnpm 会跳过它。 |

不含上述任何键的 snapshot 会写作 `{}`。

### Snapshot 的依赖

`dependencies` 和 `optionalDependencies` 把包链接时使用的名称映射到一个引用。它们同时列出该包自身的依赖和它已解析的 peer 依赖的提供方：

| 边 | 列出位置 |
| --- | --- |
| 清单 `dependencies` 中的条目 | `dependencies` |
| 清单 `optionalDependencies` 中的条目 | `optionalDependencies` |
| 已解析的必需 peer 依赖 | `dependencies` |
| 已解析的可选 peer 依赖 | `optionalDependencies` |

未被解析的 peer 依赖不会被列出。某个 snapshot 的 peer 列表位于它的 `packages` 条目中。

引用有以下形式之一：

| 形式 | 示例 | Snapshot 键 |
| --- | --- | --- |
| 版本号，可带后缀 | `example-duration: 2.1.3` | `<名称>@<版本>`，此处为 `example-duration@2.1.3` |
| `<名称>@<版本>` | `example-width-cjs: example-width@4.2.3` | 该值本身。该依赖是别名。 |
| `link:<路径>` | `c: link:packages/c` | 无。指向相对于锁文件目录的目录的符号链接。 |
| `link:<根目录>/<路径>` | `types: link:<root>/typings/css` | 无。指向该包内部目录的符号链接。 |

别名规则与 [importers](#importers) 相同。

### transitivePeerDependencies

这些是位于该包之下的包所声明、但未在该 snapshot 的子树内解析、且也不是该包自身 peer 依赖的 peer 依赖名称。每个名称属于以下两种之一：

- 从该包之外解析而来。此时提供方也会出现在该 snapshot 的 [peer 后缀](#peer-suffixes)中。
- 在任何地方都未被解析。

```yaml
  container@3.2.2(buffer-impl@3.7.1):
    dependencies:
      fs-impl: 4.8.4(buffer-impl@3.7.1)
    transitivePeerDependencies:
      - abort-impl
      - buffer-impl
```

这里 `fs-impl` 声明了可选 peer `buffer-impl` 和 `abort-impl`。`buffer-impl` 从 `container` 之外解析，因此出现在 `container` 的后缀中。`abort-impl` 没有被安装，因此被列出但不在后缀中。

### 更旧锁文件中的字段

由更早版本 pnpm 写出的锁文件，snapshot 中可能带有 `id` 和 `patched: true`。pnpm 会读取它们，但不会写出它们。

## peer 依赖是如何进入锁文件的

一个完整的示例。`container` 依赖 `fs-impl` 和 `url-impl`。`fs-impl` 把 `buffer-impl` 声明为可选 peer 依赖，而 `url-impl` 依赖 `buffer-impl`。本例使用工作区范围的可选 peer 选择，并设置 `dedupePeerDependents: true` 和 `projectScopedOptionalPeers: false`。

```yaml
snapshots:

  container@3.2.2(buffer-impl@3.7.1):
    dependencies:
      fs-impl: 4.8.4(buffer-impl@3.7.1)
      url-impl: 2.5.6
    transitivePeerDependencies:
      - buffer-impl

  fs-impl@4.8.4(buffer-impl@3.7.1):
    optionalDependencies:
      buffer-impl: 3.7.1

  url-impl@2.5.6:
    dependencies:
      buffer-impl: 3.7.1

  buffer-impl@3.7.1: {}
```

1. `buffer-impl` 不是 `container` 或其任何祖先的依赖。它是依赖图中别处安装的，作为 `url-impl` 的依赖。pnpm 把[可选 peer 依赖](/docs/settings/peer-dependencies#optional-peer-dependencies)解析到这样一个版本。
2. `fs-impl` 得到后缀 `(buffer-impl@3.7.1)`，并且 `buffer-impl` 被列在它的 `optionalDependencies` 下，因为该 peer 是可选的。
3. `container` 自身并不提供 `buffer-impl`，因此该后缀会向上传递到 `container`，`buffer-impl` 也被列在它的 `transitivePeerDependencies` 中。
4. `url-impl` 对 `buffer-impl` 有常规依赖，因此它没有后缀。

如果 `url-impl` 被更新到不再依赖 `buffer-impl` 的版本，而 pnpm 又找不到该可选 peer 的提供方，`fs-impl` 和 `container` 的键就会失去后缀。针对 `url-impl` 的更新可能仍把 `buffer-impl@3.7.1` 固定在锁文件中。若 pnpm 仍选择该固定版本，后缀就会保留。

## 不变式

pnpm 写出的锁文件满足以下性质：

- `importers` 中的每个 `version`，以及 `snapshots` 中每个不是 `link:` 的引用，都能解析到 `snapshots` 的某个键。
- 每个 snapshot 都有一个 `packages` 条目。去掉其括号后缀和任何[遗留的平台变体段](#platform-variants-in-older-lockfiles)即可找到元数据键。
- `importers`、`packages`、`snapshots` 及其依赖映射都按键排序。`overrides` 保持其声明顺序。
