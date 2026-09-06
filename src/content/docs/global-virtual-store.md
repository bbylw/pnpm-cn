---
title: "全局虚拟存储"
headingIds: ["default-behavior-vs-global-virtual-store","default-per-project-virtual-store","with-global-virtual-store","how-package-identity-works","when-to-use-it","limitations","global-packages","configuration"]
---

默认情况下，pnpm 在每个项目的 `node_modules` 内创建一个 `.pnpm` 目录，这就是「虚拟存储」。它包含指向[内容寻址存储](/docs/settings/store#storedir)中文件的硬链接。每个项目都得到这份虚拟存储各自的一份投影，pnpm 将内容寻址存储中的文件硬链接进 `.pnpm` 目录结构。实际文件内容在磁盘上只存在一份，但目录结构会为每个项目重新创建，以便 Node.js 的模块解析算法为每个包找到正确的依赖。

**全局虚拟存储**（`virtualStoreType: global`，在 v11.23.0 之前写作 `enableGlobalVirtualStore: true`）改变了这一点。pnpm 不再让每个项目各有自己的 `node_modules/.pnpm` 目录，而是维护一个单一共享的虚拟存储（位于 `<store-path>/links/`，运行 `pnpm store path` 可找到 `<store-path>`）。每个项目的 `node_modules` 只包含指向这个共享位置的符号链接。

## 默认行为与全局虚拟存储的对比

### 默认（按项目的虚拟存储）

```
project-a/
└── node_modules/
    ├── lodash → .pnpm/lodash@4.17.21/node_modules/lodash
    └── .pnpm/
        └── lodash@4.17.21/
            └── node_modules/
                └── lodash/            ← hardlinks to content-addressable store
project-b/
└── node_modules/
    ├── lodash → .pnpm/lodash@4.17.21/node_modules/lodash
    └── .pnpm/
        └── lodash@4.17.21/
            └── node_modules/
                └── lodash/            ← same hardlinks, duplicated directory structure
```

每个项目都有自己的 `.pnpm`，其中是硬链接。文件内容在磁盘上并未重复（硬链接共享 inode），但目录结构是重复的。在大型 monorepo（单体仓库）或许多并行检出中，`pnpm install` 期间创建数千个硬链接所花的时间会累积起来。

### 使用全局虚拟存储

```
project-a/
└── node_modules/
    └── lodash → <global-store>/links/@/lodash/4.17.21/<hash>/node_modules/lodash
project-b/
└── node_modules/
    └── lodash → <global-store>/links/@/lodash/4.17.21/<hash>/node_modules/lodash  ← same target
```

两个项目都直接符号链接到全局虚拟存储中的同一位置。不再有按项目的 `.pnpm` 目录。全局虚拟存储本身包含指向内容寻址存储的硬链接，但这只是针对每个依赖图发生一次（详见下文），而不是每个项目一次。

## 包标识的工作方式

在全局虚拟存储中，每个包目录以其依赖图的 hash 命名。两个使用相同传递依赖树的 `lodash@4.17.21` 项目会指向完全相同的目录。如果依赖树不同（例如对等依赖不同），pnpm 会创建单独的条目。这在概念上类似于 [NixOS 如何用依赖图 hash 管理包](https://nixos.org/guides/how-nix-works/)。

## 何时使用

当你在磁盘上对同一项目有多个检出时，全局虚拟存储最有用，例如使用 [git worktree 进行多智能体开发](/docs/git-worktrees)。在那种场景下，每个 worktree 都能近乎免费地获得 `node_modules`，因为所有真实的包内容已经存在于共享存储中。

它也会加快同一机器上不相关项目之间的安装，因为任何项目已经安装过的包版本都能立即可用。

## 局限性

- **CI 环境**：在 CI 中，缓存通常不存在，因此没有可供受益的热全局存储。全局虚拟存储在 CI 中一般没什么用。
- **共享信任域**：全局虚拟存储和内容寻址存储是共享的可写状态。只把它们用于彼此信任的项目、用户和任务，并用文件系统权限保护存储路径。
- **ESM 提升**：pnpm 使用 `NODE_PATH` 环境变量来在全局虚拟存储下支持被提升的依赖，而 Node.js 在 ESM 导入时不遵守 `NODE_PATH`。自 v11.23.0 起，pnpm 为项目派生的每个进程，包括 `pnpm run`、`pnpm exec`、生命周期脚本以及 `pnpm dlx` 运行的工具，都会附带一个 `NODE_OPTIONS` 的 `--import` 标志，用于注册一个解析钩子以恢复这些查找，从而让一个导入其未声明之包的依赖在 ESM 下也能解析（[#9618](https://github.com/pnpm/pnpm/issues/9618)）。在 pnpm 之外启动的 `node` 进程不会获得该环境，而将 [extendNodePath](/docs/settings/other#extendnodepath) 设为 `false` 会关闭整个 `NODE_PATH` 机制，解析钩子也包括在内；如果你需要在任一情况下都能解析，请用 [packageExtensions](/docs/settings/dependency-resolution#packageextensions) 声明缺失的依赖。

:::note[说明]

目前全局虚拟存储对项目安装默认处于禁用状态，并被标记为实验性，因为某些工具可能无法正确处理符号链接的 `node_modules`。要把它用于项目安装，你需要在 `pnpm-workspace.yaml` 中显式设置 `virtualStoreType: global`。对于通过 `pnpm dlx`（`pnpx`）安装的包和全局安装的包，它默认启用。目标是未来某个版本中为所有安装默认启用它。

:::

## 全局包

全局安装（`pnpm add -g`）和 `pnpm dlx` 默认使用全局虚拟存储。完整指南见[全局包](/docs/global-packages)，其中包含隔离安装和二进制文件的位置。

## 配置

所有配置细节见 [virtualStoreType](/docs/settings/node-modules#virtualstoretype) 设置参考。`virtualStoreType` 自 v11.23.0 起提供，是 [enableGlobalVirtualStore](/docs/settings/node-modules#enableglobalvirtualstore) 的规范写法，后者仍然有效。
