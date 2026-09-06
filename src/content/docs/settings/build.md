---
title: "构建设置"
headingIds: ["ignorescripts","childconcurrency","sideeffectscache","sideeffectscachereadonly","sideeffectscacheremote","unsafeperm","nodeoptions","verifydepsbeforerun","strictdepbuilds","allowbuilds","dangerouslyallowallbuilds"]
---

### ignoreScripts

- 默认值：**false**
- 类型：**布尔值**

不要执行项目 `package.json` 及其依赖中定义的任何脚本。

:::note[说明]

此标志不会阻止执行 [.pnpmfile.mjs](/docs/pnpmfile)

:::

### childConcurrency

- 默认值：**5**
- 类型：**数字**

构建 node_modules 时同时分配的子进程的最大数量。

### sideEffectsCache

- 默认值：**true**
- 类型：**布尔值或对象**

使用并缓存（前/后）install 钩子的结果。

当某个前/后安装脚本修改了包的内容（例如构建输出）时，pnpm 会将修改后的包保存到全局存储中。在同一台机器上未来的安装中，pnpm 会复用这个已缓存、已预构建的版本——使安装显著更快。

:::note[说明]

如果以下情况，你可能想禁用此设置：

1. 安装脚本修改了包目录*之外*的文件（pnpm 无法跟踪或缓存这些更改）。
2. 这些脚本执行了与构建包无关的副作用。

:::

一个对象以更详细的措辞表达同样的意思，也是声明远程层级的规范方式：

pnpm-workspace.yaml

```yaml
sideEffectsCache:
  read: true
  write: true
  remote:
    org: acme
    packages:
      - native-addon
```

- `read` — 当缓存中存在构建结果时从缓存恢复构建。默认 **true**。
- `write` — 将包的构建输出保存到缓存。默认 **true**。
- `remote` — 跨机器复用构建；见下文。

`sideEffectsCache: true` 是读取与写入的简写，也是该设置在长出远程层级之前的含义。只写不读（`read: false, write: true`）会填充一个本次运行从不消费的缓存，这正是一个为他人预热缓存的任务所想要的。

### sideEffectsCacheReadonly

- 默认值：**false**
- 类型：**布尔值**

仅在存在时使用副作用缓存，不为新包创建它。这是 `sideEffectsCache: { read: true, write: false }` 的旧写法。

### sideEffectsCache.remote

自 v12.0.0 起提供

- 默认值：**undefined**
- 类型：**对象**

通过一个 [pnpr](https://pnpm.io/pnpr) 服务器恢复经签名、组织范围内的产物，而不是在本地运行包的生命周期脚本，从而选择在跨机器间复用某个依赖的构建输出。这是一个概念验证：除非配置，否则它是关闭的，它需要一个以 `artifacts.enabled: true` 启动的 pnpr 服务器，并且在 Linux/glibc、macOS 和 Windows 上的 x64 和 arm64 恢复产物。其他操作系统和 libc 家族会在本地构建。

一个仓库只声明资格，不声明其他任何东西：

pnpm-workspace.yaml

```yaml
pnprServer: http://127.0.0.1:7677
allowBuilds:
  native-addon: true
sideEffectsCache:
  remote:
    org: acme
    packages:
      - native-addon
```

只声明 `remote` 会让 `read` 和 `write` 保持其默认值，因此本地缓存照常继续工作。

`packages` 是一份资格清单，而非一种许可：一个包只有当它同时通过 [allowBuilds](#allowbuilds)、具有 `requiresBuild: true` 并具有经过验证的源完整性时，才是一个候选。在此列出一个包并不会替你审查其构建脚本——在默认的 [strictDepBuilds](#strictdepbuilds) 下，当一个构建到达时无人裁定，安装仍会以 `ERR_PNPM_IGNORED_BUILDS` 失败，而一个以 `allowBuilds: false` 被拒绝的包永远不会构建，无论来自缓存还是其他途径。

所有描述*签名这一动作*的内容——`publish`、`keyId`、`builderId`、`imageDigest`、`architectureBaseline`、`buildEnv`、`trustedKeys` 和 `privateKey`——在 `pnpm-workspace.yaml` 中都会被以 `ERR_PNPM_WORKSPACE_REMOTE_SIDE_EFFECTS_TRUST` 拒绝，而是从[全局配置文件](/docs/cli/config)或环境中读取。一个被克隆的仓库不是信任根，且绝不能将机器的签名密钥变成签名神谕。

任何缓存失败——不可达的服务器、无法验证的签名、不兼容的平台、损坏的 blob——都会回退到普通的本地构建。完整设置，包括服务器标志、信任材料以及产物如何发布，见 [Shared side-effects cache](https://pnpm.io/pnpr/shared-side-effects-cache)。

自 v12.1.0 起，一个被恢复的产物会连同其经签名的来源一起保存在共享存储中。在后续安装复用之前，pnpm 会针对机器当前的密钥再次检查签名，并重新验证其所有者、包与源身份、平台、策略和存储的文件。一个坏的远程变体会被该 pnpr 服务器隔离，并且不再被选中。

:::note[说明]

`remoteSideEffectsCache` 是此设置的旧拼写，`organization` 是其 `org` 字段的旧拼写；两者仍然可用。

两种拼写是合并的，而非二选一：在两种拼写下都设置的字段的值取自 `sideEffectsCache.remote`，而只在一种拼写下设置的字段无论如何都会保留。这正是让一个仓库能在 `pnpm-workspace.yaml` 中声明 org，同时机器从其已经使用的那种拼写下的全局配置提供签名密钥的原因。

:::

### unsafePerm

- 默认值：以 root 运行时为 **false**，否则为 **true**
- 类型：**布尔值**

设为 true 以在运行包脚本时启用 UID/GID 切换。如果显式设为 false，则以非 root 用户身份安装将会失败。

### nodeOptions

- 默认值：**NULL**
- 类型：**字符串**

通过 `NODE_OPTIONS` 环境变量传递给 Node.js 的选项。这不影响 pnpm 本身如何执行，但会影响生命周期脚本如何被调用。

要保留现有的 `NODE_OPTIONS`，你可以在配置中使用 `${NODE_OPTIONS}` 引用现有环境变量：

```yaml
nodeOptions: "${NODE_OPTIONS:- } --experimental-vm-modules"
```

### verifyDepsBeforeRun

- 默认值：**install**
- 类型：**install**、**warn**、**error**、**prompt**、**false**

此设置允许在运行脚本前检查依赖的状态。该检查在 `pnpm run` 和 `pnpm exec` 命令上运行。支持以下值：

- `install` - 当 `node_modules` 不是最新时自动运行 install。
- `warn` - 当 `node_modules` 不是最新时打印一条警告。
- `prompt` - 当 `node_modules` 不是最新时提示用户是否允许运行 install。
- `error` - 当 `node_modules` 不是最新时抛出一个错误。
- `false` - 禁用依赖检查。

### strictDepBuilds

自 v10.3.0 起提供

- 默认值：**true**
- 类型：**布尔值**

启用 `strictDepBuilds` 时，如果任何依赖具有未经审查的构建脚本（即 postinstall 脚本），安装将以非零退出码退出。

### allowBuilds

自 v10.26.0 起提供

一个从包匹配器到显式允许（`true`）或禁止（`false`）脚本执行的映射。

```yaml
allowBuilds:
  esbuild: true
  core-js: false
  # nx versions with build scripts not listed below will
  # fail by default with ERR_PNPM_IGNORED_BUILDS
  nx@21.6.4 || 21.6.5: true
  nx@21.6.0: false
```

**Git 托管的包：**单独一个包名绝不会为 git 或 tarball 依赖批准构建——仅凭名称无法标识该产物。批准一个，要么用其精确的解析后路径（包含 commit），要么自 v11.11.0 起用其仓库 URL：

```yaml
allowBuilds:
  # Approves any commit from this repository
  'foo@git+ssh://git@example.com/org/foo.git': true
  # Approves only this exact commit
  'bar@git+https://github.com/org/bar.git#abc123': true
```

仓库形式让一个受信任的 git 依赖能在分支更新间继续运行其构建脚本，而无需为每个新 commit 重新批准。键是包名，后跟 `@` 和 git URL，不带 `#<ref>` 后缀。匹配是精确的，因此同一仓库的 `git+ssh://` 和 `git+https://` URL 是分开的键。

自 v11.19.0 起，仓库形式也会批准那些 pnpm 以 tarball 而非克隆方式下载的 git 托管包——例如 `github:` 依赖，它们从 `codeload.github.com` 拉取。一个 `foo@git+https://github.com/org/foo.git` 条目会批准 `foo`，无论 pnpm 是克隆仓库还是下载 tarball。GitLab 和 Bitbucket 的 tarball 下载以同样方式匹配。用一个完整的 tarball 依赖路径批准或拒绝某个特定的已解析 commit 仍然可用。

按包名做出的拒绝不受此限制：`foo: false` 会屏蔽 `foo`，无论它来自 registry 还是 git。

**默认行为：**未在 `allowBuilds` 中列出的包默认被禁止，并被当作未经审查处理。默认会打印一个错误（[strictDepBuilds](#strictdepbuilds) 默认为 `true`）。如果 `strictDepBuilds` 设为 `false`，则改为打印一个警告。

在安装期间，具有被忽略构建但尚未列在 `allowBuilds` 中的依赖会以一个占位值自动添加到 `pnpm-workspace.yaml`，以便你手动将它们设为 `true` 或 `false`。`pnpm add` 和 `pnpm approve-builds` 上的 [--allow-build](/docs/cli/add) 标志也会将其条目写入此处。

:::info[从旧设置迁移]

要自动迁移这些设置，请从 [Migrating from v10 to v11](/docs/migration) 指南运行 `pnpx codemod run pnpm-v10-to-v11`。

以下设置已在 v11 中被移除并由 `allowBuilds` 取代：`onlyBuiltDependencies`、`onlyBuiltDependenciesFile`、`neverBuiltDependencies`、`ignoredBuiltDependencies` 和 `ignoreDepScripts`。

Before:

```yaml
onlyBuiltDependencies:
  - electron
neverBuiltDependencies:
  - core-js
ignoredBuiltDependencies:
  - esbuild
```

After:

```yaml
allowBuilds:
  electron: true
  core-js: false
  esbuild: false
```

:::

### dangerouslyAllowAllBuilds

自 v10.9.0 起提供

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，依赖的所有构建脚本（例如 `preinstall`、`install`、`postinstall`）将自动运行，无需批准。

:::warning[warning]

此设置允许所有依赖——包括传递依赖——无论现在还是将来都运行安装脚本。即使你当前的依赖图看起来是安全的：

- 未来的更新可能引入新的、不受信任的依赖。
- 现有的包可能在后续版本中添加脚本。
- 包可能被劫持或攻破并开始执行恶意代码。

为获得最大安全性，仅在你完全了解风险并信任你所拉取的整个生态时才启用此项。建议显式审查并允许构建。

:::
