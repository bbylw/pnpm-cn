---
title: "pnpm logout"
headingIds: ["options","--registry-url","--scope-scope"]
---

自 v11.0.0 起提供

从 npm registry 登出。撤销 registry 上的认证令牌，并将其从本地认证配置文件中移除。

```bash
pnpm logout [--registry <url>] [--scope <scope>]
```

如果提供了 scope，则使用与该 scope 关联的 registry。

pnpm 12.1 及更新版本会从全局 [config.yaml](/docs/cli/config) 中移除由 `pnpm login` 写入的令牌，并检查 [<pnpm config>/auth.ini](/docs/npmrc#auth-file-locations) 中由早期版本写入的令牌。由 `.npmrc`、其他配置文件或环境变量提供的令牌会在 registry 端被撤销，但必须从该来源手动移除。

## 选项

### --registry <url>

要从中登出的 registry。默认为配置的默认 registry。

### --scope <scope>

使用与给定 scope 关联的 registry。
