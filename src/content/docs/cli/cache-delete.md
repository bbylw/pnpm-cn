---
title: "pnpm cache delete"
headingIds: []
---

:::warning[警告]

此命令为实验性

:::

为指定包删除元数据缓存。支持模式匹配。

```sh
pnpm cache delete [<pattern>...]
```

默认情况下，每个模式都会匹配所有 registry 中缓存的元数据。pnpm 从 pnpr registry 读取的单个版本的缓存清单会随其包一起被删除。用 `--registry` 可把删除限制在某一个 registry。被删除的文件会逐行打印。

```sh
pnpm cache delete '@babel/*'
```

:::warning[警告]

不带参数时，`pnpm cache delete` 会删除所有 registry 的全部缓存元数据文件，除非你传入 `--registry`。`v12/metadata-private` 下的按描述符划分的元数据不受影响。

:::
