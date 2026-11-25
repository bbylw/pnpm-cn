---
title: "错误码"
headingIds: ["err_pnpm_bad_runtime_version","err_pnpm_config_unresolved_env_var","err_pnpm_frozen_lockfile_with_outdated_lockfile","err_pnpm_hoist_pattern_diff","err_pnpm_ignored_builds","err_pnpm_invalid_node_version","err_pnpm_invalid_runtime_version_range","err_pnpm_lockfile_config_mismatch","err_pnpm_missing_runtime_version_range","err_pnpm_node_linker_diff","err_pnpm_no_matching_version_inside_workspace","err_pnpm_no_offline_meta","err_pnpm_outdated_lockfile","err_pnpm_peer_dep_issues","err_pnpm_public_hoist_pattern_diff","err_pnpm_registry_name_mismatch","err_pnpm_runtime_not_found","err_pnpm_tarball_integrity","err_pnpm_task_cycle","err_pnpm_unexpected_store","err_pnpm_unsupported_engine","err_pnpm_virtual_store_dir_max_length_diff","err_pnpm_workspace_pkg_not_found"]
---

pnpm 抛出的错误都带有以 `ERR_PNPM_` 开头的错误码，错误码会与错误信息一起打印。对失败做反应的脚本应当匹配错误码，因为错误信息可能在版本之间变化，而错误码不会。

下面按字母顺序列出各错误码。没有在此列出的错误码，请参考它自己的错误信息。

## ERR_PNPM_BAD_RUNTIME_VERSION

根项目在 [`devEngines.runtime`](/docs/package_json#devenginesruntime) 或 `engines.runtime` 中声明了运行时，其 `onFail` 设为 `error`，而已安装的该运行时版本不满足声明的范围。错误信息会给出期望的范围和当前版本。

请安装匹配版本的运行时，或把 `onFail` 设为 `download` 让 pnpm 去获取。若只想检查而不失败，可把 [`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 设为 `warn` 或 `ignore`。

## ERR_PNPM_CONFIG_UNRESOLVED_ENV_VAR

`pnpm-workspace.yaml` 或[全局配置文件](/docs/cli/config)中的某项设置引用了一个未设置或为空的环境变量，且该引用没有兜底值。错误信息会给出该引用，例如 `${MY_STORE_DIR}`。

请设置该变量，或为引用加上兜底值，例如 `${NAME:-fallback}`，或用 `${NAME?}` 表示空字符串。

## ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE

冻结安装（`pnpm install --frozen-lockfile`，CI 中的默认值）发现 `pnpm-lock.yaml` 的 boot 文档不是最新的。boot 文档记录了[配置依赖](/docs/config-dependencies)和固定的包管理器。当 `pnpm-workspace.yaml` 中的 `configDependencies` 发生变化，或 `package.json` 中固定的 pnpm 版本发生变化时，它就会改变。

请不带 `--frozen-lockfile` 运行 `pnpm install`，并提交更新后的锁文件。

## ERR_PNPM_HOIST_PATTERN_DIFF

`pnpm add`、`pnpm remove`、`pnpm update`，或只选择了部分工作区项目的安装，发现某个 modules 目录是用不同的 [`hoistPattern`](/docs/settings/node-modules#hoistpattern) 安装的。

请运行 `pnpm install`，用新的 `hoistPattern` 重建该 modules 目录。

## ERR_PNPM_IGNORED_BUILDS

由于 [`allowBuilds`](/docs/settings/build#allowbuilds) 不允许某些构建脚本、且 [`strictDepBuilds`](/docs/settings/build#strictdepbuilds) 已开启，安装跳过了这些依赖的构建脚本。错误信息会列出被跳过脚本的包。

请运行 [`pnpm approve-builds`](/docs/cli/approve-builds) 批准你信任的构建。若要在跳过构建时不失败，可把 `strictDepBuilds` 设为 `false`。

## ERR_PNPM_INVALID_NODE_VERSION

[`nodeVersion`](/docs/settings/cli#nodeversion) 设置不是精确的 semver 版本，例如 `22.22.3`。

## ERR_PNPM_INVALID_RUNTIME_VERSION_RANGE

在 [`devEngines.runtime`](/docs/package_json#devenginesruntime) 或 `engines.runtime` 中声明的运行时，其 `version` 不是合法的 semver 范围，且 `onFail` 为 `error`。

请修正 `package.json` 中的范围。若只想检查而不失败，可把 [`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 设为 `warn` 或 `ignore`。

## ERR_PNPM_LOCKFILE_CONFIG_MISMATCH

冻结安装发现 `pnpm-lock.yaml` 中记录的某项设置与当前配置不同。错误信息会指出是哪项设置。锁文件会在其 `settings` 段中记录 `overrides`、`patchedDependencies`、`catalogs`、`ignoredOptionalDependencies`、`packageExtensions` 和 pnpmfile 的校验和，以及 `autoInstallPeers`、`dedupePeers` 等解析相关设置。

请不带 `--frozen-lockfile` 运行 `pnpm install`，并提交更新后的锁文件。

## ERR_PNPM_MISSING_RUNTIME_VERSION_RANGE

在 [`devEngines.runtime`](/docs/package_json#devenginesruntime) 或 `engines.runtime` 中声明的运行时没有 `version`，且 `onFail` 为 `error`。

请为 `package.json` 中的运行时条目加上版本范围。若只想检查而不失败，可把 [`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 设为 `warn` 或 `ignore`。

## ERR_PNPM_NODE_LINKER_DIFF

`pnpm add`、`pnpm remove`、`pnpm update`，或只选择了部分工作区项目的安装，发现某个 modules 目录是用不同的 [`nodeLinker`](/docs/settings/node-modules#nodelinker) 安装的。

请运行 `pnpm install`，用新的 `nodeLinker` 重建该 modules 目录。

## ERR_PNPM_NO_MATCHING_VERSION_INSIDE_WORKSPACE

某个项目有一个在工作区中并不存在的工作区依赖。

例如，包 `foo` 在 `dependencies` 中写了 `bar@1.0.0`：

```json
{
  "name": "foo",
  "version": "1.0.0",
  "dependencies": {
    "bar": "workspace:1.0.0"
  }
}
```

但工作区中只有 `bar@2.0.0`，因此 `pnpm install` 会失败。

要修复该错误，所有使用[工作区协议]的依赖都应改为使用工作区中确实存在的包版本。可以手动修改，也可以使用 `pnpm -r update` 命令。

[工作区协议]: /docs/workspaces#workspace-protocol-workspace

## ERR_PNPM_NO_OFFLINE_META

pnpm 以 `--offline` 运行，而元数据缓存中没有某个必须解析的包的条目。错误信息会给出该包以及它查找的缓存文件。

请不带 `--offline` 运行一次该命令，让 pnpm 下载元数据。[`--prefer-offline`](/docs/cli/install#--prefer-offline) 会在能命中缓存时使用缓存，并下载缺失的部分。

## ERR_PNPM_OUTDATED_LOCKFILE

当安装必须改动锁文件才能进行时，就会出现该错误。在 CI 环境中，这可能是有人修改了仓库中的 `package.json` 文件却没有在之后运行 `pnpm install`；也可能只是有人忘了提交锁文件的改动。

要修复该错误，请运行 `pnpm install` 并提交锁文件的改动。

## ERR_PNPM_PEER_DEP_ISSUES

启用 [`strictPeerDependencies`](/docs/settings/peer-dependencies#strictpeerdependencies) 后，若项目存在未解析的对等依赖，或对等依赖不满足所需范围，`pnpm install` 就会失败。要修复它，请安装缺失的对等依赖。

你也可以用 [peerDependencyRules.ignoreMissing] 和 [peerDependencyRules.allowedVersions] 设置有选择地忽略这些错误。

[peerDependencyRules.ignoreMissing]: /docs/settings/peer-dependencies#peerdependencyrulesignoremissing
[peerDependencyRules.allowedVersions]: /docs/settings/peer-dependencies#peerdependencyrulesallowedversions

## ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF

`pnpm add`、`pnpm remove`、`pnpm update`，或只选择了部分工作区项目的安装，发现某个 modules 目录是用不同的 [`publicHoistPattern`](/docs/settings/node-modules#publichoistpattern) 安装的。

请运行 `pnpm install`，用新的 `publicHoistPattern` 重建该 modules 目录。

## ERR_PNPM_REGISTRY_NAME_MISMATCH

registry 对某个包的请求返回了另一个包的元数据。pnpm 会就此停下，而不是用 registry 并未被询问的名字安装这个包。

请检查为该包或其 scope 配置的 registry 是否正确。配置错误的代理，或返回了错误文档的 registry，都可能引发该错误。

## ERR_PNPM_RUNTIME_NOT_FOUND

在 [`devEngines.runtime`](/docs/package_json#devenginesruntime) 或 `engines.runtime` 中声明、且 `onFail` 设为 `error` 的运行时，未安装在系统中。

请安装该运行时，或把 `onFail` 设为 `download` 让 pnpm 去获取。若只想检查而不失败，可把 [`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 设为 `warn` 或 `ignore`。

## ERR_PNPM_TARBALL_INTEGRITY

该错误表示下载到的包 tarball 与预期的完整性校验和不匹配。

如果你使用 npm registry（`registry.npmjs.org`），这通常意味着锁文件中的完整性值不正确——例如锁文件在合并冲突时被错误地解决过。

如果你使用允许覆盖包既有版本的 registry，这也可能意味着你本地的元数据缓存中保存的是该包更旧版本的完整性校验和。这种情况下应运行 `pnpm store prune`，它会清除本地元数据缓存，然后重试刚才失败的命令。

同时也要留意并确认包是从正确的 URL 下载的。该 URL 会打印在错误信息中。

## ERR_PNPM_TASK_CYCLE

递归运行的任务图中存在依赖环。错误信息会以 `<项目>#<脚本>` 的标识列出参与的任务。

请移除或修改 [`tasks`](/docs/workspace-task-orchestration) 下的环。如果这个环是你有意为之，把 [`ignoreWorkspaceCycles`](/docs/workspaces#ignoreworkspacecycles) 设为 `true`，即可把该错误降级为警告，并在没有顺序保证的情况下运行这些任务。

## ERR_PNPM_UNEXPECTED_STORE

存在某个 modules 目录，而它链接到的是另一个存储目录。

如果你是有意更换了存储目录，请运行 `pnpm install`，pnpm 会用新的存储重新安装依赖。

## ERR_PNPM_UNSUPPORTED_ENGINE

项目的 `engines.node` 或 `engines.pnpm` 范围，或某个依赖的 `engines.node` 范围，不接受当前版本。错误信息会给出包名、所需范围和当前版本。

项目不兼容的 `engines.pnpm` 总会触发该错误。对于 `engines.node`，只有启用 [`engineStrict`](/docs/settings/cli#enginestrict) 时 pnpm 才会触发它；未启用时，项目或必需依赖中不兼容的 `engines.node` 只会产生警告。

要修复该错误，请切换到该包接受的 Node.js 或 pnpm 版本，或在 `engines.node` 不匹配时关闭 `engineStrict`。

## ERR_PNPM_VIRTUAL_STORE_DIR_MAX_LENGTH_DIFF

`pnpm add`、`pnpm remove`、`pnpm update`，或只选择了部分工作区项目的安装，发现某个 modules 目录是用不同的 [`virtualStoreDirMaxLength`](/docs/settings/node-modules#virtualstoredirmaxlength) 安装的。

请运行 `pnpm install`，用新的 `virtualStoreDirMaxLength` 重建该 modules 目录。

## ERR_PNPM_WORKSPACE_PKG_NOT_FOUND

某个项目用[工作区协议](/docs/workspaces#workspace-protocol-workspace)声明了一个依赖，但工作区中没有同名项目。错误信息会给出该项目、该依赖及其说明符。

请检查依赖名的拼写，并检查它所指的项目是否被 `pnpm-workspace.yaml` 中的 `packages` 模式匹配到。
