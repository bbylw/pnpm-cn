---
title: "pnpm import"
headingIds: ["options","--pnpr-server-url"]
---

`pnpm import` 从其他包管理器的锁文件生成 `pnpm-lock.yaml`。支持的源文件，按 pnpm 查找的顺序排列：

* `yarn.lock`
* `package-lock.json`
* `npm-shrinkwrap.json`

```sh
pnpm import
```

导入并不是一比一的转换。在全新解析时会优先使用源锁文件中的版本，因此在源锁文件无法满足清单的情况下，结果可能会有所不同。在工作区中，各个项目的 `yarn.lock` 也会被读取。使用 Yarn `patch:` 协议的依赖会变成 [`patchedDependencies`](/docs/cli/patch#patcheddependencies) 条目。

在 `sharedWorkspaceLockfile: false` 时，每个项目都会得到自己的锁文件，除非 `lockfileDir` 指定了共享的存放位置。导入会遵循工作区循环相关的设置。

已有的 `pnpm-lock.yaml` 会被替换。如果导入失败，原来的文件会被恢复。

没有受支持的锁文件时，该命令会以 `ERR_PNPM_LOCKFILE_NOT_FOUND` 失败。无法解析的 `yarn.lock`（包括含有合并冲突标记的文件）会以 `ERR_PNPM_YARN_LOCKFILE_PARSE_FAILED` 失败。

Yarn 的补丁文件必须位于工作区内部。如果文件在工作区之外，pnpm 会发出警告，并在导入该依赖时不带上补丁。

运行 `pnpm import` 之前，请先在 [pnpm-workspace.yaml](/docs/workspaces) 中声明工作区。

## 选项

### --pnpr-server <url>

之所以接受该选项，是为了让 `pnpm import` 与其它安装类命令接受相同的选项。由于 `pnpm import` 始终在本地解析，该值不起作用。
