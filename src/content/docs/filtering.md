---
title: "过滤"
headingIds: ["matching","--filter-package_name","--filter-package_name-1","--filter-package_name-2","--filter-package_name-3","--filter-package_name-4","--filter-glob---filter-glob","legacydirfiltering","--filter-since","--fail-if-no-match","excluding","multiplicity","--filter-prod-filtering_pattern","--test-pattern-glob","--changed-files-ignore-pattern-glob"]
---

过滤允许你把命令限制在特定的包子集上。

pnpm 支持丰富的选择器语法，可按名称或关系选择包。

可通过 `--filter`（或 `-F`）标志指定选择器：

```bash
pnpm --filter <package_selector> <command>
```

## 匹配

### --filter <package_name>

要选择确切的包，只需指定其名称（`@scope/pkg`），或使用模式选择一组包（`@scope/*`）。

Examples:

```bash
pnpm --filter "@babel/core" test
pnpm --filter "@babel/*" test
pnpm --filter "*core" test
```

指定包的作用域是可选的，因此如果找不到 `core`，`--filter=core` 会挑选 `@babel/core`。然而，如果工作区中有多个同名的包（例如 `@babel/core` 和 `@types/core`），那么不带作用域的过滤将什么都不选。

### --filter <package_name>...

要选择某个包及其依赖（直接和非直接依赖），在包名后加上省略号：`<package_name>...`。例如，以下命令将运行 `foo` 及其所有依赖的测试：

```bash
pnpm --filter foo... test
```

你可以使用模式来选择一组根包：

```bash
pnpm --filter "@babel/preset-*..." test
```

### --filter <package_name>^...

要仅选择某个包的依赖（直接和非直接都在内），在名称后加上前述省略号，其前再加一个尖角符号。例如，以下命令将运行 `foo` 所有依赖的测试：

```bash
pnpm --filter "foo^..." test
```

### --filter ...<package_name>

要选择某个包及其被依赖包（直接和非直接都在内），在包名前加上省略号：`...<package_name>`。例如，这将运行 `foo` 及所有依赖它的包的测试：

```bash
pnpm --filter ...foo test
```

### --filter "...^<package_name>"

要仅选择某个包的被依赖包（直接和非直接都在内），在包名前加上省略号后跟一个尖角符号。例如，这将运行所有依赖 `foo` 的包的测试：

```
pnpm --filter "...^foo" test
```

### --filter `./<glob>`, --filter `{<glob>}`

一个相对于当前工作目录、用于匹配项目的 glob 模式。

```bash
pnpm --filter "./packages/**" <cmd>
```

包含指定目录下的所有项目。

它可以与省略号和尖角符号运算符一起使用，以选择被依赖包/依赖：

```bash
pnpm --filter ...{<directory>} <cmd>
pnpm --filter {<directory>}... <cmd>
pnpm --filter ...{<directory>}... <cmd>
```

它也可以与 `[<since>]` 结合使用。例如，选择一个目录内所有更改过的项目：

```bash
pnpm --filter "{packages/**}[origin/master]" <cmd>
pnpm --filter "...{packages/**}[origin/master]" <cmd>
pnpm --filter "{packages/**}[origin/master]..." <cmd>
pnpm --filter "...{packages/**}[origin/master]..." <cmd>
```

或者，你可以从某个目录中选择所有名称与给定模式匹配的包：

```
pnpm --filter "@babel/*{components/**}" <cmd>
pnpm --filter "@babel/*{components/**}[origin/master]" <cmd>
pnpm --filter "...@babel/*{components/**}[origin/master]" <cmd>
```

#### legacyDirFiltering

- 默认值：**false**
- 类型：**布尔值**

`{<dir>}` 作为 glob 模式匹配：`{packages/*}` 选择 `packages/` 下一层的项目，要到达更深层则需要 `**`。在 `pnpm-workspace.yaml` 中将 `legacyDirFiltering` 设为 `true` 可恢复旧行为：在该行为下，选择器命名的是一个目录，并匹配其下子树中的**每个**项目：

pnpm-workspace.yaml

```yaml
legacyDirFiltering: true
```

此设置仅适用于你编写的那些选择器。pnpm 为自身生成的工作区根选择器——递归 `run` / `exec` / `add` / `test` 追加的 `!{<workspace-root>}`，以及 `--workspace-root` 追加的 `{<workspace-root>}`——自 v11.24.0 起始终作为 glob 匹配。按子树匹配来解读时，它们会命名根下的每个项目，因此在此设置下递归命令什么都选不到，而 `--workspace-root` 会拉入整个工作区而不是仅根目录（[#14101](https://github.com/pnpm/pnpm/issues/14101)）。

### --filter "[<since>]"

选择自指定的提交/分支以来所有更改过的包。可在其后或前加上 `...` 以包含依赖/被依赖包。

例如，以下命令将在自 `master` 以来所有更改过的包以及任意被依赖包中运行测试：

```bash
pnpm --filter "...[origin/master]" test
```

### --fail-if-no-match

如果你希望没有包匹配过滤条件时让 CLI 失败，请使用此标志。

你也可以通过 [failIfNoMatch 设置](/docs/workspaces#failifnomatch)永久设置此项。

## 排除

任何过滤选择器在前面加上 "!" 时都可以作为排除运算符。在 zsh（以及可能的其他 shell）中，"!" 需要转义：`\!`。

例如，这将在除 `foo` 之外的所有项目中运行命令：

```bash
pnpm --filter=!foo <cmd>
```

而这将在不位于 `lib` 目录下的所有项目中运行命令：

```bash
pnpm --filter=!./lib <cmd>
```

## 多重性

过滤包时，会选取每个匹配至少一个选择器的包。你可以使用任意数量的过滤器：

```bash
pnpm --filter ...foo --filter bar --filter baz... test
```

## --filter-prod <filtering_pattern>

行为与 `--filter` 相同，但从工作区选择依赖项目时会省略 `devDependencies`。

## --test-pattern <glob>

`test-pattern` 允许检测被修改的文件是否与测试相关。如果是，则不会包含这些被修改包的被依赖包。

此选项与 "changed since" 过滤器配合使用很有用。例如，以下命令将在所有更改过的包中运行测试，而如果更改在于包的源代码，则也会在依赖它的包中运行测试：

```bash
pnpm --filter="...[origin/master]" --test-pattern="test/*" test
```

## --changed-files-ignore-pattern <glob>

允许在过滤自指定提交/分支以来更改过的项目时，按 glob 模式忽略更改的文件。

用法示例：

```bash
pnpm --filter="...[origin/master]" --changed-files-ignore-pattern="**/README.md" run build
```
