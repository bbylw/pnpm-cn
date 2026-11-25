---
title: "pnpm shim <cmd>"
headingIds: ["commands","add","rm","ls","how-a-version-is-chosen","the-shim-is-a-real-executable","related"]
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

[pnpm 预置的包管理器](/docs/package-managers)，即 `npm`、`yarn`、`bun`，无需查找：它们的 bin 事先已知，别名也包括在内（`yarn` 和 `yarnpkg`、`npm` 和 `npx`）。自 v12.11.0 起，`pnpm shim add rust` 会为 [Rust 工具链](/docs/cargo#rust-toolchain)的各个工具添加 shim：`cargo`、`cargo-clippy`、`cargo-fmt`、`clippy-driver`、`rustc`、`rustdoc` 和 `rustfmt`。对于任何其他包，bin 从该包已发布的清单读取；不发布任何 bin 的包会以 `ERR_PNPM_SHIM_NO_BINS` 失败。

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

别名： `list`

列出全局 bin 目录中的每个 shim 及其适用的策略：

```
yarn (auto): yarn, yarnpkg
```

## 版本如何选择

shim 会从当前工作目录向上查找，解析你所在的项目：

- 对于**包管理器**，项目的 [packageManager](/docs/package_json) 或 [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 锁定决定版本，并由 pnpm 预置。该锁定优先于全局安装的该包管理器，因为它是项目自己关于由谁安装它的声明。
- 对于 **Rust 工具**，最近的 `rust-toolchain.toml`（或 `rust-toolchain`）决定工具链，读取方式与 rustup 一致。pnpm 会在首次使用时把该工具链安装到存储目录，并以工具链的 `bin` 目录优先的方式运行该工具。它还会把 `RUSTUP_TOOLCHAIN` 设置为该工具链，因此 Cargo 运行的 rustup 代理（例如 `~/.cargo/bin` 中的 `cargo-clippy`）会使用同一个工具链。工具链是由 Rust 项目签名的发布版本，因此运行时不需要确认提示。在没有适用工具链文件的地方，运行的是 [`pnpm add -g rust`](/docs/cli/add#adding-the-rust-toolchain) 安装的工具链；如果连它也没有，则运行 `PATH` 上同名的下一个命令，例如 rustup 的。在最近的工具链文件属于 pnpm 交由 rustup 处理的那些场合，也会运行 `PATH` 上的下一个命令。以 rustup 的方式选择工具链的命令同样如此：`+<toolchain>` 参数、`RUSTUP_TOOLCHAIN`，或在工具链文件处或其下方的 `rustup override set` 目录覆盖。通过 `globalShims` 或 `PNPM_SHIM_BYPASS` 关闭的 Rust shim，也会运行 `PATH` 上的下一个命令。
- 对于**任何其他包**，使用项目的 `node_modules/.bin/<name>`。

如果项目中没有任何东西提供该命令，就运行全局安装的版本，shim 绝不会仅仅因为分发未生效就使命令失败。

项目感知全局 bin 的[信任规则](/docs/global-packages#trust)在这里同样适用：npm 发布的包管理器针对其确切版本用 npm 的签名验证，并无需询问就切换，而 Bun 和 Yarn 6 以校验和锁定的平台归档形式到达，会经过确认提示。该应答按项目和二进制分别记住，所以把项目的锁定改到另一个版本会再次询问。

## shim 是真正的可执行文件

自 v12.3.0 起，pnpm 写入的每个项目感知全局命令在所有平台上都是原生可执行文件：`pnpm shim add` 创建的 shim，以及 `node`、`deno` 和 `bun` 命令。在 Windows 上，这意味着生成 `<name>.exe`，而不是更早的 pnpm 12 版本所写入的 `.cmd` 与 `.ps1` 这一对文件。

实际差别在于，你的命令与命令之间不再隔着一层 shell，因此名称不是合法 shell 标识符的环境变量也能在跳转中保留下来。由更早的 pnpm 12 写入的 shim，会在下次全局安装或 `pnpm self-update` 时被替换。

## 相关

- [其他包管理器](/docs/package-managers)
- [项目感知的全局 bin](/docs/global-packages#project-aware-global-bins)
- [globalShims](/docs/settings/other#globalshims)
