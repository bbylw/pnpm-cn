---
title: "pnpm cache list-registries"
headingIds: []
---

:::warning[警告]

此命令为实验性

:::

列出所有在本地拥有其元数据缓存的 registry，每行一个 URL：

```text
https://registry.npmjs.org/
https://npm.example.com:8443/team-a/
```

元数据缓存以 registry 的完整 URL 为键，包含其路径与协议。同一主机下不同路径提供的两个 registry 不共享缓存元数据，通过 HTTP 获取的元数据也绝不会被用于 HTTPS。
