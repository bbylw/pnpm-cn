---
title: "pnpm cache view"
headingIds: []
---

:::warning[警告]

此命令为实验性功能

:::

查看指定包缓存中的信息。

```sh
pnpm cache view <pkg>
```

输出是一个以 registry URL 为键的 JSON 对象。每个条目会列出 `cachedVersions`（存储目录中存在的版本）、`nonCachedVersions`、`cachedAt` 与 `distTags`。当缓存目录不存在时，会打印 `{}`。

```sh
pnpm cache view react
```
