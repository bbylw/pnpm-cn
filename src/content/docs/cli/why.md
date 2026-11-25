---
title: "pnpm why"
headingIds: ["options","--recursive--r","--json","--long","--parseable","--global--g","--ranges","--prod--p---production","--dev--d","--no-optional","--optional","--depth-number","--exclude-peers","--filter-package_selector","--find-by-finder_name"]
---

显示所有依赖指定包的包。

```bash
pnpm why <pkg>...
```

例如：

```bash
pnpm why "@babel/*"
```

需要提供包名或 [`--find-by`](#--find-by-finder_name)。两者都没有时，命令会以 `ERR_PNPM_MISSING_PACKAGE_NAME` 失败。

输出是一棵反向依赖树：被查找的包位于根部，其依赖方作为分支，一路回溯到工作区根。

重复的子树会在输出中去重，并显示为「deduped」。

## 选项

### --recursive, -r

为子目录中的每个包显示指定包的依赖树；在工作区内执行时，为每个工作区包显示。

### --json

以 JSON 格式显示信息。依赖方节点包含 `requires` 字段，其中有声明的依赖版本范围（如果可用）。

### --long

显示详细输出。

### --parseable

显示可解析的输出而非树视图。

### --global, -g

检查全局安装目录中的包，而非当前项目中的包。

### --ranges

显示每个直接依赖方为该包声明的版本范围，以替代依赖树。声明相同范围的依赖方会列在其下，每个已安装的版本各占一节：

```text
esbuild
  Installed: 0.28.1
  Wanted:
    ^0.28.0:
      vite@6.1.0
    ~0.28.0:
      tsx@4.23.1
```

`package.json` 无法读取的依赖方会列在 `<unknown>` 之下。

### --prod, -P, --production

仅显示 `dependencies` 和 `optionalDependencies` 中包的依赖树。

### --dev, -D

仅显示 `devDependencies` 中包的依赖树。

### --no-optional

不显示来自 `optionalDependencies` 的包。

### --optional

包含来自 `optionalDependencies` 的包。

### --depth <number>

仅显示特定深度内的依赖。

### --exclude-peers

去掉那些仅作为已解析的对等依赖被触达的包。若某个包同时是某个项目或包的常规依赖，则会被保留。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --find-by <finder_name>

自 v10.16.0 起提供

使用在 `.pnpmfile.mjs` 中定义的 [finder 函数](/docs/finders)，按名称之外的属性匹配依赖。
