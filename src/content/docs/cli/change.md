---
title: "pnpm change"
headingIds: ["usage","subcommands","status","check","options","--bump-type","--summary-text","referencing-packages-by-directory"]
---

自 v11.13.0 起提供

记录一个变更意图：变更影响哪些包、每个包的提升类型，以及会成为变更日志条目的摘要。意图文件以 [changesets](https://github.com/changesets/changesets) 格式写入 `.changeset/`。

```sh
pnpm change [--bump <type>] [--summary <text>] [<pkg>...]
pnpm change status
pnpm change check
```

变更意图稍后由 [pnpm version -r](/docs/cli/version#recursive-releases) 消费。整个工作流参见[发布管理](/docs/versioning)。

## 用法

不带参数运行以交互式记录一个意图：

```sh
pnpm change
```

系统会问你三个问题：

1. **此变更影响哪些包？** 自与 `main`（或 `master`）的合并基点以来发生变更的包会被预选。
2. **哪些包应做 major 提升？**，随后对 `minor` 做同样的询问。剩下的都按 `patch` 提升。
3. **变更摘要**，它会成为变更日志条目。

结果是一个形如 `.changeset/calm-cats-resolve.md` 的文件：

```markdown
---
"@example/core": minor
"@example/cli": patch
---

Added a `--watch` flag to the build command.
```

将此文件与你的变更一起提交。

将包名与 `--bump` 和 `--summary` 一起传入，可在不提示的情况下记录一个意图，这在脚本中很有用：

```sh
pnpm change --bump patch --summary "Fixed a crash on empty input" @example/core
```

## 子命令

### status

显示待处理的变更意图及其生成的发布计划。

```sh
pnpm change status
```

```
Pending change intents:
  .changeset/calm-cats-resolve.md

Release plan:
  @example/core: 1.2.0 → 1.3.0 (minor, via intent)
  @example/cli: 0.4.1 → 0.4.2 (patch, via intent+dependencies)
```

每次提升的原因属于以下之一：`intent`（变更意图点名了该包）、`dependencies`（依赖方被传播拉入）、`fixed`（某个[固定组](/docs/versioning#fixed-groups)的伴随项），或 `epic`（[epic](/docs/versioning#epics) 的重新基线）。

私有包（`"private": true`）在[首次发布](/docs/versioning#first-releases)时不会与 registry 做校验，因此它们待处理的变更意图总会显示为提升；一个只包含私有包的工作区在规划发布时也不需要访问 registry。

### check

自 v12.4.0 起提供

校验待处理的变更意图，并把工作区中已提交的版本与 `pnpm-workspace.yaml` 里声明的 [epic](/docs/versioning#epics) 区间和[固定组](/docs/versioning#fixed-groups) 步调进行比对。

```sh
pnpm change check
```

与报告待处理意图会产生哪个发布的 `pnpm change status` 不同，`check` 只根据待处理的变更意图来规划发布而不把它报告出来，并且只检查清单里已有的版本。像是指名了工作区之外的包这种在发布时才会失败的意图，会让该命令失败。建议在每个 pull request 上都运行它：一个包的版本漂移出了它所属 epic 的区间，或者与固定组不再同步，该命令就会失败。所有违规都会被列出，包括当前这次发布并未涉及的包里的违规。

## 选项

### --bump <type>

被点名包的提升类型：`none`、`patch`、`minor` 或 `major`。`none` 记录一次明确的拒绝，表示该变更无需发布。

### --summary <text>

变更日志条目的摘要。与包名一起使用时，以非交互方式运行该命令。

## 按目录引用包

当两个工作区项目发布相同的名称时，可改为通过工作区相对目录来引用某个包，并带有 `./` 前缀：

```markdown
---
"./packages/cli": minor
---
```

这是 pnpm 对 changesets 格式所做的唯一一项附加扩展。当名称有歧义时，`pnpm change` 会自动写入它。
