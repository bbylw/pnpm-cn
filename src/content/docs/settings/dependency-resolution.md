---
title: "依赖解析设置"
headingIds: ["overrides","convergence-overrides","overriding-peer-dependencies","packageextensions","alloweddeprecatedversions","update","updateignoredeps","updatechangeset","updategithubactions","updategithubactionsserver","supportedarchitectures","ignoredoptionaldependencies","minimumreleaseage","minimumreleaseageexclude","minimumreleaseageexcludeprune","minimumreleaseageignoremissingtime","minimumreleaseagestrict","trustpolicy","trustpolicyexclude","trustpolicyignoreafter","trustlockfile","blockexoticsubdeps","registries","namedregistries","built-in-aliases","reserved-alias-names","named-registries-in-the-lockfile"]
---

### overrides

该字段允许你指示 pnpm 覆盖依赖图中的任意依赖，包括对等依赖。它可用于强制所有包使用某个依赖的单一版本、回移植修复、用 fork 替换依赖，或移除未使用的依赖。

注意，overrides 字段只能在项目根目录设置。

`overrides` 字段的示例：

```yaml
overrides:
  "foo": "^1.0.0"
  "quux": "npm:@myorg/quux@^1.0.0"
  "bar@^2.1.0": "3.0.0"
  "qar@1>zoo": "2"
```

你可以通过用 ">" 分隔包选择器和依赖选择器，来指定被覆盖依赖所属的包，例如 `qar@1>zoo` 只会覆盖 `qar@1` 的 `zoo` 依赖，而不影响其他任何依赖。

要让被覆盖的版本与工作区中其他地方使用的版本保持同步，可在 [目录](/docs/catalogs) 中定义该版本，并通过 `catalog:` 协议引用它。这样版本只在一处维护，并同时被你的依赖和覆盖所引用：

pnpm-workspace.yaml

```yaml
catalog:
  foo: "^1.0.0"

overrides:
  foo: "catalog:"
```

你也可以用 `catalog:<name>` 引用命名 catalog。更多信息见 [目录](/docs/catalogs)。

如果你发现自己对某个包的用法并不需要它的某个依赖，可以用 `-` 移除它。例如，若包 `foo@1.0.0` 为一个你用不到的函数依赖了一个名为 `bar` 的大包，移除它可以缩短安装时间：

```yaml
overrides:
  "foo@1.0.0>bar": "-"
```

该特性与 `optionalDependencies` 配合尤其有用，其中大多数可选包都可以安全跳过。

#### 收敛覆盖

自 v11.13.0 起提供

带 **空范围** 的选择器，即 `"pkg@"`，就是一个收敛覆盖。与无条件重写每条匹配边的常规覆盖不同，收敛覆盖只在某条依赖边的版本满足该边声明的范围时才重写它：

pnpm-workspace.yaml

```yaml
overrides:
  "form-data@": 4.0.6
```

有了上述配置，声明 `form-data: "^4.0.5"` 的依赖会被固定到 `4.0.6`，而声明 `^3.0.0` 的依赖保留自己的解析结果。这让兼容的使用方收敛到单一版本，无论现在还是将来新增的依赖方，而不会把不兼容的版本强加给依赖图的其余部分。

Rules:

- 该值必须是 **精确版本**。范围、dist-tag 或 `-` 移除都会以 `ERR_PNPM_INVALID_CONVERGENCE_OVERRIDE` 报错失败。只要 catalog 条目解析为精确版本，就允许 `catalog:` 引用。
- 只有纯 semver 边参与。用 `workspace:`、`catalog:`、`npm:`、dist-tag 或 git/URL 说明符声明的边没有有意义的 "satisfies"（满足）关系，会保持原样不受影响。
- 收敛覆盖不能与父选择器组合使用：`"parent>pkg@"` 会被拒绝。
- 对于同一条边，常规覆盖始终优先于收敛覆盖。

当完整解析发现每个声明的范围也允许某个更新的版本时，pnpm 会警告该覆盖已过期，并指出应改为收敛到的版本。

:::note[说明]

在 v11.13.0 之前，覆盖选择器中的空范围没有文档说明，其行为类似于裸（无父选择器）覆盖。

:::

#### 覆盖对等依赖

覆盖同样适用于 `peerDependencies`。其行为取决于覆盖中使用的版本说明符类型：

- **Semver 范围**（如 `^1.0.0`）、**workspace** 和 **catalog** 协议：对等依赖被覆盖，并保持为对等依赖。
- **非范围说明符**（如 `link:` 或 `file:` 协议）：对等依赖被覆盖并移入 `dependencies`，因为这些不是有效的对等依赖范围。
- **移除**（`-`）：该对等依赖被完全移除。

例如，要覆盖 `react-dom` 的 `react` 对等依赖：

pnpm-workspace.yaml

```yaml
overrides:
  "react-dom>react": "18.1.0"
```

### packageExtensions

`packageExtensions` 字段提供了一种在现有包定义中补充额外信息的方式。例如，如果 `react-redux` 本应在其 `peerDependencies` 中包含 `react-dom` 但没有，就可以用 `packageExtensions` 为 `react-redux` 打补丁：

```yaml
packageExtensions:
  react-redux:
    peerDependencies:
      react-dom: "*"
```

`packageExtensions` 中的键是包名，或包名加 semver 范围，因此可以只为某个包的部分版本打补丁：

```yaml
packageExtensions:
  react-redux@1:
    peerDependencies:
      react-dom: "*"
```

以下字段可以用 `packageExtensions` 扩展：`dependencies`、`optionalDependencies`、`peerDependencies` 和 `peerDependenciesMeta`。

一个更完整的示例：

```yaml
packageExtensions:
  express@1:
    optionalDependencies:
      typescript: "2"
  fork-ts-checker-webpack-plugin:
    dependencies:
      "@babel/core": "1"
    peerDependencies:
      eslint: ">= 6"
    peerDependenciesMeta:
      eslint:
        optional: true
```

:::tip[提示]

我们与 Yarn 共同维护一个 `packageExtensions` 数据库，用于为生态中损坏的包打补丁。如果你使用了 `packageExtensions`，考虑向上游提交 PR，并将你的扩展贡献给 [@yarnpkg/extensions](https://github.com/yarnpkg/berry/blob/master/packages/yarnpkg-extensions/sources/index.ts) 数据库。

:::

### allowedDeprecatedVersions

此设置允许屏蔽特定包的废弃警告。

Example:

```yaml
allowedDeprecatedVersions:
  express: "1"
  request: "*"
```

有了上述配置，pnpm 不会再打印关于 `request` 任何版本以及 `express` v1 的废弃警告。

### update

自 v11.16.0 起提供

本节设置用于调整 [pnpm update](/docs/cli/update) 和 [pnpm outdated](/docs/cli/outdated) 命令。

#### update.ignoreDeps

有时你无法更新某个依赖。例如，该依赖的最新版本开始使用 ESM，但你的项目还不是 ESM。令人烦恼的是，运行 `pnpm update --latest` 时，`pnpm outdated` 命令总会打印出这样的包并将其更新。不过，你可以在 `ignoreDeps` 字段中列出你不想升级的包：

```yaml
update:
  ignoreDeps:
  - load-json-file
```

也支持模式匹配，因此你可以忽略某个作用域下的任意包：`@babel/*`。

#### update.changeset

自 v11.16.0 起提供

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm update` 会在更新工作区清单后写入一条 [变更意图](/docs/versioning)：为每个因更新而改变了 `dependencies` 或 `optionalDependencies` 的工作区包声明一次 `patch` 提升，并在其 `peerDependencies` 改变时声明一次 `major` 提升。等同于传入 [--changeset](/docs/cli/update#--changeset)；传入 `--no-changeset` 可在单次运行中覆盖该设置。

#### update.githubActions

自 v11.16.0 起提供

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm update` 和 `pnpm outdated` 还会检查仓库工作流文件所引用的 GitHub Actions。等同于传入 [--include-github-actions](/docs/cli/update#--include-github-actions)。参见 [更新 GitHub Actions](/docs/cli/update#updating-github-actions)。

#### update.githubActionsServer

自 v11.17.0 起提供

- 默认值：`GITHUB_SERVER_URL` 环境变量，回退到 **https://github.com**
- 类型：**URL**

承载工作流文件所引用 GitHub Actions 仓库的 GitHub 服务器的基础 URL（例如某个 GitHub Enterprise Server）。该 URL 必须使用 `https://` 或 `http://` 协议。只有在可信网络上的可信服务器才使用 `http://`：用于将 action 固定到提交哈希的 ref 会通过该 URL 拉取，未加密的流量可能被篡改。

:::info[info]

在 v11.16.0 之前，`update.ignoreDeps` 名为 `updateConfig.ignoreDependencies`。已废弃的 `updateConfig` 设置在下一个 major 版本之前仍可使用；当两者都设置时，`update` 段优先，并会打印一条警告。

:::

### supportedArchitectures

你可以指定要为其安装可选依赖的架构，即使它们与运行安装的系统架构不匹配。

例如，以下配置会指示为 Windows x64 安装可选依赖：

```yaml
supportedArchitectures:
  os:
  - win32
  cpu:
  - x64
```

而此配置会为 Windows、macOS 以及当前运行安装的系统架构安装可选依赖。它同时包含 x64 和 arm64 CPU 的产物：

```yaml
supportedArchitectures:
  os:
  - win32
  - darwin
  - current
  cpu:
  - x64
  - arm64
```

此外，`supportedArchitectures` 还支持指定系统的 `libc`。

### ignoredOptionalDependencies

如果某个可选依赖的名称包含在此数组中，它将被跳过。例如：

```yaml
ignoredOptionalDependencies:
- fsevents
- "@esbuild/*"
```

### minimumReleaseAge

自 v10.16.0 起提供

- 默认值：**1440**（自 v11 起），**0**（v11 之前）
- 类型：**数字（分钟）**

为降低安装被攻陷包的风险，你可以推迟对新发布版本的安装。在大多数情况下，恶意发布会在一个小时之内被发现并从 registry 中移除。

`minimumReleaseAge` 定义了版本发布后、pnpm 才会安装它所需经过的最少分钟数。它适用于 **所有依赖**，包括传递依赖。

例如，以下设置确保只能安装至少一天前发布的包：

```yaml
minimumReleaseAge: 1440
```

### minimumReleaseAgeExclude

自 v10.16.0 起提供

- 默认值：**undefined**
- 类型：**string[]**

如果你设置了 `minimumReleaseAge`，但某些依赖需要始终立即安装最新版本，可以把它们列在 `minimumReleaseAgeExclude` 下。该排除按 **包名** 生效，并适用于该包的所有版本。

Example:

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
- webpack
- react
```

在这种情况下，所有依赖都必须至少已有一天历史，`webpack` 和 `react` 除外，它们一旦发布就立即安装。

自 v10.17.0 起提供

你也可以使用模式匹配。例如，允许你所在组织的全部包：

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
- '@myorg/*'
```

自 v10.19.0 起提供

你也可以豁免特定版本（或用 `||` 析联合并的版本列表）。这允许把例外固定到成熟期规则上：

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
- nx@21.6.5
- webpack@4.47.0 || 5.102.1
```

### minimumReleaseAgeExcludePrune

自 v11.22.0 起提供

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm add`、`pnpm update` 和 `pnpm remove` 会清理 `pnpm-workspace.yaml` 中 [minimumReleaseAgeExclude](#minimumreleaseageexclude) 里新写入锁文件不再解析的条目：已消失的版本会被丢弃（当某条目没有任何版本剩余时该条目被移除），锁文件中已不存在的包对应的条目也会被移除。名称模式（`@myorg/*`）始终保留。

当本次安装的锁文件未覆盖整个工作区（[sharedWorkspaceLockfile: false](/docs/workspaces#sharedworkspacelockfile)）时，会跳过此清理，因为另一个项目仍需要的条目会被误判为过期。

### minimumReleaseAgeIgnoreMissingTime

自 v11.0.0 起提供

- 默认值：**true**
- 类型：**布尔值**

当设为 `true` 时，对于 registry 元数据不含 `time` 字段的包（某些私有 registry 和镜像会省略该字段），pnpm 会跳过 [minimumReleaseAge](#minimumreleaseage) 检查。设为 `false` 时，在这种情况下改为让解析失败，而不是安装该包。

```yaml
minimumReleaseAgeIgnoreMissingTime: false
```

自 v11.23.0 起，此设置还管理 [trustPolicy](#trustpolicy)，后者读取相同的发布日期：`trustPolicy: no-downgrade` 会跳过 registry 无法确定日期的包并给出警告，而不是以 `ERR_PNPM_MISSING_TIME` 使安装失败。

此开关针对的是无法给自身发布定日期的 registry，而不是 registry 声称从未发布过的包：在 [锁文件校验](/docs/supply-chain-security) 期间，若某个会为自己列出的每个版本都标注日期的 packument 中缺失某锁文件条目，则仍是硬性失败。

### minimumReleaseAgeStrict

自 v11.0.0 起提供

- 默认值：若显式配置了 [minimumReleaseAge](#minimumreleaseage) 则为 **true**，否则为 **false**
- 类型：**布尔值**

控制当所请求范围内没有任何依赖版本满足 [minimumReleaseAge](#minimumreleaseage) 约束时 pnpm 的行为。当设为 `false` 时，pnpm 回退到一个不满足 `minimumReleaseAge` 约束的版本，使安装仍能成功。当设为 `true` 时，pnpm 改为让解析失败。

默认值取决于你是否自行配置了 `minimumReleaseAge`：如果你显式设置了它（通过 `pnpm-workspace.yaml`、CLI 或环境变量），严格模式默认开启，因此该设置会被强制执行。`minimumReleaseAge` 的内置默认值（1440 分钟）为向后兼容采用非严格模式。

```yaml
minimumReleaseAgeStrict: true
```

### trustPolicy

自 v10.21.0 起提供

- 默认值：**off**
- 类型：**no-downgrade** | **off**

当设为 `no-downgrade` 时，如果某个包的信任级别相比其先前发布的版本有所下降，pnpm 会失败。例如，若某个包此前由受信任的发布者发布，而现在只有来源证明（provenance）或没有任何信任证据，安装将会失败。这有助于防止安装可能被攻陷的版本。信任检查仅基于发布日期，而非 semver。如果任何更早发布的版本拥有更强的信任证据，该包就无法安装。自 v10.24.0 起，在为非预发布版本安装评估信任证据时会忽略预发布版本，因此受信任的预发布版本不会阻止缺乏信任证据的稳定版本。

### trustPolicyExclude

自 v10.22.0 起提供

- 默认值：**[]**
- 类型：**string[]**

应从信任策略检查中排除的包选择器列表。这让你可以安装特定的包或版本，即使它们不满足 `trustPolicy` 要求。

例如：

```yaml
trustPolicy: no-downgrade
trustPolicyExclude:
  - 'chokidar@4.0.3'
  - 'webpack@4.47.0 || 5.102.1'
  - '@babel/core@7.28.5'
```

### trustPolicyIgnoreAfter

自 v10.27.0 起提供

- 默认值：**undefined**
- 类型：**数字（分钟）**

允许对发布已超过指定分钟数的包忽略信任策略检查。这在启用严格信任策略时很有用，因为它允许安装较旧的包版本（这些版本可能没有用签名或来源证明发布的流程），而无需手动排除，前提是它们因年代久远而被认为是安全的。

### trustLockfile

自 v11.3.0 起提供

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm install` 会跳过供应链校验步骤，该步骤本会对已加载锁文件中的每个条目重新应用 [minimumReleaseAge](#minimumreleaseage) 和 [trustPolicy](#trustpolicy)。此安装将锁文件视为已被信任。

在锁文件实际上属于可信基础的场景中很有用，例如每个提交都来自受信任作者的闭源项目。被投毒的锁文件（贡献者在比 CI 所强制策略更弱的策略下编写的锁文件）可能蒙混过关，因此只要外部协作者可以编辑锁文件，就应保持此值为 `false`。

在大型工作区中，校验步骤会在整个安装期间把各包的 registry 元数据保存在内存里；禁用它可减少内存占用，但代价是失去供应链检查。大多数使用默认 `frozenLockfile` CI 工作流的项目无需设置此项。

### blockExoticSubdeps

自 v10.26.0 起提供

- 默认值：**true**
- 类型：**布尔值**

当设为 `true` 时，只有直接依赖（列在你根 `package.json` 中的依赖）才能使用特殊来源（如 git 仓库或直接的 tarball URL）。所有传递依赖必须从可信来源解析，例如配置的 registry、本地文件路径、工作区链接，或受信任的 GitHub 仓库（node、bun、deno）。

此设置通过阻止传递依赖从不受信任的位置拉取代码，帮助加固依赖供应链安全。

特殊来源包括：

- Git 仓库（`git+ssh://...`）
- 指向 tarball 的直接 URL 链接（`https://.../package.tgz`）

### registries

自 v11.0.0 起提供

- 默认值：**undefined**
- 类型：**Record<string, RegistryDeclaration>** 或 **Record<string, string>**

声明项目从中安装包的 registry。自 v11.23.0 起，每个 registry 只声明一次，以其 URL 为键，pnpm 所知道的关于它的一切都在该条目中：路由到它的 `scopes`、它响应裸说明符的 `prefix`，以及服务器如何排布 tarball URL（`serverType`、`supportsTimeField`）。每个字段的完整说明在专门的 [registry](/docs/registries) 页面上。

```yaml
registries:
  https://npm.corp.example.com/:
    serverType: artifactory
    scopes: ["@my-org", "@internal"]
    prefix: work
```

旧的形态（将 scope 映射到 URL）仍被接受。`default` 键设置主 registry（等同于 `registry` 的 `.npmrc` 设置），而带作用域的键为特定的包 scope 配置 registry：

```yaml
registries:
  default: https://registry.npmjs.org/
  "@my-org": https://private.example.com/
  "@internal": https://nexus.corp.com/
```

两种形态不能混在同一个映射中。

自 v11.11.0 起，此设置也可以在 [全局配置文件](/docs/cli/config)（`config.yaml`）中定义，这对那些应应用于机器上每个项目而非单个仓库的 registry 很有用。其中只读取路由（`scopes` 和 `prefix`）；`serverType` 和 `supportsTimeField` 会塑造锁文件，因此只从 `pnpm-workspace.yaml` 读取。参见 [该设置可放置的位置](/docs/registries#where-the-setting-may-live)。

### namedRegistries

自 v11.1.0 起提供

- 默认值：**undefined**
- 类型：**Record<string, string>**

:::note[说明]

自 v11.23.0 起废弃：改为在 [registries](#registries) 中声明 `prefix`，参见 [registry](/docs/registries) 页面。`namedRegistries` 仍会被读取，但仅针对 `registries` 未声明的前缀；当两个设置都声明前缀时，pnpm 会警告。下文关于别名的一切，包括内置别名、保留名称和锁文件键，同样适用于通过 `prefix` 声明的别名。

:::

定义命名 registry 别名，可在安装包时用作前缀，风格参照 [vlt 的命名 registry 别名](https://docs.vlt.sh/cli/registries)。例如，使用以下配置：

pnpm-workspace.yaml

```yaml
namedRegistries:
  gh: https://npm.pkg.github.example.com/
  work: https://npm.work.example.com/
```

`pnpm add work:@corp/lib@^2.0.0` 会将 `@corp/lib@^2.0.0` 相对于 `https://npm.work.example.com/` 解析。

认证信息会从现有的按 URL 划分的 `.npmrc` 条目中获取（例如 `//npm.pkg.github.com/:_authToken=...`），因此无需单独的认证机制。

自 v11.11.0 起，此设置也可以在 [全局配置文件](/docs/cli/config)（`config.yaml`）中定义，因此像 `work:` 这样的别名可以在机器上的每个项目之间共享。

#### 内置别名

有两个别名无需任何配置即可使用：

| **Alias** | **Registry** | **Notes** |
| --- | --- | --- |
| `gh:` | `https://npm.pkg.github.com/` | 即 [GitHub Packages npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)。 |
| `npmjs:` | `https://registry.npmjs.org/` | 即公共 npm registry。自 v11.20.0 起提供。 |

你在 `namedRegistries` 下定义的条目会合并到这些之上，因此两者都可以被覆盖：GitHub Enterprise Server 用户可以让 `gh` 指向自己的主机，而对 npmjs 做镜像或代理的组织应让 `npmjs` 指向镜像：

pnpm-workspace.yaml

```yaml
namedRegistries:
  gh: https://npm.pkg.github.example.com/
  npmjs: https://npm.internal.example.com/
```

即使默认 [registry](#registries) 指向别处（例如内部代理），`npmjs:` 也能把某个依赖固定到公共 registry：

package.json

```json
{
  "dependencies": {
    "left-pad": "npmjs:^1.3.0"
  }
}
```

`npm:` 前缀做不到这一点：它是 [别名协议](/docs/aliases)（`npm:<name>@<range>`），通过 `registry` 所指向的地址解析。

内置 URL 也是 pnpm 校验某个包时用来匹配锁文件中所记录 tarball URL 的前缀。如果你代理了 npmjs 且未覆盖该别名，那么 tarball URL 位于 `registry.npmjs.org` 的条目会针对公共 registry 而非你的镜像进行校验。这只影响记录了此类 URL 的锁文件（你所配置 registry 的规范 URL 会从锁文件中省略），且仅在运行 tarball URL、[minimumReleaseAge](#minimumreleaseage) 或 [trustPolicy](#trustpolicy) 检查时才会如此。

#### 保留别名名称

自 v11.20.0 起，遮蔽了保留依赖说明符前缀（`file`、`link`、`workspace`、`runtime`、`npm`、`jsr`、`git`、`github`、`gitlab`、`bitbucket`、`catalog`、`custom`、`http`、`https`、`ssh`）的别名会被拒绝并报 `ERR_PNPM_RESERVED_NAMED_REGISTRY_NAME`。此前，此类别名会被相应的解析器静默遮蔽。别名还必须以字母开头，且只包含字母、数字、`.`、`_` 和 `-`。

#### 锁文件中的命名 registry

自 v11.20.0 起，从命名 registry 解析的包会以带 registry 限定的键 `<name>@<registryName>:<version>` 记录在 `pnpm-lock.yaml` 中：

pnpm-lock.yaml

```yaml
packages:
  foo@work:1.0.0:
    resolution: {integrity: sha512-...}
```

在 v11.20.0 之前，包仅以 `name@version` 为键，因此由两个 registry 提供的同名同版本会合并到单个条目，且谁先解析就决定了每个使用方拿到的 tarball。这是一种包替换风险：你期望从私有 registry 获得的包，可能改由另一个发布了相同名称和版本的 registry 安装，而锁文件中没有任何迹象能揭示这一点。带 registry 限定的键让每个 registry 拥有自己的条目，并固定某个依赖来自哪一个。

锁文件格式版本保持不变，且限定键只出现在从命名 registry 解析的包上，包括内置的 `gh:` 和 `npmjs:` 别名，它们无需 `namedRegistries` 条目。完全不用别名安装的项目看不出任何差异，较旧的 pnpm 版本也能继续读取该文件。

:::caution[注意]

如果有依赖通过别名安装，那么你在 v11.20.0 或更新版本上首次进行的非冻结安装会重新键化这些条目，表现为一次锁文件差异。请提交它，该差异正是所应用的修复。同时也应审查它：某个条目移动到你未曾预期的 registry 值得追查。

让项目中的所有成员先迁移到 v11.20.0 或更新版本。较旧的 pnpm 能正常读取重新键化后的锁文件，冻结安装也不受影响，但它自己不会生成带 registry 限定的键：任何更新锁文件的安装都会把这些条目写回旧形态，而下一次在当前 pnpm 上的安装又会重新为它们加限定。于是锁文件来回翻转，而只要它处于旧形态，项目就又暴露在风险中。由于锁文件格式版本被有意保持不变，pnpm 无法检测到此情况并向你发出警告。

没有保留旧行为的设置，旧形态本身就是漏洞。

:::

锁文件引用的每个非内置别名都必须保持声明状态，要么通过 [registries](#registries) 中的 `prefix`，要么通过 `namedRegistries`。读取一个别名已消失的条目会以 `ERR_PNPM_MISSING_NAMED_REGISTRY` 失败，而不是回退到默认 registry，因为那会拉取到一个不同的包。重命名别名会重新解析那些使用了它的包。

对于命名 registry 的包，遵循标准 registry 布局的 tarball URL 不再写入锁文件；它们会按需根据别名声明的 URL 重新计算。
