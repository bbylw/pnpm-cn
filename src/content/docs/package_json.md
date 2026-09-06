---
title: "package.json"
headingIds: ["engines","enginesruntime","devenginesruntime","devenginespackagemanager","dependenciesmeta","dependenciesmetainjected","peerdependencies","peerdependenciesmeta","peerdependenciesmetaoptional","publishconfig","publishconfigname","publishconfigexecutablefiles","publishconfigdirectory","publishconfiglinkdirectory"]
---

包的清单文件。它包含包的所有元数据，包括依赖、标题、作者等。这是包括 pnpm 在内的所有主流 Node.js 包管理器共同遵循的标准。

除传统的 `package.json` 格式外，pnpm 还支持 `package.json5`（通过 [json5](https://www.npmjs.com/package/json5)）和 `package.yaml`（通过 [js-yaml](https://www.npmjs.com/package/@zkochan/js-yaml)）。

:::note[说明]

自 v11 起，pnpm 不再从 `package.json` 的 `pnpm` 字段读取设置。设置必须定义在 `pnpm-workspace.yaml` 中。参见[配置](/docs/configuring)。

:::

## engines

你可以指定软件运行所需的 Node 和 pnpm 版本：

```json
{
    "engines": {
        "node": ">=10",
        "pnpm": ">=3"
    }
}
```

本地开发期间，如果 pnpm 自身版本与 `engines` 字段指定的不匹配，pnpm 将始终报错失败。

除非用户设置了 `engineStrict` 配置标志（参见 [settings](/docs/settings/cli#enginestrict)），否则此字段仅供参考，仅在你的包作为依赖被安装时产生警告。

## engines.runtime

自 v10.21.0 起提供

指定依赖所需的 Node.js 运行时。声明后，pnpm 会自动安装指定的 Node.js 版本。

```json
{
  "engines": {
    "runtime": {
      "name": "node",
      "version": "^24.11.0",
      "onFail": "download"
    }
  }
}
```

当包声明了运行时：

1. **对于 CLI 应用**：pnpm 把 CLI 绑定到所需的 Node.js 版本，确保无论全局安装的 Node.js 是哪个实例，都使用正确的运行时。
2. **对于带 postinstall 脚本的包**：脚本使用指定的 Node.js 版本执行。

这对于需要特定 Node.js 版本才能正常工作的依赖尤其有用。

## devEngines.runtime

自 v10.14 起提供

允许指定项目使用的一个或多个 JavaScript 运行时引擎。支持的运行时为 Node.js、Deno 和 Bun。

例如，以下展示如何把 `node@^24.4.0` 加入你的依赖：

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "^24.4.0",
      "onFail": "download"
    }
  }
}
```

也可以在同一个 `package.json` 中添加多个运行时：

```json
{
  "devEngines": {
    "runtime": [
      {
        "name": "node",
        "version": "^24.4.0",
        "onFail": "download"
      },
      {
        "name": "deno",
        "version": "^2.4.3",
        "onFail": "download"
      }
    ]
  }
}
```

工作原理：

1. `pnpm install` 会将你指定的范围解析为匹配的最新运行时版本。
2. 精确版本（及校验和）保存在锁文件中。
3. 脚本使用本地运行时，确保跨环境的一致性。

要在不修改清单的情况下覆盖声明的 `onFail` 行为，使用 [runtimeOnFail](/docs/settings/cli#runtimeonfail) 设置。

自 v12.0.0-rc.2 起，在项目内直接运行 `node`（或 `deno`/`bun`）也会遵循此锁定版本，而不仅是脚本。可通过 [globalShims](/docs/settings/other#globalshims) 设置关闭，或用 `PNPM_SHIM_BYPASS=1` 对单条命令跳过。参见[项目感知的全局命令](/docs/global-packages#project-aware-global-bins)。

## devEngines.packageManager

自 v11.0.0 起提供

允许通过 `package.json` 中的 `devEngines.packageManager` 指定 pnpm 版本。与 `packageManager` 字段不同，它支持版本范围。解析出的版本会记录在 `pnpm-lock.yaml` 的 `packageManagerDependencies` 下，若仍满足范围则会被复用。

```json
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": ">=12.0.0 <13.0.0",
      "onFail": "download"
    }
  }
}
```

:::note[说明]

当通过旧版 `packageManager` 字段声明 pnpm 12，且 [pmOnFail](/docs/settings/cli#pmonfail) 未设为 `ignore` 时，其解析信息会写入 `pnpm-lock.yaml`。锁文件因此会在开头多出一个[环境锁文件文档](/docs/lockfile)。

:::

自 v12.0.0-rc.6 起，该字段还可以指定[其他包管理器](/docs/package-managers)，即 `npm`、`yarn` 或 `bun`，`pnpm add npm@11` 写入的就是这种形式。对于这些管理器，`pnpm-lock.yaml` 中不会记录任何内容：`packageManagerDependencies` 保存的是 pnpm 自身的锁定，其他包管理器则锁定在 pnpm 主目录下各自的环境锁文件中。

要在不修改清单的情况下覆盖 `onFail` 行为，参见 [pmOnFail](/docs/settings/cli#pmonfail) 设置。

## dependenciesMeta

用于 `dependencies`、`optionalDependencies` 和 `devDependencies` 中声明的依赖的附加元信息。

### dependenciesMeta.*.injected

如果某个依赖是本地工作区包，且此项设为 `true`，安装该包时会在虚拟存储（`node_modules/.pnpm`）中创建其硬链接副本。

如果此项设为 `false` 或未设置，则改为在 `node_modules` 中创建符号链接来安装该依赖，链接指向包在工作区中的源码目录。这是默认行为，速度更快，且对依赖的任何修改都会立即对其使用者可见。

例如，假设以下 `package.json` 是一个本地工作区包：

```json
{
  "name": "card",
  "dependencies": {
    "button": "workspace:1.0.0"
  }
}
```

`button` 依赖通常这样安装：在 `card` 的 `node_modules` 目录中创建一个符号链接，指向 `button` 的开发目录。

但如果 `button` 在其 `peerDependencies` 中声明了 `react` 呢？如果 monorepo（单体仓库）中所有项目都使用同一版本的 `react`，就没有问题。但假如 `button` 同时被使用 `react@16` 的 `card` 和使用 `react@17` 的 `form` 需要呢？通常你只能选定单一版本的 `react`，并通过 `button` 的 `devDependencies` 指定它。符号链接无法让 `card`、`form` 等不同使用者以不同方式满足 `react` 这一对等依赖。

`injected` 字段通过向虚拟存储安装 `button` 的硬链接副本解决这一问题。为此，`card` 的 `package.json` 可配置如下：

```json
{
  "name": "card",
  "dependencies": {
    "button": "workspace:1.0.0",
    "react": "16"
  },
  "dependenciesMeta": {
    "button": {
      "injected": true
    }
  }
}
```

而 `form` 的 `package.json` 可配置如下：

```json
{
  "name": "form",
  "dependencies": {
    "button": "workspace:1.0.0",
    "react": "17"
  },
  "dependenciesMeta": {
    "button": {
      "injected": true
    }
  }
}
```

有了这些更改，可以说 `button` 是 `card` 和 `form` 的「注入依赖」。当 `button` 导入 `react` 时，在 `card` 的上下文中解析为 `react@16`，在 `form` 的上下文中则解析为 `react@17`。

由于注入依赖会生成其工作区源码目录的副本，因此代码一旦修改，就必须以某种方式更新这些副本，否则使用者看不到新的状态。使用 `pnpm --recursive run build` 这类命令构建多个项目时，该更新必须发生在每个被注入包重新构建之后、其使用者重新构建之前。对于简单场景，可以再执行一次 `pnpm install` 来完成，例如借助 `package.json` 的生命周期脚本（如 `"prepare": "pnpm run build"`）重新构建该项目。[pnpm-sync](https://www.npmjs.com/package/pnpm-sync-lib) 和 [pnpm-sync-dependencies-meta-injected](https://www.npmjs.com/package/pnpm-sync-dependencies-meta-injected) 等第三方工具为更新注入依赖提供了更稳健高效的方案，并支持监听模式。

## peerDependencies

对等依赖的值通常是 semver 范围（`^1.0.0`），或 [workspace:](/docs/workspaces#workspace-protocol-workspace)、[catalog:](/docs/catalogs) 说明符。

自 v11.14.0 起，对等依赖也可以用带方案的说明符声明：

```json
{
  "peerDependencies": {
    "lib-a": "work:5.x.x",
    "lib-b": "npm:other-lib@^5",
    "lib-c": "file:../lib-c",
    "lib-d": "git+https://example.com/lib-d.git"
  }
}
```

允许的形式包括[具名 registry](/docs/settings/dependency-resolution#namedregistries) 说明符（`<registry>:<version>`）、`npm:` 别名，以及 `file:`、git 或 URL 说明符。

这类说明符会与其携带的 semver 范围匹配：`work:5.x.x` 按 `5.x.x` 检查，`npm:other-lib@^5` 按 `^5` 检查。不带版本的说明符（如 `file:../lib-c`）按 `*` 匹配，因此任何版本都满足。同时，当 [autoInstallPeers](/docs/settings/peer-dependencies#autoinstallpeers) 安装缺失的对等依赖时，由原始说明符负责选择包，因此该对等依赖会从你指定的别名、registry 或来源拉取。

裸的 `name@version` 值仍会以 `ERR_PNPM_INVALID_PEER_DEPENDENCY_SPECIFICATION` 被拒绝，因为它们几乎总是笔误：

```json
{
  "peerDependencies": {
    "lib-a": "lib-a@1.2.3"
  }
}
```

## peerDependenciesMeta

此字段列出与 `peerDependencies` 字段中所列依赖相关的一些附加信息。

### peerDependenciesMeta.*.optional

如果设为 true，所选对等依赖会被包管理器标记为可选，因此使用者未提供它不再被报告为错误。

例如：

```json
{
    "peerDependencies": {
        "foo": "1"
    },
    "peerDependenciesMeta": {
        "foo": {
            "optional": true
        },
        "bar": {
            "optional": true
        }
    }
}
```

注意，尽管 `bar` 未在 `peerDependencies` 中声明，它也被标记为可选。因此 pnpm 认为 bar 的任何版本都可以。而 `foo` 是可选的，但仅限于其要求的版本规范。

## publishConfig

在包被打包之前，可以覆盖清单中的某些字段。可覆盖的字段有：

- [bin](https://github.com/stereobooster/package.json#bin)
- [main](https://github.com/stereobooster/package.json#main)
- [exports](https://nodejs.org/api/esm.html#esm_package_exports)
- [types or typings](https://github.com/stereobooster/package.json#types)
- [module](https://github.com/stereobooster/package.json#module)
- [browser](https://github.com/stereobooster/package.json#browser)
- [esnext](https://github.com/stereobooster/package.json#esnext)
- [es2015](https://github.com/stereobooster/package.json#es2015)
- [unpkg](https://github.com/stereobooster/package.json#unpkg-1)
- [umd:main](https://github.com/stereobooster/package.json#microbundle)
- [typesVersions](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#version-selection-with-typesversions)
- cpu
- os
- `engines`（自 v10.22.0 起提供）
- [name](#publishconfigname)（自 v11.18.0 起提供）

要覆盖某个字段，把发布时使用的该字段值加入 `publishConfig`。

例如下面这个 `package.json`：

```json
{
    "name": "foo",
    "version": "1.0.0",
    "main": "src/index.ts",
    "publishConfig": {
        "main": "lib/index.js",
        "typings": "lib/index.d.ts"
    }
}
```

发布后变为：

```json
{
    "name": "foo",
    "version": "1.0.0",
    "main": "lib/index.js",
    "typings": "lib/index.d.ts"
}
```

### publishConfig.name

自 v11.18.0 起提供

发布时使用与工作区清单所载名称不同的包名。这适用于发布名已被同级项目占用的项目，否则这类项目不得不在发布前一刻通过构建步骤临时改名。

```json
{
  "name": "foo-v2",
  "version": "2.0.0",
  "publishConfig": {
    "name": "foo"
  }
}
```

只有发布产物会被改名：依赖方、`pnpm-lock.yaml` 和发布工具仍按清单名寻址该项目。新名称会进入打包后的清单、tarball 文件名，以及一切在 registry 上寻址该包的环节：`pnpm publish -r` 的已发布检查及其 registry 选择，还有 `pnpm change status` 和 `pnpm version -r` 的发布规划探测。

### publishConfig.executableFiles

出于可移植性考虑，默认情况下，除 bin 字段列出的文件外，包归档中没有其他文件会被标记为可执行。`executableFiles` 字段让你声明更多必须设置可执行标志（+x）的文件，即使它们无法通过 bin 字段直接访问。

```json
{
  "publishConfig": {
    "executableFiles": [
      "./dist/shim.js"
    ]
  }
}
```

### publishConfig.directory

你还可以使用 `publishConfig.directory` 字段，自定义相对于当前 `package.json` 的发布子目录。

预期是指定目录中存在当前包的修改版本（通常借助第三方构建工具生成）。

> 在此示例中，`"dist"` 文件夹必须包含一个 `package.json`

```json
{
  "name": "foo",
  "version": "1.0.0",
  "publishConfig": {
    "directory": "dist"
  }
}
```

### publishConfig.linkDirectory

- 默认值：**true**
- 类型：**布尔值**

设为 `true` 时，本地开发期间会从 `publishConfig.directory` 位置对该项目进行符号链接。

例如：

```json
{
  "name": "foo",
  "version": "1.0.0",
  "publishConfig": {
    "directory": "dist",
    "linkDirectory": true
  }
}
```
