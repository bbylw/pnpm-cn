---
title: "pnpm version"
headingIds: ["usage","recursive-releases","options","--preid-prerelease-id","--message--m-message","--tag-version-prefix-prefix","--dry-run","--no-git-tag-version","--no-commit-hooks","--sign-git-tag","--no-git-checks","--allow-same-version","--recursive--r","--json","--release-notes-file"]
---

自 v11.0.0 起提供

升级包的版本号。

```bash
pnpm version <newversion>
pnpm version <major|minor|patch|premajor|preminor|prepatch|prerelease|from-git>
pnpm version -r [--dry-run]
```

`<newversion>` 可以是上述任意一种版本提升类型，也可以是明确的 semver 版本（如 `1.2.3`）。支持工作区和 `workspace:` 协议，因此工作区包之间的交叉引用会被正确更新。

在 git 仓库内运行时，`pnpm version` 会为这次升级创建一个 git 提交和一个附注标签。可以用 `--no-git-tag-version` 或 `pnpm-workspace.yaml` 中的 `gitTagVersion: false` 禁用提交和标签。递归模式下总是跳过 git 提交和标签，因为单次运行中多个包可能被升级到不同的版本。

单包升级允许包内存在未暂存的改动和未跟踪的常规文件，只要打包时不会把它们包含进去。例如，当 `"files": ["dist"]` 时，你可以在 `dist` 之外留下本地的 `notes.txt`。但对 `README.md` 的修改仍然会阻止升级，因为打包始终会包含它。

已暂存的改动、删除、包目录之外的改动以及对忽略规则的改动仍然会阻止升级。递归升级要求工作树是干净的。当版本、打包或发布钩子可能改变被打包内容时，同样有这个要求。

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

私有包（`"private": true`）在升级时不会去 registry 查询它们的[首次发布](/docs/versioning#first-releases)，并且它们的 changelog 总是写入已提交的 `CHANGELOG.md`，即使 [versioning.changelog.storage](/docs/settings/versioning#versioningchangelogstorage) 是 `registry`。

用 `--filter` 可将其缩小到工作区的一部分。选择集会被持续扩展直至稳定，因此固定组伙伴包，以及升级使其依赖范围失效的下游依赖包，都会被自动纳入。

除非传入 `--dry-run` 或 `--no-git-checks`，否则工作树必须是干净的。完整流程见[发布管理](/docs/versioning)。

升级会运行每个被升级包的 `preversion`、`version` 和 `postversion` 脚本。版本升级会保留 `preversion` 修改过的其他清单字段。`--dry-run` 和 [ignoreScripts](/docs/settings/build#ignorescripts) 会跳过这些脚本。

在工作区之外，直接执行 `pnpm version -r` 会失败并报 `ERR_PNPM_WORKSPACE_ONLY`。

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

创建 git 标签时使用的前缀。默认为 `tagVersionPrefix` 设置的值，未设置该设置时则默认为 `v`（如 `v1.2.3`）。设为空字符串可完全去掉前缀。

### --dry-run

打印该命令将要做什么，而不改动任何东西。它对单包升级和 `pnpm version -r` 都有效。

### --no-git-tag-version

不为版本变更创建 git 提交或标签。

### --no-commit-hooks

提交版本升级时跳过 git 提交钩子（`--no-verify`）。

### --sign-git-tag

用 GPG 对生成的 git 标签签名（`git tag -s`）。

### --no-git-checks

升级版本前不检查工作树是否干净。出现 `ERR_PNPM_UNCLEAN_WORKING_TREE` 后，可用该选项继续执行。

### --allow-same-version

允许将版本设置为当前版本。这对 CI 流水线很有用。没有该选项时，这样的升级会以 `ERR_PNPM_VERSION_NOT_CHANGED` 失败。

### --recursive, -r

将版本升级应用到工作区中的每个包（可用 `--filter` 缩小范围）。递归模式下会跳过 git 提交和标签的创建。

### --json

以 JSON 格式输出被升级的包列表。

### --release-notes <file>

配合不带版本号的 `pnpm version -r` 使用：一个手工编写的发布摘要文件，用于声明为 [serverType: pnpr](/docs/registries#servertype) 的 registry。该摘要会放在[由变更意图组成的发布说明](/docs/versioning#release-notes-on-pnpr)之上：整个发布的说明，或当该发布只包含一个包时该包自己的说明。随后 `pnpm publish` 会按原样发送这些说明。当文件不存在、发布计划中没有向此类 registry 发布，或 [versioning.changelog.storage](/docs/settings/versioning#versioningchangelogstorage) 不是 `registry` 时，该命令会失败。
