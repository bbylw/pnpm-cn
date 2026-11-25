---
title: "pnpm cat-index"
headingIds: []
---

从存储中打印特定包的索引文件。该包通过名称和版本指定：

```bash
pnpm cat-index <pkg name>@<pkg version>
```

输出是 JSON，列出该包的每个文件及其 `digest`、`mode` 与 `size`。要找出哪些包包含某个文件，把它的哈希值传给 [`pnpm find-hash`](/docs/cli/find-hash)。
