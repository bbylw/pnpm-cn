---
title: "pnpm list"
headingIds: ["options","--recursive--r","--json","--long","--lockfile-only","--parseable","--global--g","--depth-number","--prod--p","--dev--d","--no-optional","--only-projects","--exclude-peers","--filter-package_selector","--find-by-finder_name"]
---

别名： `ls`

此命令将以树形结构输出所有已安装包的版本及其依赖。

位置参数是 `name-pattern@version-range` 标识符，用于将结果限定为指定名称的包。例如 `pnpm list "babel-*" "eslint-*" semver@5`。

## 选项

### --recursive, -r

对子目录中的每个包执行命令；在工作区内执行时，对工作区的每个包执行命令。

### --json

以 JSON 格式记录输出。

### --long

显示扩展信息。

### --lockfile-only

自 v10.23.0 起提供

从锁文件读取包信息，而不是检查实际的 `node_modules` 目录。适用于在不进行完整安装的情况下快速查看将要安装的内容。

### --parseable

以可解析的格式输出包目录，而不是树形视图。

### --global, -g

列出全局安装目录中的包，而不是当前项目中的包。

### --depth <number>

依赖树的最大显示深度。

`pnpm ls --depth 0`（默认）仅列出直接依赖。`pnpm ls --depth -1` 仅列出项目，在工作区内与 `-r` 选项配合使用时很有用。`pnpm ls --depth Infinity` 会列出所有依赖，不受深度限制。

### --prod, -P

仅显示 `dependencies` 和 `optionalDependencies` 中包的依赖图。

### --dev, -D

仅显示 `devDependencies` 中包的依赖图。

### --no-optional

不显示 `optionalDependencies` 中的包。

### --only-projects

仅显示同时也是工作区内项目的依赖。

### --exclude-peers

从结果中排除对等依赖（但对等依赖的依赖不会被忽略）。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --find-by <finder_name>

自 v10.16.0 起提供

使用在 `.pnpmfile.mjs` 中定义的[查找函数](/docs/finders)，按名称以外的属性匹配依赖。
