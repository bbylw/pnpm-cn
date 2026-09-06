---
title: "pnpm vs npm"
headingIds: ["npms-flat-tree","installation","directory-dependencies"]
---

## npm 的扁平依赖树

自 3 版本起，npm 维护一棵[扁平化的依赖树](https://github.com/npm/npm/issues/6912)。这减少了磁盘空间的浪费，副作用是 `node_modules` 目录变得混乱。

另一方面，pnpm 通过硬链接和符号链接将 `node_modules` 关联到全局磁盘上的内容寻址存储来管理它。这样既能大幅减少磁盘占用，又保持了 `node_modules` 的整洁。想深入了解可以查看[存储布局](/docs/symlinked-node-modules-structure)文档。

pnpm 规范的 `node_modules` 结构的好处在于，它让使用项目 `package.json` 中未指定的模块成为不可能，从而"[有助于避免低级错误](https://www.kochan.io/nodejs/pnpms-strictness-helps-to-avoid-silly-bugs.html)"。

## 安装

pnpm 不允许安装依赖包时不将其保存到 `package.json`。如果 `pnpm add` 未传入任何参数，包将作为普通依赖保存。与 npm 一样，可以使用 `--save-dev` 和 `--save-optional` 将包安装为开发依赖或可选依赖。

这一限制带来的结果是，使用 pnpm 的项目不会有多余的包，除非删除了某个依赖而留下了孤立的包。这就是为什么 pnpm 的 [prune 命令](/docs/cli/prune)不允许指定要清理的包：它始终会移除所有多余的、孤立的包。

## 目录依赖

目录依赖以 `file:` 前缀开头，指向文件系统中的某个目录。与 npm 一样，pnpm 会为这些依赖创建符号链接。与 npm 不同的是，pnpm 不会对 file 依赖执行安装。

这意味着，如果你有一个名为 `foo`（`<root>/foo`）的包，其依赖为 `bar@file:../bar`，那么对 `foo` 运行 `pnpm install` 时，pnpm 不会为 `<root>/bar` 执行安装。

如果你需要同时在多个包中运行安装，例如在 monorepo 的场景下，可以查看 [pnpm -r](/docs/cli/recursive) 的文档。
