---
title: "pnpm token"
headingIds: ["commands","list","revoke","create","options","--registry-url","--json","-p---parseable","--read-only","--cidr-cidr","--otp-otp"]
---

自 v12.13.0 起提供

管理所配置 registry 上的认证令牌。

## 命令

### list

```sh
pnpm token list
```

别名：`ls`

列出已认证账户的所有认证令牌。不指定子命令时，默认使用该子命令。

### revoke

```sh
pnpm token revoke <id|token...>
```

别名：`rm`、`delete`、`remove`

按密钥、ID 前缀或令牌值吊销一个或多个认证令牌。

匹配到多个令牌的 ID 前缀会报 `ERR_PNPM_TOKEN_AMBIGUOUS` 失败；未匹配到任何令牌的会报 `ERR_PNPM_TOKEN_NOT_FOUND` 失败。没有凭据时，该命令会以 `ERR_PNPM_TOKEN_UNAUTHORIZED` 失败。

### create

```sh
pnpm token create [--read-only] [--cidr <cidr>]
```

创建一个新的认证令牌。pnpm 会询问你的账户密码。如果标准输入不是终端，pnpm 会从第一行读取密码。

## 选项

### --registry <url>

npm registry 的基础 URL。

### --json

以 JSON 格式输出结果。

### -p, --parseable

以制表符分隔的表格格式输出结果。

### --read-only

将新建的令牌标记为只读。

### --cidr <cidr>

把新建的令牌限制在特定的 CIDR 地址范围内。多个范围用逗号分隔，或重复使用该选项：

```sh
pnpm token create --cidr 192.0.2.0/24,198.51.100.0/24
```

### --otp <otp>

要求双因素认证的 registry 所用的一次性密码。
