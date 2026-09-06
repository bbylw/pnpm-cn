---
title: "pnpm fetch"
headingIds: ["usage-scenario","options","--dev--d","--prod--p"]
---

从锁文件拉取包到虚拟存储，包清单将被忽略。

## 使用场景

此命令专为改进 Docker 镜像构建而设计。

你可能读过为 Node.js 应用编写 Dockerfile 的[官方指南](https://github.com/nodejs/docker-node#readme)，如果还没读过，建议先看一下。

从该指南中，我们学到如何为使用 pnpm 的项目编写优化的 Dockerfile，其大致如下

```dockerfile
FROM ghcr.io/pnpm/pnpm:12

RUN pnpm runtime set node 22 -g

WORKDIR /app

# Files required by pnpm install
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

# Files required by pnpm install
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

可以看到，添加或删除子包时都必须更新 Dockerfile。

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

### --prod, -P

不拉取开发包
