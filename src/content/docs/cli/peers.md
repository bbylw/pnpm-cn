---
title: "pnpm peers"
headingIds: ["commands","check","options","--global--g","--json","--lockfile-only","--recursive--r"]
---

通过读取锁文件检查未满足和缺失的对等依赖问题。如果 `node_modules` 中存在上次安装的锁文件，pnpm 会读取它，否则读取 `pnpm-lock.yaml`。

## 命令

### check

```sh
pnpm peers check
```

报告存在未解析或不兼容对等依赖的包。直接运行 `pnpm peers` 等同于运行 `check`。

当发现未解析或不兼容的对等依赖时，该命令以退出码 1 结束。

当 `autoInstallPeers: false` 且 `dedupePeerDependents: true` 时，命令还会警告那些已解析、但项目和它的依赖祖先都没有声明的必需对等依赖。启用 `resolvePeersFromWorkspaceRoot` 时，工作区根项目的依赖也视为提供方。可选对等依赖不会产生此类警告。

这些警告描述的是项目自身的声明情况，即使某个依赖自带了该对等依赖的兜底副本也是如此。警告仅供参考，不会改变退出码，也不会导致 `strictPeerDependencies` 失败。如果项目的脚本用到该对等依赖，请直接声明它。JSON 输出会在每个项目的 `undeclared` 数组中包含这些警告。

## 选项

### --global, -g

检查全局安装的包中的对等依赖问题。

### --json

以 JSON 格式输出问题。

### --lockfile-only

即使 `node_modules` 中保存着上次安装的锁文件，也始终读取 `pnpm-lock.yaml`。

### --recursive, -r

检查每个工作区项目。可以与 [`--filter`](/docs/filtering) 结合使用，以选择要检查的项目。
