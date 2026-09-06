---
title: "常见问题"
headingIds: ["why-does-my-node_modules-folder-use-disk-space-if-packages-are-stored-in-a-global-store","does-it-work-on-windows","but-the-nested-node_modules-approach-is-incompatible-with-windows","what-about-circular-symlinks","why-have-hard-links-at-all-why-not-symlink-directly-to-the-global-store","does-pnpm-work-across-different-subvolumes-in-one-btrfs-partition","does-pnpm-work-across-multiple-drives-or-filesystems","store-path-is-specified","store-path-is-not-specified","what-does-pnpm-stand-for","pnpm-does-not-work-with-your-project-here","solution-1","solution-2","solution-3"]
---

## 如果包存储在某个全局存储中，为什么我的 `node_modules` 文件夹还会占用磁盘空间？

pnpm 会创建从全局存储到项目 `node_modules` 文件夹的[硬链接](https://en.wikipedia.org/wiki/Hard_link)。硬链接指向磁盘上与原始文件相同的位置。例如，如果你的项目中有一个依赖 `foo`，它占用 1MB 空间，那么它在项目的 `node_modules` 文件夹中看起来占用 1MB，在全局存储中也占用同样的 1MB。然而，那 1MB 是从两个不同位置寻址的磁盘上的*同一块空间*。因此总计 `foo` 占用 1MB，而不是 2MB。

关于此主题的更多信息：

- [Why do hard links seem to take the same space as the originals?](https://unix.stackexchange.com/questions/88423/why-do-hard-links-seem-to-take-the-same-space-as-the-originals)
- [A thread from the pnpm chat room](https://gist.github.com/zkochan/106cfef49f8476b753a9cbbf9c65aff1)
- [An issue in the pnpm repo](https://github.com/pnpm/pnpm/issues/794)

## 它在 Windows 上可用吗？

简短回答：可以。详细回答：在 Windows 上使用符号链接有时会有问题，不过 pnpm 有一个变通方案。对于 Windows，如果[开发者模式](https://learn.microsoft.com/windows/advanced-settings/developer-mode)未开启，我们改用 [junctions](https://docs.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions)。

## 但嵌套的 `node_modules` 方式与 Windows 不兼容？

早期版本的 npm 因为把所有 `node_modules` 嵌套起来而存在问题（见[此问题](https://github.com/nodejs/node-v0.x-archive/issues/6960)）。然而，pnpm 不会创建很深的文件夹，它以扁平方式存储所有包，并使用符号链接来创建依赖树结构。

## 循环符号链接怎么办？

尽管 pnpm 使用链接把依赖放进 `node_modules` 文件夹，但循环符号链接是可以避免的，因为父包与其依赖被放在同一个 `node_modules` 文件夹中。因此 `foo` 的依赖并不在 `foo/node_modules` 中，而 `foo` 自身与它自己的依赖一起位于 `node_modules` 中。

## 为什么要用硬链接？为什么不直接符号链接到全局存储？

在一台机器上，一个包可能有不同的依赖集合。

在项目 **A** 中，`foo@1.0.0` 的某个依赖可能解析为 `bar@1.0.0`，而在项目 **B** 中，`foo` 的同一依赖可能解析为 `bar@1.1.0`；因此，pnpm 把 `foo@1.0.0` 硬链接到每个使用它的项目，以便为它创建不同的依赖集合。

直接符号链接到全局存储可以用 Node 的 `--preserve-symlinks` 标志实现，然而这种方式本身带来大量问题，所以我们决定坚持使用硬链接。关于做出这一决定的更多细节，见[此问题](https://github.com/nodejs/node-eps/issues/46)。

## pnpm 能在单个 Btrfs 分区内的不同子卷之间工作吗？

虽然 Btrfs 不允许在单个分区内的不同子卷之间进行跨设备硬链接，但它确实允许引用链接（reflink）。因此，pnpm 利用引用链接在这些子卷之间共享数据。

## pnpm 能在多个驱动器或文件系统之间工作吗？

包存储应与安装位于同一驱动器和文件系统上，否则包将被复制而不是链接。这是由于硬链接工作方式的一个限制：一个文件系统上的文件无法寻址另一个文件系统中的位置。更多细节见 [Issue #712](https://github.com/pnpm/pnpm/issues/712)。

pnpm 在以下两种情况下的行为有所不同：

### 指定了存储路径

如果通过[存储配置](/docs/configuring)指定了存储路径，那么存储与位于不同磁盘上的任何项目之间会发生复制。

如果你在驱动器 `A` 上运行 `pnpm install`，那么 pnpm 存储必须位于驱动器 `A`。如果 pnpm 存储位于驱动器 `B`，那么所有必需的包将被直接复制到项目位置，而不是被链接。这会严重削弱 pnpm 在存储和性能方面的优势。

### 未指定存储路径

如果没有设置存储路径，则会创建多个存储（每个驱动器或文件系统一个）。

如果在驱动器 `A` 上运行安装，存储将在文件系统根目录下 `A` 的 `.pnpm-store` 中创建。之后如果在驱动器 `B` 上运行安装，将在 `B` 上的 `.pnpm-store` 处创建一个独立的存储。项目仍会保持 pnpm 的优势，但每个驱动器上可能都有冗余的包。

## `pnpm` 代表什么？

`pnpm` 代表 `performant npm`。这个名字由 [@rstacruz](https://github.com/rstacruz/) 提出。

## `pnpm` 无法在 <YOUR-PROJECT-HERE> 上工作？

在大多数情况下，这意味着某个依赖需要的包未在 `package.json` 中声明。这是由扁平的 `node_modules` 引起的常见错误。如果发生这种情况，这是依赖中的一个错误，应当修复该依赖。不过这可能需要时间，因此 pnpm 支持变通方案，让有问题的包能够工作。

### 方案 1

如果出现这些问题，你可以使用 [nodeLinker: hoisted](/docs/settings/node-modules#nodelinker) 设置。这会创建一个扁平的 `node_modules` 结构，类似于 `npm` 所创建的那种。

### 方案 2

在以下示例中，某个依赖在自己的依赖列表中**没有** `iterall` 模块。

解决有问题的包缺失依赖的最简单方法，是**将 iterall 作为依赖添加到我们项目的 package.json**。

你可以通过 `pnpm add iterall` 来安装它，它会被自动添加到你项目的 `package.json`。

```json
  "dependencies": {
    ...
    "iterall": "^1.2.2",
    ...
  }
```

### 方案 3

一种解决方案是使用[钩子](/docs/pnpmfile#hooks)把缺失的依赖添加到包的 `package.json`。

一个例子是 [Webpack Dashboard](https://github.com/pnpm/pnpm/issues/1043)，它当时无法在 `pnpm` 下工作。现在已解决，它已经能在 `pnpm` 下工作了。

它过去会抛出一个错误：

```bash
Error: Cannot find module 'babel-traverse'
  at /node_modules/inspectpack@2.2.3/node_modules/inspectpack/lib/actions/parse
```

问题在于 `inspectpack` 使用了 `babel-traverse`，而 `inspectpack` 又被 `webpack-dashboard` 使用，但 `inspectpack` 的 `package.json` 中并未指定 `babel-traverse`。它在 `npm` 和 `yarn` 下仍然可用，因为它们创建扁平的 `node_modules`。

解决方案是创建一个 `.pnpmfile.mjs`，内容如下：

```js
export const hooks = {
  readPackage: (pkg) => {
    if (pkg.name === "inspectpack") {
      pkg.dependencies['babel-traverse'] = '^6.26.0';
    }
    return pkg;
  }
}
```

创建 `.pnpmfile.mjs` 后，只需删除 `pnpm-lock.yaml`——不需要删除 `node_modules`，因为 pnpm 钩子只影响模块解析。然后重新构建依赖，它应该就能工作了。
