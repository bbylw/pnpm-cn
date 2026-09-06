---
title: "pnpm config"
headingIds: ["commands","set-key-value","get-key","delete-key","list","options","--global--g","--location","--json"]
---

别名： `c`

管理配置文件。

pnpm 设置分布在两类配置文件中：

- **与 npm 兼容的传统 registry/认证设置** 存放在 INI 文件中，包括全局 `rc` 文件、`auth.ini` 以及本地的 `.npmrc` 文件。
- **pnpm 设置** 存放在 YAML 文件中，包括全局 `config.yaml` 和每个项目的 `pnpm-workspace.yaml`。全局文件还可能保存 pnpm 12.1 及更高版本在 `pnpm login` 期间写入的结构化 [_auth](/docs/npmrc#_auth) 和 [registry](/docs/registries) 值。

本地工作区配置文件位于项目根目录，名为 `pnpm-workspace.yaml`。全局 YAML 配置文件（`config.yaml`）位于：

- 如果设置了 **$XDG_CONFIG_HOME** 环境变量，则为 **$XDG_CONFIG_HOME/pnpm/config.yaml**
- 在 Windows 上：**~/AppData/Local/pnpm/config/config.yaml**
- 在 macOS 上：**~/Library/Preferences/pnpm/config.yaml**
- 在 Linux 上：**~/.config/pnpm/config.yaml**

全局 `rc` 文件（仅 registry/认证设置）位于：

- 如果设置了 **$XDG_CONFIG_HOME** 环境变量，则为 **$XDG_CONFIG_HOME/pnpm/rc**
- 在 Windows 上：**~/AppData/Local/pnpm/config/rc**
- 在 macOS 上：**~/Library/Preferences/pnpm/rc**
- 在 Linux 上：**~/.config/pnpm/rc**

你还可以通过运行以下命令来获取全局配置文件的路径（自 v10.21.0 起提供）：

```bash
pnpm config get globalconfig
```

## 命令

### set <key> <value>

将配置键设置为所提供的值。

不带 `--json` 标志时，将值解析为普通字符串：

```bash
pnpm config set --location=project nodeVersion 22.0.0
```

带 `--json` 标志时，将值解析为 JSON：

```bash
pnpm config set --location=project --json nodeVersion '"22.0.0"'
```

`--json` 标志还允许 `pnpm config set` 创建数组和对象：

```bash
pnpm config set --location=project --json allowBuilds '{"react": true, "react-dom": true}'
pnpm config set --location=project --json catalog '{ "react": "19" }'
```

`set` 命令不接受属性路径。

`pnpm config set` 拒绝把一个 pnpm 不会从该处读取的设置写入项目的 `pnpm-workspace.yaml`，包括 `configDir`、`pnpmHomeDir`、`stateDir` 以及其他指代机器级状态的设置。自 v12.1.0 起，这也包括 `scope`，它控制 `pnpm login` 的全机器默认值。当某设置有其归属位置时，该命令会以 `ERR_PNPM_CONFIG_SET_NOT_A_PROJECT_SETTING` 失败并指出该设置应放在何处。`pnpm config delete` 仍会从已包含该键的文件中清除此类键。

### get <key>

打印所提供键对应的配置值。

`key` 可以是一个简单的键：

```bash
pnpm config get nodeVersion
pnpm config get --json nodeVersion
pnpm config get --json packageExtensions
pnpm config get --json allowBuilds
pnpm config get --json catalog
```

它也可以是一个属性路径：

```bash
pnpm config get 'packageExtensions["@babel/parser"].peerDependencies["@babel/types"]'
pnpm config get --json 'packageExtensions["@babel/parser"].peerDependencies["@babel/types"]'
pnpm config get 'allowBuilds.react'
pnpm config get --json 'allowBuilds.react'
pnpm config get catalog.react
pnpm config get --json catalog.react
```

属性路径的语法模拟 JavaScript 属性路径。

### delete <key>

从配置文件中移除该配置键。

### list

显示所有配置设置。输出为一个 JSON 对象。

与认证相关的设置不会显示在输出中；使用 `pnpm config get <key>` 显式读取它们。

:::note[说明]

自 v11 起，`pnpm config get`（不带 `--json`）不再输出 INI 格式文本。它对对象和数组输出 JSON，对字符串、数字、布尔值和 null 输出原始字符串。`pnpm config get --json` 将所有值输出为 JSON。`pnpm config list` 始终输出一个 JSON 对象。

:::

## 选项

### --global, -g

在全局配置文件中设置该配置。

### --location

默认情况下，`--location` 设置为 `global`。

设置为 `project` 时，pnpm 将该设置写入工作区根目录的 `pnpm-workspace.yaml`（对于 registry/认证设置，则写入工作区根目录的 `.npmrc`）。

设置为 `global` 时，行为等同于传入 `--global` 选项。

### --json

让 `get` 和 `list` 以 JSON 格式显示所有配置设置，并让 `set` 将值解析为 JSON。
