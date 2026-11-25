---
title: "对等依赖设置"
headingIds: ["autoinstallpeers", "optional-peer-dependencies", "version-conflicts", "conflict-resolution", "autoinstallpeersfromhighestmatch", "dedupepeerdependents", "projectscopedoptionalpeers", "dedupepeers", "addmissingpeertypes", "strictpeerdependencies", "resolvepeersfromworkspaceroot", "peerdependencyrules", "peerdependencyrulesignoremissing", "peerdependencyrulesallowedversions", "peerdependencyrulesallowany"]
---

### autoInstallPeers

- 默认值：**true**
- 类型：**Boolean**

为 `true` 时，任何缺失的非可选对等依赖都会被自动安装。

所选版本为满足 peer 范围的最高版本。由于自动安装的对等依赖并非项目声明的依赖，[resolutionMode](/docs/settings/other#resolutionmode) 会将其视为子依赖而非直接依赖，因此 `lowest-direct` 不会降低其版本。

#### 可选对等依赖

只有在满足可选对等依赖范围的某个版本已经安装时，pnpm 才会安装缺失的可选对等依赖；此时 pnpm 会把该可选对等依赖解析到那个版本。

当 [`dedupePeerDependents`](#dedupepeerdependents) 为 `true` 时，该版本可以来自工作区中的任何项目，包括另一个项目的 `devDependencies`。例如，若一个项目依赖 `webpack`，另一个项目在 `devDependencies` 中有 `webpack-cli`，那么两个项目都会得到那个以 `webpack-cli` 为可选对等依赖的 `webpack` 实例。

当 `dedupePeerDependents` 为 `false`，或 [`projectScopedOptionalPeers`](#projectscopedoptionalpeers) 为 `true` 时，该版本必须来自项目自身的依赖。若 [`resolvePeersFromWorkspaceRoot`](#resolvepeersfromworkspaceroot) 为 `true`，工作区根目录的依赖也算在内。

若安装该版本会让项目留下未满足的对等依赖，pnpm 会跳过它。这涵盖该版本自身的 peer、pnpm 会随它安装的必需 peer，以及它们的 peer。`dedupePeerDependents` 不会通过共享另一个项目中声明它的包的实例，把被跳过的 peer 重新交给该项目。

当 `autoInstallPeers` 为 `false` 且 `dedupePeerDependents` 为 `true` 时，pnpm 也会以这种方式解析可选 peer。要停止这一行为，请把两个设置都设为 `false`。

为新项目选择工作区提供方时，pnpm 会优先使用锁文件中已经固定的兼容可选对等依赖版本。

当你更改或移除某个直接依赖时，它之前的 peer 版本不再指导可选对等依赖的选择。未更改的依赖仍可以保留其锁定的 peer 版本。仅存在于旧锁文件中的、已被移除的提供方，不会妨碍与仍在安装的提供方去重。

#### 版本冲突

如果不同包对某个对等依赖的版本要求相互冲突，pnpm 不会自动安装该冲突对等依赖的任何版本，而是打印一条警告。例如，若一个依赖要求 `react@^16.0.0`，另一个要求 `react@^17.0.0`，这些要求彼此冲突，就不会进行自动安装。

#### 解决冲突

出现版本冲突时，你需要自行判断该安装对等依赖的哪个版本，或更新相关依赖以统一它们的对等依赖要求。

### autoInstallPeersFromHighestMatch

- 默认值：**false**
- 类型：**布尔值**

设为 `true` 时，pnpm 用 `||` 合并冲突的对等依赖范围，并安装满足其中任意一个的最高版本。例如，若一个依赖要求 `react@^16.0.0`，另一个要求 `react@^17.0.0`，pnpm 会安装最高的 `react@17`。

只有 semver 范围可以被合并。冲突的路径、别名或标签会让该对等依赖保持缺失。相同的非 semver 说明符会被保留。

### dedupePeerDependents

- 默认值：**true**
- 类型：**Boolean**

将此设置设为 `true` 时，含有对等依赖的包会在对等依赖解析后进行去重。

该设置还让 pnpm 可以用工作区其它地方已有的兼容版本来解析缺失的必需与可选对等依赖，包括其它项目的传递依赖。即使 `autoInstallPeers` 为 `false`，必需对等依赖也可以这种方式解析。以这种方式满足的必需对等依赖不会被报告为缺失。当 `autoInstallPeers: false` 时，若项目及其依赖祖先都没有声明提供方，[`pnpm peers check`](/docs/cli/peers) 会给出一条单独的提示。

若要禁止这种工作区范围的对等依赖复用，请把 `autoInstallPeers` 与 `dedupePeerDependents` 都设为 `false`。当 [`resolvePeersFromWorkspaceRoot`](#resolvepeersfromworkspaceroot) 启用时，工作区根的依赖仍可提供对等依赖。

解析某个包的对等依赖，并不会把该对等依赖加入你项目已声明的依赖。如果你的项目脚本会运行某个对等依赖包的可执行文件，请把该包直接声明到你项目的 `dependencies` 或 `devDependencies` 中。

例如，假设有一个包含两个项目的工作区，二者的依赖中都有 `webpack`。`webpack` 的可选对等依赖中有 `esbuild`，而其中一个项目的依赖中有 `esbuild`。在这种情况下，pnpm 会将 `webpack` 的两个实例链接到 `node_modules/.pnpm` 目录：一个带 `esbuild`，另一个不带：

```
node_modules
  .pnpm
    webpack@1.0.0_esbuild@1.0.0
    webpack@1.0.0
project1
  node_modules
    webpack -> ../../node_modules/.pnpm/webpack@1.0.0/node_modules/webpack
project2
  node_modules
    webpack -> ../../node_modules/.pnpm/webpack@1.0.0_esbuild@1.0.0/node_modules/webpack
    esbuild
```

这是合理的，因为 `webpack` 被两个项目使用，而其中一个项目没有 `esbuild`，所以两个项目无法共享同一个 `webpack` 实例。然而，这并非大多数开发者的预期，尤其在提升后的 `node_modules` 中只会有一个 `webpack` 实例。因此，你现在可以使用 `dedupePeerDependents` 设置，在 `webpack` 没有冲突对等依赖时对它去重（说明见文末）。在这种情况下，若将 `dedupePeerDependents` 设为 `true`，两个项目将使用同一个 `webpack` 实例，即已解析到 `esbuild` 的那个实例：

```
node_modules
  .pnpm
    webpack@1.0.0_esbuild@1.0.0
project1
  node_modules
    webpack -> ../../node_modules/.pnpm/webpack@1.0.0_esbuild@1.0.0/node_modules/webpack
project2
  node_modules
    webpack -> ../../node_modules/.pnpm/webpack@1.0.0_esbuild@1.0.0/node_modules/webpack
    esbuild
```

**什么是对等依赖冲突？** 冲突的对等依赖指的是如下所示的场景：

```
node_modules
  .pnpm
    webpack@1.0.0_react@16.0.0_esbuild@1.0.0
    webpack@1.0.0_react@17.0.0
project1
  node_modules
    webpack -> ../../node_modules/.pnpm/webpack@1.0.0_react@17.0.0/node_modules/webpack
    react (v17)
project2
  node_modules
    webpack -> ../../node_modules/.pnpm/webpack@1.0.0_react@16.0.0_esbuild@1.0.0/node_modules/webpack
    esbuild
    react (v16)
```

在这种情况下，我们无法对 `webpack` 去重，因为 `webpack` 的对等依赖中有 `react`，而 `react` 在两个项目的上下文中分别解析为两个不同的版本。

### projectScopedOptionalPeers

自 v12.19.0 起提供

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，只有当项目自身的依赖已经安装了某个可选对等依赖的版本时，项目才会得到它。若 [`resolvePeersFromWorkspaceRoot`](#resolvepeersfromworkspaceroot) 为 `true`，工作区根目录的依赖也算在内。只由另一个工作区项目安装的版本不计入。

[`dedupePeerDependents`](#dedupepeerdependents) 对其他一切仍然有效。它依旧会跨项目对包去重，除非去重会让某个项目得到它自身依赖并未安装的可选对等依赖。必需 peer 不受影响。

在 [`dedupePeerDependents`](#dedupepeerdependents) 的例子中，`project1` 会保留没有 `esbuild` 的那个 `webpack` 实例。

当 `dedupePeerDependents` 为 `false` 时该设置没有作用，因为那时可选 peer 本来就只从项目自身的依赖中解析。

更改该设置会改变锁文件。pnpm 在它生效期间会把它记录到锁文件的 `settings` 中，因此下一次安装会重新解析锁文件。

### dedupePeers

已废弃。请移除该设置。若需要不带对等依赖后缀的锁文件引用，请使用 [`lockfile.format: v13`](/docs/settings/store#lockfileformat)。

- 默认值：**false**
- 类型：**Boolean**

启用后，对等依赖后缀使用仅含版本的标识（`name@version`）而不是完整的依赖路径，从而消除像 `(foo@1.0.0(bar@2.0.0))` 这样的嵌套后缀。对于存在大量递归对等依赖的项目，这能大幅减少包实例的数量。

这与 [dedupePeerDependents](#dedupepeerdependents) 不同，后者针对在不同工作区项目中拥有相同对等依赖的包进行去重。`dedupePeers` 简化的是对等依赖后缀格式本身。

### addMissingPeerTypes

自 v12.12.0 起提供

- 默认值：**false**
- 类型：**布尔值**

为 `true` 时，某个依赖的每个对等依赖，都会让相应的 `@types` 包也成为它的可选对等依赖。对 `react` 有对等依赖的包会得到对 `@types/react` 的可选对等依赖，对 `@babel/core` 有对等依赖的包会得到 `@types/babel__core`。已经声明了该 `@types` 包的包会保留自己的声明。pnpm 不会安装工作区中无人依赖的 `@types` 包。

许多包对某个库有对等依赖，却没有声明它的 `@types` 包。此时 TypeScript 会在该包自身所在位置旁边寻找类型。启用 [`enableGlobalVirtualStore`](/docs/settings/node-modules#enableglobalvirtualstore) 后，那个位置在你的项目之外，因此你项目安装的类型找不到。使用该设置时，pnpm 会像处理任何[可选对等依赖](#optional-peer-dependencies)那样，把 `@types` 包链接到每个对该库有对等依赖的包旁边。

更改该设置会改变锁文件。

### strictPeerDependencies

- 默认值：**false**
- 类型：**Boolean**

启用后，若依赖树中存在缺失或无效的对等依赖，命令将会失败。

### resolvePeersFromWorkspaceRoot

- 默认值：**true**
- 类型：**Boolean**

启用后，将使用工作区根项目的依赖来解析工作区内任意项目的对等依赖。这一功能很有用：你可以只在工作区根目录安装对等依赖，同时确保工作区中的所有项目使用相同版本的对等依赖。

### peerDependencyRules

:::note[说明]

已废弃：`peerDependencyRules` 只在解析之后抑制对等依赖警告，并不会改变 `peerDependencies`。若你想修改或移除已声明的对等依赖范围、让对等依赖解析本身也被更新，请使用带 `:peer` 的 [`overrides`](/docs/settings/dependency-resolution#overriding-peer-dependencies)：

- `peerDependencyRules.ignoreMissing: ["react", "@babel/*"]` 只会让缺失对等依赖的警告静音。`overrides` 中的 `"react:peer": "-"` 与 `"@babel/*:peer": "-"` 会移除对等依赖声明及其 `peerDependenciesMeta` 条目，于是包不再从父级接收这些对等依赖。
- `peerDependencyRules.allowedVersions: { "button@2>react": "17" }` 只改变对等依赖不匹配的报告方式，没有保持行为不变的 `overrides` 替代方案。当你想放宽已声明的对等依赖范围并改变对等依赖解析时，请在 `overrides` 中使用 `"button@2>react:peer": "16 || 17"`。
- `peerDependencyRules.allowAny: ["@babel/*"]` 只抑制对等依赖版本不匹配的警告，并不会重写 `peerDependencies`，因此没有直接对应的 `overrides` 写法。只有当你想放宽已声明的对等依赖范围并改变对等依赖解析时，才在 `overrides` 中使用 `"@babel/*:peer": "*"`。

出于向后兼容，`peerDependencyRules` 仍可继续使用。

:::

#### peerDependencyRules.ignoreMissing

对于这些列表中提到的对等依赖，即使缺失，pnpm 也不会发出警告。

例如，使用以下配置时，若某个依赖需要 `react` 但 `react` 未安装，pnpm 不会打印警告：

```yaml
peerDependencyRules:
  ignoreMissing:
  - react
```

也可以使用包名模式：

```yaml
peerDependencyRules:
  ignoreMissing:
  - "@babel/*"
  - "@eslint/*"
```

`ignoreMissing` 匹配对等依赖的包名，或一个 glob。它不支持 [`allowedVersions`](#peerdependencyrulesallowedversions) 所接受的 `parent>peer` 或 `parent@range>peer` 选择器。

#### peerDependencyRules.allowedVersions

对于指定范围内的对等依赖，不会打印未满足的对等依赖警告。

例如，若你有一些依赖需要 `react@16`，但你确认它们在 `react@17` 下也能正常工作，则可以使用以下配置：

```yaml
peerDependencyRules:
  allowedVersions:
    react: "17"
```

这会告诉 pnpm，凡对等依赖中有 react 的任何依赖，都应允许安装 `react` v17。

也可以仅针对特定包的对等依赖屏蔽警告。例如，使用以下配置时，仅当 `react` v17 出现在 `button` v2 包的对等依赖中，或出现在任何 `card` 包的依赖中时才会被允许：

```yaml
peerDependencyRules:
  allowedVersions:
    "button@2>react": "17"
    "card>react": "17"
```

#### peerDependencyRules.allowAny

`allowAny` 是一个包名模式数组，任何匹配该模式的对等依赖都将从任意版本解析，无论 `peerDependencies` 中指定了什么范围。例如：

```yaml
peerDependencyRules:
  allowAny:
  - "@babel/*"
  - "eslint"
```

上述设置会屏蔽所有与 `@babel/` 包或 `eslint` 相关的对等依赖版本不匹配警告。

`allowAny` 匹配对等依赖的包名，或一个 glob。它不支持 [`allowedVersions`](#peerdependencyrulesallowedversions) 所接受的 `parent>peer` 或 `parent@range>peer` 选择器。
