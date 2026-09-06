---
title: "pnpm owner"
headingIds: ["commands","ls","add","rm","options","--registry-url","--otp-otp"]
---

自 v11.1.0 起提供

别名： `owners`

管理 registry 上的包所有者。

## 命令

### ls

```bash
pnpm owner ls <package>
```

别名： `list`

列出一个包的所有所有者。未给出其他子命令时，这是默认子命令。

### add

```bash
pnpm owner add <package> <user>
```

添加用户为包的所有者。需要认证。

### rm

```bash
pnpm owner rm <package> <user>
```

将用户从包的所有者列表中移除。需要认证。

## 选项

### --registry <url>

此操作使用的 npm registry 基础 URL。对于被修改的包，会遵循按 scope 配置的 registry 和命名 registry（分别通过 [registries](/docs/settings/dependency-resolution#registries) 和 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 配置）。

### --otp <otp>

当 registry 要求双因素认证时，此选项提供一次性密码。
