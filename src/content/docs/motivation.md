---
title: "为什么选择 pnpm"
headingIds: ["saving-disk-space","boosting-installation-speed","creating-a-non-flat-node_modules-directory"]
---

## 节省磁盘空间

![一张 pnpm 内容寻址存储的示意图。图中有两个带 node_modules 的项目。node_modules 目录中的文件是到内容寻址存储中同一文件的硬链接。](/img/gen/ce745b9da0a0b031.svg)

使用 npm 时，如果你有 100 个项目都依赖某个包，磁盘上就会有该依赖的 100 份副本。使用 pnpm 时，该依赖会被存放在一个内容寻址存储中，于是：

1. 如果你依赖该依赖的不同版本，只有内容不同的文件才会被加入存储。举例来说，如果它有 100 个文件，而新版本只在其中一个文件上有一处改动，`pnpm update` 只会向存储新增 1 个文件，而不是仅仅为这一处改动就克隆整个依赖。
2. 所有文件都保存在磁盘上的同一个位置。安装包时，它们的文件从那个单一位置硬链接过去，不占用额外磁盘空间。这让你可以在项目之间共享同一版本的依赖。

结果就是，你在磁盘上节省的空间与项目和依赖的数量成正比，而且安装速度快得多！

## 加快安装速度

pnpm 分三个阶段执行安装：

1. 依赖解析。识别出所有必需的依赖并拉取到存储。
2. 目录结构计算。根据依赖计算 `node_modules` 目录结构。
3. 链接依赖。拉取所有剩余的依赖，并从存储硬链接到 `node_modules`。

![一张 pnpm 安装过程的示意图。包会尽快被解析、拉取并硬链接。](/img/gen/4ee698154153d70f.svg)

这种方式比传统「先把所有依赖解析、拉取，再全部写入 `node_modules`」的三阶段安装过程要快得多。

![一张示意图，展示 Yarn Classic 或 npm 这类包管理器如何安装依赖。](/img/gen/d79edf734b5485d5.svg)

## 创建非扁平的 node_modules 目录

用 npm 或 Yarn Classic 安装依赖时，所有包都被提升到模块目录的根部。结果是源代码能够访问那些并未作为依赖加入项目的依赖。

默认情况下，pnpm 使用符号链接，只把项目的直接依赖加入模块目录的根部。

![一张 pnpm 创建的 node_modules 目录示意图。根 node_modules 中的包是指向 node_modules/.pnpm 目录内各目录的符号链接](/img/gen/c2131b58e7c3ae90.svg)

如果你想进一步了解 pnpm 创建的独特 `node_modules` 结构，以及它为何能与 Node.js 生态良好协作，请阅读：

- [Flat node_modules is not the only way](https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way)
- [Symlinked node_modules structure](/docs/symlinked-node-modules-structure)

:::tip[提示]

如果你的工具与符号链接配合不佳，你仍然可以使用 pnpm，并将 [nodeLinker](/docs/settings/node-modules#nodelinker) 设置设为 `hoisted`。这会指示 pnpm 创建一个与 npm 和 Yarn Classic 所创建的类似的 node_modules 目录。

:::
