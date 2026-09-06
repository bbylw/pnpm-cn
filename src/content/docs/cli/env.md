---
title: "pnpm env <cmd>"
headingIds: ["commands","use","add","remove-rm","list-ls","options","--global--g"]
---

:::warning[Deprecated]

`pnpm env` 已废弃。请改用 [pnpm runtime](/docs/cli/runtime)。例如，`pnpm env use --global lts` 变为 `pnpm runtime set node lts -g`。

:::

管理 Node.js 环境。

## 命令

### use

安装并使用指定版本的 Node.js

安装 Node.js 的 LTS 版本：

```
pnpm env use --global lts
```

安装 Node.js v16：

```
pnpm env use --global 16
```

安装 Node.js 的预发布版本：

```
pnpm env use --global nightly
pnpm env use --global rc
pnpm env use --global 16.0.0-rc.0
pnpm env use --global rc/14
```

安装 Node.js 的最新版本：

```
pnpm env use --global latest
```

使用其[代号](https://github.com/nodejs/Release/blob/main/CODENAMES.md)安装 Node.js 的 LTS 版本：

```
pnpm env use --global argon
```

### add

安装指定版本的 Node.js，但不将其激活为当前版本。

Example:

```
pnpm env add --global lts 18 20.0.1
```

### remove, rm

移除指定版本的 Node.js。

用法示例：

```
pnpm env remove --global 14.0.0
pnpm env remove --global 14.0.0 16.2.3
```

### list, ls

列出本地或远程可用的 Node.js 版本。

打印本地已安装的版本：

```
pnpm env list
```

打印远程可用的 Node.js 版本：

```
pnpm env list --remote
```

打印远程可用的 Node.js v16 版本：

```
pnpm env list --remote 16
```

## 选项

### --global, -g

更改会全局生效。
