---
title: "pnpm dedupe"
headingIds: ["workspace-selection","options","--check","--lockfile-only","--ignore-scripts","--ignore-pnpmfile","--offline","--prefer-offline","--no-runtime","--filter-package_selector","--fail-if-no-match"]
---

执行一次安装，如果可以使用更新的版本，则移除锁文件中较旧的依赖。

## 工作区选择

自 v12.4.1 起，`pnpm dedupe` 默认会处理工作区中的每个项目，包括为每个项目单独保存 [lockfile 的工作区](/docs/workspaces#sharedworkspacelockfile)。可以用常见的[过滤](/docs/filtering)来缩小运行范围，例如 `pnpm dedupe --filter ./packages/app`。

## 选项

### `--check`

检查运行去重是否会产生变更，而不安装任何包或编辑锁文件。如果可能有变更，则以非零状态码退出。

该检查会忽略 lockfile 写入之后才发生变化的 registry 元数据：`deprecated` 通知，以及 registry 现在用更强的哈希算法（例如 `sha512` 而不是 `sha1`）报告的已锁定版本的完整性。完整性使用了更弱的算法，或同一算法的另一份摘要，仍会被报告；lockfile 使用 CRLF 换行或带有字节序标记（byte order mark）时的任何元数据变化也会被报告，因为 `pnpm` 同样会重写这些字节。

该检查仍会安装 [`configDependencies`](/docs/config-dependencies)。如果它们自上次安装以来发生了变化，检查也会像 `pnpm install` 那样把它们记录到锁文件中，并报告这一变化。

### `--lockfile-only`

只更新 `pnpm-lock.yaml`。不会下载包，也不会写入 `node_modules`。

### `--ignore-scripts`

不运行项目及其依赖的生命周期脚本。

### `--ignore-pnpmfile`

不运行 [pnpmfile](/docs/pnpmfile) 的钩子。

### `--offline`

只使用已经存在于存储目录中的包。存储目录中缺少某个包时，该命令会失败。

### `--prefer-offline`

优先使用缓存的包和元数据，即使它们已超过新鲜期。

### `--no-runtime`

跳过安装运行时条目，例如通过 [`devEngines.runtime`](/docs/package_json#devenginesruntime) 下载的 Node.js。作用与 [`pnpm install --no-runtime`](/docs/cli/install#--no-runtime) 相同。

### `--filter <package_selector>`

把该命令限制在选中的项目上。更多过滤说明见[过滤](/docs/filtering)。

### `--fail-if-no-match`

当没有项目匹配给定的过滤条件时，以错误退出，而不是什么都不做。
