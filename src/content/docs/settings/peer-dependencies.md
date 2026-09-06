---
title: "对等依赖设置"
headingIds: ["autoinstallpeers","version-conflicts","conflict-resolution","dedupepeerdependents","dedupepeers","strictpeerdependencies","resolvepeersfromworkspaceroot","peerdependencyrules","peerdependencyrulesignoremissing","peerdependencyrulesallowedversions","peerdependencyrulesallowany"]
---

### autoInstallPeers

- 默认值：**true**
- 类型：**Boolean**

为 `true` 时，任何缺失的非可选对等依赖都会被自动安装。

所选版本为满足 peer 范围的最高版本。由于自动安装的对等依赖并非项目声明的依赖，[resolutionMode](/docs/settings/other#resolutionmode) 会将其视为子依赖而非直接依赖，因此 `lowest-direct` 不会降低其版本。

#### 版本冲突

如果不同包对某个对等依赖的版本要求相互冲突，pnpm 不会自动安装该冲突对等依赖的任何版本，而是打印一条警告。例如，若一个依赖要求 `react@^16.0.0`，另一个要求 `react@^17.0.0`，这些要求彼此冲突，就不会进行自动安装。

#### 解决冲突

出现版本冲突时，你需要自行判断该安装对等依赖的哪个版本，或更新相关依赖以统一它们的对等依赖要求。

### dedupePeerDependents

- 默认值：**true**
- 类型：**Boolean**

将此设置设为 `true` 时，含有对等依赖的包会在对等依赖解析后进行去重。

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

### dedupePeers

自 v10.33.0 起提供

- 默认值：**false**
- 类型：**Boolean**

启用后，对等依赖后缀使用仅含版本的标识（`name@version`）而不是完整的依赖路径，从而消除像 `(foo@1.0.0(bar@2.0.0))` 这样的嵌套后缀。对于存在大量递归对等依赖的项目，这能大幅减少包实例的数量。

这与 [dedupePeerDependents](#dedupepeerdependents) 不同，后者针对在不同工作区项目中拥有相同对等依赖的包进行去重。`dedupePeers` 简化的是对等依赖后缀格式本身。

### strictPeerDependencies

- 默认值：**false**
- 类型：**Boolean**

启用后，若依赖树中存在缺失或无效的对等依赖，命令将会失败。

### resolvePeersFromWorkspaceRoot

- 默认值：**true**
- 类型：**Boolean**

启用后，将使用工作区根项目的依赖来解析工作区内任意项目的对等依赖。这一功能很有用：你可以只在工作区根目录安装对等依赖，同时确保工作区中的所有项目使用相同版本的对等依赖。

### peerDependencyRules

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
    "button@2>react": "17",
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
