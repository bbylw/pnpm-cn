---
title: "pnpm licenses"
headingIds: ["commands","list","options","--dev--d","--json","--long","--no-optional","--prod--p","--filter-package_selector"]
---

## 命令

### list

别名： `ls`

列出已安装包的许可证。

自 v11.20.0 起，从[命名 registry](/docs/settings/dependency-resolution#namedregistries) 解析的包，与来自其他 registry 的同名同版本包会分开报告。在表格输出中，registry 别名显示在包名旁边，并在使用 `--json` 时以 `registryName` 字段暴露。

## 选项

### --dev, -D

仅检查 "devDependencies"。

### --json

以 JSON 格式显示信息。

### --long

默认不显示更多详情（例如仓库链接）。要显示这些详情，传入此选项。

### --no-optional

不检查 `optionalDependencies` 中的包。

### --prod, -P

仅检查 `dependencies` 和 `optionalDependencies`。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
