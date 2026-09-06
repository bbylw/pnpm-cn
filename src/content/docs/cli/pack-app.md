---
title: "pnpm pack-app"
headingIds: ["requirements","supported-targets","known-limitations","darwin-x64-binaries-crash-on-intel-macs","examples","options","--entry-path","--target--t-triplet","--runtime-spec","--output-dir--o-dir","--output-name-name","configuration"]
---

自 v11.0.0 起提供

:::warning[Experimental]

`pnpm pack-app` 处于实验阶段。其标志、`pnpm.app` 配置架构和输出布局可能会在未来版本中变更。

:::

将一个 CommonJS 入口文件打包为一个或多个目标平台的独立可执行文件，底层使用 [Node.js 单可执行文件应用](https://nodejs.org/api/single-executable-applications.html) API。

```bash
pnpm pack-app --entry <path> --target <triplet> [--target <triplet> ...]
```

每个目标在 `<output-dir>/<target>/` 下生成一个可执行文件（默认 `dist-app/<target>/`）。对于 Windows 目标，输出带有 `.exe` 后缀；macOS 输出会自动进行 ad-hoc 签名（在 macOS 主机上通过 `codesign`，在 Linux 主机上通过 `ldid`），因为 SEA 注入会使现有的代码签名失效。

## 要求

- 主机必须运行 Node.js v25.5+ 以执行 SEA 注入。如果正在运行的 Node.js 版本较旧，或与嵌入的运行时版本不匹配（SEA blob 不跨小版本兼容），pnpm 会自动下载匹配的构建器。
- 从 Linux 交叉编译 macOS 目标需要 `$PATH` 中有 [ldid](https://github.com/ProcursusTeam/ldid)。Windows 主机无法对 macOS 输出进行 ad-hoc 签名；请在 macOS 或 Linux 上构建 macOS 目标。

## 支持的目标

目标使用格式 `<os>-<arch>[-<libc>]`：

- `linux-x64`, `linux-x64-musl`, `linux-arm64`, `linux-arm64-musl`
- `darwin-x64`, `darwin-arm64`
- `win32-x64`, `win32-arm64`

`-musl` 后缀仅对 `linux` 目标有效。`<os>` 段与 `process.platform` 的取值保持一致，因此该标志与 pnpm 的 `--os` 标志以及 `pnpm-workspace.yaml` 中的 `supportedArchitectures.os` 相统一。

## 已知限制

### `darwin-x64` 二进制文件在 Intel Mac 上崩溃

由于上游 Node.js 在 `--build-sea` 注入步骤中的一个缺陷，`darwin-x64` 输出在 Intel Mac 上启动时发生段错误。LIEF 对 x64 的 Mach-O 处理在插入 SEA 段后，会使 `LC_DYLD_CHAINED_FIXUPS` 链条目指向过期目标；随后 dyld 将原始链编码值当作指针解引用，二进制文件在任何用户代码运行前就在 `__cxx_global_var_init` 中崩溃。使用标准的 `node --build-sea` + `codesign --sign -` 流程即可复现，与 pnpm 无关。

Node.js 团队已决定不修复此问题，理由是 x64 macOS 正在被淘汰。与签名相关的变通方法没有帮助：损坏发生在注入步骤，即签名*之前*，因此将 `ldid` 换成 `codesign`（或反之）没有区别。重新签名只是对已经损坏的字节生成有效签名。

Tracking:

- [nodejs/node#62893](https://github.com/nodejs/node/issues/62893) — 最简 `node --build-sea` 复现
- [nodejs/node#59553](https://github.com/nodejs/node/issues/59553) — macOS x64 上长期存在的 SEA 测试失败，根因相同
- [nodejs/node#60250](https://github.com/nodejs/node/pull/60250) — Node.js 选择在 x64 macOS 上跳过 SEA 测试而非修复它们

如果你需要交付能在 Intel Mac 上运行的 CLI，请使用非 SEA 工具（如 [@yao-pkg/pkg](https://github.com/yao-pkg/pkg)，它向二进制尾部追加数据而非修改 Mach-O 段）构建 `darwin-x64` 产物。注意 Rosetta 并*不是*逃生通道：它只把 x64 翻译为 arm64（供运行 Intel 二进制的 Apple Silicon Mac 使用），不支持反方向，因此 Intel Mac 无法运行 `darwin-arm64` 构建。

## 示例

同时构建 Linux 和 Windows 版本：

```bash
pnpm pack-app --entry dist/index.cjs --target linux-x64 --target win32-x64
```

嵌入指定的 Node.js 版本：

```bash
pnpm pack-app --entry dist/index.cjs --target linux-x64-musl --runtime node@25.5.0
```

## 选项

### --entry <path>

要嵌入可执行文件中的 CJS 入口文件路径。除非在 `package.json` 中设置了 [pnpm.app.entry](#configuration)，否则必填。也接受裸位置参数（例如 `pnpm pack-app dist/index.cjs`）。

### --target, -t <triplet>

要构建的目标。可多次指定。接受的取值参见[支持的目标](#supported-targets)。除非设置了 [pnpm.app.targets](#configuration)，否则必填。在命令行传入时，`--target` 会完全替换已配置的列表，因此你可以在调用时缩小构建范围。

### --runtime <spec>

要嵌入输出可执行文件中的运行时，以 `<name>@<version>` 形式指定（例如 `node@25`、`node@25.5.0`）。目前仅支持 `node`；`<name>@` 前缀为未来的运行时（`bun`、`deno`）留有余地。版本必须 >= v25.5（支持 `--build-sea` 的最低版本）。默认为当前运行的 Node.js 版本。

### --output-dir, -o <dir>

构建出的可执行文件的输出目录。默认为 `dist-app`。

### --output-name <name>

输出可执行文件的名称（不含扩展名）。默认为 `package.json` 中不含 scope 的 `name`（例如 `@acme/my-cli` 对应 `my-cli`）。

## 配置

每个标志的默认值都可以在 `package.json` 的 `pnpm.app` 下设置。命令行标志会覆盖配置：

package.json

```json
{
  "name": "my-cli",
  "pnpm": {
    "app": {
      "entry": "dist/index.cjs",
      "targets": [
        "linux-x64",
        "linux-arm64",
        "darwin-x64",
        "darwin-arm64",
        "win32-x64"
      ],
      "runtime": "node@25.5.0",
      "outputDir": "dist-app",
      "outputName": "my-cli"
    }
  }
}
```

完成此配置后，`pnpm pack-app` 可以在不带任何参数的情况下运行。命令行上的 `--target` 会替换已配置的 `targets` 列表，适合用于缩小构建范围（例如 `pnpm pack-app --target linux-x64`）。
