---
title: "pnpm rebuild"
headingIds: ["options","--pending","--recursive--r","--no-bail","--filter-package_selector"]
---

别名： `rb`

重新运行已安装依赖的（构建）生命周期脚本。重建会保留上次安装所包含的依赖分组。

```sh
pnpm rebuild [<pkg>...]
```

指定包名时，只会重建这些包。不指定时，则会重建所有需要构建的依赖。

`package.json` 中的 `rebuild` 脚本会覆盖该命令，`rb` 脚本会覆盖 `pnpm rb`。参见 [`pnpm pm`](/docs/cli/pm)。

## 选项

### --pending

只重建安装期间没有被构建的包，例如在 `--ignore-scripts` 下安装的包。

```sh
pnpm rebuild --pending
```

### --recursive, -r

此命令会在 monorepo 的每个包中运行 **pnpm rebuild** 命令。

### --no-bail

参见 [`--no-bail`](/docs/cli/recursive#--no-bail)。

### --filter <package_selector>

更多过滤说明见[过滤](/docs/filtering)。
