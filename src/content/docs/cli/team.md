---
title: "pnpm team"
headingIds: ["subcommands","create","destroy","add","rm","ls","options","--registry-urlgt","--otp-codegt","--parseable","--json"]
---

自 v11.13.0 起提供

在 registry 上管理组织团队和团队成员身份

```bash
pnpm team create <scope:team> [--otp <code>]
pnpm team destroy <scope:team> [--otp <code>]
pnpm team add <scope:team> <user> [--otp <code>]
pnpm team rm <scope:team> <user> [--otp <code>]
pnpm team ls <scope|scope:team>
```

团队引用始终以前导的 `@` 书写：组织写作 `@myorg`，其中的团队写作 `@myorg:developers`

## 子命令

### create

在一个组织中创建一个新团队

```bash
pnpm team create @myorg:developers
```

### destroy

销毁一个已存在的团队

```bash
pnpm team destroy @myorg:developers
```

### add

把一个用户添加到已存在的团队

```bash
pnpm team add @myorg:developers alice
```

### rm

把一个用户从已存在的团队中移除

```bash
pnpm team rm @myorg:developers alice
```

### ls

列出组织中的团队，或某个团队的成员

```bash
pnpm team ls @myorg
pnpm team ls @myorg:developers
```

别名：`list`。如果未给出子命令且第一个参数看起来像作用域或团队，则默认视为 `ls`，因此 `pnpm team @myorg` 等同于 `pnpm team ls @myorg`。

## 选项

### --registry <url&gt;

此次操作要使用的 npm registry 的基础 URL。为组织作用域配置的 registry（通过 [registries](/docs/settings/dependency-resolution#registries)）会被遵循。

### --otp <code&gt;

当 registry 要求双因素认证时，此选项提供一次性密码。适用于 `create`、`destroy`、`add` 和 `rm`。

### --parseable

以裸名称逐行输出 `ls` 的结果，不带表头或缩进

### --json

把 `ls` 的结果以名称的 JSON 数组输出。优先于 `--parseable`
