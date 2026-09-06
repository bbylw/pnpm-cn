---
title: "pnpm remove"
headingIds: ["options","--recursive--r","--global--g","--save-dev--d","--save-optional--o","--save-prod--p","--filter-package_selector"]
---

别名： `rm`, `uninstall`, `un`

从 `node_modules` 和项目的 `package.json` 中移除包。

## 选项

### --recursive, -r

在[工作区](/docs/workspaces)内使用时，从每个工作区包中移除某个依赖（或某些依赖）。

不在工作区内使用时，从所有子目录中发现的每个包中移除某个依赖（或某些依赖）。

### --global, -g

移除一个全局包。

### --save-dev, -D

仅从 `devDependencies` 中移除该依赖。

### --save-optional, -O

仅从 `optionalDependencies` 中移除该依赖。

### --save-prod, -P

仅从 `dependencies` 中移除该依赖。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
