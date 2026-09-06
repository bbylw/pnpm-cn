---
title: "读取 pnpm-lock.yaml"
headingIds: ["which-document-you-need","the-projects-dependency-graph","everything-the-lockfile-installs","resolutions-that-carry-a-revision","why-the-env-document-comes-first","when-a-lockfile-has-two-documents","scanning-for-vulnerabilities"]
---

`pnpm-lock.yaml` 是一个 YAML 文件，但它并不总是**单个** YAML 文档。根据项目所用内容，pnpm 会写入一个或两个文档：

| **Document** | **Contents** |
| --- | --- |
| **env 锁文件**（第一个，存在时） | [配置依赖](/docs/config-dependencies)以及为项目解析出的 pnpm 版本，记录在 `configDependencies` 与 `packageManagerDependencies` 下，连同它们所需的 `packages` 和 `snapshots` 条目 |
| **项目锁文件**（最后一个，始终存在） | 项目自身的依赖图：`importers` 及其 `dependencies`，以及与之匹配的 `packages` 和 `snapshots` |

两个文档都声明相同的 `lockfileVersion`。该字段描述的是文档内条目的结构，而非文件包含多少个文档，因此当 env 文档出现时它不会改变。

本页面向读取 `pnpm-lock.yaml` 的工具，包括漏洞扫描器、SBOM 生成器、依赖图构建器和依赖更新机器人。如果你只是使用 pnpm，就不必关心这些内容。

两文档的锁文件如下所示：

pnpm-lock.yaml

```yaml
---
lockfileVersion: '9.0'

importers:

  .:
    configDependencies: {}
    packageManagerDependencies:
      pnpm:
        specifier: 12.3.4
        version: 12.3.4

packages:
  # pnpm and its platform binaries
snapshots:
  # ...
---
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

importers:

  .:
    dependencies:
      react:
        specifier: ^19.0.0
        version: 19.0.0

packages:
  # every package in the project's dependency graph
snapshots:
  # ...
```

## 你需要哪个文档

这取决于你的工具是做什么的：

- **项目的依赖图**：依赖更新机器人、图构建器，以及任何询问「这个项目依赖什么」的工具，都用**最后一个**文档。
- **锁文件安装的一切**：漏洞扫描器和 SBOM 生成器，要用**每个**文档。配置依赖是真实的 npm 包，安装到 `node_modules/.pnpm-config`，它们只出现在 env 文档中。

无论哪种情况，都用多文档 API 加载文件。单文档 API（js-yaml 的 `load()`、Python 的 `yaml.safe_load`、Go 中 `yaml.Unmarshal` 到单个值）要么抛出错误，要么悄悄给你第一个文档，而在两文档锁文件中，第一个文档是 env 文档。

### 项目的依赖图

取最后一个文档：

```js
import { readFile } from 'node:fs/promises'
import { loadAll } from 'js-yaml'

const lockfile = loadAll(await readFile('pnpm-lock.yaml', 'utf8')).at(-1)
```

这对两种形态都正确，对 pnpm 写过的每个 `pnpm-lock.yaml` 也都正确。

如果你宁愿检测布局而不是总取最后一个文档，那么首行为 `---` 的文件就带有 env 文档。pnpm 只有在写入两个文档时才写这个前导标记。

### 锁文件安装的一切

读取每个文档，并合并你在每个文档中发现的内容：

```js
const documents = loadAll(await readFile('pnpm-lock.yaml', 'utf8'))
const installed = documents.flatMap((doc) => Object.keys(doc.packages ?? {}))
```

把每个文档当作各自独立的清单来处理，而不是先合并成单个对象。两者都使用 `.` 导入器键，各自带有自己的 `packages` 和 `snapshots` 映射，所以合并它们会覆盖一方的导入器并丢失其所持有的那个图。

## 带有修订号的解析结果

自 v12.0.0 起，`packages:` 条目可能在 integrity 旁边带有一个 `revision` 字段：

```yaml
packages:
  lodash@4.17.21:
    resolution:
      integrity: sha512-<replacement-digest>
      revision: 1
```

它表示这些字节是 registry 的**替换产物**，从 registry 按 integrity 寻址的路由拉取，而不是从规范的 `name@version` URL。没有 `revision` 字段的条目就是修订号 0，即原始版本，这也是 pnpm 写过的每个条目的含义，因此尚未采用任何替换的锁文件不会有变化。参见 [registry 修订](/docs/registry-revisions)。

读取 integrity 值的工具应当把 `revision` 当作普通元数据处理：`integrity` 仍然是一个标准的 Subresource Integrity 值，用于固定精确的字节。

## 为什么 env 文档排在前面

pnpm 必须先知道该切换到哪个 pnpm 版本、该加载哪些插件，才能做其他任何事，包括在任何理由去解析一个可能有数兆字节的依赖图之前。把这些信息放在一个较小的前置文档中，意味着每个命令只需读取几千字节，而不是整个文件。

## 锁文件何时会有两个文档

当满足以下任一条件时，会写入 env 文档：

- 项目带有[配置依赖](/docs/config-dependencies)。它们的 integrity 校验和属于项目内容，总是会被记录。
- pnpm 在它解析出项目对应的 pnpm 版本时，将其记录在 `packageManagerDependencies` 下。这发生在项目声明了 [devEngines.packageManager](/docs/package_json#devenginespackagemanager)，或通过旧的 `packageManager` 字段锁定 pnpm 12 或更新版本时。将 [pmOnFail](/docs/settings/cli#pmonfail) 设为 `ignore` 会关闭这一点，此时 pnpm 不强制使用锁定的版本，也就没有内容可记录。

两文档锁文件自引入配置依赖起就已存在。它们在 pnpm 12 中变得常见，因为 pnpm 12 默认记录解析出的包管理器版本。

自 v11.23.0 起，冻结安装不再重写这一区块。当锁定的 pnpm 版本在锁文件中缺失或不再匹配时，`pnpm install --frozen-lockfile` 会以 `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE` 失败，因此某个清单在锁定值被提升却未重新生成锁文件的情况下，不再能通过 CI。运行不带 `--frozen-lockfile` 的 `pnpm install` 并提交结果。

## 扫描漏洞

:::caution[注意]

只读两文档锁文件第一个文档的工具不会明显地失败。env 文档是一个结构上有效的锁文件，只是它描述的是一个没有 `dependencies` 的导入器。这样的工具会报告项目没有依赖，因而没有漏洞，而建立其上的 CI 门禁会放行。

:::

如果你扫描 pnpm 项目：

- **读取每个文档**，如上所述。只读项目文档的工具会漏掉配置依赖；只读 env 文档的工具会漏掉其他一切。
- **在信任扫描器的输出之前，先用一个两文档锁文件验证它**。这里「它报告了些什么」并不是充分的检查：env 文档确实包含包，所以一个有缺陷的读取器会给出一个看似合理的结果，列出 pnpm 自身的二进制文件。
- [pnpm audit](/docs/cli/audit) 在两种形态下都能正确读取锁文件，无需任何配置。
