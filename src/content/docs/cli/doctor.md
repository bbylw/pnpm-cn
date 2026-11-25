---
title: "pnpm doctor"
headingIds: ["checks","versions","install-method","nodejs-on-path","script-shell","global-bin-directory","cache-directory","store-directory","filesystem","registry-connectivity","install-smoke-test","lifecycle-scripts","options","--offline","--benchmark","--json"]
---

自 v11.14.0 起提供

对 pnpm 安装及其运行环境进行诊断。

```sh
pnpm doctor [--offline] [--benchmark] [--json]
```

每项检查都会报告如何修复其发现的问题，当任何检查失败时该命令以非零代码退出。警告不会导致命令失败。

```text
✓ Versions: pnpm 12.3.4, Node.js 22.20.0
✓ Install method: pnpm
✓ Node.js on PATH: /Users/example/.local/share/fnm/node-versions/v22.20.0/installation/bin/node
✓ Script shell: scripts run in /bin/sh (/bin/bash), package executables in /bin/sh (/bin/bash)
✓ Global bin directory: /Users/example/Library/pnpm/bin
✓ Cache directory: /Users/example/Library/Caches/pnpm
✓ Store directory: /Users/example/Library/pnpm/store/v11
✓ Filesystem: available: reflink, hardlink, symlink
✓ Registry connectivity: https://registry.npmjs.org/ (128ms)
✓ Install smoke test: offline "file:" install linked its dependency
✓ Lifecycle scripts: an install script ran /Users/example/.local/share/fnm/node-versions/v22.20.0/installation/bin/node, a script in /Users/example/my-project ran /Users/example/.local/share/fnm/node-versions/v22.20.0/installation/bin/node

All checks passed
```

## 检查项

### 版本

报告正在运行的 pnpm 和 Node.js 版本。

### 安装方式

报告 `pnpm` 这一安装方式，并在 pnpm 由 Corepack 运行时发出警告，因为 Corepack 自行管理 pnpm 版本并导致 `pnpm self-update` 不可用。

当 `PATH` 上找到的 `pnpm` 与全局 bin 目录中的那一个不同时，也会发出警告。这通常是因为另一个安装器（如 npm、Homebrew、Volta 或 Scoop）安装的副本在 `PATH` 中排在更前面。警告信息会指出那个副本。如果 pnpm 能够识别该安装器，它会给出移除该副本的命令；否则会给出把全局 bin 目录放到前面的 `PATH` 修改方式。

### PATH 上的 Node.js

自 v12.23.0 起提供

按查找顺序列出 pnpm 运行时 `PATH` 上的 `node` 可执行文件。生命周期脚本会运行其中的第一个，除非 pnpm 放在它们前面的某个目录（例如 `node_modules/.bin`）自带 `node`。pnpm 本身不需要 Node.js，但 `node_modules/.bin` 中运行 JavaScript 的可执行文件需要。

当 `PATH` 上没有 `node` 时会发出警告；当某个 `node` 条目因为是断链、不可执行或不是文件而被跳过时也会发出警告。版本管理器在脚本运行期间重新链接 `node` 时，可能留下这样的条目。

### 脚本 shell

自 v12.23.0 起提供

报告运行脚本所用的 shell：[`scriptShell`](/docs/settings/other#scriptshell)、内置的 shell 模拟器，或者 `sh`。在 Windows 之外，它还会报告 `/bin/sh` 究竟是什么，因为 `/bin/sh` 会启动 `node_modules/.bin` 中的每个可执行文件。在 macOS 上，它就是 `/private/var/select/sh` 所链接的那个 shell。

当运行脚本的 shell 找不到时，该检查失败。

### 全局 bin 目录

检查 pnpm 链接全局可执行文件所在的目录是否在 `PATH` 中且可写。如果它不在 `PATH` 中，修复方法是运行 [pnpm setup](/docs/cli/setup)。

### 缓存目录

检查[缓存目录](/docs/settings/other#cachedir)是否可写。

### 存储目录

检查[存储目录](/docs/settings/store#storedir)是否可写。未配置存储目录时，该检查会针对默认存储目录运行。

### 文件系统

探测从存储所在卷可用的链接策略：引用链接（写时复制）、硬链接和符号链接。这决定了包如何落到 `node_modules` 中以及安装有多快，引用链接或硬链接几乎零开销，而普通复制则不然。

如果引用链接和硬链接都不起作用，该检查会警告安装将退回到复制，并建议将存储放在与你的项目相同的文件系统上。

### registry 连通性

以 15 秒超时 ping 所配置的 registry 并报告往返时间。如果无法访问 registry 或它返回错误状态，则判定失败，这通常指向网络、代理或认证配置问题。

使用 `--offline` 时跳过。

### 安装冒烟测试

在临时目录中完全离线地将一个一次性包作为 `file:` 依赖安装。这会端到端地演练解析、存储和链接路径，并确认正在运行的二进制文件确实能执行安装。

此检查从设计上就始终是离线的，因此 `--offline` 不会跳过它。

### 生命周期脚本

自 v12.23.0 起提供

安装一个临时项目，其 `postinstall` 脚本会调用某个依赖的可执行文件，并使用所配置的脚本 shell 来运行。随后在当前项目中通过 `pnpm exec` 运行同一个可执行文件（如果存在的话）。两者都要经过该可执行文件的 `node_modules/.bin` shim，而 shim 必须在 `PATH` 上找到 `node`。该检查会报告每次运行各自使用的 `node`。

如果某次运行失败，报告中会包含错误信息；在 Windows 之外还会包含 shim 的一段 `sh -x` 跟踪输出结尾。跟踪信息会显示 shim 搜索过的 `PATH` 以及它所运行的命令。shim 找不到 `node` 是脚本以退出状态 127 失败的最常见原因。

在当前项目中的那次运行会经过 `pnpm exec`，因此项目的 pnpmfile 和 `nodeOptions` 会像对 `pnpm exec` 一样对它生效。命令行传给 `pnpm doctor` 的设置也同样生效。它不会安装项目的依赖。使用 `--offline` 时，它也会离线运行。当 `PATH` 上没有 `node` 时，整个检查会被跳过。

## 选项

### --offline

跳过需要网络访问的检查。

### --benchmark

同时对文件系统、安装以及生命周期脚本的检查计时，并在每个结果旁报告耗时。

### --json

以 JSON 报告结果。输出是一个包含单个 `checks` 数组的对象，每个条目都有 `title`、`status`（`pass`、`warn` 或 `fail`），以及可选的 `detail`、`fix` 和 `durationMs`。

```json
{
  "checks": [
    {
      "title": "Filesystem",
      "status": "pass",
      "detail": "available: reflink, hardlink, symlink",
      "durationMs": 3
    }
  ]
}
```
