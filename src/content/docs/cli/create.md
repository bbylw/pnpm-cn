---
title: "pnpm create"
headingIds: ["examples","options","--allow-build","security-and-trust-policies"]
---

从 `create-*` 或 `@foo/create-*` 起步模板创建项目。

## 示例

```
pnpm create react-app my-app
```

## 选项

### --allow-build

自 v10.2.0 起提供

允许在安装期间运行 postinstall 脚本的包名列表。

## 安全与信任策略

自 v11.0.0 起，`pnpm create` 在解析和拉取起步模板时会遵循项目级的安全与信任策略设置，即 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage)（及其 `Exclude`/`Strict` 伴随项）和 [trustPolicy](/docs/settings/dependency-resolution#trustpolicy)（及其 `Exclude`/`IgnoreAfter` 伴随项）。
