---
title: "符号链接的 `node_modules` 结构"
headingIds: []
---

:::info[info]

本文只描述在没有带对等依赖的包时 pnpm 的 `node_modules` 是如何组织的。对于依赖带有对等体的更复杂场景，参见[对等依赖如何解析](/docs/how-peers-are-resolved)。

:::

pnpm 的 `node_modules` 布局使用符号链接来创建嵌套的依赖结构。

`node_modules` 中每个包的每个文件都是指向内容寻址存储的硬链接。假设你安装了依赖于 `bar@1.0.0` 的 `foo@1.0.0`。pnpm 会以如下方式将这两个包硬链接到 `node_modules`：

```
node_modules
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar
    │           ├── index.js     -> <store>/001
    │           └── package.json -> <store>/002
    └── foo@1.0.0
        └── node_modules
            └── foo
                ├── index.js     -> <store>/003
                └── package.json -> <store>/004
```

这些是 `node_modules` 中唯一“真实”的文件。一旦所有包都被硬链接到 `node_modules`，就会创建符号链接以构建嵌套的依赖图结构。

正如你可能已经注意到的，两个包都被硬链接到某个 `node_modules` 文件夹内部的一个子文件夹中（`foo@1.0.0/node_modules/foo`）。这样做是为了：

1. **允许包导入自身。** `foo` 应该能够 `require('foo/package.json')` 或 `import * as package from "foo/package.json"`。
2. **避免循环符号链接。** 包的依赖被放置于依赖它们的包所在的同一文件夹中。对 Node.js 而言，无论依赖是在包自身的 `node_modules` 中，还是在父目录的其他 `node_modules` 中，都没有区别。

安装的下一个阶段是为依赖创建符号链接。`bar` 将被符号链接到 `foo@1.0.0/node_modules` 文件夹：

```
node_modules
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar -> <store>
    └── foo@1.0.0
        └── node_modules
            ├── foo -> <store>
            └── bar -> ../../bar@1.0.0/node_modules/bar
```

接下来处理直接依赖。`foo` 将被符号链接到根 `node_modules` 文件夹，因为 `foo` 是项目的依赖：

```
node_modules
├── foo -> ./.pnpm/foo@1.0.0/node_modules/foo
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       └── bar -> <store>
    └── foo@1.0.0
        └── node_modules
            ├── foo -> <store>
            └── bar -> ../../bar@1.0.0/node_modules/bar
```

这是一个非常简单的例子。不过，无论依赖的数量和依赖图的深度如何，该布局都会保持这一结构。

让我们把 `qar@2.0.0` 添加为 `bar` 和 `foo` 的依赖。新结构看起来将是这样：

```
node_modules
├── foo -> ./.pnpm/foo@1.0.0/node_modules/foo
└── .pnpm
    ├── bar@1.0.0
    │   └── node_modules
    │       ├── bar -> <store>
    │       └── qar -> ../../qar@2.0.0/node_modules/qar
    ├── foo@1.0.0
    │   └── node_modules
    │       ├── foo -> <store>
    │       ├── bar -> ../../bar@1.0.0/node_modules/bar
    │       └── qar -> ../../qar@2.0.0/node_modules/qar
    └── qar@2.0.0
        └── node_modules
            └── qar -> <store>
```

如你所见，即使现在依赖图更深了（`foo > bar > qar`），文件系统中的目录深度仍然相同。

这种布局乍看可能有些奇怪，但它与 Node 的模块解析算法完全兼容！在解析模块时，Node 会忽略符号链接，因此当从 `foo@1.0.0/node_modules/foo/index.js` 中 require `bar` 时，Node 不会使用 `foo@1.0.0/node_modules/bar` 处的 `bar`，而是将 `bar` 解析到它的真实位置（`bar@1.0.0/node_modules/bar`）。因此，`bar` 也能解析位于 `bar@1.0.0/node_modules` 中的其依赖。

这种布局的一个额外好处是，只有真正属于依赖的包才可被访问。在扁平的 `node_modules` 结构下，所有被提升的包都可被访问。要了解更多关于这为何是一项优势的内容，参见“[pnpm 的严格性有助于避免愚蠢的 bug](https://www.kochan.io/nodejs/pnpms-strictness-helps-to-avoid-silly-bugs.html)”

不幸的是，生态中有许多包是有问题的——它们使用了未在自身 `package.json` 中列出的依赖。为尽量减少新用户遇到的问题，pnpm 默认将所有依赖提升到 `node_modules/.pnpm/node_modules`。要禁用这种提升，将 [hoist](/docs/settings/node-modules#hoist) 设为 `false`。
