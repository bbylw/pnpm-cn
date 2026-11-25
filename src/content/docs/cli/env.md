---
title: "pnpm env <cmd>"
headingIds: ["commands", "use", "remove-rm", "list-ls", "options", "--global--g"]
---

:::warning[已废弃]

`pnpm env` 已废弃。请改用 [pnpm runtime](/docs/cli/runtime)。例如，`pnpm env use --global lts` 变为 `pnpm runtime set node lts -g`，`pnpm env remove --global <version>` 变为 `pnpm remove -g node`。

:::

管理 Node.js 环境。

## 命令

### use

安装并使用指定版本的 Node.js

安装 Node.js 的 LTS 版本：

```sh
pnpm env use --global lts
```

安装 Node.js v16：

```sh
pnpm env use --global 16
```

安装 Node.js 的预发布版本：

```sh
pnpm env use --global nightly
pnpm env use --global rc
pnpm env use --global 16.0.0-rc.0
pnpm env use --global rc/14
```

安装 Node.js 的最新版本：

```sh
pnpm env use --global latest
```

使用其[代号](https://github.com/nodejs/Release/blob/main/CODENAMES.md)安装 Node.js 的 LTS 版本：

```sh
pnpm env use --global argon
```

### remove, rm

移除指定版本的 Node.js。

用法示例：

```sh
pnpm env remove --global 14.0.0
pnpm env remove --global 14.0.0 16.2.3
```

### list, ls

打印 Node.js 镜像中与给定版本范围匹配的版本。不带范围时，只打印最新版本。

```sh
pnpm env list
```

打印可用的 Node.js v16 版本：

```sh
pnpm env list 16
```

## 选项

### --global, -g

更改会全局生效。`use` 和 `remove` 需要该选项，缺少它时会以 `ERR_PNPM_NOT_IMPLEMENTED_YET` 失败。
