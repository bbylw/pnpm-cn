---
title: "pnpm doctor"
headingIds: ["checks","versions","install-method","global-bin-directory","cache-directory","store-directory","filesystem","registry-connectivity","install-smoke-test","options","--offline","--benchmark","--json"]
---

自 v11.14.0 起提供

对 pnpm 安装及其运行环境进行诊断。

```bash
pnpm doctor [--offline] [--benchmark] [--json]
```

每项检查都会报告如何修复其发现的问题，当任何检查失败时该命令以非零代码退出。警告不会导致命令失败。

```
✓ Versions: pnpm 12.3.4, Node.js 22.20.0
✓ Install method: pnpm
✓ Global bin directory: /Users/example/Library/pnpm/bin
✓ Cache directory: /Users/example/Library/Caches/pnpm
✓ Store directory: /Users/example/Library/pnpm/store/v10
✓ Filesystem: available: reflink, hardlink, symlink
✓ Registry connectivity: https://registry.npmjs.org/ (128ms)
✓ Install smoke test: offline "file:" install linked its dependency

All checks passed
```

## 检查项

### 版本

报告正在运行的 pnpm 和 Node.js 版本。

### 安装方式

报告 pnpm 的安装方式，即作为 `pnpm` 包还是 `@pnpm/exe` 独立构建；并在 pnpm 由 Corepack 运行时发出警告，因为 Corepack 自行管理 pnpm 版本并导致 `pnpm self-update` 不可用。

### 全局 bin 目录

检查 pnpm 链接全局可执行文件所在的目录是否在 `PATH` 中且可写。如果它不在 `PATH` 中，修复方法是运行 [pnpm setup](/docs/cli/setup)。

### 缓存目录

检查[缓存目录](/docs/settings/other#cachedir)是否可写。

### 存储目录

检查[存储目录](/docs/settings/store#storedir)是否可写。未配置存储目录时跳过。

### 文件系统

探测从存储所在卷可用的链接策略：引用链接（写时复制）、硬链接和符号链接。这决定了包如何落到 `node_modules` 中以及安装有多快，引用链接或硬链接几乎零开销，而普通复制则不然。

如果引用链接和硬链接都不起作用，该检查会警告安装将退回到复制，并建议将存储放在与你的项目相同的文件系统上。

### registry 连通性

以 15 秒超时 ping 所配置的 registry 并报告往返时间。如果无法访问 registry 或它返回错误状态，则判定失败，这通常指向网络、代理或认证配置问题。

使用 `--offline` 时跳过。

### 安装冒烟测试

在临时目录中完全离线地将一个一次性包作为 `file:` 依赖安装。这会端到端地演练解析、存储和链接路径，并确认正在运行的二进制文件确实能执行安装。

此检查从设计上就始终是离线的，因此 `--offline` 不会跳过它。

## 选项

### --offline

跳过需要网络访问的检查。

### --benchmark

同时对文件系统和安装检查计时，并在每个结果旁报告耗时。

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
