---
title: "pnpm dist-tag"
headingIds: ["subcommands","add-pkgversion-tag","rm-pkg-tag","ls-pkg","options","--registry-url","--otp-code"]
---

自 v11.0.0 起提供

管理某个包的分发标签。dist-tag 提供人类可读的别名（如 `latest`、`next`、`beta`），指向 registry 上特定的包版本。

```bash
pnpm dist-tag add <pkg>@<version> [<tag>]
pnpm dist-tag rm <pkg> <tag>
pnpm dist-tag ls [<pkg>]
```

## 子命令

### add <pkg>@<version> [<tag>]

用 dist-tag 为包的指定版本打标签。如果省略 `<tag>`，则使用 [tag](/docs/settings/other#tag) 设置的值（默认为 `latest`）。

```bash
pnpm dist-tag add foo@1.2.0 next
```

### rm <pkg> <tag>

从某个包移除一个 dist-tag。

```bash
pnpm dist-tag rm foo next
```

### ls [<pkg>]

列出某个包的所有 dist-tag。如果未给出包名，则显示当前包的 dist-tag（从本地 `package.json` 读取）。

```bash
pnpm dist-tag ls foo
```

## 选项

### --registry <url>

要操作的 registry。默认为该包所配置的 registry。

### --otp <code>

当 registry 要求双因素认证时，通过此标志或 `PNPM_CONFIG_OTP` 环境变量提供一次性密码。
