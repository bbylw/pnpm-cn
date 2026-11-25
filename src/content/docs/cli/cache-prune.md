---
title: "pnpm cache prune"
headingIds: ["options","--dry-run","what-prune-keeps"]
---

自 v12.5.0 起提供（仅 pnpm v12）

:::warning[警告]

此命令为实验性

:::

删除当前版本的 pnpm 已无法读取的 registry 元数据缓存目录。

```sh
pnpm cache prune
```

pnpm 把 registry 元数据保存在 `v12/metadata`、`v12/metadata-full`、`v12/metadata-full-filtered`、`v12/metadata-pnpr` 和 `v12/metadata-pnpr-records` 这几个根目录下，每个 registry 一个目录，目录名是该 registry 的完整 URL。`cache prune` 会删除：

- `v11/metadata`、`v11/metadata-full`、`v11/metadata-full-filtered` 和 `v11/metadata-private` 下的所有目录，旧版 pnpm 使用它们；
- `v12/` 各根目录下仅以 registry 主机名命名的目录，当前版本无法读取它们。

[`cache delete`](/docs/cli/cache-delete) 删除的是匹配的文件。想删掉遗留目录本身，请用 `cache prune`。

每个被删除的目录会以「元数据根目录 + 目录名」的形式打印出来：

```text
v11/metadata/https%3A+registry.npmjs.org
v11/metadata/registry.npmjs.org
v11/metadata-full/npm.example.com
```

缓存中没有任何可回收内容时，不会打印任何内容并成功退出。当某个目录无法读取或删除时，prune 仍会回收其余部分，然后报告每一处失败及其所在目录名。

## 选项

### --dry-run

列出 prune 将要删除的内容，不删除任何东西。

```sh
pnpm cache prune --dry-run
```

标准输出中的列表与实际 prune 的列表完全相同，因此你可以对比两次运行，或把该列表传给其他工具。「未删除任何内容」的提示会写入标准错误。

:::warning[警告]

缓存目录由机器上的每一个 pnpm 共享。如果同一台机器上有旧版 pnpm 在同一个 [`cacheDir`](/docs/settings/other#cachedir) 下运行，它可能仍会读写 prune 要删除的目录。使用了该 pnpm 的项目会在 prune 之后重新拉取 registry 元数据，在重新拉取之前它们的离线安装会失败。受影响的只有缓存本身，它会自行重新填充。请先用 `--dry-run` 查看清单，再决定是否删除。

:::

## prune 会保留什么

prune 只删除能证明已经失效的目录，因此有些看起来可以回收的内容会原样保留。

- `v12/metadata-private` 下按 descriptor 划分的缓存，所有 `pnpm cache` 子命令都不会动它们。`v11/metadata-private` 下的会被删除。
- 名称符合当前格式的目录，包括那些因使用临时端口的 registry（例如本地测试 registry）而堆积出来的目录。删除这些需要保留策略（比如按时间截止），而不是靠名称规则。
- 64 位十六进制的目录名。过长的 registry URL 无法用作目录名时，会变成它自身的 sha256 哈希。这种名称下的活跃缓存无法与陈旧缓存区分，因此 prune 会保留它。
