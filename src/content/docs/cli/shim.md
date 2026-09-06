---
title: "pnpm shim <cmd>"
headingIds: ["commands","add","rm","ls","how-a-version-is-chosen","related"]
---

自 v12.0.0-rc.6 起提供（仅 pnpm v12）

管理项目感知的命令 shim

此命令创建的 shim 背后没有全局安装。它的存在只是为了让你所在的项目决定运行什么：`pnpm shim add yarn` 会链接一个 `yarn` 命令，运行当前项目所锁定的版本，并按需预置该版本。在一台只有 pnpm 的机器上，正是它让 `yarn` 在 Yarn 项目里可用。

创建 shim 始终是有意为之，不会作为 [pnpm setup](/docs/cli/setup) 或安装的副作用自动写入，因为 shim 会遮蔽你的 `PATH` 在此之前解析到的任何内容。

## 命令

### add

```
pnpm shim add <pkg>...
```

把每个包的每个 bin 的 shim 链接到全局 bin 目录（`pnpm bin -g`），并在 [globalShims](/docs/settings/other#globalshims) 设置中记录该包，以便这些 shim 真正分发命令。

```bash
pnpm shim add yarn
```

[pnpm 预置的包管理器](/docs/package-managers)，即 `npm`、`yarn`、`bun`，无需查找：它们的 bin 事先已知，别名也包括在内（`yarn` 和 `yarnpkg`、`npm` 和 `npx`）。对于任何其他包，bin 从该包已发布的清单读取；不发布任何 bin 的包会以 `ERR_PNPM_SHIM_NO_BINS` 失败。

全局 bin 目录中已存在的某个 bin 属于别的东西，可能是某个全局安装的包，也可能是另一个包的 shim，因此命令会以 `ERR_PNPM_SHIM_BIN_CONFLICT` 拒绝，而不是拿走一个能用的命令。

在设置了 `globalShims: false` 时添加 shim 会以 `ERR_PNPM_SHIMS_DISABLED` 失败：该设置关闭所有项目感知的 shim，否则 shim 会待在 `PATH` 上什么也不做。

### rm

```
pnpm shim rm <pkg>...
```

别名： `remove`, `uninstall`

移除该包的 shim 以及 `add` 为其记录的 `globalShims` 条目

### ls

```
pnpm shim ls
```

Alias: `list`

列出全局 bin 目录中的每个 shim 及其适用的策略：

```
yarn (auto): yarn, yarnpkg
```

## 版本如何选择

shim 会从当前工作目录向上查找，解析你所在的项目：

- 对于**包管理器**，项目的 [packageManager](/docs/package_json) 或 [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 锁定决定版本，并由 pnpm 预置。该锁定优先于全局安装的该包管理器，因为它是项目自己关于由谁安装它的声明。
- 对于**任何其他包**，使用项目的 `node_modules/.bin/<name>`。

如果项目中没有任何东西提供该命令，就运行全局安装的版本，shim 绝不会仅仅因为分发未生效就使命令失败。

项目感知全局 bin 的[信任规则](/docs/global-packages#trust)在这里同样适用：npm 发布的包管理器针对其确切版本用 npm 的签名验证，并无需询问就切换，而 Bun 和 Yarn 6 以校验和锁定的平台归档形式到达，会经过确认提示。该应答按项目和二进制分别记住，所以把项目的锁定改到另一个版本会再次询问。

## 相关

- [Other package managers](/docs/package-managers)
- [Project-aware global bins](/docs/global-packages#project-aware-global-bins)
- [globalShims](/docs/settings/other#globalshims)
