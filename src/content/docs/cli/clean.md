---
title: "pnpm clean"
headingIds: ["options","--lockfile--l","--lockfile-dir-dir","--filter-package_selector"]
---

别名： `purge`

安全地从所有工作区项目移除 `node_modules` 内容。移除目录时不会跟随 Windows 上的 NTFS junction 进入其目标。

在工作区中，`pnpm clean` 默认会清理根目录和每个工作区包中的 `node_modules`，即使工作区根目录没有 `package.json` 也一样。传入 [`--filter`](/docs/filtering)、`--filter-prod`、`--workspace-root` 或 `--no-recursive` 则只清理被选中的项目，并且在工作区使用共享 lockfile 时会保留共享的虚拟存储目录（`node_modules/.pnpm`）。`pnpm clean` 会保留 `node_modules` 内非 pnpm 的隐藏条目（例如 `.cache`），并会在设置了自定义的 [`modulesDir`](/docs/settings/node-modules#modulesdir) 时清理它。

`package.json` 中的 `clean` 或 `purge` 脚本会覆盖内置命令，并接收位置参数，例如 `pnpm clean dist` 中的 `dist`。而 `pnpm pm clean` 和 `pnpm pm purge` 无论怎样都会运行内置命令。

如果自定义的 [`virtualStoreDir`](/docs/settings/node-modules#virtualstoredir) 或 `globalVirtualStoreDir` 位于项目根目录内，未加过滤的 `pnpm clean` 也会把它一并移除。

使用 `nodeLinker: pnp` 时，完整清理还会删除生成的 `.pnp.cjs` loader；带过滤的清理则会保留工作区项目共享的 loader。

## 选项

### --lockfile, -l

同时移除被清理项目的 `pnpm-lock.yaml` 文件；当 `pnpm clean` 清理的是工作区根目录时，如果 [`lockfileDir`](/docs/settings/store#lockfiledir) 位于工作区根目录内，也会移除该目录里的 lockfile。

### --lockfile-dir <dir>

存放 `pnpm-lock.yaml` 的目录。当该目录位于工作区或项目根目录内时，`--lockfile` 会同时移除其中的 lockfile。

### --filter <package_selector>

更多过滤说明见[过滤](/docs/filtering)。
