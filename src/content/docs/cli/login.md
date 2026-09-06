---
title: "pnpm login"
headingIds: ["options","--registry-url","--scope-scope"]
---

自 v11.0.0 起提供

别名： `adduser`

向 npm registry 进行身份验证。

```bash
pnpm login [--registry <url>] [--scope <scope>]
```

支持带二维码的网页登录，也支持经典的用户名/密码认证。

自 v11.19.0 起，网页登录不再需要交互式终端：没有 TTY 时，`pnpm login` 会打印认证 URL（跳过二维码和在浏览器中打开 URL 的提示），并轮询 registry 直到浏览器审批完成。只有经典用户名/密码登录在非交互式终端中仍会以 `ERR_PNPM_LOGIN_NON_INTERACTIVE` 失败。

在 pnpm 12.1 及更新版本中，授予的 token 会写入全局 [config.yaml](/docs/cli/config)，位于结构化的 [_auth](/docs/npmrc#_auth) 设置下。当存在 `--scope` 时，同样的写入会在全局 [registries](/docs/registries) 设置下将该 scope 路由到对应 registry。pnpm 11.25 会把 token 和 scope 路由写入 [<pnpm config>/auth.ini](/docs/npmrc#auth-file-locations)；pnpm 12.1 仍会读取写入那里的 token。

## 选项

### --registry <url>

要认证的目标 registry。默认为配置的默认 registry。

### --scope <scope>

将凭据与指定 scope 关联。将使用该 scope 对应的 registry。

自 v12.1.0 起，项目 `pnpm-workspace.yaml` 中的 `scope` 设置会被忽略并发出警告。仓库不应能够决定后续登录写入的机器级路由。传入 `--scope`、设置 `PNPM_CONFIG_SCOPE`，或使用以下方式设置机器的默认值：

```bash
pnpm config set --global scope @acme
```
