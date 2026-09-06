---
title: "pnpm deploy"
headingIds: ["options","--dev--d","--no-optional","--prod--p","--filter-package_selector","--legacy","files-included-in-the-deployed-project","configuration","forcelegacydeploy"]
---

从工作区部署一个包。部署期间，被部署包的文件会被复制到目标目录。被部署包的所有依赖（包括来自工作区的依赖）都会安装在目标目录下隔离的 `node_modules` 目录中。目标目录将包含一个可移植的包，可直接复制到服务器并执行，无需额外步骤。

:::note[说明]

默认情况下，deploy 命令仅适用于将 `inject-workspace-packages` 设置设为 `true` 的工作区。如果你想在没有"注入依赖"的情况下使用 deploy，请使用 `--legacy` 标志或将 `force-legacy-deploy` 设为 `true`。

:::

:::note[说明]

设置了 [enableGlobalVirtualStore](/docs/settings/node-modules#enableglobalvirtualstore) 选项时，`pnpm deploy` 会忽略它，并始终在部署目录内创建一个本地化的虚拟存储。这使部署目录保持自包含且可移植。

:::

Usage:

```
pnpm --filter=<deployed project name> deploy <target directory>
```

如果你在部署前先构建项目，还应使用 `--prod` 选项以跳过 `devDependencies` 的安装。

```
pnpm --filter=<deployed project name> --prod deploy <target directory>
```

在 docker 镜像中的用法。在构建完 monorepo 中的所有内容后，在一个将 monorepo 基础镜像作为构建上下文的第二个镜像中，或在额外的构建阶段中执行以下操作：

```dockerfile
# syntax=docker/dockerfile:1.4

FROM workspace as pruned
RUN pnpm --filter <your package name> --prod deploy pruned

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=pruned /app/pruned .

ENTRYPOINT ["node", "index.js"]
```

## 选项

### --dev, -D

仅安装 `devDependencies`。

### --no-optional

不安装 `optionalDependencies`。

### --prod, -P

不安装 `devDependencies` 中的包。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

### --legacy

强制使用旧版部署实现。

默认情况下，`pnpm deploy` 会尝试为部署从共享锁文件创建一个专用锁文件。`--legacy` 标志会禁用此行为，并允许在未设置 `inject-workspace-packages=true` 的情况下使用 deploy 命令。

## 部署项目中包含的文件

默认情况下，部署期间会复制项目的所有文件，但可通过以下*一种*方式修改，这些方式按顺序解析：

1. 项目的 `package.json` 可以包含一个 "files" 字段，列出应被复制的文件和目录。
2. 如果应用目录中有 `.npmignore` 文件，则此处列出的任何文件都会被忽略。
3. 如果应用目录中有 `.gitignore` 文件，则此处列出的任何文件都会被忽略。

## 配置

### forceLegacyDeploy

- 默认值：**false**
- 类型：**Boolean**

默认情况下，`pnpm deploy` 会尝试为部署从共享锁文件创建一个专用锁文件。如果将此设置设为 `true`，则使用旧版 `deploy` 行为。
