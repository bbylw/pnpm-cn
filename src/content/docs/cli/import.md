---
title: "pnpm import"
headingIds: []
---

`pnpm import` 从其他包管理器的锁文件生成 `pnpm-lock.yaml`。支持的源文件：

- `package-lock.json`
- `npm-shrinkwrap.json`
- `yarn.lock`

注意，如果你有想要导入依赖的工作区，需要事先在 [pnpm-workspace.yaml](/docs/settings) 文件中声明它们。
