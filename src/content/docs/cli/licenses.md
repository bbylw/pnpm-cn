---
title: "pnpm licenses"
headingIds: ["commands", "list", "options", "--recursive--r", "--dev--d", "--json", "--long", "--no-optional", "--optional--o", "--prod--p---production", "--filter-package_selector"]
---

别名： `licences`

检查项目依赖的许可证。

```sh
pnpm licenses list
```

不带子命令运行 `pnpm licenses` 会失败，错误码为 `ERR_PNPM_LICENCES_NO_SUBCOMMAND`。

## 命令

### list

别名： `ls`

列出项目依赖的许可证。

该命令需要 `pnpm-lock.yaml` 文件。尚未记录在锁文件中的工作区项目没有可列出的许可证。当没有许可证匹配时，文本输出会显示 `No licenses in packages found`，而 `--json` 输出 `{}`。

当 `node_modules` 不存在时，pnpm 会从配置的存储目录读取包元数据和许可证文件。运行 `pnpm fetch` 可以根据锁文件填充存储目录。既不在安装中也不在存储目录中的包，会以 `Unknown` 许可证报告。

自 v12.7.0 起，在工作区项目中运行 `pnpm licenses list` 只列出该项目的依赖。使用 [`--recursive`](#--recursive--r) 或 [`--filter`](#--filter-package_selector) 可以把其它工作区项目也包含进来。

从[命名 registry](/docs/settings/dependency-resolution#namedregistries) 解析的包，会与来自其它 registry 的同名同版本包分开报告。表格输出中 registry 别名显示在包名旁边，使用 `--json` 时则作为 `registryName` 字段暴露。

## 选项

### --recursive, -r

列出每个工作区项目的依赖的许可证。

### --dev, -D

仅检查 "devDependencies"。

### --json

以 JSON 格式显示信息。

### --long

显示每个包的作者、描述和主页。

### --no-optional

不检查 `optionalDependencies` 中的包。

### --optional, -O

只检查 `optionalDependencies`。

### --prod, -P, --production

只检查 `dependencies` 和 `optionalDependencies`。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
