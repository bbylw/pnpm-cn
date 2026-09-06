---
title: "错误码"
headingIds: ["err_pnpm_task_cycle","err_pnpm_unexpected_store","err_pnpm_no_matching_version_inside_workspace","err_pnpm_peer_dep_issues","err_pnpm_outdated_lockfile","err_pnpm_tarball_integrity","err_pnpm_mismatched_release_channel","err_pnpm_invalid_node_version"]
---

## ERR_PNPM_TASK_CYCLE

递归运行的任务图中存在依赖环。错误会以 `<project>#<script>` 标识符列出参与的任务。

在 [任务](/docs/workspace-task-orchestration) 中移除或修改该环。如果是有意为之，将 [ignoreWorkspaceCycles](/docs/workspaces#ignoreworkspacecycles) 设为 `true`，可把该错误降级为警告，并在不保证顺序的情况下运行环中的任务。

## ERR_PNPM_UNEXPECTED_STORE

存在一个 modules 目录，且它链接到了另一个存储目录。

如果你是有意更改了存储目录，运行 `pnpm install`，pnpm 会使用新的存储重新安装依赖。

## ERR_PNPM_NO_MATCHING_VERSION_INSIDE_WORKSPACE

某个项目有一个工作区依赖，而该依赖在工作区中并不存在。

例如，包 `foo` 在 `dependencies` 中声明了 `bar@1.0.0`：

```json
{
  "name": "foo",
  "version": "1.0.0",
  "dependencies": {
    "bar": "workspace:1.0.0"
  }
}
```

然而，工作区中只有 `bar@2.0.0`，因此 `pnpm install` 会失败。

要修复此错误，所有使用 [workspace 协议](/docs/workspaces#workspace-protocol-workspace) 的依赖都应更新为工作区中已存在的包版本。这可以手动完成，也可以使用 `pnpm -r update` 命令。

## ERR_PNPM_PEER_DEP_ISSUES

如果项目存在未解析的对等依赖，或对等依赖与所需范围不匹配，`pnpm install` 将会失败。要修复此问题，请安装缺失的对等依赖。

你也可以使用 [peerDependencyRules.ignoreMissing](/docs/settings/peer-dependencies#peerdependencyrulesignoremissing) 和 [peerDependencyRules.allowedVersions](/docs/settings/peer-dependencies#peerdependencyrulesallowedversions) 设置有选择地忽略这些错误。

## ERR_PNPM_OUTDATED_LOCKFILE

当无法在不更改锁文件的情况下执行安装时，就会出现此错误。在 CI 环境中，如果有人修改了仓库中的某个 `package.json` 文件但没有随后运行 `pnpm install`，就可能出现此错误。或者有人忘记提交对锁文件的更改。

要修复此错误，只需运行 `pnpm install` 并提交对锁文件的更改。

## ERR_PNPM_TARBALL_INTEGRITY

此错误表明下载的包的 tarball 与预期的完整性校验和不匹配。

如果你使用 npm registry（`registry.npmjs.org`），这很可能意味着你锁文件中的完整性校验值有误。这可能是因为锁文件在合并时错误地解决了合并冲突。

如果你使用的 registry 允许覆盖某个包的已有版本，这可能意味着你的本地元数据缓存中保存的是该包旧版本的完整性校验和。在这种情况下，你应该运行 `pnpm store prune`。此命令会删除你的本地元数据缓存。然后你可以重试失败的命令。

但也要小心，确认包是从正确的 URL 下载的。该 URL 应该会打印在错误消息中。

## ERR_PNPM_MISMATCHED_RELEASE_CHANNEL

配置字段 `use-node-version` 定义的发布通道与版本后缀不一致。

例如：

- `rc/20.0.0` 定义了一个 `rc` 通道，但版本却是稳定版本的。
- `release/20.0.0-rc.0` 定义了一个 `release` 通道，但版本却是 RC 版本的。

要修复此错误，要么移除发布通道前缀，要么更正版本后缀。

请注意，不允许像 `lts/Jod` 这样指定 node 版本。稳定版本的正确语法严格为 X.Y.Z 或 release/X.Y.Z。

## ERR_PNPM_INVALID_NODE_VERSION

配置字段 `use-node-version` 的值具有无效语法。

以下是 `use-node-version` 的有效形式：

- 稳定版本：
  - `X.Y.Z`（`X`、`Y`、`Z` 为整数）
  - `release/X.Y.Z`（`X`、`Y`、`Z` 为整数）
- RC 版本：
  - `X.Y.Z-rc.W`（`X`、`Y`、`Z`、`W` 为整数）
  - `rc/X.Y.Z-rc.W`（`X`、`Y`、`Z`、`W` 为整数）
