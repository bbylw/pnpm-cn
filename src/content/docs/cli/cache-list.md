---
title: "pnpm cache list"
headingIds: []
---

:::warning[警告]

此命令为实验性

:::

列出可用的包元数据缓存。支持按 glob 过滤。

```sh
pnpm cache list [<pattern>...]
```

该命令会在元数据目录中按当前解析模式搜索所有 registry。传入 `--registry` 可只搜索某个 registry。每个匹配项都会单独打印一行，路径相对于该目录，格式为 `<registry-key>/<名称>.jsonl`。不带参数时会列出其中每个包。

```sh
pnpm cache list 'react*'
```
