---
title: "pnpm patch-remove <pkg...>"
headingIds: []
---

移除已有的补丁文件以及 `patchedDependencies` 中的相关设置。

```bash
pnpm patch-remove foo@1.0.0 bar@1.0.1
```

该命令会删除补丁文件，并从 [`patchedDependencies`](/docs/cli/patch#patcheddependencies) 中移除它们的键。如果之后补丁目录为空，它也会被一并删除。

不带参数时，pnpm 会列出已记录的补丁并询问要移除哪些。如果没有记录任何补丁，该命令会以 `ERR_PNPM_NO_PATCHES_TO_REMOVE` 失败。一个不在 `patchedDependencies` 中的键会以 `ERR_PNPM_PATCH_NOT_FOUND` 失败。
