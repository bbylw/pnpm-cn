---
title: "pnpm prefix"
headingIds: ["options","--global--g"]
---

打印当前的包前缀目录：从当前目录开始向上查找，包含 `node_modules`、`package.json`、`package.json5`、`package.yaml`、`pnpm-workspace.yaml`、`Cargo.toml` 或 `pyproject.toml` 的最近的那个目录。如果找不到这样的目录，则打印当前目录。

```bash
pnpm prefix
```

## 选项

### --global, -g

改为打印全局前缀目录，也就是 [`pnpm root -g`](/docs/cli/root) 所打印的全局包目录的父目录。如果全局 bin 目录不存在，pnpm 会创建它。如果没有配置全局 bin 目录，该命令会以 `ERR_PNPM_NO_GLOBAL_BIN_DIR` 失败；如果全局 bin 目录不在 `PATH` 中，则会以 `ERR_PNPM_GLOBAL_BIN_DIR_NOT_IN_PATH` 失败。运行 [`pnpm setup`](/docs/cli/setup) 可以配置一个。
