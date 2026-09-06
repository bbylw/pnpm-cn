---
title: "pnpm clean"
headingIds: ["options","--lockfile--l"]
---

别名： `purge`

安全地从所有工作区项目移除 `node_modules` 内容。使用 Node.js 移除目录，可正确处理 Windows 上的 NTFS junction，而不会跟随其进入目标。

在工作区中，会清理根目录和每个工作区包中的 `node_modules` 目录。`node_modules` 内非 pnpm 的隐藏条目（例如 `.cache`）会被保留。

如果配置了自定义的 [virtualStoreDir](/docs/settings/node-modules#virtualstoredir)，且它位于项目根目录内（但在 `node_modules` 之外），它也会被移除。

## 选项

### --lockfile, -l

同时移除 `pnpm-lock.yaml` 文件。
