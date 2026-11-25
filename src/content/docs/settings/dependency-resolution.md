---
title: "依赖解析设置"
headingIds: ["overrides", "dependency-type-selectors", "convergence-overrides", "overriding-peer-dependencies", "warnunusedoverrides", "packageextensions", "alloweddeprecatedversions", "update", "updateignoredeps", "updatechangeset", "updategithubactions", "updategithubactionsserver", "supportedarchitectures", "platform-lists", "optional", "ignoredoptionaldependencies", "forceignoresplatform", "minimumreleaseage", "minimumreleaseageexclude", "minimumreleaseageexcludeprune", "minimumreleaseageignoremissingtime", "referencetime", "minimumreleaseagestrict", "trustpolicy", "trustpolicyexclude", "trustpolicyignoreafter", "trustpolicyexcludeprune", "trustlockfile", "blockexoticsubdeps", "registries", "namedregistries", "built-in-aliases", "reserved-alias-names", "named-registries-in-the-lockfile", "pnprserver", "autodedupe"]
---

### overrides

该字段允许你指示 pnpm 覆盖依赖图中的任意依赖，包括对等依赖。它可用于强制所有包使用某个依赖的单一版本、回移植修复、用 fork 替换依赖，或移除未使用的依赖。

`overrides` 字段只能在项目根目录设置。相对的 `file:` 覆盖会从该根目录解析。锁文件可能使用指向同一目录的更短的相对路径。

`overrides` 字段的示例：

pnpm-workspace.yaml

```yaml
overrides:
  "foo": "^1.0.0"
  "quux": "npm:@myorg/quux@^1.0.0"
  "bar@^2.1.0": "3.0.0"
  "qar@1>zoo": "2"
```

你可以通过用 ">" 分隔包选择器和依赖选择器，来指定被覆盖依赖所属的包，例如 `qar@1>zoo` 只会覆盖 `qar@1` 的 `zoo` 依赖，而不影响其他任何依赖。

父选择器和目标选择器都支持在包名上使用 `*` 通配模式：

pnpm-workspace.yaml

```yaml
overrides:
  "@esbuild/*:optional": "-"
  "@mui/*>react:peer": "^17.0.0 || ^18.0.0"
```

#### 依赖类型选择器

默认情况下，覆盖会作用于 `dependencies`、`devDependencies`、`optionalDependencies` 和 `peerDependencies`。在目标后追加一个[依赖选择器语法](https://docs.vlt.sh/cli/selectors)伪选择器，即可把覆盖限制到某一个依赖组：

- `:prod` 只匹配 `dependencies`。
- `:optional` 只匹配 `optionalDependencies`。
- `:peer` 只匹配 `peerDependencies`。

pnpm-workspace.yaml

```yaml
overrides:
  "foo:prod": "^2.0.0"
  "@esbuild/*:optional": "-"
  "react-dom>react:peer": "^18.0.0 || ^19.0.0"
```

当覆盖用 `"-"` 从 `optionalDependencies` 中移除某个条目时，pnpm 也会从同一份清单的 `dependencies` 中移除该包的任何重复声明。

若想让被覆盖的版本与工作区其他地方使用的版本保持同步，可以在[目录](/docs/catalogs)中定义该版本并用 `catalog:` 协议引用它。这样版本只维护一处，同时被你的依赖和覆盖引用：

pnpm-workspace.yaml

```yaml
catalog:
  foo: "^1.0.0"

overrides:
  foo: "catalog:"
```

你也可以用 `catalog:<名称>` 引用具名目录。更多细节见[目录](/docs/catalogs)。

如果你发现对某个包的使用并不需要它的某个依赖，可以用 `-` 移除它。例如，若包 `foo@1.0.0` 为一个你用不到的函数依赖了名为 `bar` 的大包，移除它可以缩短安装时间：

pnpm-workspace.yaml

```yaml
overrides:
  "foo@1.0.0>bar": "-"
```

该特性与 `optionalDependencies` 配合尤其有用，其中大多数可选包都可以安全跳过。

#### 收敛覆盖

带 **空范围** 的选择器，即 `"pkg@"`，就是一个收敛覆盖。与无条件重写每条匹配边的常规覆盖不同，收敛覆盖只在某条依赖边的版本满足该边声明的范围时才重写它：

pnpm-workspace.yaml

```yaml
overrides:
  "form-data@": 4.0.6
```

有了上述配置，声明 `form-data: "^4.0.5"` 的依赖会被固定到 `4.0.6`，而声明 `^3.0.0` 的依赖保留自己的解析结果。这让兼容的使用方收敛到单一版本，无论现在还是将来新增的依赖方，而不会把不兼容的版本强加给依赖图的其余部分。

规则：

- 该值必须是 **精确版本**。范围、dist-tag 或 `-` 移除都会以 `ERR_PNPM_INVALID_CONVERGENCE_OVERRIDE` 报错失败。只要 catalog 条目解析为精确版本，就允许 `catalog:` 引用。
- 只有纯 semver 边参与。用 `workspace:`、`catalog:`、`npm:`、dist-tag 或 git/URL 说明符声明的边没有有意义的 "satisfies"（满足）关系，会保持原样不受影响。
- 收敛覆盖不能与父选择器组合使用：`"parent>pkg@"` 会被拒绝。
- 对于同一条边，常规覆盖始终优先于收敛覆盖。

当完整解析发现每个声明的范围也允许某个更新的版本时，pnpm 会警告该覆盖已过期，并指出应改为收敛到的版本。

#### 覆盖对等依赖

覆盖同样适用于 `peerDependencies`。在目标选择器上使用 `:peer`，可以只针对 `peerDependencies`，而不会覆盖同名的直接依赖或传递运行时依赖：

- **版本范围**（例如 `^1.0.0`、`*`）、**workspace** 和 **catalog** 协议：对等依赖的范围会被替换。
- **非范围说明符**，例如 `link:`、`file:` 或 `npm:` 协议：`peerDependencies` 保持不变（因此像 `"foo": "file:./foo.tgz"` 这样未指定类型的覆盖会替换 `dependencies` 中的 `foo`，而不会抹掉使用方的对等依赖版本范围）。
- **移除**（`-`）：该对等依赖（以及它的 `peerDependenciesMeta` 条目）会被移除。

例如，要放宽 `react-dom` 的 `react` 对等依赖，或允许 `@babel/*` 对等依赖使用任意版本：

pnpm-workspace.yaml

```yaml
overrides:
  "react-dom>react:peer": "^18.0.0 || ^19.0.0"
  "@babel/*:peer": "*"
```

要用直接依赖替换某个包的对等依赖，请在 [`packageExtensions`](#packageextensions) 中添加该依赖，并用 `:peer` 移除对等依赖声明：

pnpm-workspace.yaml

```yaml
packageExtensions:
  react-dom:
    dependencies:
      react: "18.3.1"

overrides:
  "react-dom>react:peer": "-"
```

### warnUnusedOverrides

- 默认值：**true**
- 类型：**布尔值**

为 `true` 时，解析整个依赖图的安装会对 [`overrides`](#overrides) 中每一条没有匹配到任何依赖的条目发出警告，格式为一行，例如 `2 overrides matched no dependency: foo, parent>child`。

只会上报 `pnpm-workspace.yaml` 或它所包含的本地文件声明的条目。配置依赖或 `updateConfig` 钩子添加的条目不会上报。收敛覆盖也不会上报，因为 pnpm 会在它们过期时给出警告；移除覆盖（`"-"`）同样不上报，因为它们没有可匹配的对象。

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

本节设置用于调整 [pnpm update](/docs/cli/update) 和 [pnpm outdated](/docs/cli/outdated) 命令。

#### update.ignoreDeps

有时你无法更新某个依赖。例如，该依赖的最新版本开始使用 ESM，但你的项目还不是 ESM。令人烦恼的是，运行 `pnpm update --latest` 时，`pnpm outdated` 命令总会打印出这样的包并将其更新。不过，你可以在 `ignoreDeps` 字段中列出你不想升级的包：

```yaml
update:
  ignoreDeps:
  - load-json-file
```

也支持模式匹配，因此你可以忽略某个作用域下的任意包：`@babel/*`。

被你忽略的包在点名时仍会更新，例如 `pnpm update load-json-file`。当所有选择器都被取反时，它们保持不变，例如 `pnpm update '!webpack'`。

#### update.changeset

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm update` 会在更新工作区清单后写入一条 [变更意图](/docs/versioning)：为每个因更新而改变了 `dependencies` 或 `optionalDependencies` 的工作区包声明一次 `patch` 提升，并在其 `peerDependencies` 改变时声明一次 `major` 提升。等同于传入 [--changeset](/docs/cli/update#--changeset)；传入 `--no-changeset` 可在单次运行中覆盖该设置。

#### update.githubActions

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm update` 和 `pnpm outdated` 还会检查仓库工作流文件所引用的 GitHub Actions。等同于传入 [--include-github-actions](/docs/cli/update#--include-github-actions)。参见 [更新 GitHub Actions](/docs/cli/update#updating-github-actions)。

#### update.githubActionsServer

- 默认值：`GITHUB_SERVER_URL` 环境变量，回退到 **https://github.com**
- 类型：**URL**

承载工作流文件所引用 GitHub Actions 仓库的 GitHub 服务器的基础 URL（例如某个 GitHub Enterprise Server）。该 URL 必须使用 `https://` 或 `http://` 协议。只有在可信网络上的可信服务器才使用 `http://`：用于将 action 固定到提交哈希的 ref 会通过该 URL 拉取，未加密的流量可能被篡改。

:::info[信息]

`updateConfig.ignoreDependencies` 是 `update.ignoreDeps` 已废弃的旧名，仍然可用。当两者都设置时，`update` 段优先，并会打印一条警告。

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

:::note[说明]

在平台之间复制 `node_modules` 可能导致原生模块加载错误，例如 `invalid ELF header` 或 `not a valid Win32 application`。对于发布了平台相关可选依赖的包，请在安装前在 `supportedArchitectures` 中列出目标操作系统、CPU 和 C 库。锁文件可以为每个平台变体保存单独的条目。

该设置不会交叉编译原生插件。如果某个包在安装脚本中构建其插件，请在目标平台上安装或重新构建它。

:::

#### 平台列表

自 v12.5.0 起提供

除了 `os`、`cpu` 和 `libc` 映射之外，也可以直接列出要准备的平台：

```yaml
supportedArchitectures:
  - linux-x64
  - linux-x64-musl
  - darwin-arm64
  - win32-x64
```

每个条目都是一个平台标签：先是 `<os>-<cpu>`，然后在 Linux 平台使用 musl 时加上 `musl`，再是该平台所具备的基线与 ABI，例如 `linux-x64-manylinux_2_28`（glibc 2.28）、`darwin-arm64-macos_14_0`、`win32-x64-windows_10_0`、`linux-x64-napi8` 或 `linux-x64-node127`（Node.js ABI）。`<os>` 和 `<cpu>` 使用 Node.js 的名称，因此 `freebsd-x64` 和 `linux-loong64` 也是平台。不带 C 库的 Linux 条目表示 glibc。

pnpm 之前接受的写法仍然有效：如 `glibc` 或 `gnu` 表示 C 库、架构的其他写法（如 `amd64`）、`musllinux_<主>_<次>` wheel 基线，以及 Rust 目标三元组，因此 `x86_64-unknown-linux-gnu` 等价于 `linux-x64`。`current` 表示运行安装的平台。Python 会为列表中的 Linux、macOS 和 Windows 平台解析，并报告其他平台。

该列表只准备列出的平台。映射形式继续以原有含义工作。Python 在为多个环境锁定时，会把这些目标与 [`python.versions`](/docs/python#pythonversions) 一同使用。

### optional

- 默认值：**true**
- 类型：**布尔值**

设为 `false` 时会在安装期间跳过可选依赖，包括传递的可选依赖。等价于 [`pnpm install --no-optional`](/docs/cli/install#--no-optional)。

### ignoredOptionalDependencies

:::note[说明]

已废弃：请改用带 `:optional` 和 `"-"` 的 [`overrides`](#dependency-type-selectors)（例如 `"fsevents:optional": "-"` 和 `"@esbuild/*:optional": "-"`）。出于向后兼容，`ignoredOptionalDependencies` 仍然可用。

:::

如果某个可选依赖的名称包含在此数组中，它将被跳过。例如：

```yaml
ignoredOptionalDependencies:
- fsevents
- "@esbuild/*"
```

### forceIgnoresPlatform

自 v12.7.0 起提供

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，[`pnpm install --force`](/docs/cli/install#--force) 也会安装 `os`、`cpu` 或 `libc` 与宿主机不匹配的可选依赖。为 `false` 时，`--force` 会重新拉取每个包，但仍会跳过为其他平台构建的可选依赖。

pnpm v11 的行为相当于该设置为 `true`。若想故意安装其他平台的可选依赖，请优先使用 [`supportedArchitectures`](#supportedarchitectures)。

### minimumReleaseAge

- 默认值：**1440**
- 类型：**数字（分钟）**

为降低安装被攻陷包的风险，你可以推迟对新发布版本的安装。在大多数情况下，恶意发布会在一个小时之内被发现并从 registry 中移除。

`minimumReleaseAge` 定义了版本发布后、pnpm 才会安装它所需经过的最少分钟数。它适用于 **所有依赖**，包括传递依赖。它不适用于以 `version+integrity` 锁定的[配置依赖](/docs/config-dependencies)。

例如，以下设置确保只能安装至少一天前发布的包：

```yaml
minimumReleaseAge: 1440
```

声明为 [`serverType: pnpr`](/docs/registries#servertype) 的 registry 所支持的 `minimumReleaseAge` 至多为 43200 分钟（30 天）。

### minimumReleaseAgeExclude

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

你也可以使用模式匹配。例如，允许你所在组织的全部包：

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
- '@myorg/*'
```

你也可以豁免特定版本（或用 `||` 析联合并的版本列表）。这允许把例外固定到成熟期规则上：

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
- nx@21.6.5
- webpack@4.47.0 || 5.102.1
```

### minimumReleaseAgeExcludePrune

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm add`、`pnpm update` 和 `pnpm remove` 会清理 `pnpm-workspace.yaml` 中 [minimumReleaseAgeExclude](#minimumreleaseageexclude) 里新写入锁文件不再解析的条目：已消失的版本会被丢弃（当某条目没有任何版本剩余时该条目被移除），锁文件中已不存在的包对应的条目也会被移除。名称模式（`@myorg/*`）始终保留。清理还会检查已解析的配置依赖及其传递依赖。

当本次安装的锁文件未覆盖整个工作区（[sharedWorkspaceLockfile: false](/docs/workspaces#sharedworkspacelockfile)）时，会跳过此清理，因为另一个项目仍需要的条目会被误判为过期。被保留条目上的注释会在重写后依然存在。

### minimumReleaseAgeIgnoreMissingTime

- 默认值：**true**
- 类型：**布尔值**

当设为 `true` 时，对于 registry 元数据不含 `time` 字段的包（某些私有 registry 和镜像会省略该字段），pnpm 会跳过 [minimumReleaseAge](#minimumreleaseage) 检查。设为 `false` 时，在这种情况下改为让解析失败，而不是安装该包。

```yaml
minimumReleaseAgeIgnoreMissingTime: false
```

该设置也管理 [`trustPolicy`](#trustpolicy)，后者读取相同的发布日期：`trustPolicy: no-downgrade` 会跳过 registry 无法确定日期的包并给出警告，而不是以 `ERR_PNPM_MISSING_TIME` 使安装失败。

此开关针对的是无法给自身发布定日期的 registry，而不是 registry 声称从未发布过的包：在 [锁文件校验](/docs/supply-chain-security) 期间，若某个会为自己列出的每个版本都标注日期的 packument 中缺失某锁文件条目，则仍是硬性失败。

### referenceTime

- 默认值：**undefined**
- 类型：**字符串**（RFC 3339 时间戳）

用于评估与时间相关设置的参考时间。未设置时，pnpm 使用当前时间。目前这适用于 [`minimumReleaseAge`](#minimumreleaseage) 和 [`trustPolicyIgnoreAfter`](#trustpolicyignoreafter)，在解析和[锁文件校验](/docs/supply-chain-security)中都是如此。

固定的参考时间会让这些时间阈值在多次运行之间保持不变。它不会冻结 registry 元数据，也不影响超时、重试或缓存过期。

请在 `pnpm-workspace.yaml` 中设置它，或使用 `PNPM_CONFIG_REFERENCE_TIME` 环境变量。全局 `config.yaml` 不适用。在 `pnpm-workspace.yaml` 中，不是时间戳的值、或比当前时间晚超过 10 分钟的值，会使命令失败。来自其他来源的同类值会被忽略并给出警告。需要推进时间的作业应安全地写入过去的某个时间，例如当天的开始时刻。

当 `minimumReleaseAge` 的截止时间，或 `trustPolicy: no-downgrade` 下的 `trustPolicyIgnoreAfter` 窗口需要从该设置往回推算时，使用 [`pnprServer`](https://pnpm.io/pnpr/install-acceleration#enabling-it) 的安装会在本地解析。

```yaml
referenceTime: "2026-11-01T00:00:00Z"
```

### minimumReleaseAgeStrict

- 默认值：若显式配置了 [minimumReleaseAge](#minimumreleaseage) 则为 **true**，否则为 **false**
- 类型：**布尔值**

控制当所请求范围内没有任何依赖版本满足 [minimumReleaseAge](#minimumreleaseage) 约束时 pnpm 的行为。当设为 `false` 时，pnpm 回退到一个不满足 `minimumReleaseAge` 约束的版本，使安装仍能成功。当设为 `true` 时，pnpm 改为让解析失败。

默认值取决于你是否自行配置了 `minimumReleaseAge`：如果你显式设置了它（在 `pnpm-workspace.yaml` 中、在全局 `config.yaml` 中、通过 `PNPM_CONFIG_*` 变量或在命令行上），严格模式默认开启，因此该设置会被强制执行。`minimumReleaseAge` 的内置默认值（1440 分钟）为向后兼容采用非严格模式。

```yaml
minimumReleaseAgeStrict: true
```

通过 pnpr 服务器解析时，若没有匹配的成熟版本，严格模式会使该请求失败。在非严格模式下，pnpm 会把服务器选出的回退版本加入 `pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude`。

### trustPolicy

- 默认值：**off**
- 类型：**no-downgrade** | **off**

当设为 `no-downgrade` 时，如果某个包的信任级别相比其先前发布的版本有所下降，pnpm 会失败。例如，若某个包此前由受信任的发布者发布，而现在只有来源证明（provenance）或没有任何信任证据，安装将会失败。这有助于防止安装可能被攻陷的版本。信任检查仅基于发布日期，而非 semver。如果任何更早发布的版本拥有更强的信任证据，该包就无法安装。在为非预发布版本安装评估信任证据时会忽略预发布版本，因此受信任的预发布版本不会阻止缺乏信任证据的稳定版本。

该检查也涵盖项目在 `packageManager` 或 `devEngines.packageManager` 中固定的 pnpm 版本。pnpm 会在切换到该版本或把它记录进锁文件之前失败。

### trustPolicyExclude

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

- 默认值：**undefined**
- 类型：**数字（分钟）**

允许对发布已超过指定分钟数的包忽略信任策略检查。这在启用严格信任策略时很有用，因为它允许安装较旧的包版本（这些版本可能没有用签名或来源证明发布的流程），而无需手动排除，前提是它们因年代久远而被认为是安全的。

### trustPolicyExcludePrune

自 v12.4.0 起提供

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，`pnpm install`、`pnpm add`、`pnpm update`、`pnpm remove` 和 `pnpm dedupe` 会清理 `pnpm-workspace.yaml` 中那些新写出的锁文件已不再解析到的 [`trustPolicyExclude`](#trustpolicyexclude) 条目：消失的版本会被丢弃（当一个条目的所有版本都不再存在时，该条目被移除），锁文件中已不存在的包的条目也会被移除。名称模式（`@myorg/*`）始终保留。清理还会检查已解析的配置依赖及其传递依赖。

当安装的锁文件没有覆盖整个工作区（[`sharedWorkspaceLockfile: false`](/docs/workspaces#sharedworkspacelockfile)）时，清理会被跳过，因为其他项目仍需要的条目看起来会像是过期的。被保留条目上的注释会在重写后依然存在。

### trustLockfile

- 默认值：**false**
- 类型：**布尔值**

当设为 `true` 时，`pnpm install` 会跳过供应链校验步骤，该步骤本会对已加载锁文件中的每个条目重新应用 [minimumReleaseAge](#minimumreleaseage)、[trustPolicy](#trustpolicy) 和 [blockExoticSubdeps](#blockexoticsubdeps)。此安装将锁文件视为已被信任。

在锁文件实际上属于可信基础的场景中很有用，例如每个提交都来自受信任作者的闭源项目。被投毒的锁文件（贡献者在比 CI 所强制策略更弱的策略下编写的锁文件）可能蒙混过关，因此只要外部协作者可以编辑锁文件，就应保持此值为 `false`。

在大型工作区中，校验步骤会在整个安装期间把各包的 registry 元数据保存在内存里；禁用它可减少内存占用，但代价是失去供应链检查。大多数使用默认 `frozenLockfile` CI 工作流的项目无需设置此项。

### blockExoticSubdeps

- 默认值：**true**
- 类型：**布尔值**

当设为 `true` 时，只有直接依赖（列在你根 `package.json` 中的依赖）才能使用特殊来源（如 git 仓库或直接的 tarball URL）。所有传递依赖必须从可信来源解析，例如配置的 registry、工作区包，或受信任的 GitHub 仓库（node、bun、deno）。非本地包不能解析自己包归档之外的宿主机文件系统路径（`file:` 或 `link:`），除非由工作区的 `overrides`、`packageExtensions` 或 `.pnpmfile.cjs` 重写。

此设置通过阻止传递依赖从不受信任的位置拉取代码，帮助加固依赖供应链安全。

特殊来源包括：

- Git 仓库（`git+ssh://...`）
- 指向 tarball 的直接 URL 链接（`https://.../package.tgz`）

pnpr 服务器不会获取非常规的传递依赖。设置了 [`pnprServer`](#pnprserver) 且 `blockExoticSubdeps: false` 时，pnpm 会在本地解析。

### registries

- 默认值：**undefined**
- 类型：**Record<string, RegistryDeclaration>** 或 **Record<string, string>**

声明项目从中安装包的 registry。每个 registry 只声明一次，以其 URL 为键，pnpm 所知道的关于它的一切都在该条目中：路由到它的 `scopes`、它响应裸说明符的 `prefix`，服务器如何排布 tarball URL（`serverType`、`supportsTimeField`），以及 pnpm 同时向它发出多少请求（`networkConcurrency`）。每个字段的完整说明在专门的 [registry](/docs/registries) 页面上。

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

pnpm 会把 `https://registry.npmjs.com/` 规范化为 `https://registry.npmjs.org/`。在 registry 根目录为任一主机名配置的凭据都适用于规范化的 registry。HTTP URL、自定义端口和 registry 子路径保持不变。

对于按 URL 作用域划分的环境凭据，显式的 `registry.npmjs.org` 条目优先于 `registry.npmjs.com` 条目。

此设置也可以在[全局配置文件](/docs/configuring#global-configuration)（`config.yaml`）中定义，这对那些应应用于机器上每个项目而非单个仓库的 registry 很有用。其中会读取生态索引、路由（`scopes` 和 `prefix`）和 `networkConcurrency`；`serverType` 和 `supportsTimeField` 会塑造锁文件，因此只从 `pnpm-workspace.yaml` 读取。参见 [该设置可放置的位置](/docs/registries#where-the-setting-may-live)。

### namedRegistries

- 默认值：**undefined**
- 类型：**Record<string, string>**

:::note[说明]

已废弃：请改为在 [registries](#registries) 中声明 `prefix`，参见 [registry](/docs/registries) 页面。`namedRegistries` 仍会被读取，但仅针对 `registries` 未声明的前缀；当两个设置都声明前缀时，pnpm 会警告。下文关于别名的一切，包括内置别名、保留名称和锁文件键，同样适用于通过 `prefix` 声明的别名。

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

此设置也可以在[全局配置文件](/docs/configuring#global-configuration)（`config.yaml`）中定义，因此像 `work:` 这样的别名可以在机器上的每个项目之间共享。

#### 内置别名

有两个别名无需任何配置即可使用：

| **Alias** | **Registry** | **Notes** |
| --- | --- | --- |
| `gh:` | `https://npm.pkg.github.com/` | 即 [GitHub Packages npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)。 |
| `npmjs:` | `https://registry.npmjs.org/` | 即公共 npm registry。 |

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

遮蔽了保留依赖说明符前缀（`file`、`link`、`workspace`、`runtime`、`npm`、`jsr`、`git`、`github`、`gitlab`、`bitbucket`、`catalog`、`custom`、`http`、`https`、`ssh`）的别名会被拒绝并报 `ERR_PNPM_RESERVED_NAMED_REGISTRY_NAME`。自 v12.5.0 起，出于 Package URL 的需要，`pkg` 无论大小写也被保留。自 v12.13.0 起，`tool` 为[预置工具](/docs/package-sources#provisioned-tools)保留。别名还必须以字母开头，且只包含字母、数字、`.`、`_` 和 `-`。

#### 锁文件中的命名 registry

从命名 registry 解析的包会以带 registry 限定的键 `<name>@<registryName>:<version>` 记录在 `pnpm-lock.yaml` 中：

pnpm-lock.yaml

```yaml
packages:
  foo@work:1.0.0:
    resolution: {integrity: sha512-...}
```

仅以 `name@version` 为键时，由两个 registry 提供的同名同版本会合并到单个条目，且谁先解析就决定了每个使用方拿到的 tarball。这是一种包替换风险：你期望从私有 registry 获得的包，可能改由另一个发布了相同名称和版本的 registry 安装，而锁文件中没有任何迹象能揭示这一点。带 registry 限定的键让每个 registry 拥有自己的条目，并固定某个依赖来自哪一个。

锁文件格式版本保持不变，且限定键只出现在从命名 registry 解析的包上，包括内置的 `gh:` 和 `npmjs:` 别名，它们无需 `namedRegistries` 条目。来自默认 registry 的大多数包仍使用普通键，如下文所述。既不声明前缀、也不通过别名安装任何东西的项目看不出任何差异，较旧的 pnpm 版本也能继续读取该文件。

键记录的是包从哪个 registry 解析而来，而不是它的依赖最初是怎么写的。声明了前缀的 registry（通过 [`registries`](#registries) 中的 `prefix` 或通过 `namedRegistries`）会用该前缀为从它解析出的每个包建键：无论是写成 `work:^1.0.0` 的，还是写成普通范围但其 scope 被 `registries` 路由到该 URL 的。因此，一个普通范围和一个带前缀的说明符如果指向同一个 registry，就会共用同一个 `packages:` 条目和 `node_modules/.pnpm` 中的一份拷贝；也就是说，一个以普通范围依赖 `@work/util` 的已发布包，与你的项目通过 `work:` 安装的那份是同一份。内置的 `gh:` 和 `npmjs:` 别名只限定写出了它们的那些说明符，除非你自己声明了该前缀。同名同版本由两个 registry 提供时，仍然会有两个条目。

来自默认 registry（即 `registry` 设置所指定的 registry）的包保留普通键。这包括通过指向默认 registry 的前缀安装的包，例如 `npmjs` 指向你的 `registry` 设置所使用的 npm 镜像时的情形。普通范围和这样的带前缀说明符共用普通条目。例外是 scope 被 `registries` 路由到另一个 registry 的包：当 `@work` 被路由到别处时，`npmjs:@work/util` 的键是 `@work/util@npmjs:<version>`。

当多个前缀声明同一个 registry 时，它的包使用其中字典序最小的前缀建键，因此指向同一个 URL 的 `work:^1.0.0` 和 `zeta:^1.0.0` 会记录为 `foo@work:1.0.0`。`package.json` 中的说明符保持原样。

:::caution[注意]

如果有依赖通过别名安装，那么你在 v11.20.0 或更新版本上首次进行的非冻结安装会重新键化这些条目，表现为一次锁文件差异。请提交它，该差异正是所应用的修复。同时也应审查它：某个条目移动到你未曾预期的 registry 值得追查。

当你路由的某个 scope 指向的 registry 也声明了前缀时，同理适用：下一次 `pnpm install` 会把按 scope 路由的条目移到该前缀下，并与带前缀的条目合并。冻结安装仍会按锁文件记录的样子安装。

让项目中的所有成员先迁移到 v11.20.0 或更新版本。较旧的 pnpm 能正常读取重新键化后的锁文件，冻结安装也不受影响，但它自己不会生成带 registry 限定的键：任何更新锁文件的安装都会把这些条目写回旧形态，而下一次在当前 pnpm 上的安装又会重新为它们加限定。于是锁文件来回翻转，而只要它处于旧形态，项目就又暴露在风险中。由于锁文件格式版本被有意保持不变，pnpm 无法检测到此情况并向你发出警告。

没有保留旧行为的设置，旧形态本身就是漏洞。

:::

普通键不记录 registry，因此 pnpm 会在工作区状态（`node_modules/.pnpm-workspace-state-v1.json`）中记下上次解析锁文件时每个 scope 路由到了哪个 registry。当你把某个 scope 路由到另一个 registry 时，下一次 `pnpm install` 会从新 registry 重新解析该 scope 的包及其依赖，按新 registry 提供的锁定版本解析，并为它不提供的锁定版本在范围内另选一个版本。冻结安装仍会按锁文件记录的样子安装。没有这份记录时（例如全新克隆），pnpm 会按当前配置的 registry 来解析普通键。只有 scope 路由会以这种方式被跟踪：更换默认 registry（这通常是镜像之间的切换）不会重新解析任何内容。

锁文件引用的每个非内置别名都必须保持声明状态，要么通过 [registries](#registries) 中的 `prefix`，要么通过 `namedRegistries`。读取一个别名已消失的条目会以 `ERR_PNPM_MISSING_NAMED_REGISTRY` 失败，而不是回退到默认 registry，因为那会拉取到一个不同的包。重命名别名会重新解析那些使用了它的包。

对于命名 registry 的包，遵循标准 registry 布局的 tarball URL 不再写入锁文件；它们会按需根据别名声明的 URL 重新计算。

### pnprServer

- 默认值：**null**
- 类型：**字符串**

[pnpr](https://pnpm.io/pnpr) 服务器的 URL。参见[安装加速](https://pnpm.io/pnpr/install-acceleration)。

设置后，`pnpm install` 会把依赖解析卸载给远程 pnpr 服务器。pnpm 把工作区清单和 registry 配置发送给服务器，服务器针对这些 registry 解析依赖图，并在遍历依赖图时以帧的形式流式返回已解析的包元数据，好让 pnpm 平行下载 tarball。解析结束后，服务器返回完整的锁文件，pnpm 在本地链接 `node_modules`。

公共包会直接从各自对应的 registry 平行拉取。通过 pnpr 配置的私有包则使用服务端的上游凭据，从它的 registry 端点获取；客户端的上游 registry 凭据不会发送给 pnpr 服务器。

```yaml
pnprServer: https://pnpr.example.com/
```

也可以通过 `--config.pnprServer=<url>` 命令行选项或 `PNPM_CONFIG_PNPR_SERVER` 环境变量配置。

如果服务器拒绝安装所用的某个设置，或无法返回 pnpm 能读取的锁文件格式，pnpm 会打印警告并改为在本地解析。

设置 `pnprServer` 时，在 `.npmrc` 中为 pnpr 服务器 URL 配置的认证头（例如 `//pnpr.example.com/:_authToken=...`）会用于通过 HTTPS 或环回 HTTP 对该服务器的请求认证。

远程解析失败时，pnpm 会报告服务器的 `ERR_PNPR_` 错误码和原因。

### autoDedupe

自 v12.6.0 起提供

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，`pnpm install` 和 `pnpm add` 会在安装期间对兼容的依赖版本去重。如果某个依赖以多个版本出现，且其中一个版本满足工作区中的每个范围，pnpm 就会为它们统一选用该版本。

设为 `false` 时，每个项目的依赖都按自己的范围解析。例如，某个项目写着 `ajv: "*"`，即使另一个项目依赖 `ajv@^6`，它也会得到最新的 Ajv。项目在 `peerDependencies` 中列出的包仍跟随其他项目所用的版本。运行 [`pnpm dedupe`](/docs/cli/dedupe) 可让两个项目使用同一个版本。如果你用 `pnpm dedupe --check` 检查锁文件，请设置 `autoDedupe: true`。

去重覆盖整个工作区。诸如 `pnpm --filter <项目> add` 这样的带过滤命令，也可能改动过滤器之外项目的锁文件条目，这些项目会在下一次 `pnpm install` 时链接上去重后的版本。

```yaml
autoDedupe: true
```

冻结安装（`--frozen-lockfile`）不会改动锁文件。去重只在锁文件被写入时执行。

为了让其他机器上的安装能复用去重后的锁文件，请设置 [`lockfile.includeResolutionSettings`](/docs/settings/store#lockfileincluderesolutionsettings)。

如果自执行过去一次执行去重的 `pnpm install --lockfile-only` 写出锁文件后没有发生变化，`pnpm install --lockfile-only` 会跳过解析。这样的安装会保留锁文件，即使此后发布了新版本，或只更改了 `resolutionMode` 之类的设置。请运行 [`pnpm dedupe`](/docs/cli/dedupe) 来应用这类改动。
