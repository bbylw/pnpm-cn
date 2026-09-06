---
title: "pnpm star"
headingIds: ["pnpm-unstar","pnpm-stars"]
---

自 v11.0.0 起提供

在 registry 上把一个包标记为收藏。你必须已登录（见 [pnpm login](/docs/cli/login)）。

```bash
pnpm star <pkg>
```

## pnpm unstar

从你的收藏中移除一个包

```bash
pnpm unstar <pkg>
```

## pnpm stars

列出你（或另一个用户）标为收藏的包

```bash
pnpm stars [<user>]
```

不带用户名运行时，pnpm 列出当前已认证用户标为收藏的包
