---
title: "pnpm unpublish"
headingIds: ["examples","options","--force","--registry-url","--otp-code"]
---

自 v11.0.0 起提供

从 registry 移除一个已发布的包版本

```sh
pnpm unpublish <pkg>[@<version>] [--force]
```

:::warning[警告]

通常不建议取消发布。大多数 registry（包括公开的 npm registry）都限制何时以及如何取消发布包。尽可能优先使用 [pnpm deprecate](/docs/cli/deprecate)。

:::

## 示例

取消发布特定版本：

```sh
pnpm unpublish foo@1.0.0
```

使用 semver 说明符取消发布一个版本范围：

```sh
pnpm unpublish "foo@<2"
```

如果被移除的版本持有 `latest` 标签，pnpm 会把该标签移到剩余的最高稳定版本上。如果只剩下预发布版本，则会选中最高的那个预发布版本。

取消发布整个包（所有版本）。需要 `--force`：

```sh
pnpm unpublish foo --force
```

包名是必需的。不提供包名时，命令会以 `ERR_PNPM_UNPUBLISH_REQUIRED` 失败。

## 选项

### --force

当移除整个包（所有版本）而非特定版本或范围时必需。匹配所有已发布版本的范围，同样视为移除整个包。不加 `--force` 时，命令会以 `ERR_PNPM_UNPUBLISH_CONFIRM` 失败。

如果 registry 不允许移除整个包，命令会以 `ERR_PNPM_UNPUBLISH_FORBIDDEN` 失败。请改为废弃该包。

### --registry <url>

要从中移除该包的 registry。默认为该包所配置的 registry

### --otp <code>

当 registry 要求双因素认证时，通过此选项提供一次性密码。
