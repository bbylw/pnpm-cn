---
title: "pnpm runtime <cmd>"
headingIds: ["commands","set","supported-runtimes","examples","options","--global--g","--save-dev--d","--save-prod--p"]
---

管理运行时。

别名： `rt`

## 命令

### set

安装指定版本的运行时。

```sh
pnpm runtime set <name> <version> [-g]
```

不带 `-g` 时，运行时会以 `<name>@runtime:<version>` 的形式添加到当前项目。默认写入 [`devEngines.runtime`](/docs/package_json#devenginesruntime)；使用 `--save-prod` 时则写入 `engines.runtime`。

安装完成后，pnpm 会提示你运行 [`pnpm shim add <name>`](/docs/cli/shim)，以便直接使用该命令时命中项目的运行时。

#### 支持的运行时

- `node` - Node.js
- `deno` - Deno
- `bun` - Bun

:::info[信息]

安装 Node.js 运行时（通过 `pnpm runtime set node …` 或 `node@runtime:<version>`）不会安装 Node.js 归档中自带的 `npm`、`npx` 和 `corepack`。如果你需要 `npm`，用 `pnpm add -g npm` 单独安装。

:::

:::info[信息]

Node.js 版本的发布元数据在签名验证通过后会被缓存到[缓存目录](/docs/cli/cache-path)。元数据只获取过一次的被锁定运行时，无需联网即可解析。

:::

#### 示例

全局安装 Node.js v22：

```sh
pnpm runtime set node 22 -g
```

安装 Node.js 的 LTS 版本：

```sh
pnpm runtime set node lts -g
```

安装 Node.js 的最新稳定版本：

```sh
pnpm runtime set node latest -g
```

安装 Node.js 的预发布版本：

```sh
pnpm runtime set node nightly -g
pnpm runtime set node rc -g
pnpm runtime set node rc/22 -g
pnpm runtime set node 22.0.0-rc.4 -g
```

使用[代号](https://github.com/nodejs/Release/blob/main/CODENAMES.md)安装 Node.js 的 LTS 版本：

```sh
pnpm runtime set node argon -g
```

安装 Deno：

```sh
pnpm runtime set deno 2 -g
```

安装 Bun：

```sh
pnpm runtime set bun latest -g
```

## 选项

### --global, -g

全局安装该运行时。

### --save-dev, -D

将运行时保存到 `devEngines.runtime`。这是默认行为。

### --save-prod, -P

将运行时保存到 `engines.runtime`。
