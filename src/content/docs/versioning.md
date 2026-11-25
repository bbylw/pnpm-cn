---
title: "发布管理"
headingIds: ["recording-a-change", "releasing", "first-releases", "configuration", "fixed-groups", "lanes", "epics", "checking-committed-versions", "changelogs", "release-notes-on-pnpr", "the-ledger"]
---

自 v11.13.0 起提供

pnpm 可以自行管理工作区版本和发布，无需单独的发布工具。该工作流分为两部分：

1. 在你工作时，[pnpm change](/docs/cli/change) 会记录**变更意图**——`.changeset/` 中的小 markdown 文件，说明某次变更影响哪些包、每个包应如何提升版本，以及一段会成为变更日志条目的摘要。这些文件与变更一起提交。
2. 在发布时，基础的 [pnpm version -r](/docs/cli/version#recursive-releases) 会消费待处理的意图：它在整个工作区提升版本，传播到依赖方，写入变更日志，并将所消费的内容记录在一个已提交的台账中。

意图文件使用 [changesets](https://github.com/changesets/changesets) 格式，因此现有的 `.changeset/` 目录仍能正常工作。如果你更希望继续使用 Changesets CLI，参见[在 pnpm 中使用 Changesets](/docs/using-changesets)。

## 记录变更

```bash
pnpm change
```

这会提示输入受影响的包、它们的提升类型以及一段摘要，然后写入一个类似 `.changeset/calm-cats-resolve.md` 的文件：

```markdown
---
"@example/core": minor
---

Added a `--watch` flag to the build command.
```

要查看待处理的意图会产生什么：

```bash
pnpm change status
```

## 发布

```bash
pnpm version -r
```

这会应用发布计划：每个被意图指定的包都会提升版本，通过 `workspace:` 范围依赖它的每个包也是如此。先用 `--dry-run` 预览，并用 `--filter` 缩小范围。

由于一次递归运行会把许多包提升到不同版本，因此不会创建 git 提交或标签——没有单一的版本可打标签。自行提交结果，然后用 `pnpm publish -r` 发布。

### 首次发布

自 v11.16.0 起，一个包的首次发布会原样发布其清单中写明的版本，而不是在其基础上提升。`pnpm version -r` 和 `pnpm change status` 会向 registry 查询每次发布的当前版本；当该版本尚未发布时，包就以该版本首次亮相，而其待处理的变更意图仅从下一次发布起生效。因此，一个初始版本设为 `1100.0.0` 并带有 `minor` 意图的新增包，会作为 `1100.0.0` 发布，而不是直接跳到 `1100.1.0`。

## 配置

发布行为在 `pnpm-workspace.yaml` 的 `versioning` 键下配置：

pnpm-workspace.yaml

```yaml
versioning:
  fixed:
    - ['@example/cli', '@example/napi']
  ignore:
    - '@example/internal'
  maxBump: minor
  lanes:
    '@example/cli': alpha
  changelog:
    storage: repository
```

每个键都在[版本管理设置](/docs/settings/versioning)中有说明。

当两个工作区项目发布相同的名称时，可以用带 `./` 前缀的工作区相对目录而不是名称来引用某个项目（例如 `"./packages/cli"`）。这在意图文件以及 `versioning.lanes`、`versioning.fixed` 和 `versioning.ignore` 中都有效。

### 固定组

在 `versioning.fixed` 中一起列出的包始终以单一共享版本发布——即组内当前最高版本，并按任一成员所需的最大升级幅度提升。固定组必须一起在通道之间移动，并且必须完全位于某个 epic 之内或完全之外。

### 通道

通道是一条并行的发布轨道。当某个包处于某条通道上时，它会从那些发布主通道上所有包稳定版本的相同运行中，发布 `X.Y.Z-<lane>.N` 预发布版本。这使得一次重写或一个大版本线能在公开环境中逐步成熟，而工作区其余部分继续交付。

```bash
pnpm lane alpha --filter @example/cli   # move onto the alpha lane
pnpm lane main --filter @example/cli    # graduate back to stable
pnpm lane                               # show membership
```

关于预发布版本如何计算，参见[pnpm lane](/docs/cli/lane)。

### Epics

一个 epic 将一组成员包绑定到一个 lead 包，把每个成员的主版本约束在由 lead 主版本推导出的区间内：当 lead 处于主版本 `M` 时，成员位于 `M*100` … `M*100+99`。

pnpm-workspace.yaml

```yaml
versioning:
  epics:
    - lead: '@example/app'
      packages:
        - './packages/**'
        - '!./packages/private-*'
```

当 lead 处于 `11.x` 时，成员占据主版本 `1100`–`1199`。成员可在区间内独立移动——patch、minor，甚至是保持在区间内的 `major` 意图。任何会将成员推过区间上限的版本提升都会被拒绝，直到 lead 推进自身的主版本。当某个发布计划将 lead 带到一个新的稳定主版本时，每个成员都会在同一个计划中重新基准化到区间下限。

成员资格通过 pnpm 的包选择器匹配：名称 glob、带 `./` 前缀的目录 glob 以及带 `!` 前缀的取反。选择器按顺序求值，最后一个匹配者决定结果，因此靠后的包含可以重新纳入一个被靠前取反排除的包。lead 永远不会是其自身区间的成员。

## 检查已提交的版本

[`pnpm change check`](/docs/cli/change#check) 会把工作区中已提交的版本与 `versioning.epics` 的区间、`versioning.fixed` 的分组进行校验，而不读取任何变更意图。请在 CI 中把它放在 lint 与测试步骤旁边，这样偏离所属区间的版本会在引入它的那次拉取请求上被捕获，而不是等到发布时。

## 变更日志

默认情况下（`versioning.changelog.storage: registry`），不会提交 `CHANGELOG.md`。每个发布的章节在发布时组合，并叠加在此前已发布版本的变更日志之上打包进发布的 tarball。已被消费的变更意图只有在 registry 确认该版本连同其章节一起发布后，才会在之后的 `pnpm version -r` 中被垃圾回收。

改为设置 `versioning.changelog.storage: repository`，以便在每个包中保留已提交的 `CHANGELOG.md` 文件。

### pnpr 上的发布说明

当一个包发布到以 [`serverType: pnpr`](/docs/registries#servertype) 声明的 registry 时，`registry` 存储会把它的章节（不含版本标题）作为该版本的发布说明保存，而不是把它打包进 tarball。发布计划中发布到这类 registry 的包构成一次发布：

- 只指名其中一个包的变更意图进入该包的说明。
- 指名其中若干个包的变更意图只出现一次，进入该次发布的说明，并附上它适用的包。
- 同时还指名了本次发布之外某个包的变更意图，会留在它所指定的每个包的说明中。

该次发布以其 [epic](/docs/versioning#epics) lead 的版本，或其唯一固定组的版本，命名为 `v<版本>`。[`pnpm publish -r --batch`](/docs/cli/publish#--batch) 用一个请求发送整次发布。`pnpm version -r --release-notes <文件>` 会在该次发布的说明上方（当该次发布只有一个包时，在该包的说明上方）添加一份手写摘要，而 `pnpm publish --publication-name` 为该次发布命名。每条说明都由 `pnpm version -r` 组合并保留到发布时，因此 `pnpm publish` 不需要为这些包传 `--release-notes`。自带名称或说明的发布只会到达一个 registry，因此 `pnpm version -r` 会在改动任何版本之前拒绝那些包发布到多个 pnpr registry 的发布；请用 `--filter` 分别对每个 registry 的包做版本管理。

tarball 不会被打包进任何内容，也不会从中拉取任何内容。在 registry 持有由这些变更意图组合出的说明之后，之后的 `pnpm version -r` 才会删除已消费的意图：每条说明要么仍包含那段文字，要么是由它创建的——registry 通过编辑前的初始摘要来证明这一点。

私有包永远不会被发布，因此没有 tarball 能承载它们的变更日志。无论配置如何，它们的发布始终使用 `repository` 存储：章节会被前置到该包已提交的 `CHANGELOG.md`，该次发布无需 registry 确认即视为已消费。同时还指名了其他项目的意图文件，只有在它们全部发布后才会被删除。

## 台账

`pnpm version -r` 将每个被消费的意图记录在 `.changeset/ledger.yaml` 中，这是一个已提交的仅追加文件：

```yaml
"@example/core@1.3.0":
  dir: packages/core
  intents:
    - calm-cats-resolve
```

消费按项目跟踪：一个意图文件只有在它指定的每个项目都已发布后才会被删除。这正是使发布分支之间的 cherry-pick 和回向合并保持安全的原因——一个已经消费了某意图的发布分支，在提交向前合并时不会再次消费它；而位于某通道上的包可以半消费一个意图，该意图的说明文字仍需在一次稳定发布中组合进去。
