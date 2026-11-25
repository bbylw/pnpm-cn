---
title: "pnpm install-test"
headingIds: []
---

别名： `it`

先运行 `pnpm install`，紧接着运行 `pnpm test`。它接受的参数与 [pnpm install](/docs/cli/install) 完全相同。

`--` 之后的参数会传给 `test` 脚本：

```sh
pnpm it -- --watch
```
