---
title: "版本管理设置"
headingIds: ["versioningfixed","versioningignore","versioningmaxbump","versioninglanes","versioningepics","versioningchangelogstorage"]
---

自 v11.13.0 起提供

这些配置项用于设置 pnpm 原生的工作区发布管理，由 [pnpm change](/docs/cli/change) 和基础的 [pnpm version -r](/docs/cli/version#recursive-releases) 驱动。有关它们所属的工作流，参见[发布管理](/docs/versioning)。

当两个工作区项目发布相同的名称时，在 `versioning.fixed`、`versioning.ignore` 以及 `versioning.lanes` 的键中，可以用带 `./` 前缀的工作区相对目录来引用某个项目，而不用它的名称。

### versioning.fixed

- 默认值：**[]**
- 类型：**string[][]**

始终以单一共享版本一起发布的包分组。该共享版本是组内当前最高的版本，并按任一成员所需的最大升级幅度进行提升。

pnpm-workspace.yaml

```yaml
versioning:
  fixed:
    - ['@example/cli', '@example/napi']
```

一个固定组必须一起在通道之间移动，并且必须完全位于某个 epic 之内或完全之外。

### versioning.ignore

- 默认值：**[]**
- 类型：**string[]**

永久从版本管理和依赖传播中排除的包。若某个变更意图为一个被忽略的包请求实际版本提升，则会失败。

pnpm-workspace.yaml

```yaml
versioning:
  ignore:
    - '@example/internal'
```

### versioning.maxBump

- 默认值：**undefined**（无上限）
- 类型：**'patch'**、**'minor'**、**'major'**

限定从当前检出的代码进行发布时可应用的最大升级幅度。它在依赖传播和固定组解析之后，对最终组装的发布计划强制执行，因此一个仅 patch 的维护分支不会意外发布一个 minor。

pnpm-workspace.yaml

```yaml
versioning:
  maxBump: patch
```

### versioning.lanes

- 默认值：****
- 类型：**Record<string, string>**

将包映射到其所在的发布通道。通道是一条并行的发布轨道，会发出 `X.Y.Z-<lane>.N` 预发布版本；每个未列出的包都位于保留的默认通道 `main` 上，并发布稳定版本。

pnpm-workspace.yaml

```yaml
versioning:
  lanes:
    '@example/cli': alpha
```

通道名称只能包含字母数字和连字符，且不能为纯数字。`main` 是保留字，不能被指定——改为移除该条目，或使用 [pnpm lane main --filter <pkg>](/docs/cli/lane)。

### versioning.epics

- 默认值：**[]**
- 类型：**Array<{ lead: string, packages: string[] }>**

将一组成员包绑定到一个 lead 包，把每个成员的主版本约束在由 lead 主版本推导出的区间内：当 lead 处于主版本 `M` 时，成员位于 `M*100` … `M*100+99`。

pnpm-workspace.yaml

```yaml
versioning:
  epics:
    - lead: '@example/app'
      packages:
        - './packages/**'
        - '!./packages/private-*'
```

`lead` 是包名或带 `./` 前缀的工作区目录。`packages` 通过 pnpm 的包选择器进行匹配——名称 glob、带 `./` 前缀的目录 glob 以及带 `!` 前缀的取反——按顺序求值，最后匹配者胜出。一个包最多只能属于一个 epic。

关于该区间如何被强制执行和重新基准化，参见[Epics](/docs/versioning#epics)。

### versioning.changelog.storage

- 默认值：**'registry'**
- 类型：**'registry'**、**'repository'**

发布变更日志所在的位置。

使用 `registry` 时，不会提交 `CHANGELOG.md`：每个发布的章节在发布时组合，并叠加在此前已发布版本的变更日志之上，打包进发布的 tarball。

使用 `repository` 时，会在每个包中提交 `CHANGELOG.md`。

pnpm-workspace.yaml

```yaml
versioning:
  changelog:
    storage: repository
```
