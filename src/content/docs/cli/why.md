---
title: "pnpm why"
headingIds: ["options","--recursive--r","--json","--long","--parseable","--global--g","--prod--p","--dev--d","--depth-number","--only-projects","--exclude-peers","--filter-package_selector","--find-by-finder_name"]
---

显示所有依赖指定包的包。

输出是一棵反向依赖树：被查找的包位于根部，其依赖方作为分支，一路回溯到工作区根。

重复的子树会在输出中去重，并显示为「deduped」。

## 选项

### --recursive, -r

为子目录中的每个包显示指定包的依赖树；在工作区内执行时，为每个工作区包显示。

### --json

以 JSON 格式显示信息。

### --long

显示详细输出。

### --parseable

显示可解析的输出而非树视图。

### --global, -g

列出全局安装目录中的包，而非当前项目中的包。

### --prod, -P

仅显示 `dependencies` 中包的依赖树。

### --dev, -D

仅显示 `devDependencies` 中包的依赖树。

### --depth <number>

仅显示特定深度内的依赖。

### --only-projects

仅显示同时也是工作区内项目的依赖。

### --exclude-peers

从结果中排除对等依赖（但对等依赖的依赖不会被忽略）。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --find-by <finder_name>

自 v10.16.0 起提供

使用在 `.pnpmfile.mjs` 中定义的 [finder 函数](/docs/finders)，按名称之外的属性匹配依赖。
