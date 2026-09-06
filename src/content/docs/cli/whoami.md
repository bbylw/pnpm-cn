---
title: "pnpm whoami"
headingIds: ["options","--registry-url"]
---

自 v11.0.0 起提供

打印与当前 registry 凭据关联的用户名。

```bash
pnpm whoami [--registry <url>]
```

如果未登录，命令将以错误退出。先使用 [pnpm login](/docs/cli/login) 进行身份验证。

## 选项

### --registry <url>

要检查的 registry。默认使用配置的默认 registry。
