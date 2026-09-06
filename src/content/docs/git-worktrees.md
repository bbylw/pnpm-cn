---
title: "pnpm + Git 工作树实现多代理开发"
headingIds: ["what-is-a-git-worktree","why-worktrees","why-this-matters-even-more-with-ai-agents","setting-it-up","1-create-a-bare-repository","2-create-worktrees-for-each-branch","3-enable-the-global-virtual-store","4-install-dependencies-in-each-worktree","how-it-works","example-the-pnpm-monorepo-itself","tips"]
---

当多个 AI 代理需要同时在同一个 monorepo 上工作时，每个代理都需要一个具有完全可用的 `node_modules` 的隔离工作副本。Git 工作树（worktree）结合 pnpm 的[全局虚拟存储](/docs/global-virtual-store)让这一点变得可行：每个工作树都有自己的检出和自己的 `node_modules`，但依赖通过磁盘上单个内容寻址存储在它们之间共享。

## 什么是 git 工作树？

通常，一个 git 仓库在同一时间只有一个绑定到单个分支的工作目录。如果你想查看另一个分支，就必须暂存或提交你的更改再切换。[git 工作树](https://git-scm.com/docs/git-worktree)让你可以同时检出多个分支，每个分支都在自己的目录中。所有工作树共享相同的仓库历史和对象——它们只是同一仓库的不同视图。

```
git worktree add ../feature-branch feat/my-feature
```

这会创建一个新目录 `../feature-branch`，其中检出了 `feat/my-feature`，而你原来的工作目录仍停留在当前分支。你可以独立地在这两个目录中工作。

一个常见的模式是使用一个**裸仓库**（bare repository，即没有自己的工作目录的仓库）作为中心，并把所有工作目录创建为工作树：

```
git clone --bare https://github.com/your-org/your-repo.git your-repo
cd your-repo
git worktree add ./main main
git worktree add ./feature feat/something
```

## 为什么用工作树？

早在 AI 代理出现之前，工作树就已经很有用了——它可以维护一个项目的多个主要版本。在我的开发机器上，我使用一个至少有 2 个工作树的 pnpm 仓库：一个在 `main` 上用于 pnpm v12，另一个在 `v11` 分支上用于回移和维护版本发布。这样，我可以在不停存我进行中的 v12 工作的情况下修复 v11 上的一个 bug——两个版本始终处于检出状态、随时可用。过去，在 pnpm 仓库里 2 或 3 个工作树通常就够我用了。然而，自从我开始大量使用 AI 代理后，我需要多得多的工作树，好让我的代理并行处理许多任务。

## 为什么这在 AI 代理下更重要

有了 AI 编码代理，工作树从方便变成了必不可少。每个代理都需要自己的工作目录，以便编辑文件、运行构建和执行测试，而不干扰其他代理。没有工作树，就意味着要多次克隆仓库，为每个副本重复 git 历史。

工作树解决了 git 这一侧的问题——每个代理都得到自己的隔离检出，同时共享底层的 git 对象。但每个工作树仍然需要自己的 `node_modules`，这可能是数百兆字节。这就是 pnpm 的[全局虚拟存储](/docs/global-virtual-store)发挥作用的地方：启用它后，每个工作树的 `node_modules` 只包含指向磁盘上单个内容寻址存储的符号链接。这意味着添加一个新代理既快又几乎不占用额外磁盘空间。

:::important[重要]

此设置假定工作树和代理共享同一个信任边界。不要为相互不信任的代理或用户共用一个可写的 pnpm 存储。

:::

## 设置

### 1. 创建裸仓库

```bash
git clone --bare https://github.com/your-org/your-monorepo.git your-monorepo
cd your-monorepo
```

### 2. 为每个分支创建工作树

```bash
# Main development worktree
git worktree add ./main main

# A feature branch for agent A
git worktree add ./feature-auth feat/auth

# A bugfix branch for agent B
git worktree add ./fix-api fix/api-error
```

每个工作树都是一个完整检出，拥有自己的文件，但它们都共享同一个 `.git` 对象存储。

### 3. 启用全局虚拟存储

在你的仓库的 `pnpm-workspace.yaml` 中添加 `virtualStoreType: global`（在 v11.23.0 之前，此设置写作 `enableGlobalVirtualStore: true`）：

```yaml
packages:
  - 'packages/*'

virtualStoreType: global
```

### 4. 在每个工作树中安装依赖

```bash
cd main && pnpm install
cd ../feature-auth && pnpm install
cd ../fix-api && pnpm install
```

第一次 `pnpm install` 会将包下载到全局存储。其他工作树中的后续安装几乎瞬间完成，因为它们只是创建指向同一存储的符号链接。

## 工作原理

没有全局虚拟存储时，每个工作树都会有自己的、位于 `node_modules` 内的 `.pnpm` 虚拟存储，其中包含每个包的硬链接或副本。使用 `virtualStoreType: global` 时，pnpm 将所有包内容保存在单个共享目录（全局存储，你可以通过运行 `pnpm store path` 找到它）中，而每个工作树的 `node_modules` 包含指向那里的符号链接：

```
your-monorepo/                      (bare git repo)
├── main/                           (worktree: main branch)
│   ├── packages/
│   └── node_modules/
│       ├── lodash → <global-store>/links/@/lodash/...
│       └── express → <global-store>/links/@/express/...
├── feature-auth/                   (worktree: feat/auth branch)
│   └── node_modules/
│       ├── lodash → <global-store>/links/@/lodash/...  ← same target
│       └── express → <global-store>/links/@/express/...
└── fix-api/                        (worktree: fix/api-error branch)
    └── node_modules/
        ├── lodash → <global-store>/links/@/lodash/...  ← same target
        └── express → <global-store>/links/@/express/...
```

这意味着：

- **每个工作树近乎零开销**——本地的 `node_modules` 只包含指向共享全局虚拟存储的符号链接。与 pnpm 的默认行为（它把文件从内容寻址存储硬链接到本地的 `node_modules/.pnpm` 目录）不同，全局虚拟存储意味着根本没有任何文件被复制或硬链接到工作树中。
- **新工作树的即时安装**——包已经在全局存储中。
- **没有冲突**——每个工作树都有自己的 `node_modules` 树，因此代理可以在不同分支上安装不同的依赖版本而互不干扰。

## 示例：pnpm monorepo 本身

[pnpm 仓库](https://github.com/pnpm/pnpm)使用的正是这套配置：一个裸 git 仓库加一个全局虚拟存储。它包含一些辅助脚本，让工作树管理更简单：

**pnpm worktree:new <branch-name|pr-number>** — 创建一个新工作树并设置它：

```bash
# Create a worktree for a branch (creates it from main if it doesn't exist)
pnpm worktree:new feat/my-feature

# Create a worktree for a GitHub PR (fetches the PR ref automatically)
pnpm worktree:new 10834
```

该脚本处理了一些超出普通 `git worktree add` 的事情：

- PR 编号通过 `git fetch origin pull/<number>/head` 获取，因此它们对 fork 也有效。
- 包含斜杠的分支名（例如 `feat/my-feature`）会被转换为短横线作为目录名（例如 `feat-my-feature`）。
- `.claude` 目录从裸仓库的 git 公共目录符号链接到新工作树，因此所有工作树共享相同的 Claude Code 设置和已批准命令。

此外还有一个 shell 辅助脚本 [shell/wt.sh](https://github.com/pnpm/pnpm/blob/main/shell/wt.sh)，它包装了该脚本并 `cd` 到新工作树：

```bash
# Source it in your shell config, then:
wt feat/my-feature
wt 10834
```

## 提示

- **为代理创建工作树**：启动 AI 代理时，为它创建一个专用工作树。代理获得完全的隔离来编辑文件、运行测试和安装包，而不影响其他代理。
- **清理**：当工作树不再需要时，用 `git worktree remove ./feature-auth` 移除它。残留的工作树开销很小，但会不断累积。
