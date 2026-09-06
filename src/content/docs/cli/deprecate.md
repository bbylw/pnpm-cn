---
title: "pnpm deprecate"
headingIds: ["examples","options","--registry-url","--otp-code","pnpm-undeprecate"]
---

自 v11.0.0 起提供

为已发布的包版本设置一条废弃消息。运行 `pnpm install` 的使用者在安装到匹配版本时会看到此消息。

```bash
pnpm deprecate <pkg>[@<version-range>] <message>
```

要清除废弃消息，请使用 [pnpm undeprecate](#pnpm-undeprecate) 或传入一个空字符串：

```bash
pnpm deprecate foo@1.0.0 ""
```

## 示例

标记废弃单个版本：

```bash
pnpm deprecate foo@1.0.0 "Use foo@2 instead"
```

标记废弃某个范围内的版本：

```bash
pnpm deprecate "foo@<2" "Please upgrade to foo@2"
```

标记废弃所有版本：

```bash
pnpm deprecate foo "This package is no longer maintained"
```

## 选项

### --registry <url>

要发布到的 registry。默认为该包所配置的 registry。

### --otp <code>

当 registry 要求双因素认证时，通过此标志或 `PNPM_CONFIG_OTP` 环境变量提供一次性密码。

## pnpm undeprecate

从某个包版本移除废弃消息。等同于运行 `pnpm deprecate <pkg>[@<version-range>] ""`。

```bash
pnpm undeprecate <pkg>[@<version-range>]
```
