---
title: "pnpm logout"
headingIds: ["options", "--registry-url"]
---

自 v11.0.0 起提供

从 npm registry 登出。撤销 registry 上的认证令牌，并将其从本地认证配置文件中移除。

```bash
pnpm logout [--registry <url>]
```

`pnpm logout` 会从 [<pnpm config>/auth.ini](/docs/npmrc#auth-file-locations) 中移除令牌，也会从全局 [config.yaml](/docs/cli/config) 的 [_auth](/docs/npmrc#_auth) 设置中移除令牌——pnpm 12.1 到 12.15 把令牌写在那里。由 `.npmrc`、其他配置文件或环境变量提供的令牌会在 registry 端被撤销，但必须从该来源手动移除。

## 选项

### --registry <url>

要从中登出的 registry。默认为配置的默认 registry。
