---
title: "pnpm star"
headingIds: ["pnpm-unstar","pnpm-stars","options","--registry-url"]
---

自 v11.0.0 起提供

在 registry 上把一个包标记为收藏。你必须已登录（见 [pnpm login](/docs/cli/login)）。没有凭据时，`star` 和 `unstar` 会以 `ERR_PNPM_STAR_UNAUTHORIZED` 失败，`stars` 会以 `ERR_PNPM_STARS_UNAUTHORIZED` 失败。未知的包会以 `ERR_PNPM_PACKAGE_NOT_FOUND` 失败。

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

## 选项

### --registry <url>

要使用的 registry。默认为配置的默认 registry。`star`、`unstar` 和 `stars` 均接受该选项。
