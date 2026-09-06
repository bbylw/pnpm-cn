---
title: "pnpm unpublish"
headingIds: ["examples","options","--force","--registry-url","--otp-code"]
---

自 v11.0.0 起提供

从 registry 移除一个已发布的包版本

```bash
pnpm unpublish [<pkg>[@<version>]] [--force]
```

:::warning[warning]

通常不建议取消发布。大多数 registry（包括公开的 npm registry）都限制何时以及如何取消发布包。尽可能优先使用 [pnpm deprecate](/docs/cli/deprecate)。

:::

## 示例

取消发布特定版本：

```bash
pnpm unpublish foo@1.0.0
```

使用 semver 说明符取消发布一个版本范围：

```bash
pnpm unpublish "foo@<2"
```

取消发布整个包（所有版本）。需要 `--force`：

```bash
pnpm unpublish foo --force
```

在包目录内不带参数运行时，pnpm 会取消发布从本地 `package.json` 读取的当前包版本。

## 选项

### --force

当移除整个包（所有版本）而非特定版本或范围时必需

### --registry <url>

要发布到的 registry。默认为该包所配置的 registry

### --otp <code>

当 registry 要求双因素认证时，通过此标志或 `PNPM_CONFIG_OTP` 环境变量提供一次性密码。
