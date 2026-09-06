---
title: "pnpm pack"
headingIds: ["options","--recursive--r","--out-path","--pack-destination-dir","--pack-gzip-level-level","--json","--filter-package_selector","--dry-run","--skip-manifest-obfuscation","life-cycle-scripts"]
---

从包创建 tarball。

## 选项

### --recursive, -r

自 v10.11.0 起提供

打包工作区中的所有包。

### --out <path>

自定义 tarball 的输出路径。使用 `%s` 和 `%v` 包含包名和版本，例如 `%s.tgz` 或 `some-dir/%s-%v.tgz`。默认情况下，tarball 以 `<package-name>-<version>.tgz` 的名称保存在当前工作目录中。

### --pack-destination <dir>

`pnpm pack` 保存 tarball 的目录。默认为当前工作目录。

### --pack-gzip-level <level>

指定自定义压缩级别。

### --json

以 JSON 格式输出日志。

### --filter <package_selector>

自 v10.11.0 起提供

[Read more about filtering.](/docs/filtering)

### --dry-run

自 v10.26.0 起提供

执行正常运行的所有操作，但不实际打包 tarball。适用于验证 tarball 的内容。

### --skip-manifest-obfuscation

自 v11.3.0 起提供

在打包的 manifest 中保留原有的 `packageManager` 字段和发布生命周期脚本，而不是将其剥离。pnpm 特有的 `pnpm` 字段仍会被省略。

## 生命周期脚本

- `prepack`
- `prepare`
- `postpack`

:::tip[提示]

你还可以使用 [beforePacking 钩子](/docs/pnpmfile#hooksbeforepackingpkg-pkg--promisepkg)，在创建 tarball 之前以编程方式修改 `package.json` 的内容。这适合用于移除仅开发用的字段，或在不修改本地 `package.json` 的情况下添加发布元数据。

:::
