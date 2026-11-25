---
title: "目录（catalogs）"
headingIds: ["the-catalog-protocol-catalog","advantages","defining-catalogs","default-catalog","named-catalogs","workspace-dependencies-in-a-catalog","local-dependencies-in-a-catalog","adding-dependencies-to-a-catalog","errors","publishing","settings","catalogmode","catalogprune"]
---

「目录（catalogs）」是一项[工作区功能](/docs/workspaces)，用于把依赖版本范围定义成可复用的常量。目录中定义的常量之后可以在 `package.json` 文件里引用。

## 目录协议（`catalog:`）

一旦在 `pnpm-workspace.yaml` 中定义了目录，

pnpm-workspace.yaml

```yaml
packages:
  - packages/*

# Define a catalog of version ranges.
catalog:
  react: ^18.3.1
  redux: ^5.0.1
```

可以用 `catalog:` 协议代替版本范围本身。

packages/example-app/package.json

```json
{
  "name": "@example/app",
  "dependencies": {
    "react": "catalog:",
    "redux": "catalog:"
  }
}
```

这等同于直接写出版本范围（例如 `^18.3.1`）。

packages/example-app/package.json

```json
{
  "name": "@example/app",
  "dependencies": {
    "react": "^18.3.1",
    "redux": "^5.0.1"
  }
}
```

你可以在以下字段中使用 `catalog:` 协议：

- `package.json`：
  - `dependencies`
  - `devDependencies`
  - `peerDependencies`
  - `optionalDependencies`
- `pnpm-workspace.yaml`：
  - `overrides`
- [`pnx`](/docs/cli/pnx) 说明符，例如 `pnx shx@catalog:`

作为副本安装的本地目录依赖（例如 `file:` 依赖或[注入的](/docs/package_json#dependenciesmetainjected)工作区包）也可以使用 `catalog:` 协议。它们针对安装该目录的工作区的目录进行解析。

当一个本地目录包使用目录条目作为对等依赖时，pnpm 会把该条目记录到 lockfile 中。修改条目后请运行 `pnpm install`，以便冻结安装能使用更新后的 lockfile。

`catalog:` 协议允许在冒号后附加一个可选的名称（例如 `catalog:name`），用来指定使用哪个目录。省略名称时，使用默认目录。

根据场景不同，与直接编写版本范围相比，`catalog:` 协议提供了若干[优势](#advantages)，下文详述。

## 优势

在工作区（即 monorepo 或多包仓库）中，同一个依赖被许多包使用是很常见的。目录在编写 `package.json` 文件时减少了重复，并带来以下几方面好处：

- **保持版本唯一** — 在工作区里通常希望一个依赖只存在一个版本。目录让这一点更易于维护。重复的依赖可能在运行时产生冲突并引发 bug。使用打包工具时，重复还会增大打包产物体积。
- **升级更容易** — 升级依赖时，只需编辑 `pnpm-workspace.yaml` 中的目录条目，而不必逐个修改所有使用该依赖的 `package.json`。这节省了时间，只需改一行而不是很多行。
- **更少的合并冲突** — 由于升级依赖时不需要编辑 `package.json` 文件，这些文件中不再会出现 git 合并冲突。

## 定义目录

目录定义在 `pnpm-workspace.yaml` 文件中。有两种定义目录的方式。

1. 使用（单数形式的）`catalog` 字段创建一个名为 `default` 的目录。
2. 使用（复数形式的）`catalogs` 字段创建任意名称的目录。

:::tip[提示]

如果你已有一个工作区并想迁移到使用目录，运行 [`pnpm catalog migrate`](/docs/cli/catalog)：

```sh
pnpm catalog migrate
```

:::

### 默认目录

顶层的 `catalog` 字段允许用户定义一个名为 `default` 的目录。

pnpm-workspace.yaml

```yaml
catalog:
  react: ^18.2.0
  react-dom: ^18.2.0
```

这些版本范围可以通过 `catalog:default` 引用。对于默认目录，还可以使用一种特殊的 `catalog:` 简写形式。可以把 `catalog:` 理解为展开为 `catalog:default` 的简写。

默认目录也可以写成 `catalogs.default`。同时定义 `catalog` 和 `catalogs.default` 会失败，提示「The 'default' catalog was defined multiple times」。

### 命名目录

可以在 `catalogs` 键下配置多个使用任意名称的目录。

pnpm-workspace.yaml

```yaml
catalogs:
  # Can be referenced through "catalog:react17"
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2

  # Can be referenced through "catalog:react18"
  react18:
    react: ^18.2.0
    react-dom: ^18.2.0
```

默认目录可以与多个命名目录同时定义。这在一个正在逐步迁移到依赖新版本的大型多包仓库中可能很有用。

pnpm-workspace.yaml

```yaml
catalog:
  react: ^16.14.0
  react-dom: ^16.14.0

catalogs:
  # Can be referenced through "catalog:react17"
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2

  # Can be referenced through "catalog:react18"
  react18:
    react: ^18.2.0
    react-dom: ^18.2.0
```

### 目录中的工作区依赖

自 v12.2.0 起提供

目录条目可以写 [`workspace:` 范围](/docs/workspaces#workspace-protocol-workspace)，这样工作区依赖所链接的版本也只需写一次：

pnpm-workspace.yaml

```yaml
catalog:
  '@example/utils': workspace:^
```

packages/example-app/package.json

```json
{
  "name": "@example/app",
  "dependencies": {
    "@example/utils": "catalog:"
  }
}
```

pnpm 会把 `catalog:` 引用展开为 `workspace:^`，然后链接该工作区项目，效果与 `package.json` 自己声明 `workspace:^` 完全一样。发布时两个协议都会被替换，因此当 `@example/utils` 的版本是 1.4.0 时，上面的例子会发布为 `"^1.4.0"`。

### 目录中的本地依赖

自 v12.6.0 起提供

目录条目可以使用 `file:` 和 `link:` 协议（[#8642](https://github.com/pnpm/pnpm/issues/8642)）。条目中的相对路径，例如 `file:./tarballs/foo.tgz`、`workspace:./packages/foo` 或者裸写法的 `./tarballs/foo.tgz`，都以存放 `pnpm-workspace.yaml` 的目录为基准：

pnpm-workspace.yaml

```yaml
catalog:
  my-lib: link:./packages/my-lib
  my-tarball: file:./tarballs/foo.tgz
```

packages/example-app/package.json

```json
{
  "name": "@example/app",
  "dependencies": {
    "my-lib": "catalog:",
    "my-tarball": "catalog:"
  }
}
```

## 添加依赖到目录

[`pnpm add --save-catalog`](/docs/cli/add#--save-catalog) 会把新依赖的版本范围写入默认目录，并在 `package.json` 中写入 `catalog:`。[`--save-catalog-name`](/docs/cli/add#--save-catalog-name-catalog_name) 用于指定使用哪个命名目录。[`catalogMode`](#catalogmode) 则控制不使用该标记时 `pnpm add` 是否也会加入默认目录。

## 错误

- `ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC`：目录中没有该依赖对应的条目。
- `ERR_PNPM_CATALOG_ENTRY_INVALID_RECURSIVE_DEFINITION`：目录条目自身又是一个 `catalog:` 引用。

## 发布

在运行 `pnpm publish` 或 `pnpm pack` 时，`catalog:` 协议会被移除。这与 [workspace: 协议](/docs/workspaces#workspace-protocol-workspace)类似，后者[也会在发布时被替换](/docs/workspaces#publishing-workspace-packages)。

例如，

packages/example-components/package.json

```json
{
  "name": "@example/components",
  "dependencies": {
    "react": "catalog:react18"
  }
}
```

在发布时会变成如下内容。

packages/example-components/package.json

```json
{
  "name": "@example/components",
  "dependencies": {
    "react": "^18.3.1"
  }
}
```

`catalog:` 协议的替换过程使得 `@example/components` 包可以被其他工作区或包管理器使用。

## 设置

### catalogMode

自 v10.12.1 起提供

- 默认值：**manual**
- 类型：**manual**、**strict**、**prefer**

控制运行 `pnpm add` 时是否以及如何把依赖加入默认目录。共有三种模式：

- **strict** — 只允许使用目录中的依赖版本。添加目录版本范围之外的依赖会导致报错。
- **prefer** — 优先使用目录版本，但在找不到兼容版本时回退为直接依赖。
- **manual**（默认）— 不会自动把依赖加入目录。

自 v12.3.0 起，指向位置而不是指向版本的说明符不会被移入目录：本地路径、本地 tarball、tarball URL 以及 `workspace:<path>` 范围都会留在声明它们的 `package.json` 中。这类说明符是相对各自项目来解析的，因此一个目录条目无法对所有引用它的项目都表示同一个目录。

### catalogPrune

自 v11.22.0 起提供（自 v10.15.0 起名为 `cleanupUnusedCatalogs`）

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，pnpm 会在安装过程中移除未使用的目录条目。

`cleanupUnusedCatalogs` 是此设置的已废弃拼写，仍然可用；当两者都被设置时，以 `catalogPrune` 为准。
