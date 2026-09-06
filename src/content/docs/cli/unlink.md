---
title: "pnpm unlink"
headingIds: ["options","--recursive--r","--filter-package_selector"]
---

取消链接一个系统级包（[pnpm link](/docs/cli/link) 的反向操作）

不带参数调用时，会在当前项目内取消链接所有已链接的依赖

这类似于 `yarn unlink`，不同之处在于 pnpm 会在移除外部链接后重新安装该依赖

:::info[info]

如果你想移除用 `pnpm link --global <package>` 创建的链接，应使用 `pnpm uninstall --global <package>`。`pnpm unlink` 只移除你当前目录中的链接。

:::

## 选项

### --recursive, -r

在子目录中找到的每个包里取消链接，或在 [工作区](/docs/workspaces) 内执行时在每个工作区包里取消链接。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
