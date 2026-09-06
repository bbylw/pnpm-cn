---
title: "pnpm runtime <cmd>"
headingIds: ["commands","set","supported-runtimes","examples","options","--global--g"]
---

管理运行时。

Alias: `rt`

## 命令

### set

安装指定版本的运行时。

```
pnpm runtime set <name> <version> [-g]
```

#### 支持的运行时

- `node` - Node.js
- `deno` - Deno
- `bun` - Bun

:::info[info]

自 v11.0.0 起，安装 Node.js 运行时（通过 `pnpm runtime set node …` 或 `node@runtime:<version>`）时，不会从 Node.js 归档中提取自带的 `npm`、`npx` 和 `corepack`。这使运行时安装期间 pnpm 需要计算哈希、写入内容寻址存储并建立链接的文件数大约减半。如果你仍需要 `npm`，用 `pnpm add -g npm` 单独安装。

:::

:::info[info]

自 v11.22.0 起，解析 Node.js 版本（通过 [devEngines.runtime](/docs/package_json#devenginesruntime) 或 `runtime:` 说明符）快了很多。每个版本的发布元数据在签名验证通过后会被缓存到[缓存目录](/docs/cli/cache-path)，形如 `runtime:22.23.2` 的精确稳定版本不再下载 Node.js 发布索引。对于已获取过一次元数据的被锁定运行时，解析完全无需联网，从而消除了锁定已下载运行时的项目中首次调用 `node` 的延迟。

:::

#### 示例

全局安装 Node.js v22：

```
pnpm runtime set node 22 -g
```

安装 Node.js 的 LTS 版本：

```
pnpm runtime set node lts -g
```

安装 Node.js 的最新版本：

```
pnpm runtime set node latest -g
```

安装 Node.js 的预发布版本：

```
pnpm runtime set node nightly -g
pnpm runtime set node rc -g
pnpm runtime set node rc/22 -g
pnpm runtime set node 22.0.0-rc.4 -g
```

使用[代号](https://github.com/nodejs/Release/blob/main/CODENAMES.md)安装 Node.js 的 LTS 版本：

```
pnpm runtime set node argon -g
```

安装 Deno：

```
pnpm runtime set deno 2 -g
```

安装 Bun：

```
pnpm runtime set bun latest -g
```

## 选项

### --global, -g

全局安装运行时。
