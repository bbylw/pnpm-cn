---
title: "pnpm store"
headingIds: ["commands","status","add","prune","path"]
---

管理包存储

## 命令

### status

检查当前项目锁文件中列出的包在项目或全局虚拟存储中是否被改动。

如果包的内容与解包时相同，返回退出码 0。否则它会以 `ERR_PNPM_MODIFIED_DEPENDENCY` 失败，并列出被改动的包。

如果某个已安装的全局存储包无法定位，或其项目链接指向了不同的槽位，该命令会以 `ERR_PNPM_STORE_STATUS_UNVERIFIABLE` 失败。请先运行 `pnpm install` 再检查。

### add

在功能上等同于 [pnpm add](/docs/cli/add)，不同之处在于它直接把新包添加到存储，而不修改存储之外的任何项目或文件。

```sh
pnpm store add express@4
```

它也可以接收通过其它方式下载的包 tarball 或 tarball 目录，会递归地在目录中查找 `.tgz`、`.tar.gz` 与 `.tar` 归档。这可以为无网络的安装（例如提前下载好源码的沙箱构建）准备好存储：

```sh
pnpm store add ./tarballs
pnpm install --offline --frozen-lockfile
```

当锁文件条目锁定了某个 tarball 时，安装会从这样的 tarball 中取包。该条目的 `integrity` 可以是 tarball 的 sha512 或 sha1，也可以是其中未压缩 tar 的哈希，[`lockfile.integrityTarget: tar`](/docs/settings/store#lockfileintegritytarget) 记录的正是后者。

请在 `pnpm store add` 所准备存储的那个项目中运行它。它随后会读取该项目的锁文件，并为每个锁定了 tarball 的条目准备好 tarball。这涵盖了对 tarball URL 的依赖、来自[具名 registry](/docs/package-sources#named-registries)的包，以及对 GitHub 这类 git 主机且其条目记录了 `integrity` 的依赖。在项目之外，tarball 只能服务于其 `package.json` 中指明了包名与版本的 registry 条目。

### prune

从存储中移除*未引用的包*

未引用的包是系统中任何项目都不使用的包。包在大多数安装操作之后可能变为未引用，例如当依赖变得多余时。

例如，在 `pnpm install` 期间，包 `foo@1.0.0` 被更新到 `foo@1.0.1`。pnpm 会把 `foo@1.0.0` 留在存储中，因为它不会自动移除包。如果系统上没有其他项目使用 `foo@1.0.0`，它就变为未引用。运行 `pnpm store prune` 会从存储中移除 `foo@1.0.0`。

运行 `pnpm store prune` 无害，也不会对你的项目产生副作用。如果将来的安装需要被移除的包，pnpm 会再次下载它们。

最佳实践是偶尔运行 `pnpm store prune` 来清理存储，但不要过于频繁。有时未引用的包会重新变为必需，这可能发生在切换分支并安装较旧依赖时，此时 pnpm 需要重新下载所有被移除的包，会短暂放慢安装过程。

在清理存储之前，pnpm 会先删除 `pnx` 缓存中过期的条目（参见 [`dlxCacheMaxAge`](/docs/settings/node-modules#dlxcachemaxage)），因为它们持有指向存储的硬链接。

`pnpm store prune` 还会移除包的元数据缓存：缓存目录中的 `metadata*` 目录及其带版本的子目录（例如 `v12/metadata`）。缓存目录中的其它缓存会保留。下一次安装会重新下载这些元数据。

清理后，pnpm 会显示被移除文件的总大小

如果 pnpm 无法解码某个包索引条目，它会保留该条目，并在摘要中报告无法解码的条目数量。清理会继续处理其它条目。保留索引条目并不会保留它那些未被引用的文件。若之后无法复用已存储的文件，安装会再次下载该包。

`pnpm store prune` 会保留每个已登记 Python 项目的 `pylock.toml` 所固定的 wheel 与源码分发包，以便之后的 `pnpm install --offline` 能重建其环境。除非启用了 `frozenStore`，一次安装会尝试登记每个拥有环境的 Python 项目，即使该项目的存储就在其内部。登记失败不会导致安装失败。由更早的 pnpm 版本安装的项目，在被再次安装之前不会被登记。若某个已登记项目的 `pylock.toml` 无法解析，清理会停止。

启用 [`frozenStore`](/docs/settings/store#frozenstore) 时，`pnpm store prune` 会以 `ERR_PNPM_FROZEN_STORE_WRITE` 失败。

自 v12.7.0 起，`pnpm store prune` 还会移除被强杀的 pnpm 进程遗留的 pnpm 或运行时的私有副本。当项目锁定的版本恰好正被另一个 pnpm 进程安装时，pnpm 会创建这样一份副本。

`pnpm install` 会把项目登记到存储的 `projects` 目录中，即 `"$(pnpm store path)/projects"`，无论是否使用全局虚拟存储。每个条目都是指向项目目录的符号链接，因此 `ls -l "$(pnpm store path)/projects"` 会列出使用该存储的项目。

不使用全局虚拟存储时，带 `--frozen-store` 或 `enableModulesDir: false` 的安装不会写入这个登记。`--lockfile-only` 与 `--dry-run` 安装同样不会。

`pnpm store prune` 会移除 macOS 上本地安装所使用的目录克隆缓存。已安装的包依然可用，之后的安装会按需重建该缓存。该缓存要求存储与项目位于同一个卷上。冻结的存储在缓存缺失时会改用逐文件导入。

启用[全局虚拟存储](/docs/settings/node-modules#enableglobalvirtualstore)后，`pnpm store prune` 还会对全局虚拟存储的 `links/` 目录执行标记-清除垃圾回收。它会遍历已登记的项目，找出仍在使用的包并移除其余的。若没有已登记的项目链接到 `links/`，清理会保持它不变。

若某个依赖链接无法读取，清理会停止。

### path

返回当前生效的存储目录的路径
