---
title: "构建设置"
headingIds: ["ignorescripts","childconcurrency","sideeffectscache","sideeffectscachereadonly","sideeffectscacheremote","sideeffectscacheexclude","remotecache","authenticating-with-vercel-remote-cache","unsafeperm","nodeoptions","verifydepsbeforerun","strictdepbuilds","allowbuilds","permissions","skillsdirs","dangerouslyallowallbuilds"]
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
- `exclude` — 构建从不经过缓存的包；见下文。

`sideEffectsCache: true` 是读取与写入的简写，也是该设置在长出远程层级之前的含义。只写不读（`read: false, write: true`）会填充一个本次运行从不消费的缓存，这正是一个为他人预热缓存的任务所想要的。

自 v12.2.0 起，`--side-effects-cache` 与 `--no-side-effects-cache` 标志以及 `PNPM_CONFIG_SIDE_EFFECTS_CACHE` 只切换**本地**缓存。在 `sideEffectsCache.remote` 下声明的远程层级会保留原样，因此一次运行可以关闭本地缓存而不丢失共享的那一层。

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
remoteCache:
  org: acme
sideEffectsCache:
  remote:
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

### sideEffectsCache.exclude

自 v12.14.0 起提供

- 默认值：**未定义**
- 类型：**字符串[]**

那些构建依赖 pnpm 无法纳入缓存键的内容的包，例如原生插件所链接的系统库。pnpm 会在每个项目中构建被列出的包，并且从不通过副作用缓存（无论是本地还是 [`remoteCache`](#remotecache) 服务器）恢复或保存其构建。在[全局虚拟存储](/docs/global-virtual-store)下，每个项目都会得到该包自己的副本，因此一个项目的构建不会影响另一个项目。

```yaml
sideEffectsCache:
  exclude:
    - java
    - '@native/*'
    - 'sharp@1.0.0 || 2.0.0'
```

只声明 `exclude` 会让 `read` 和 `write` 保持默认值，因此缓存对其他每个包仍然有效。

条目使用与 [`minimumReleaseAgeExclude`](/docs/settings/dependency-resolution#minimumreleaseageexclude) 相同的模式：包名、`@scope/*` 通配符，或带一个或多个精确版本的 `name@version`。裸包名涵盖该包的所有解析结果，包括 git 和 tarball URL。`name@version` 条目只涵盖 registry 版本。

依赖了被列出包的包，在全局虚拟存储下同样会获得项目专属的副本，因为它的副本链接到了被列出的包。

### remoteCache

自 v12.12.0 起提供

- 默认值：**未定义**
- 类型：**对象**

在多台机器之间共享构建产物的服务器，以及每个共享产物签名与校验所使用的密钥。

[`sideEffectsCache.remote`](#sideeffectscacheremote) 和 [`pnpm pipeline`](/docs/cli/pipeline#sharing-the-cache-between-machines) 的任务缓存都会使用它。

设置 `url` 时，产物存放在支持 Turborepo Remote Cache API 的服务器上，例如 Vercel Remote Cache 或自建实现。不设置时，它们存放在 [`pnprServer`](https://pnpm.io/pnpr/install-acceleration#enabling-it) 上。

```yaml
remoteCache:
  org: acme
```

```yaml
remoteCache:
  url: https://vercel.com/api
  team: team_abc123
  trustedKeys:
    ci-2026: <base64 P-256 SubjectPublicKeyInfo DER public key>
```

| 字段 | 可设置的位置 | 含义 |
| --- | --- | --- |
| `url` | 全局配置或环境变量 | Turborepo Remote Cache 服务器的 API 基础 URL，例如 `https://vercel.com/api`。 |
| `team` | 全局配置或环境变量 | Vercel 团队 ID（`team_...`）或团队标识。 |
| `org` | 任意位置 | 拥有这些产物的组织。在 pnpr 服务器上，它是该服务器在 `artifacts.owners` 下声明的所有者之一。它同时是 `pnpm pipeline --report` 记录一次运行时所用的组织名。 |
| `trustedKeys` | 全局配置或环境变量 | 产物必须由其签名的公钥，按密钥 ID 索引。 |
| `publish` | 全局配置或环境变量 | `true` 会发布本机构建的内容：依赖构建和 `pnpm pipeline` 的任务结果。任务结果包含任务的输出文件及其捕获的终端输出。默认为 `false`。设置在 `sideEffectsCache.remote` 下时，只发布依赖构建。 |
| `privateKey`、`keyId`、`builderId` | 全局配置或环境变量 | 签名已发布产物的密钥、消费者信任它所用的 ID，以及构建者的标签。与 `publish` 一起使用时必填。 |
| `imageDigest`、`architectureBaseline`、`buildEnv` | 全局配置或环境变量 | 记录在已签名产物中的可选来源信息。 |

每个字段也可以从环境变量读取，形式为 `PNPM_REMOTE_CACHE_` 加字段名的大写下划线形式，例如 `PNPM_REMOTE_CACHE_URL`。在那里，`trustedKeys` 和 `buildEnv` 接受 JSON 对象。环境变量优先于两个文件。设置了标记为「全局配置或环境变量」字段的 `pnpm-workspace.yaml` 会以 `ERR_PNPM_WORKSPACE_REMOTE_CACHE_TRUST` 失败。一个能够指定服务器的仓库，可能会让机器的令牌被发送到你选择的服务器。

#### 使用 Vercel Remote Cache 认证

`pnpm` 会把其[认证设置](/docs/npmrc)为 `url` 保存的凭据发送给服务器，就像对 registry 所做的那样。请在 Vercel 账户设置的 Tokens 中创建一个访问令牌，并限定到拥有该缓存的团队。在你自己的机器上保存它：

```sh
pnpm config set //vercel.com/api/:_authToken "$VERCEL_TOKEN"
```

在 CI 中，改为只为那一条命令通过环境变量传入：

```sh
env "pnpm_config_//vercel.com/api/:_authToken=$VERCEL_TOKEN" pnpm pipeline
```

请使用这种形式而不是 [`_auth`](/docs/npmrc#_auth)。`_auth` 条目还会把包请求路由到其 URL。

`pnpm` 不会读取 `turbo login` 保存的令牌。该令牌数小时内就会过期，且只有 `turbo` 能续期。

Turborepo Remote Cache 服务器会为操作系统、CPU 架构和 Node.js 主版本的每种组合保存每个包的一份构建，之后的发布会替换它。机器在满足构建的最低操作系统或 glibc 版本时恢复构建，只有在找不到可恢复的构建时才发布。请从你支持的最旧系统的机器上发布。

pnpm 会发送凭据的服务器必须使用 HTTPS 或环回地址，否则不会使用远程缓存。

### unsafePerm

- 默认值：以 root 运行时为 **false**，否则为 **true**
- 类型：**布尔值**

设为 true 以在运行包脚本时启用 UID/GID 切换。如果显式设为 false，则以非 root 用户身份安装将会失败。

### nodeOptions

- 默认值：**NULL**
- 类型：**字符串**

通过 `NODE_OPTIONS` 环境变量传递给 Node.js 的选项。这不影响 pnpm 本身如何执行，但会影响生命周期脚本如何被调用。

空值（如 `--config.node-options=` 或 `PNPM_CONFIG_NODE_OPTIONS=`）会覆盖来自低优先级配置来源的值。在 `nodeOptions` 为空时，脚本会保留来自父环境或 `extraEnv` 的 `NODE_OPTIONS`。

要保留现有的 `NODE_OPTIONS`，你可以在配置中使用 `${NODE_OPTIONS}` 引用现有环境变量：

```yaml
nodeOptions: "${NODE_OPTIONS:- } --experimental-vm-modules"
```

### verifyDepsBeforeRun

- 默认值：**install**
- 类型：**install**、**warn**、**error**、**prompt**、**false**

此设置允许在运行脚本前检查依赖的状态。该检查在 `pnpm run` 和 `pnpm exec` 命令上运行。支持以下值：

- `install` - 当 `node_modules` 不是最新时自动运行 install。若该 install 失败——例如因为存储是只读的或没有网络——pnpm 会打印一条警告，并仍然运行该命令。
- `warn` - 当 `node_modules` 不是最新时打印一条警告。
- `prompt` - 当 `node_modules` 不是最新时提示用户是否允许运行 install。
- `error` - 当 `node_modules` 不是最新时抛出一个错误。
- `false` - 禁用依赖检查。

仅更改 [`trustLockfile`](/docs/settings/dependency-resolution#trustlockfile) 并不会在脚本运行前触发依赖重装。当该设置关闭时，显式的 `pnpm install` 会校验锁文件。

当命令带过滤时，例如 `pnpm --filter foo run build`，该检查覆盖被选中的项目以及它们所依赖的工作区项目，它所运行的 install 也以同样的方式过滤。

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

### permissions

自 v12.11.0 起提供

- 类型：**对象**

以包为键，规定每个依赖可以做什么。键的形式与 [`allowBuilds`](#allowbuilds) 的键相同。每个条目决定一项或多项能力：

* `build`：该包可以运行其构建脚本。优先于该包的 `allowBuilds` 条目。
* `skills`：pnpm 可以把该包携带的代理技能链接到项目的代理技能目录中。`true` 链接该包携带的所有技能，`false` 一个都不链接，技能名称列表则只链接这些技能。参见[代理技能](/docs/agent-skills)。

```yaml
permissions:
  drizzle-kit:
    build: true
    skills: [guide, migrate]
  esbuild:
    build: true
  some-pkg:
    skills: false
```

`skills` 列表限定了 pnpm 只会链接该包的哪些技能，列表之外的技能不会再被提供批准。

`false` 记录了一次拒绝，因此该包不会再被提供批准。这些条目由 [`pnpm approve`](/docs/cli/permissions) 写入。

只有当文件中已经存在 `permissions` 设置时，构建决策才会写入 `permissions`。否则会写入 `allowBuilds`，旧版 pnpm 也能读取它。

### skills.dirs

自 v12.11.0 起提供

- 默认值：**项目为工作区根目录下检测到的代理技能目录，全局包则为主目录下的检测结果，再加上正在运行 pnpm 的代理所在目录**
- 类型：**字符串[]**

pnpm 把已批准的[代理技能](/docs/agent-skills)链接到哪些目录。在项目中，路径相对于工作区根目录。在全局 `config.yaml` 的 `globalPackagesConfig` 中，路径相对于主目录且必须留在其内部。设置后它会替换检测到的目录，pnpm 会创建缺失的目录。首次批准技能时，`pnpm approve` 或 `pnpm approve -g` 会列出检测到的目录并询问要链接到哪些，把选中的目录记录在这里。若一个目录都不选，pnpm 会继续使用检测到的目录。

```yaml
skills:
  dirs:
    - .claude/skills
```

```yaml
globalPackagesConfig:
  skills:
    dirs:
      - .agents/skills
      - .claude/skills
```

空列表会关闭代理技能功能。pnpm 不再提供批准，并删除它已链接的技能。

### dangerouslyAllowAllBuilds

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，依赖的所有构建脚本（例如 `preinstall`、`install`、`postinstall`）将自动运行，无需批准。构建被拒绝的包——无论是在 [`allowBuilds`](#allowbuilds) 中设为 `false`，还是在 [`permissions`](#permissions) 中设为 `build: false`——仍会被阻止，因此该设置允许除被拒绝者之外的每一个构建。与其它地方一样，一个包的 `permissions` 条目优先于它的 `allowBuilds` 条目。

:::warning[警告]

此设置允许所有依赖——包括传递依赖——无论现在还是将来都运行安装脚本。即使你当前的依赖图看起来是安全的：

- 未来的更新可能引入新的、不受信任的依赖。
- 现有的包可能在后续版本中添加脚本。
- 包可能被劫持或攻破并开始执行恶意代码。

为获得最大安全性，仅在你完全了解风险并信任你所拉取的整个生态时才启用此项。建议显式审查并允许构建。

:::
