---
title: "pnpm access"
headingIds: ["subcommands","list-packages","list-collaborators","get-status","set-status","set-mfa","grant","revoke","options","--registry-urlgt","--json","--otp-codegt"]
---

自 v11.11.0 起提供

管理包在 registry 上的访问权限与可见性。

```bash
pnpm access list packages [<user>|<scope>|<scope:team>]
pnpm access list collaborators <package> [<user>]
pnpm access get status <package>
pnpm access set status=public|private <package>
pnpm access set mfa=none|publish|automation <package>
pnpm access grant <read-only|read-write> <scope:team> <package>
pnpm access revoke <scope:team> <package>
```

## 子命令

### list packages

列出某个用户、scope 或团队可以访问的包。不带参数时，列出你自己的包。

```bash
pnpm access list packages
pnpm access list packages alice
pnpm access list packages @myorg
pnpm access list packages @myorg:developers
```

参数的类型根据其形式推断：包含 `:` 的值是团队，以 `@` 开头的值是组织，其他值都是用户。

`ls` 可作为别名使用，因此 `pnpm access ls` 等同于 `pnpm access list packages`。

### list collaborators

列出某个包上的协作者，可选地过滤到单个用户。

```bash
pnpm access list collaborators @myorg/pkg
pnpm access list collaborators @myorg/pkg alice
```

### get status

显示某个包是公开还是受限。

```bash
pnpm access get status @myorg/pkg
```

### set status

设置包的可见性。

```bash
pnpm access set status=public @myorg/pkg
pnpm access set status=private @myorg/pkg
```

只有带 scope 的包可以更改可见性。不带 scope 的包始终公开，尝试更改会失败并报 `ERR_PNPM_ACCESS_SET_STATUS_UNSCOPED`。

### set mfa

设置发布某个包时的双因素认证要求。

```bash
pnpm access set mfa=none @myorg/pkg
pnpm access set mfa=publish @myorg/pkg
pnpm access set mfa=automation @myorg/pkg
```

`none` 关闭该要求，而 `publish` 和 `automation` 都要求发布时进行双因素认证。

### grant

授予团队对某个包的只读或读写访问权限。

```bash
pnpm access grant read-only @myorg:developers @myorg/pkg
pnpm access grant read-write @myorg:developers @myorg/pkg
```

### revoke

撤销团队对某个包的访问权限。

```bash
pnpm access revoke @myorg:developers @myorg/pkg
```

## 选项

### --registry <url&gt;

此操作使用的 npm registry 的基础 URL。被修改的包会遵循按 scope 及具名 registry 的配置（通过 [registries](/docs/settings/dependency-resolution#registries) 和 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 配置）。

### --json

以 JSON 格式输出结果。适用于 `list packages`、`list collaborators` 和 `get status`。

### --otp <code&gt;

当 registry 要求双因素认证时，此选项提供一次性密码。它适用于会修改状态的子命令：`set status`、`set mfa`、`grant` 和 `revoke`。
