---
title: "pnpm unlink"
headingIds: ["options","--recursive--r","--ignore-pnpmfile","--filter-package_selector"]
---

别名： `dislink`

移除由 [`pnpm link <dir>`](/docs/cli/link) 创建的链接，并按声明重新安装相应的包。

```bash
pnpm unlink [<pkg>...]
```

`pnpm link` 会把每个链接记录为 `pnpm-workspace.yaml` 中 [overrides](/docs/settings/dependency-resolution#overrides) 里的一条 `link:` 条目。`pnpm unlink` 会移除这些 override（全部移除，或只移除指定的那几个），然后重新安装。如果没有配置任何 override，它会打印 `Nothing to unlink` 并停止。

这类似于 `yarn unlink`，不同之处在于 pnpm 会在移除外部链接后重新安装该依赖。

自 v12.7.0 起，如果 `pnpm link <dir>` 曾向 `package.json` 添加了 `link:` 依赖，`pnpm unlink` 也会移除该条目，以及 `node_modules` 中的包和它在 lockfile 中的记录。指向其他目录的 `link:` 依赖会被保留。

自 v12.23.0 起，`pnpm unlink` 还会移除指向目录的 `file:` override（由 [`pnpm link --hard`](/docs/cli/link#--hard) 写入），但会保留指向 tarball 的 `file:` override。

## 选项

### --recursive, -r

在子目录中找到的每个包里取消链接，或在 [工作区](/docs/workspaces) 内执行时在每个工作区包里取消链接。

### --ignore-pnpmfile

不加载 `.pnpmfile.cjs` 中的钩子，包括配置依赖的 pnpmfile。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
