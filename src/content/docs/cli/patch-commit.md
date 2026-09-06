---
title: "pnpm patch-commit <path>"
headingIds: ["options","---patches-dir-patchesdir"]
---

从一个目录生成补丁并保存（灵感来自 Yarn 中的类似命令）。

此命令会将 `path` 中的变更与其本应打补丁的包进行比较，生成补丁文件，将补丁文件保存到 `patchesDir`（可通过 `--patches-dir` 选项自定义），并在 [patchedDependencies](/docs/cli/patch#patcheddependencies) 中添加一条记录。

Usage:

```bash
pnpm patch-commit <path>
```

- `path` 是补丁目标包的已修改副本的路径，通常是 [pnpm patch](/docs/cli/patch) 生成的临时目录。

## 选项

### ---patches-dir <patchesDir>

生成的补丁文件将保存到此目录。默认情况下，补丁保存到项目根目录下的 `patches` 目录。
