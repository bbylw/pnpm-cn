---
title: "pnpm outdated"
headingIds: ["options","--recursive--r","--filter-package_selector","--global--g","--long","--format-format","--compatible","--dev--d","--prod--p","--no-optional","--sort-by","--include-github-actions"]
---

检查过期的包。可以通过提供参数（支持模式）将检查范围限定为已安装包的一个子集。

Examples:

```bash
pnpm outdated
pnpm outdated "*gulp-*" @babel/core
```

## 选项

### --recursive, -r

检查子目录中找到的每个包里的过期依赖；在工作区内执行时，检查每个工作区包里的过期依赖。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --global, -g

列出过期的全局包。

### --long

打印详细信息。

### --format <format>

- 默认值：**table**
- 类型：**table**、**list**、**json**

以给定格式打印过期的依赖。

### --compatible

仅打印满足 `package.json` 中声明的版本。

### --dev, -D

仅检查 `devDependencies`。

### --prod, -P

仅检查 `dependencies` 和 `optionalDependencies`。

### --no-optional

不检查 `optionalDependencies`。

### --sort-by

指定输出结果的排序顺序。目前仅接受值 `name`。

### --include-github-actions

自 v11.16.0 起提供

同时检查仓库工作流文件引用的 GitHub Actions 是否有更新。可在 `pnpm-workspace.yaml` 中将 [update.githubActions](/docs/settings/dependency-resolution#updategithubactions) 设为 `true`，以默认启用此选项。参见[更新 GitHub Actions](/docs/cli/update#updating-github-actions)。
