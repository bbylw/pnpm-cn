---
title: "pnpm version"
headingIds: ["usage","recursive-releases","options","--preid-prerelease-id","--message--m-message","--tag-version-prefix-prefix","--no-git-tag-version","--no-commit-hooks","--sign-git-tag","--no-git-checks","--allow-same-version","--recursive--r","--json"]
---

自 v11.0.0 起提供

升级包的版本号。

```bash
pnpm version <newversion>
pnpm version <major|minor|patch|premajor|preminor|prepatch|prerelease|from-git>
pnpm version -r [--dry-run]
```

`<newversion>` 可以是上述任意一种版本提升类型，也可以是明确的 semver 版本（如 `1.2.3`）。支持工作区和 `workspace:` 协议，因此工作区包之间的交叉引用会被正确更新。

在 git 仓库内运行时，`pnpm version` 会为这次升级创建一个 git 提交和一个附注标签。工作树必须是干净的（见下文的 `--no-git-checks`），并且可以用 `--no-git-tag-version` 禁用提交/标签。递归模式下总是跳过 git 提交和标签，因为单次运行中多个包可能被升级到不同的版本。

## 用法

```bash
pnpm version patch
pnpm version minor
pnpm version major
pnpm version 2.0.0
pnpm version prerelease --preid beta
```

## 递归发布

自 v11.13.0 起提供

使用 `-r` 且**不带版本参数**运行，以消费 [pnpm change](/docs/cli/change) 记录的待处理变更意图：

```bash
pnpm version -r
```

该命令根据 `.changeset/*.md` 意图文件组装出发布计划并加以执行：意图点名的每个包都会升级，凡是通过 `workspace:` 范围依赖它们的包也同样升级。随后写入 changelog，并在 `.changeset/ledger.yaml` 中记录已消费的意图。

预览计划而不改动任何内容：

```bash
pnpm version -r --dry-run
```

用 `--filter` 可将其缩小到工作区的一部分。选择集会被持续扩展直至稳定，因此固定组伙伴包，以及升级使其依赖范围失效的下游依赖包，都会被自动纳入。

除非传入 `--dry-run` 或 `--no-git-checks`，否则工作树必须是干净的。完整流程见[发布管理](/docs/versioning)。

## 选项

### --preid <prerelease-id>

用作 semver 预发布部分前缀的「预发布标识符」。

```bash
pnpm version prerelease --preid beta
```

### --message, -m <message>

提交信息。消息中的任意 `%s` 会被替换为新版本。默认值为 `%s`。

```bash
pnpm version patch --message "chore: release v%s"
```

### --tag-version-prefix <prefix>

创建 git 标签时使用的前缀。默认值为 `v`（如 `v1.2.3`）。设为空字符串可完全去掉前缀。

### --no-git-tag-version

不为版本变更创建 git 提交或标签。

### --no-commit-hooks

提交版本升级时跳过 git 提交钩子（`--no-verify`）。

### --sign-git-tag

用 GPG 对生成的 git 标签签名（`git tag -s`）。

### --no-git-checks

升级版本前不检查工作树是否干净。

### --allow-same-version

允许将版本设置为当前版本。这对 CI 流水线很有用。

### --recursive, -r

将版本升级应用到工作区中的每个包（可用 `--filter` 缩小范围）。递归模式下会跳过 git 提交和标签的创建。

### --json

以 JSON 格式输出被升级的包列表。
