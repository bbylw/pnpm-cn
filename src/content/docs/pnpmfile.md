---
title: ".pnpmfile.mjs"
headingIds: ["hooks","tldr","hooksreadpackagepkg-context-pkg--promisepkg","arguments","usage","known-limitations","hooksupdateconfigconfig-config--promiseconfig","usage-example","hooksafterallresolvedlockfile-context-lockfile--promiselockfile","arguments-1","usage-example-1","known-limitations-1","hooksbeforepackingpkg-pkg--promisepkg","arguments-2","usage-example-2","hookspreresolutionoptions-promisevoid","arguments-3","hooksimportpackagedestinationdir-options-promisestring--undefined","arguments-4","hooksfilterlog","hooksfetchers","finders","custom-resolvers-and-fetchers","typescript-interfaces","custom-resolvers","resolver-interface","canresolvewanteddependency-boolean--promiseboolean","resolvewanteddependency-opts-resolveresult--promiseresolveresult","shouldrefreshresolutiondeppath-pkgsnapshot-boolean--promiseboolean","custom-fetchers","fetcher-interface","canfetchpkgid-resolution-boolean--promiseboolean","fetchcafs-resolution-opts-fetchers-fetchresult--customfetcherdelegation--promisefetchresult--customfetcherdelegation","delegating-to-the-built-in-fetchers","usage-examples","basic-custom-resolver","custom-resolver-and-fetcher-with-shouldrefreshresolution","basic-custom-fetcher","custom-resolution-type-with-resolver-and-fetcher","priority-and-ordering","performance-considerations","related-configuration","ignorepnpmfile","pnpmfile","globalpnpmfile"]
---

pnpm 允许你通过特殊函数（钩子）直接介入安装过程。钩子可以在名为 `.pnpmfile.mjs`（ESM）或 `.pnpmfile.cjs`（CommonJS）的文件中声明。

默认情况下，`.pnpmfile.mjs` 应与锁文件位于同一目录。例如，在共享锁文件的 [工作区](/docs/workspaces) 中，`.pnpmfile.mjs` 应位于 monorepo 的根目录。

## 钩子

### TL;DR

| **钩子函数** | **Process** | **Uses** |
| --- | --- | --- |
| `hooks.readPackage(pkg, context): pkg` | 在 pnpm 解析依赖的包清单之后调用 | 允许你修改某个依赖的 `package.json`。 |
| `hooks.afterAllResolved(lockfile, context): lockfile` | 在依赖解析完成之后调用。 | 允许你修改锁文件。 |
| `hooks.beforePacking(pkg): pkg` | 在 pack/publish 过程中创建 tarball 之前调用 | 允许你自定义发布出去的 `package.json` |
| `resolvers` | 在包解析期间调用。 | 允许你注册自定义的包解析器。 |
| `fetchers` | 在拉取包期间调用。 | 允许你注册自定义的包拉取器。 |

### `hooks.readPackage(pkg, context): pkg | Promise<pkg>`

允许你在解析之后、依赖解析之前修改某个依赖的 `package.json`。这些改动不会写入文件系统，但会影响锁文件中的解析结果，从而影响安装的内容。

注意，如果你要修改的依赖已经被解析过，需要先删除 `pnpm-lock.yaml`。

:::tip[提示]

如果需要将 `package.json` 的改动保存到文件系统，就要使用 [pnpm patch](/docs/cli/patch) 命令对 `package.json` 文件打补丁。例如，当你想移除某个依赖的 `bin` 字段时，这种方式会很有用。

:::

#### 参数

- `pkg` - 包的 manifest，即来自 registry 的响应或 `package.json` 的内容
- `context` - 该步骤的上下文对象。`#log(msg)` 方法允许你在该步骤中使用调试日志

#### 用法

示例 `.pnpmfile.mjs`（修改某个依赖的依赖）：

```js
function readPackage(pkg, context) {
  // Override the manifest of foo@1.x after downloading it from the registry
  if (pkg.name === 'foo' && pkg.version.startsWith('1.')) {
    // Replace bar@x.x.x with bar@2.0.0
    pkg.dependencies = {
      ...pkg.dependencies,
      bar: '^2.0.0'
    }
    context.log('bar@1 => bar@2 in dependencies of foo')
  }

  // This will change any packages using baz@x.x.x to use baz@1.2.3
  if (pkg.dependencies.baz) {
    pkg.dependencies.baz = '1.2.3';
  }

  return pkg
}

export const hooks = {
  readPackage
}
```

#### 已知限制

通过 `readPackage` 从依赖的 manifest 中移除 `scripts` 字段，并不会阻止 pnpm 构建该依赖。pnpm 构建依赖时读取的是包归档中的 `package.json`，不受钩子影响。要想跳过某个包的构建，使用 [allowBuilds](/docs/settings/build#allowbuilds) 字段。

### `hooks.updateConfig(config): config | Promise<config>`

自 v10.8.0 起提供

允许你修改 pnpm 使用的配置项。此钩子与 [configDependencies](/docs/config-dependencies) 配合使用时最为有用，可以让你在不同的 Git 仓库之间共享和复用设置。

例如，[@pnpm/plugin-better-defaults](https://github.com/pnpm/plugin-better-defaults) 使用 `updateConfig` 钩子来应用一组精心挑选的推荐设置。

#### 用法示例

.pnpmfile.mjs

```js
export const hooks = {
  updateConfig (config) {
    return Object.assign(config, {
      enablePrePostScripts: false,
      optimisticRepeatInstall: true,
      resolutionMode: 'lowest-direct',
      verifyDepsBeforeRun: 'install',
    })
  }
}
```

### `hooks.afterAllResolved(lockfile, context): lockfile | Promise<lockfile>`

允许你在锁文件被序列化之前修改其输出内容。

#### 参数

- `lockfile` - 被序列化到 `pnpm-lock.yaml` 的锁文件解析结果对象
- `context` - 该步骤的上下文对象。`#log(msg)` 方法允许你在该步骤中使用调试日志

#### 用法示例

.pnpmfile.mjs

```js
function afterAllResolved(lockfile, context) {
  // ...
  return lockfile
}

export const hooks = {
  afterAllResolved
}
```

#### 已知限制

没有限制：凡是能对锁文件做的修改，都可以通过此函数完成，你甚至可以扩展锁文件的功能。

### `hooks.beforePacking(pkg): pkg | Promise<pkg>`

自 v10.28.0 起提供

允许你在 `pnpm pack` 或 `pnpm publish` 期间，于 `package.json` manifest 被打包进 tarball 之前修改它。这适合用于定制要发布的包，同时不影响本地开发用的 `package.json`。

与修改安装期间依赖解析方式的 `hooks.readPackage` 不同，`beforePacking` 只影响最终发布的 tarball 的内容。

#### 参数

- `pkg` - 将包含在发布 tarball 中的包 manifest 对象

#### 用法示例

.pnpmfile.mjs

```js
function beforePacking(pkg) {
  // Remove development-only fields from published package
  delete pkg.devDependencies
  delete pkg.scripts.test

  // Add publication metadata
  pkg.publishedAt = new Date().toISOString()

  // Modify package exports for production
  if (pkg.name === 'my-package') {
    pkg.main = './dist/index.js'
  }

  return pkg
}

export const hooks = {
  beforePacking
}
```

:::note[说明]

此钩子所做的修改只影响 tarball 内部的 `package.json`，你本地的 `package.json` 文件保持不变。

:::

### `hooks.preResolution(options): Promise<void>`

此钩子在读取并解析项目的锁文件之后、解析依赖之前执行，允许修改锁文件对象。

#### 参数

- `options.existsCurrentLockfile` - 布尔值，当 `node_modules/.pnpm/lock.yaml` 处的锁文件存在时为 true
- `options.currentLockfile` - 来自 `node_modules/.pnpm/lock.yaml` 的锁文件对象
- `options.existsNonEmptyWantedLockfile` - 布尔值，当 `pnpm-lock.yaml` 处的锁文件存在时为 true
- `options.wantedLockfile` - 来自 `pnpm-lock.yaml` 的锁文件对象
- `options.lockfileDir` - 期望锁文件所在的目录
- `options.storeDir` - 存储目录的位置
- `options.registries` - 从 scope 到 registry URL 的映射

### `hooks.importPackage(destinationDir, options): Promise<string | undefined>`

:::warning[自 v11.23.0 起废弃]

`importPackage` 已被废弃，将在下一个 major 版本中移除。当 pnpmfile 定义了它时，pnpm 会发出警告，且定义它会使安装退出并行包导入器，导致安装变慢。如果你依赖此钩子，请到 [#14101](https://github.com/pnpm/pnpm/issues/14101) 下留言。

:::

此钩子允许你更改包写入 `node_modules` 的方式。返回值是可选的，用于说明导入依赖时使用的方法，例如克隆、硬链接。

#### 参数

- `destinationDir` - 包应写入的目标目录
- `options.disableRelinkLocalDirDeps`
- `options.filesMap`
- `options.force`
- `options.resolvedFrom`
- `options.keepModulesDir`

### `hooks.filterLog(log): boolean`

:::warning[自 v12.0.0 起废弃]

`filterLog` 通过针对某条日志返回 `false`，将其排除在 pnpm 的报告输出之外。pnpm 12 会忽略该钩子，并在 pnpmfile 定义它时发出警告，因此应移除它而不是依赖它。使用 [loglevel](/docs/settings/cli#loglevel) 来选择 pnpm 的报告详细程度。

:::

### `hooks.fetchers`

:::danger[已在 v11.0.0 中移除]

`hooks.fetchers` 已被移除。改用顶层的 `fetchers`。新 API 见[自定义拉取器](#custom-fetchers)一节。

:::

## 查找器（Finders）

自 v10.16.0 起提供

Finder 函数通过 `--find-by` 标志配合 `pnpm list` 和 `pnpm why` 使用。

Example:

.pnpmfile.mjs

```js
export const finders = {
  react17: (ctx) => {
    return ctx.readManifest().peerDependencies?.react === "^17.0.0"
  }
}
```

Usage:

```
pnpm why --find-by=react17
```

更多细节见 [Finders](/docs/finders)。

## 自定义解析器与拉取器

自 v11.0.0 起提供

自定义解析器与拉取器允许你为新的包标识方案（如 `my-protocol:package-name`）实现自定义的包解析与拉取逻辑。它们以顶层导出的形式注册在 `.pnpmfile.cjs` 中：

```js
module.exports = {
  resolvers: [customResolver1, customResolver2],
  fetchers: [customFetcher1, customFetcher2],
}
```

#### TypeScript 接口

```typescript
interface CustomResolver {
  canResolve?: (wantedDependency: WantedDependency) => boolean | Promise<boolean>
  resolve?: (wantedDependency: WantedDependency, opts: ResolveOptions) => ResolveResult | Promise<ResolveResult>
  shouldRefreshResolution?: (depPath: string, pkgSnapshot: PackageSnapshot) => boolean | Promise<boolean>
}

interface CustomFetcher {
  canFetch?: (pkgId: string, resolution: Resolution) => boolean | Promise<boolean>
  fetch?: (cafs: Cafs, resolution: Resolution, opts: FetchOptions, fetchers: Fetchers) => FetchResult | Promise<FetchResult>
}
```

### 自定义解析器

自定义解析器将包描述符（如 `foo@^1.0.0`）转换为存储在锁文件中的解析结果。

#### 解析器接口

自定义解析器是一个对象，可以实现以下方法的任意组合：

##### `canResolve(wantedDependency): boolean | Promise<boolean>`

判断此解析器能否解析给定的 wanted 依赖。

**Arguments:**

- wantedDependency
  - 包含以下字段的对象：
  - `alias` - 在 package.json 中出现的包名或别名
  - `bareSpecifier` - 版本范围、git URL、文件路径或其他说明符

**返回：** 若此解析器能处理该包则返回 `true`，否则返回 `false`。这决定了 `resolve` 是否会被调用。

##### `resolve(wantedDependency, opts): ResolveResult | Promise<ResolveResult>`

将 wanted 依赖解析为具体的包元数据和解析结果信息。

**Arguments:**

- `wantedDependency` - wanted 依赖（与 `canResolve` 中的相同）
- opts
  - 包含以下字段的对象：
  - `lockfileDir` - 包含锁文件的目录
  - `projectDir` - 项目根目录
  - `preferredVersions` - 从包名到首选版本的映射

**返回：** 包含以下字段的对象：

- `id` - 唯一的包标识符（如 `'custom-pkg@1.0.0'`）
- resolution
  - 解析结果的元数据，可以是：
  - 标准解析结果，如 `{ tarball: 'https://...', integrity: '...' }`
  - 自定义解析结果：`{ type: 'custom:cdn', url: '...' }`

自定义解析结果必须由对应的自定义拉取器处理。

:::warning[自定义解析结果类型]

自定义解析结果必须在 type 字段中使用 `custom:` 前缀（如 `custom:cdn`、`custom:artifactory`），以区别于 pnpm 内置的解析结果类型。

:::

##### `shouldRefreshResolution(depPath, pkgSnapshot): boolean | Promise<boolean>`

返回 `true` 可触发对所有包的完整解析，跳过「Lockfile is up to date」优化。这适合用于实现基于时间的缓存失效或其他自定义重新解析逻辑。

**Arguments:**

- `depPath` - 包标识符字符串（如 `lodash@4.17.21`）
- `pkgSnapshot` - 该包的锁文件条目，可直接访问解析结果、依赖等信息

**返回：** 返回 `true` 强制重新解析，否则返回 `false`。

:::note[说明]

在 frozen lockfile 安装期间会跳过 `shouldRefreshResolution`，因为该模式不允许进行解析。

:::

### 自定义拉取器

自定义拉取器完全负责自定义包类型的拉取，从自定义来源下载包内容，并将其存储到 pnpm 的内容寻址文件系统中。

#### 拉取器接口

自定义拉取器是可以实现以下方法的对象：

##### `canFetch(pkgId, resolution): boolean | Promise<boolean>`

判断此拉取器能否按给定的解析结果拉取某个包。

**Arguments:**

- `pkgId` - 来自解析阶段的唯一包标识符
- `resolution` - 解析器的 `resolve` 方法返回的解析结果对象

**返回：** 若此拉取器能处理该包的拉取则返回 `true`，否则返回 `false`。

##### `fetch(cafs, resolution, opts, fetchers): FetchResult | CustomFetcherDelegation | Promise<FetchResult | CustomFetcherDelegation>`

拉取包文件并返回所拉取包的元数据。

**Arguments:**

- `cafs` - 用于存储文件的内容寻址文件系统接口
- `resolution` - 解析结果对象（与传给 `canFetch` 的相同）
- opts
  - 拉取选项，包括：
  - `lockfileDir` - 包含锁文件的目录
  - `filesIndexFile` - 文件索引的路径
  - `onStart` - 拉取开始时的可选回调
  - `onProgress` - 可选的进度回调
- fetchers
  - 包含 pnpm 标准拉取器的对象，用于委托：
  - `remoteTarball` - 远程 tarball 的拉取器
  - `localTarball` - 本地 tarball 的拉取器
  - `gitHostedTarball` - GitHub/GitLab/Bitbucket tarball 的拉取器
  - `directory` - 本地目录的拉取器
  - `git` - git 仓库的拉取器

**返回：** 拉取结果，或一个[委托信封](#delegating-to-the-built-in-fetchers)。

拉取结果是一个包含以下字段的对象：

- `filesIndex` - 从相对文件路径到其物理位置的映射。对于远程包，这些是 pnpm 内容寻址存储（CAFS）中的路径；对于本地包（当 `local: true` 时），这些是磁盘上文件的绝对路径。
- `manifest` - 可选。所拉取包的 package.json。若不提供，pnpm 会在需要时从磁盘读取。提供它可以省去一次额外的文件 I/O，当你手头已有 manifest 数据时（例如拉取过程中已经解析过）建议提供。
- `requiresBuild` - 布尔值，指示该包是否有需要执行的构建脚本。当包包含 `preinstall`、`install` 或 `postinstall` 脚本，或含有 `binding.gyp`、`.hooks/` 文件时，设为 `true`。标准拉取器会根据 manifest 和文件列表自动判断。
- `local` - 可选。设为 `true` 时直接从磁盘加载包，不复制到 pnpm 的存储中。为 `true` 时，`filesIndex` 应包含磁盘上文件的绝对路径，pnpm 会将它们硬链接到 `node_modules` 而不是复制。directory 拉取器就是这样处理本地依赖的（如 `file:../my-package`）。

#### 委托给内置拉取器

自 v11.12.0 起提供

自定义拉取器可以不亲自拉取包，而是把这项工作交还给 pnpm。有两种方式可以做到这一点。

**返回 { delegate } 信封。** 不返回拉取结果，而是返回一个只含 `delegate` 键的对象，其值是 pnpm 应改用的解析结果。pnpm 会将该包的解析结果改写为该形式，并走内置的拉取路径：

.pnpmfile.cjs

```js
const customFetcher = {
  canFetch: (pkgId, resolution) => resolution.type === 'custom:url',
  fetch: (cafs, resolution) => ({
    delegate: {
      tarball: resolution.customUrl,
      integrity: resolution.integrity,
    },
  }),
}

module.exports = { fetchers: [customFetcher] }
```

被委托的解析结果必须是完整、可拉取的形式（例如 `{ tarball, integrity }`）。委托只有一步：`delegate` 本身若为自定义类型会被拒绝。

**直接调用 fetchers.*。** `fetchers` 参数提供 pnpm 的标准拉取器，因此你可以自行转换解析结果并调用其中一个。

:::tip[为可移植性优先使用信封]

`{ delegate }` 信封是唯一在 pnpm 和 [pacquet](https://pnpm.io/blog/releases/12.0)（pnpm 的 Rust 移植版）中都能工作的委托形式。pacquet 通过 IPC 调用 pnpmfile 拉取器，此时 `cafs` 与 `fetchers` 无法存在，都会以 `null` 传入。要在任一技术栈上运行的拉取器必须返回信封，而不是调用 `fetchers.*`。

:::

#### 用法示例

##### 基础自定义解析器

此示例展示一个从自定义 registry 解析包的自定义解析器：

.pnpmfile.cjs

```js
const customResolver = {
  // Only handle packages with @company scope
  canResolve: (wantedDependency) => {
    return wantedDependency.alias.startsWith('@company/')
  },

  resolve: async (wantedDependency, opts) => {
    // Fetch metadata from custom registry
    const response = await fetch(
      `https://custom-registry.company.com/${wantedDependency.alias}/${wantedDependency.bareSpecifier}`
    )
    const metadata = await response.json()

    return {
      id: `${metadata.name}@${metadata.version}`,
      resolution: {
        tarball: metadata.tarballUrl,
        integrity: metadata.integrity
      }
    }
  }
}

module.exports = {
  resolvers: [customResolver]
}
```

##### 结合 `shouldRefreshResolution` 的自定义解析器与拉取器

此示例展示解析器与拉取器协同工作，配合自定义解析结果类型和基于时间的缓存失效：

.pnpmfile.cjs

```js
const customResolver = {
  canResolve: (wantedDependency) => {
    return wantedDependency.alias.startsWith('company-cdn:')
  },

  resolve: async (wantedDependency, opts) => {
    const actualName = wantedDependency.alias.replace('company-cdn:', '')
    const version = await fetchVersionFromCompanyCDN(actualName, wantedDependency.bareSpecifier)

    return {
      id: `company-cdn:${actualName}@${version}`,
      resolution: {
        type: 'custom:cdn',
        cdnUrl: `https://cdn.company.com/packages/${actualName}/${version}.tgz`,
        cachedAt: Date.now(), // Custom metadata for shouldRefreshResolution
      },
    }
  },

  shouldRefreshResolution: (depPath, pkgSnapshot) => {
    // Check custom metadata stored in the resolution
    const cachedAt = pkgSnapshot.resolution?.cachedAt
    if (cachedAt && Date.now() - cachedAt > 24 * 60 * 60 * 1000) {
      return true // Re-resolve if cached more than 24 hours ago
    }
    return false
  },
}

const customFetcher = {
  canFetch: (pkgId, resolution) => {
    return resolution.type === 'custom:cdn'
  },

  fetch: async (cafs, resolution, opts, fetchers) => {
    // Delegate to pnpm's standard tarball fetcher
    const tarballResolution = {
      tarball: resolution.cdnUrl,
      integrity: resolution.integrity,
    }

    return fetchers.remoteTarball(cafs, tarballResolution, opts)
  },
}

module.exports = {
  resolvers: [customResolver],
  fetchers: [customFetcher],
}
```

##### 基础自定义拉取器

此示例展示从另一来源拉取特定包的自定义拉取器：

.pnpmfile.cjs

```js
const customFetcher = {
  canFetch: (pkgId, resolution) => {
    return pkgId.startsWith('@company/')
  },

  fetch: async (cafs, resolution, opts, fetchers) => {
    // Delegate to pnpm's tarball fetcher with modified URL
    const tarballResolution = {
      tarball: resolution.tarball.replace(
        'https://registry.npmjs.org/',
        'https://custom-registry.company.com/'
      ),
      integrity: resolution.integrity
    }

    return fetchers.remoteTarball(cafs, tarballResolution, opts)
  }
}

module.exports = {
  fetchers: [customFetcher]
}
```

##### 解析器与拉取器配合的自定义解析结果类型

此示例展示解析器与拉取器通过自定义解析结果类型协同工作：

.pnpmfile.cjs

```js
const customResolver = {
  canResolve: (wantedDependency) => {
    return wantedDependency.alias.startsWith('@internal/')
  },

  resolve: async (wantedDependency) => {
    return {
      id: `${wantedDependency.alias}@${wantedDependency.bareSpecifier}`,
      resolution: {
        type: 'custom:internal-directory',
        directory: `/packages/${wantedDependency.alias}/${wantedDependency.bareSpecifier}`
      }
    }
  }
}

const customFetcher = {
  canFetch: (pkgId, resolution) => {
    return resolution.type === 'custom:internal-directory'
  },

  fetch: async (cafs, resolution, opts, fetchers) => {
    // Delegate to pnpm's directory fetcher for local packages
    const directoryResolution = {
      type: 'directory',
      directory: resolution.directory
    }

    return fetchers.directory(cafs, directoryResolution, opts)
  }
}

module.exports = {
  resolvers: [customResolver],
  fetchers: [customFetcher]
}
```

#### 优先级与顺序

注册多个解析器时，会按顺序依次检查。第一个 `canResolve` 返回 `true` 的解析器将用于解析。拉取器同理：拉取阶段会使用第一个 `canFetch` 返回 `true` 的拉取器。

自定义解析器会在 pnpm 内置解析器（npm、git、tarball 等）之前尝试，让你完全掌控包的解析。

#### 性能考量

`canResolve()`、`canFetch()` 和 `shouldRefreshResolution()` 应当是低开销的检查（最好为同步），因为解析期间会为每个依赖调用它们。

## 相关配置

### ignorePnpmfile

- 默认值：**false**
- 类型：**布尔值**

pnpmfile 将被忽略。与 `--ignore-scripts` 搭配使用，可确保安装期间不执行任何脚本。

### pnpmfile

- 默认值：**['.pnpmfile.mjs']**
- 类型：**路径[]**
- 示例：**['.pnpm/.pnpmfile.mjs']**

本地 pnpmfile 的位置。

### globalPnpmfile

- 默认值：**null**
- 类型：**路径**
- 示例：**~/.pnpm/global_pnpmfile.mjs**

全局 pnpmfile 的位置。所有项目在安装期间都会使用全局 pnpmfile。

:::note[说明]

推荐使用本地 pnpmfile。只有当你在不以 pnpm 为主要包管理器的项目中使用 pnpm 时，才使用全局 pnpmfile。

:::
