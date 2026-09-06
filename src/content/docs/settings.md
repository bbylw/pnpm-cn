---
title: "设置（pnpm-workspace.yaml）"
headingIds: ["packages","packageconfigs","settings","dependency-resolution","node-modules-settings","dependency-hoisting-settings","store-settings","lockfile-settings","network-settings","request-settings","peer-dependency-settings","cli-settings","nodejs-settings","build-settings","versioning-settings","other-settings","workspace-settings","settings-documented-elsewhere"]
---

pnpm 从命令行、环境变量和 `pnpm-workspace.yaml` 获取其配置。

仅有 auth 和 registry 设置从 `.npmrc` 文件读取。所有其他设置（如 `hoistPattern`、`nodeLinker`、`shamefullyHoist` 等）必须在 `pnpm-workspace.yaml` 或全局的 `~/.config/pnpm/config.yaml` 中配置。

`pnpm config` 命令可用于读取和编辑项目与全局配置文件的内容。

相关的配置文件有：

- 每个项目的配置文件：`/path/to/my/project/pnpm-workspace.yaml`
- [Global configuration file](/docs/cli/config)

:::note[说明]

与授权相关的设置通过 [.npmrc](/docs/npmrc) 处理。

:::

配置文件中的值可以使用 `${NAME}` 语法包含环境变量。环境变量也可以指定默认值。使用 `${NAME-fallback}` 会在 `NAME` 未设置时返回 `fallback`。`${NAME:-fallback}` 会在 `NAME` 未设置或为空字符串时返回 `fallback`。

:::warning[warning]

自 v11.5.3 起，在 `pnpm-workspace.yaml` 中定义 registry URL 的设置里**不会**展开环境变量：`registry`，以及 [registries](/docs/settings/dependency-resolution#registries) 和 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 的 URL 值。这些设置中包含 `${...}` 占位符的值会被忽略。在 `registries` 的 [registry 声明形式](/docs/registries) 中（自 v11.23.0 起），URL 是键而非值，同样的规则适用于键。由于 `pnpm-workspace.yaml` 会提交到仓库，在 registry URL 中展开环境变量可能会被恶意仓库利用，把环境中的机密泄露到攻击者控制的 registry。请改为在受信任的位置配置动态 registry URL：全局配置文件或 CLI 选项。

:::

:::note[说明]

自 v11.22.0 起，项目的 `pnpm-workspace.yaml` 不能选择 pnpm 保存其凭据、其自身安装或其他机器级状态的位置：`bin`、`configDir`、`dir`、`globalBinDir`、`globalDir`、`npmrcAuthFile`、`pnpmHomeDir`、`stateDir`、`userconfig` 和 `workspaceDir` 在那里会被忽略，并发出警告。请改在[全局配置文件](/docs/cli/config)或命令行上设置它们。`cacheDir` 和 `storeDir` 不受影响。

:::

## packages

除设置之外，`pnpm-workspace.yaml` 还定义了[工作区](/docs/workspaces)的根，并让你能将目录纳入 / 排除出工作区。如果省略 `packages` 字段，则只有根包包含在工作区中。

例如：

pnpm-workspace.yaml

```yaml
packages:
  # specify a package in a direct subdir of the root
  - 'my-app'
  # all packages in direct subdirs of packages/
  - 'packages/*'
  # all packages in subdirs of components/
  - 'components/**'
  # exclude packages that are inside test directories
  - '!**/test/**'
```

根包始终被纳入，即使使用了自定义位置通配符。

catalogs 也在 `pnpm-workspace.yaml` 文件中定义。详情见 [Catalogs](/docs/catalogs)。

pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'

catalog:
  chalk: ^4.1.2

catalogs:
  react16:
    react: ^16.7.0
    react-dom: ^16.7.0
  react17:
    react: ^17.10.0
    react-dom: ^17.10.0
```

## packageConfigs

自 v11.0.0 起提供

允许为各个工作区包设置项目专属的配置。这取代了工作区项目专属的 `.npmrc` 文件。

`packageConfigs` 可以指定为一个从包名到配置对象的映射：

pnpm-workspace.yaml

```yaml
packages:
  - "packages/project-1"
  - "packages/project-2"
packageConfigs:
  "project-1":
    saveExact: true
  "project-2":
    savePrefix: "~"
```

或者作为一个由通配符匹配的规则数组：

pnpm-workspace.yaml

```yaml
packages:
  - "packages/project-1"
  - "packages/project-2"
packageConfigs:
  - match: ["project-1", "project-2"]
    modulesDir: "node_modules"
    saveExact: true
```

## 设置

以下按主题分组列出每个设置。跟随某个设置可阅读其文档，或打开某个分组的完整参考。

### 依赖解析

[Full reference →](/docs/settings/dependency-resolution)

- overrides
  - [Convergence overrides](/docs/settings/dependency-resolution#convergence-overrides)
  - [Overriding peer dependencies](/docs/settings/dependency-resolution#overriding-peer-dependencies)
- [packageExtensions](/docs/settings/dependency-resolution#packageextensions)
- [allowedDeprecatedVersions](/docs/settings/dependency-resolution#alloweddeprecatedversions)
- update
  - [update.ignoreDeps](/docs/settings/dependency-resolution#updateignoredeps)
  - [update.changeset](/docs/settings/dependency-resolution#updatechangeset)
  - [update.githubActions](/docs/settings/dependency-resolution#updategithubactions)
  - [update.githubActionsServer](/docs/settings/dependency-resolution#updategithubactionsserver)
- [supportedArchitectures](/docs/settings/dependency-resolution#supportedarchitectures)
- [ignoredOptionalDependencies](/docs/settings/dependency-resolution#ignoredoptionaldependencies)
- [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage)
- [minimumReleaseAgeExclude](/docs/settings/dependency-resolution#minimumreleaseageexclude)
- [minimumReleaseAgeExcludePrune](/docs/settings/dependency-resolution#minimumreleaseageexcludeprune)
- [minimumReleaseAgeIgnoreMissingTime](/docs/settings/dependency-resolution#minimumreleaseageignoremissingtime)
- [minimumReleaseAgeStrict](/docs/settings/dependency-resolution#minimumreleaseagestrict)
- [trustPolicy](/docs/settings/dependency-resolution#trustpolicy)
- [trustPolicyExclude](/docs/settings/dependency-resolution#trustpolicyexclude)
- [trustPolicyIgnoreAfter](/docs/settings/dependency-resolution#trustpolicyignoreafter)
- [trustLockfile](/docs/settings/dependency-resolution#trustlockfile)
- [blockExoticSubdeps](/docs/settings/dependency-resolution#blockexoticsubdeps)
- [registries](/docs/settings/dependency-resolution#registries)
- [namedRegistries](/docs/settings/dependency-resolution#namedregistries)

### node_modules 设置

[Full reference →](/docs/settings/node-modules#node-modules-settings)

- [modulesDir](/docs/settings/node-modules#modulesdir)
- [nodeLinker](/docs/settings/node-modules#nodelinker)
- [nodeExperimentalPackageMap](/docs/settings/node-modules#nodeexperimentalpackagemap)
- [nodePackageMapType](/docs/settings/node-modules#nodepackagemaptype)
- [symlink](/docs/settings/node-modules#symlink)
- [enableModulesDir](/docs/settings/node-modules#enablemodulesdir)
- [virtualStoreDir](/docs/settings/node-modules#virtualstoredir)
- [virtualStoreDirMaxLength](/docs/settings/node-modules#virtualstoredirmaxlength)
- [virtualStoreOnly](/docs/settings/node-modules#virtualstoreonly)
- [packageImportMethod](/docs/settings/node-modules#packageimportmethod)
- [modulesCacheMaxAge](/docs/settings/node-modules#modulescachemaxage)
- [dlxCacheMaxAge](/docs/settings/node-modules#dlxcachemaxage)
- [virtualStoreType](/docs/settings/node-modules#virtualstoretype)
- [enableGlobalVirtualStore](/docs/settings/node-modules#enableglobalvirtualstore)

### 依赖提升设置

[Full reference →](/docs/settings/node-modules#dependency-hoisting-settings)

- [hoist](/docs/settings/node-modules#hoist)
- [hoistWorkspacePackages](/docs/settings/node-modules#hoistworkspacepackages)
- [hoistPattern](/docs/settings/node-modules#hoistpattern)
- [publicHoistPattern](/docs/settings/node-modules#publichoistpattern)
- [shamefullyHoist](/docs/settings/node-modules#shamefullyhoist)
- [hoistingLimits](/docs/settings/node-modules#hoistinglimits)

### 存储设置

[Full reference →](/docs/settings/store#store-settings)

- [storeDir](/docs/settings/store#storedir)
- [verifyStoreIntegrity](/docs/settings/store#verifystoreintegrity)
- [useRunningStoreServer](/docs/settings/store#userunningstoreserver)
- [strictStorePkgContentCheck](/docs/settings/store#strictstorepkgcontentcheck)
- [frozenStore](/docs/settings/store#frozenstore)

### 锁文件设置

[Full reference →](/docs/settings/store#lockfile-settings)

- [lockfile](/docs/settings/store#lockfile)
- [preferFrozenLockfile](/docs/settings/store#preferfrozenlockfile)
- [lockfileIncludeTarballUrl](/docs/settings/store#lockfileincludetarballurl)
- [gitBranchLockfile](/docs/settings/store#gitbranchlockfile)
- [mergeGitBranchLockfilesBranchPattern](/docs/settings/store#mergegitbranchlockfilesbranchpattern)
- [peersSuffixMaxLength](/docs/settings/store#peerssuffixmaxlength)

### 网络设置

[Full reference →](/docs/settings/network#network-settings)

- [httpsProxy](/docs/settings/network#httpsproxy)
- [httpProxy](/docs/settings/network#httpproxy)
- [noProxy](/docs/settings/network#noproxy)
- [localAddress](/docs/settings/network#localaddress)
- [maxsockets](/docs/settings/network#maxsockets)
- [strictSsl](/docs/settings/network#strictssl)

### 请求设置

[Full reference →](/docs/settings/network#request-settings)

- [gitShallowHosts](/docs/settings/network#gitshallowhosts)
- [networkConcurrency](/docs/settings/network#networkconcurrency)
- [fetchRetries](/docs/settings/network#fetchretries)
- [fetchRetryFactor](/docs/settings/network#fetchretryfactor)
- [fetchRetryMintimeout](/docs/settings/network#fetchretrymintimeout)
- [fetchRetryMaxtimeout](/docs/settings/network#fetchretrymaxtimeout)
- [fetchTimeout](/docs/settings/network#fetchtimeout)
- [fetchWarnTimeoutMs](/docs/settings/network#fetchwarntimeoutms)
- [fetchMinSpeedKiBps](/docs/settings/network#fetchminspeedkibps)

### 对等依赖设置

[Full reference →](/docs/settings/peer-dependencies)

- autoInstallPeers
  - [Version Conflicts](/docs/settings/peer-dependencies#version-conflicts)
  - [Conflict Resolution](/docs/settings/peer-dependencies#conflict-resolution)
- [dedupePeerDependents](/docs/settings/peer-dependencies#dedupepeerdependents)
- [dedupePeers](/docs/settings/peer-dependencies#dedupepeers)
- [strictPeerDependencies](/docs/settings/peer-dependencies#strictpeerdependencies)
- [resolvePeersFromWorkspaceRoot](/docs/settings/peer-dependencies#resolvepeersfromworkspaceroot)
- peerDependencyRules
  - [peerDependencyRules.ignoreMissing](/docs/settings/peer-dependencies#peerdependencyrulesignoremissing)
  - [peerDependencyRules.allowedVersions](/docs/settings/peer-dependencies#peerdependencyrulesallowedversions)
  - [peerDependencyRules.allowAny](/docs/settings/peer-dependencies#peerdependencyrulesallowany)

### CLI 设置

[Full reference →](/docs/settings/cli#cli-settings)

- [no-color](/docs/settings/cli#no-color)
- [loglevel](/docs/settings/cli#loglevel)
- [useBetaCli](/docs/settings/cli#usebetacli)
- [recursiveInstall](/docs/settings/cli#recursiveinstall)
- [engineStrict](/docs/settings/cli#enginestrict)
- [npmPath](/docs/settings/cli#npmpath)
- [pmOnFail](/docs/settings/cli#pmonfail)
- [ignoreWorkspaceRootCheck](/docs/settings/cli#ignoreworkspacerootcheck)

### Node.js 设置

[Full reference →](/docs/settings/cli#nodejs-settings)

- [nodeVersion](/docs/settings/cli#nodeversion)
- [runtimeOnFail](/docs/settings/cli#runtimeonfail)
- [nodeDownloadMirrors](/docs/settings/cli#nodedownloadmirrors)

### 构建设置

[Full reference →](/docs/settings/build)

- [ignoreScripts](/docs/settings/build#ignorescripts)
- [childConcurrency](/docs/settings/build#childconcurrency)
- [sideEffectsCache](/docs/settings/build#sideeffectscache)
- [sideEffectsCacheReadonly](/docs/settings/build#sideeffectscachereadonly)
- [sideEffectsCache.remote](/docs/settings/build#sideeffectscacheremote)
- [unsafePerm](/docs/settings/build#unsafeperm)
- [nodeOptions](/docs/settings/build#nodeoptions)
- [verifyDepsBeforeRun](/docs/settings/build#verifydepsbeforerun)
- [strictDepBuilds](/docs/settings/build#strictdepbuilds)
- [allowBuilds](/docs/settings/build#allowbuilds)
- [dangerouslyAllowAllBuilds](/docs/settings/build#dangerouslyallowallbuilds)

### 版本策略设置

[Full reference →](/docs/settings/versioning)

- [versioning.fixed](/docs/settings/versioning#versioningfixed)
- [versioning.ignore](/docs/settings/versioning#versioningignore)
- [versioning.maxBump](/docs/settings/versioning#versioningmaxbump)
- [versioning.lanes](/docs/settings/versioning#versioninglanes)
- [versioning.epics](/docs/settings/versioning#versioningepics)
- [versioning.changelog.storage](/docs/settings/versioning#versioningchangelogstorage)

### 其他设置

[Full reference →](/docs/settings/other)

- [savePrefix](/docs/settings/other#saveprefix)
- [tag](/docs/settings/other#tag)
- [globalDir](/docs/settings/other#globaldir)
- [globalBinDir](/docs/settings/other#globalbindir)
- [npmrcAuthFile](/docs/settings/other#npmrcauthfile)
- [stateDir](/docs/settings/other#statedir)
- [cacheDir](/docs/settings/other#cachedir)
- [useStderr](/docs/settings/other#usestderr)
- [updateNotifier](/docs/settings/other#updatenotifier)
- [globalShims](/docs/settings/other#globalshims)
- [preferSymlinkedExecutables](/docs/settings/other#prefersymlinkedexecutables)
- [ignoreCompatibilityDb](/docs/settings/other#ignorecompatibilitydb)
- [resolutionMode](/docs/settings/other#resolutionmode)
- [registrySupportsTimeField](/docs/settings/other#registrysupportstimefield)
- extendNodePath
  - [Why this is needed](/docs/settings/other#why-this-is-needed)
  - [When to disable](/docs/settings/other#when-to-disable)
- [deployAllFiles](/docs/settings/other#deployallfiles)
- [dedupeDirectDeps](/docs/settings/other#dedupedirectdeps)
- [optimisticRepeatInstall](/docs/settings/other#optimisticrepeatinstall)
- [requiredScripts](/docs/settings/other#requiredscripts)
- [enablePrePostScripts](/docs/settings/other#enableprepostscripts)
- [scriptShell](/docs/settings/other#scriptshell)
- [shellEmulator](/docs/settings/other#shellemulator)
- [catalogMode](/docs/settings/other#catalogmode)
- [ci](/docs/settings/other#ci)
- [catalogPrune](/docs/settings/other#catalogprune)

### 工作区设置

这些设置同样在 `pnpm-workspace.yaml` 中配置，但与其所属的工作区特性一起文档化。

[Full reference →](/docs/workspaces#configuration)

- [linkWorkspacePackages](/docs/workspaces#linkworkspacepackages)
- [injectWorkspacePackages](/docs/workspaces#injectworkspacepackages)
- [dedupeInjectedDeps](/docs/workspaces#dedupeinjecteddeps)
- [syncInjectedDepsAfterScripts](/docs/workspaces#syncinjecteddepsafterscripts)
- [preferWorkspacePackages](/docs/workspaces#preferworkspacepackages)
- [sharedWorkspaceLockfile](/docs/workspaces#sharedworkspacelockfile)
- [saveWorkspaceProtocol](/docs/workspaces#saveworkspaceprotocol)
- [includeWorkspaceRoot](/docs/workspaces#includeworkspaceroot)
- [ignoreWorkspaceCycles](/docs/workspaces#ignoreworkspacecycles)
- [disallowWorkspaceCycles](/docs/workspaces#disallowworkspacecycles)
- [failIfNoMatch](/docs/workspaces#failifnomatch)

### 在其他处文档化的设置

- [patchedDependencies](/docs/cli/patch#patcheddependencies)
- [pnpmfile](/docs/pnpmfile#pnpmfile), [globalPnpmfile](/docs/pnpmfile#globalpnpmfile) and [ignorePnpmfile](/docs/pnpmfile#ignorepnpmfile)
- [audit.level](/docs/cli/audit#auditlevel), [audit.ignore](/docs/cli/audit#auditignore) and [audit.ignorePrune](/docs/cli/audit#auditignoreprune)
- [initVersion](/docs/cli/init#initversion), [initLicense](/docs/cli/init#initlicense) and [initAuthorName / initAuthorEmail / initAuthorUrl](/docs/cli/init#initauthorname-initauthoremail-initauthorurl)
- [legacyDirFiltering](/docs/filtering#legacydirfiltering)
- 在 [.npmrc](/docs/npmrc) 中读取的授权设置
