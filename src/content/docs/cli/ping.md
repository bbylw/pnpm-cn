---
title: "pnpm ping"
headingIds: ["options","--registry-url"]
---

自 v11.0.0 起提供

Ping 配置的 registry 以验证连通性。

```bash
pnpm ping [--registry <url>]
```

成功时打印 registry 的响应。这适合用于在不安装或发布任何内容的前提下，快速确认当前机器可以访问 registry。

## 选项

### --registry <url>

要 ping 的 registry。默认为配置的默认 registry。
