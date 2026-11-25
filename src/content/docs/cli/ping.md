---
title: "pnpm ping"
headingIds: ["options","--registry-url"]
---

自 v11.0.0 起提供

Ping 配置的 registry 以验证连通性。

```sh
pnpm ping [--registry <url>]
```

成功时，pnpm 会打印 registry 的 URL 和往返耗时：

```text
PING https://registry.npmjs.org/
PONG 120ms
```

如果 registry 返回的是非空 JSON 对象或数组，pnpm 会在另外一行 `PONG` 上打印它。如果请求失败，命令会以 `ERR_PNPM_PING_ERROR` 失败。

这适合用于在不安装或发布任何内容的前提下，快速确认当前机器可以访问 registry。

## 选项

### --registry <url>

要 ping 的 registry。默认为配置的默认 registry。
