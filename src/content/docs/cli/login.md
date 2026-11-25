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

自 v12.13.0 起，网页登录会在认证 URL 之前先打印 registry 的 `npm-notice` 消息。有些 registry 用它们来显示一个需要你在浏览器中确认的验证码。

授予的 token 会写入 [<pnpm config>/auth.ini](/docs/npmrc#auth-file-locations)。自 v12.1.0 起，`--scope` 还会将该 scope 路由到全局 [config.yaml](/docs/cli/config) 中的 [registries](/docs/registries) 设置下对应的 registry。

从 v12.1.0 到 v12.15.0，token 会被写入全局 `config.yaml` 的 [_auth](/docs/npmrc#_auth) 设置。在那里，无 scope 的 token 还会把它的 registry 变成默认 registry。自 v12.16.0 起，登录会从 `_auth` 中移除它所替换的那个 token。

## 选项

### --registry <url>

要认证的目标 registry。默认为配置的默认 registry。

### --scope <scope>

将凭据与指定 scope 关联。将使用该 scope 对应的 registry。

自 v12.1.0 起，项目 `pnpm-workspace.yaml` 中的 `scope` 设置会被忽略并发出警告。仓库不应能够决定后续登录写入的机器级路由。传入 `--scope`、设置 `PNPM_CONFIG_SCOPE`，或使用以下方式设置机器的默认值：

```bash
pnpm config set --global scope @acme
```
