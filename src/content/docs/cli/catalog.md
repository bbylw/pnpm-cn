---
title: "pnpm catalog"
headingIds: ["commands","migrate"]
---

管理工作区的[目录（catalogs）](/docs/catalogs)。

## 命令

### migrate

```sh
pnpm catalog migrate
```

把依赖版本说明符迁移到 `pnpm-workspace.yaml` 的默认目录中，并将工作区各项目的 `package.json` 文件里的对应说明符替换为 `catalog:`。它会读取每个工作区项目（包括根项目）的 `dependencies`、`devDependencies`、`optionalDependencies` 和 `peerDependencies`。

只有当直接声明该依赖的所有项目都使用相同的说明符、且默认目录中没有与之不同的条目时，该依赖才会被迁移。由 `updateConfig` 钩子设置的目录也算在内。由于钩子的目录会替换 `pnpm-workspace.yaml` 中的目录，只有钩子放行的条目才会被加入；否则该依赖会被列出并保持不变。若某依赖的直接声明彼此不一致、或与目录中的条目不一致，该依赖也会被列出并保持不变。已经使用 `catalog:` 或 `workspace:` 协议的依赖，以及 `file:`、`link:` 等本地路径，会原样保留。

锁文件不会被改动。之后请运行 `pnpm install`。
