---
title: "pnpm link"
headingIds: ["options","pnpm-link-dir","use-cases","replace-an-installed-package-with-a-local-version-of-it","add-a-binary-globally","whats-the-difference-between-pnpm-link-and-using-the-file-protocol"]
---

别名： `ln`

将本地包链接到当前项目的 `node_modules`。

```
pnpm link <dir>
```

## 选项

### `pnpm link <dir>`

将 `<dir>` 目录中的包链接到执行此命令的包所在的 `node_modules`。`<dir>` 必须是相对或绝对路径。

> 例如，如果你在 `~/projects/foo` 中执行 `pnpm link ../bar`，则会在 `foo/node_modules/bar` 创建指向 `bar` 的链接。

:::note[v11 的破坏性变更]

`pnpm link` 不再从全局存储解析包。仅接受相对或绝对路径（用 `pnpm link ./foo` 代替 `pnpm link foo`）。

`pnpm link --global` 已被移除。要全局注册本地包的 bin，改用 `pnpm add -g .`。

不带参数的 `pnpm link` 已被移除。始终传入显式路径。

:::

## 使用场景

### 用本地版本替换已安装的包

假设你有一个使用 `foo` 包的项目，你想修改 `foo` 并在项目中测试这些改动。此时可以用 `pnpm link` 将 `foo` 的本地版本链接到你的项目：

```bash
cd ~/projects/foo
pnpm install # install dependencies of foo
cd ~/projects/my-project
pnpm link ~/projects/foo # link foo to my-project
```

### 全局添加可执行文件

要让本地包的可执行文件在全系统可用，改用 `pnpm add -g .`：

```bash
cd ~/projects/foo
pnpm install # install dependencies of foo
pnpm add -g . # register foo's bins globally
```

注意，只有当包在其 `package.json` 中有 `bin` 字段时，可执行文件才可用。

## `pnpm link` 与使用 `file:` 协议的区别

使用 `pnpm link` 时，被链接的包以符号链接方式指向其源代码。你可以修改被链接包的源代码，改动会反映到你的项目中。用这种方式，pnpm 不会安装被链接包的依赖，你需要在源代码中手动安装它们。当你必须为被链接包使用特定包管理器时，这会很有用，例如你想对被链接包使用 `npm`，而对项目使用 pnpm。

在 `dependencies` 中使用 `file:` 协议时，被链接的包以硬链接方式链接到你项目的 `node_modules`，你可以修改被链接包的源代码，改动会反映到你的项目中。用这种方式，pnpm 还会安装被链接包的依赖，并覆盖被链接包的 `node_modules`。

:::info[info]

处理**对等依赖**时，建议使用 `file:` 协议。它能更好地从项目依赖中解析对等依赖，确保被链接的依赖正确使用主项目中指定的依赖版本，从而带来更一致、更符合预期的行为。

:::

| **Feature** | **`pnpm link`** | **`file:` Protocol** |
| --- | --- | --- |
| 符号链接/硬链接 | Symlink | 硬链接 |
| 反映源代码的修改 | Yes | Yes |
| 安装被链接包的依赖 | 否（需手动安装） | 是（覆盖被链接包的 `node_modules`） |
| 为依赖使用不同的包管理器 | 可以（例如对被链接的包使用 `npm`） | 不可以，它仍会使用 pnpm |
