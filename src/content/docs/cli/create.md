---
title: "pnpm create"
headingIds: ["examples","options","--allow-build","--shell-mode--c","--cpuname","--osname","--libcname","security-and-trust-policies"]
---

从 `create-*` 或 `@foo/create-*` 起步模板创建项目。

```sh
pnpm create <name> [<args>...]
```

名称会映射到相应的起步模板包：

| 名称 | 包 |
|------|---------|
| `foo` | `create-foo` |
| `create-foo` | `create-foo` |
| `@scope` | `@scope/create` |
| `@scope/foo` | `@scope/create-foo` |

pnpm 使用 [`pnx`](/docs/cli/pnx) 运行起步模板，并把其余参数传给它。

## 示例

```sh
pnpm create vite my-app
```

## 选项

### --allow-build

自 v10.2.0 起提供

允许在安装期间运行 postinstall 脚本的包名列表。可以重复使用该选项，或自 v12.23.0 起用逗号分隔多个名称。

### --shell-mode, -c

在 shell 中运行该命令。在 UNIX 上使用 `/bin/sh`，在 Windows 上使用 `cmd.exe`。

### --cpu=<name>

覆盖要安装的原生模块的 CPU 架构。可接受的值与 `package.json` 的 `cpu` 字段相同，来自 `process.arch`。

### --os=<name>

覆盖要安装的原生模块的操作系统。可接受的值与 `package.json` 的 `os` 字段相同，来自 `process.platform`。

### --libc=<name>

覆盖要安装的原生模块的 libc。可接受的值与 `package.json` 的 `libc` 字段相同。

## 安全与信任策略

`pnpm create` 在解析和拉取起步模板时会遵循项目级的安全与信任策略设置，包括 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage)、`minimumReleaseAgeExclude`、`minimumReleaseAgeStrict`、[trustPolicy](/docs/settings/dependency-resolution#trustpolicy)、`trustPolicyExclude` 和 `trustPolicyIgnoreAfter`。
