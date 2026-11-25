---
title: "pnpm outdated"
headingIds: ["options","--recursive--r","--filter-package_selector","--global--g","--long","--format-format","--json","--no-table","--compatible","--dev--d","--prod--p---production","--no-optional","--optional","--sort-by","--notes","--include-github-actions"]
---

检查过期的包、运行时（声明在 `devEngines.runtime`、`engines.runtime` 中，或通过 `runtime:` / `tool:` 协议声明的 `node`、`deno`、`bun`）、包管理器（声明在 `devEngines.packageManager` 或 `packageManager` 中的 `pnpm`、`npm`、`yarn`、`bun`）、Cargo crate（当 [`cargo.enabled`](/docs/cargo#cargoenabled) 为 `true` 时读取 `Cargo.toml`）以及 Python 包（当 [`python.enabled`](/docs/python#pythonenabled) 为 `true` 时读取 `pyproject.toml`）。通过提供参数（包括 Cargo crate 的 `crate:<name>` 和 Python 包的 `pypi:<name>`），可以将检查范围限定为已声明依赖、运行时或包管理器的一个子集。模式支持 `*` 通配符，开头的 `!` 表示排除匹配的名称。Python 选择器忽略大小写，并将连续的句点、下划线和连字符视作一个连字符。Cargo 选择器同时匹配依赖别名和 crate 名称。

当任意依赖过期时，`pnpm outdated` 会以状态码 1 退出。没有 lockfile 时，`Current` 列显示安装在 `node_modules` 中的版本；若该依赖未安装，则显示声明范围允许的最低版本。Cargo 和 Python 的检查仍需要各自生态的 lockfile。

`Latest` 列显示声明的版本范围解析到的版本与 `latest` dist-tag 所指版本中的较高者。如果安装的版本是预发布版本，pnpm 还会考虑指向同一预发布通道最新版本的 dist-tag，例如安装了 `3.0.0-rc.0` 时，`next` 指向 `3.0.0-rc.1`。`pnpm update --latest` 不会跟随预发布通道的 dist-tag。

示例：

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

### --json

`--format json` 的简写。

### --no-table

`--format list` 的简写。

### --compatible

仅打印满足 `package.json` 中声明的版本。

### --dev, -D

仅检查 `devDependencies`。

### --prod, -P, --production

仅检查 `dependencies` 和 `optionalDependencies`。

### --no-optional

不检查 `optionalDependencies`。

### --optional

检查 `optionalDependencies`。

### --sort-by

指定输出结果的排序顺序。目前仅接受值 `name`。默认先按版本变化的大小排序，再按名称排序。

### --notes

在每个过期包下方打印当前版本与最新版本之间的发布说明。说明读取自以 [`serverType: pnpr`](/docs/registries#servertype) 声明的 registry。一次发布了多个包的发布会打印一次，位于它所发布版本的说明上方。两个稳定版本之间，预发布版本的说明会被略去。使用 `--json` 时，每个条目会获得一个 `releaseNotes` 字段。

### --include-github-actions

自 v11.16.0 起提供

同时检查仓库工作流文件引用的 GitHub Actions 是否有更新。可在 `pnpm-workspace.yaml` 中将 [update.githubActions](/docs/settings/dependency-resolution#updategithubactions) 设为 `true`，以默认启用此选项。参见[更新 GitHub Actions](/docs/cli/update#updating-github-actions)。
