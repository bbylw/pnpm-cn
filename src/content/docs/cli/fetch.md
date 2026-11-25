---
title: "pnpm fetch"
headingIds: ["workspaces","usage-scenario","options","--dev--d","--prod---production--p","--ignore-pnpmfile"]
---

从锁文件拉取包到虚拟存储，包清单将被忽略。缺失的包清单不会被创建。

`pnpm fetch` 需要 `pnpm-lock.yaml`，并且不会更新它。即使没有工作区配置和 pnpmfile，拉取也会使用锁文件中的解析设置。当项目固定了某个 pnpm 版本、而命令本应切换到该版本时，`pnpm fetch` 还会把该 pnpm 下载到存储目录，以便之后的 `pnpm install --offline` 能找到它。

## 工作区

当 `sharedWorkspaceLockfile: false` 时，使用 `pnpm -r fetch` 从每个所选项目的锁文件中拉取包。用 `--filter` 选择项目。工作区发现需要项目的包清单，它们的依赖字段不影响从锁文件拉取什么。

## 使用场景

此命令专为改进 Docker 镜像构建而设计。

使用 pnpm 的项目，其典型的 Dockerfile 如下（另见[使用 Docker](/docs/docker)）：

```dockerfile
FROM ghcr.io/pnpm/pnpm:12

RUN pnpm runtime set node 22 -g

WORKDIR /app

# Files required by pnpm install. Leave out .pnpmfile.mjs if the project has none,
# because COPY fails on a missing source.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.mjs ./

# If you patched any package, include patches before install too
COPY patches patches

RUN pnpm install --frozen-lockfile --prod

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]
```

只要 `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`.pnpmfile.mjs` 没有变化，docker 构建缓存在 `RUN pnpm install --frozen-lockfile --prod` 这一层之前都仍然有效，而这一层正是构建 docker 镜像时最耗时的部分。

然而，对 `package.json` 的修改可能远比我们预期的频繁，因为它不仅包含依赖，还可能包含版本号、脚本以及任意其他工具的配置。

维护一个构建 monorepo 项目的 Dockerfile 也很困难，它可能如下

```dockerfile
FROM ghcr.io/pnpm/pnpm:12

RUN pnpm runtime set node 22 -g

WORKDIR /app

# Files required by pnpm install. Leave out .pnpmfile.mjs if the project has none,
# because COPY fails on a missing source.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .pnpmfile.mjs ./

# If you patched any package, include patches before install too
COPY patches patches

# for each sub-package, we have to add one extra step to copy its manifest
# to the right place, as docker have no way to filter out only package.json with
# single instruction
COPY packages/foo/package.json packages/foo/
COPY packages/bar/package.json packages/bar/

RUN pnpm install --frozen-lockfile --prod

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]
```

可以看出，添加或删除子包时都必须更新 Dockerfile。

`pnpm fetch` 完美解决了上述问题，它提供了仅凭锁文件和配置文件（`pnpm-workspace.yaml`）中的信息就能将包加载到虚拟存储的能力。

```dockerfile
FROM ghcr.io/pnpm/pnpm:12

RUN pnpm runtime set node 22 -g

WORKDIR /app

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# If you patched any package, include patches before running pnpm fetch
COPY patches patches

RUN pnpm fetch --prod


COPY . ./
RUN pnpm install -r --offline --prod


EXPOSE 8080
CMD [ "node", "server.js" ]
```

它对简单项目和 monorepo 项目都适用，由于所有必需的包都已存在于虚拟存储中，`--offline` 会强制 pnpm 不与包 registry 通信。

只要锁文件没有变化，构建缓存到该层都仍然有效，因此 `RUN pnpm install -r --offline --prod` 会为你节省大量时间。

:::note[说明]

本地 `file:` 协议依赖会在 `pnpm fetch` 期间被跳过，因为它们引用的目录在拉取时可能不可用（例如在 Docker 构建中）。

:::

## 选项

### --dev, -D

仅拉取开发包

### --prod, --production, -P

不拉取开发包

### --ignore-pnpmfile

不运行 [pnpmfile](/docs/pnpmfile) 的钩子。
