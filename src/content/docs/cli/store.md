---
title: "pnpm store"
headingIds: ["commands","status","add","prune","path"]
---

管理包存储

## 命令

### status

检查存储中被改动的包

如果包的内容与解包时相同，返回退出码 0

### add

在功能上等同于 [pnpm add](/docs/cli/add)，不同之处在于它直接把新包添加到存储，而不修改存储之外的任何项目或文件。

### prune

从存储中移除*未引用的包*

未引用的包是系统中任何项目都不使用的包。包在大多数安装操作之后可能变为未引用，例如当依赖变得多余时。

例如，在 `pnpm install` 期间，包 `foo@1.0.0` 被更新到 `foo@1.0.1`。pnpm 会把 `foo@1.0.0` 留在存储中，因为它不会自动移除包。如果系统上没有其他项目使用 `foo@1.0.0`，它就变为未引用。运行 `pnpm store prune` 会从存储中移除 `foo@1.0.0`。

运行 `pnpm store prune` 无害，也不会对你的项目产生副作用。如果将来的安装需要被移除的包，pnpm 会再次下载它们。

最佳实践是偶尔运行 `pnpm store prune` 来清理存储，但不要过于频繁。有时未引用的包会重新变为必需，这可能发生在切换分支并安装较旧依赖时，此时 pnpm 需要重新下载所有被移除的包，会短暂放慢安装过程。

清理后，pnpm 会显示被移除文件的总大小

启用[全局虚拟存储](/docs/settings/node-modules#enableglobalvirtualstore)后，`pnpm store prune` 还会对全局虚拟存储的 `links/` 目录执行标记-清除垃圾回收。使用存储的项目通过 `{storeDir}/v11/projects/` 中的符号链接注册，使 pnpm 能够跟踪活跃使用情况，并安全地从全局虚拟存储中移除未使用的包。

### path

返回当前生效的存储目录的路径
