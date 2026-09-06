---
title: "目录（catalogs）"
headingIds: ["the-catalog-protocol-catalog","advantages","defining-catalogs","default-catalog","named-catalogs","publishing","settings","catalogmode","catalogprune"]
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

- package.json
  :
  - `dependencies`
  - `devDependencies`
  - `peerDependencies`
  - `optionalDependencies`
- pnpm-workspace.yaml
  - `overrides`

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

如果你已有一个工作区并想迁移到使用目录，可以用下面这个 [codemod](https://go.codemod.com/pnpm-catalog)：

```
pnpx codemod pnpm/catalog
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

## 发布

在运行 `pnpm publish` 或 `pnpm pack` 时，`catalog:` 协议会被移除。这与 [workspace: 协议](/docs/workspaces#workspace-protocol-workspace)类似，后者[也会在发布时被替换](/docs/workspaces#publishing-workspace-packages)。

例如，

packages/example-components/package.json

```json
{
  "name": "@example/components",
  "dependencies": {
    "react": "catalog:react18",
  }
}
```

在发布时会变成如下内容。

packages/example-components/package.json

```json
{
  "name": "@example/components",
  "dependencies": {
    "react": "^18.3.1",
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

### catalogPrune

自 v11.22.0 起提供（自 v10.15.0 起名为 `cleanupUnusedCatalogs`）

- 默认值：**false**
- 类型：**Boolean**

设为 `true` 时，pnpm 会在安装过程中移除未使用的目录条目。

`cleanupUnusedCatalogs` 是此设置的已废弃拼写，仍然可用；当两者都被设置时，以 `catalogPrune` 为准。
