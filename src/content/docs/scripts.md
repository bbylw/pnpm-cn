---
title: "脚本"
headingIds: ["hidden-scripts", "environment-variables", "build-options-for-native-addons", "processes-a-script-leaves-running", "built-in-command-and-script-name-conflicts", "lifecycle-scripts", "pnpmdevpreinstall"]
---

pnpm 如何处理 `package.json` 的 `scripts` 字段。

## 隐藏脚本

名称以 `.` 开头的脚本是隐藏的。它们无法通过 `pnpm run` 直接运行，并从 `pnpm run` 的列表中省略。隐藏脚本只能从其他脚本中被调用。

package.json

```json
{
  "scripts": {
    ".helper": "echo 'I am hidden'",
    "build": "pnpm run .helper && tsc"
  }
}
```

在此示例中，`pnpm run .helper` 会失败，但 `pnpm run build` 会成功，因为 `.helper` 是从另一个脚本中被调用的。

## 环境变量

pnpm 在生命周期脚本执行期间设置以下环境变量：

- `npm_package_name`：包名
- `npm_package_version`：包版本
- `npm_package_config_*`、`npm_package_engines_*`、`npm_package_bin_*`：清单中的 `config`、`engines` 与 `bin` 字段，每个条目一个变量（例如 `npm_package_config_port`）。`bin` 为字符串时会设置 `npm_package_bin`。
- `npm_package_json`：包的 `package.json` 的路径
- `npm_lifecycle_event`：正在运行的脚本的名称（例如 `postinstall`）
- `npm_lifecycle_script`：正在运行的脚本的命令
- `npm_node_execpath` 和 `NODE`：Node.js 可执行文件的路径
- `npm_execpath`：正在运行的 pnpm 的路径
- `npm_config_user_agent`：pnpm 的 user agent 字符串
- `npm_config_node_gyp`：内置的 `node-gyp` 的路径，除非环境中已经设置了它
- `INIT_CWD`：启动 pnpm 时所在的目录
- `PNPM_SCRIPT_SRC_DIR`：脚本所属包的目录
- `TMPDIR`：包内的 `node_modules/.tmp`，除非 [`unsafePerm`](/docs/settings/build#unsafeperm) 为 `true`

即使 pnpm 自己的安装脚本被跳过，pnpm 这个 npm 包也会向生命周期脚本提供内置的 `node-gyp`。

:::note[说明]

除了上面这些变量，pnpm 不会从自身配置中设置 `npm_config_*` 变量。环境中的其它 `npm_config_*` 变量会原样传给脚本，但认证、作用域 registry 以及按 registry 的设置除外（名称以 `_`、`/` 或 `@` 开头，或包含 `:_` 的那些）。

:::

### 原生插件的构建选项

`pnpm install` 不会像 `npm install --build-from-source` 那样把额外的命令行标志变成 `npm_config_*` 变量。请改为在环境中设置这些变量。使用 `node-pre-gyp` 或 `prebuild-install` 的原生插件（例如 `sqlite3`）会读取它们。例如，要为 Electron 从源码构建 `sqlite3`，请先在 [`allowBuilds`](/docs/settings/build#allowbuilds) 中批准它的构建，然后把这些变量放进一个 env 文件：

.env.electron

```ini
npm_config_build_from_source=true
npm_config_runtime=electron
npm_config_target=38.0.0
npm_config_disturl=https://electronjs.org/headers
```

再用 [`--env-file`](/docs/pnpm-cli#--env-file-path) 加载它：

```sh
pnpm --env-file .env.electron install
```

若要在项目的每次安装中都无需标志就设置它们，可以在 [`updateConfig`](/docs/pnpmfile#hooksupdateconfigconfig-config--promiseconfig) 钩子中通过 `extraEnv` 返回：

.pnpmfile.mjs

```js
export const hooks = {
  updateConfig (config) {
    return {
      ...config,
      extraEnv: {
        ...config.extraEnv,
        npm_config_build_from_source: 'true',
        npm_config_runtime: 'electron',
        npm_config_target: '38.0.0',
        npm_config_disturl: 'https://electronjs.org/headers',
      },
    }
  },
}
```

[副作用缓存](/docs/settings/build#sideeffectscache)的键不包含这些变量，因此 pnpm 可能恢复一个用不同取值构建出的产物。请把该包列在 [`sideEffectsCache.exclude`](/docs/settings/build#sideeffectscacheexclude) 中，让 pnpm 永远不从缓存中恢复它的构建：

pnpm-workspace.yaml

```yaml
sideEffectsCache:
  exclude:
    - sqlite3
```

重复安装不会重新构建已经安装好的包。修改这些变量后，需要在每个使用它们的项目中重新构建该包：

```sh
pnpm --env-file .env.electron pm rebuild -r sqlite3
```

使用 `updateConfig` 钩子时，去掉 `--env-file .env.electron` 即可。[`pnpm pm`](/docs/cli/pm) 会运行内置命令，即使 `package.json` 定义了 `rebuild` 脚本也是如此。

## 脚本遗留的进程

脚本或 `pnpm exec`、`pnpm dlx` 运行的命令所启动并遗留运行的进程（例如守护进程、编辑器，或由 `open` 包打开的浏览器），在 pnpm 退出后仍会继续运行。无论脚本成功还是失败都是如此，在按下 `Ctrl+C` 之后也是如此，就像脚本脱离 pnpm 直接运行时一样。关闭终端会结束附着于它的进程，操作系统一向如此。

只有两种情况下 pnpm 才会结束它所启动的东西：

- pnpm 自身在脚本运行期间被杀死或崩溃，例如 CI 作业被取消时。在 Windows 上这会结束脚本启动的所有东西，但以 `CREATE_BREAKAWAY_FROM_JOB` 启动的进程除外。在 Unix 上它会结束运行在各自进程组中的脚本，即并行运行中的每个脚本以及每个没有终端的脚本。离开其进程组的进程（例如守护进程）仍会继续运行。
- 在递归或并行运行中某个脚本失败时，pnpm 会停止其它仍在运行的包中的脚本，除非设置了 [`--no-bail`](/docs/cli/recursive#--no-bail)。

## 内置命令与脚本名称冲突

以下内置命令优先使用用户脚本：`clean`（及其别名 `purge`）、`setup`、`deploy`、`rebuild`（及其别名 `rb`）和 `tasks`。如果你的 `package.json` 用其中之一定义了脚本，`pnpm <name>` 将执行该脚本而非内置命令。

要强制使用内置命令，请用 [pnpm pm <name>](/docs/cli/pm)。

## 生命周期脚本

`pnpm install` 会按顺序运行工作区中每个项目的以下脚本：`preinstall`、`install`、`postinstall`、`preprepare`、`prepare` 和 `postprepare`。使用 `--prod`，或安装特定包时，只运行 `preinstall`、`install` 和 `postinstall`。

对于 [`pnpm run`](/docs/cli/run) 运行的其他脚本的 `pre` 和 `post` 脚本，参见 [`enablePrePostScripts`](/docs/settings/other#enableprepostscripts)。

### `pnpm:devPreinstall`

当 `pnpm install` 在项目自身运行时执行（包含在 CI 中）。当该包作为另一个项目的依赖被安装时不会执行。

在任何依赖安装之前运行。

此脚本仅在设置于根项目的 `package.json` 中时才执行。
