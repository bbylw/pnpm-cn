---
title: "使用 Docker"
headingIds: ["official-pnpm-base-image","tags","installing-nodejs","when-to-use-this-image","minimizing-docker-image-size-and-build-time","example-1-build-a-bundle-in-a-docker-container","example-2-build-multiple-docker-images-in-a-monorepo","example-3-build-on-cicd"]
---

:::note[说明]

在构建期间，无法在 Docker 容器与主机文件系统之间创建引用链接或硬链接。次优做法是使用 BuildKit 缓存挂载在多次构建之间共享缓存。另一种选择是使用 [podman](/docs/podman)，因为它可以在构建期间挂载 Btrfs 卷。如果使用 BuildKit 缓存挂载，请将 pnpm 存储缓存限定在相互信任的构建范围内。能被不受信任构建写入的存储缓存不应被受信任构建复用。

:::

## pnpm 官方基础镜像

pnpm 官方基础镜像以 [ghcr.io/pnpm/pnpm](https://github.com/pnpm/pnpm/pkgs/container/pnpm) 的形式发布在 GitHub Container Registry 上。它基于 `debian:stable-slim`，仅包含 pnpm 的[独立二进制](/docs/installation#using-a-standalone-script)，**不**捆绑 Node.js。这样你可以自行选择 Node.js 版本（在 Dockerfile 内或运行时），而不必受基础镜像自带 Node 版本的限制。

### 标签

| **Tag** | **Meaning** |
| --- | --- |
| `<version>` | 精确、不可变（如 `12.0.0`）。包含预发布版本。 |
| `<major>` | 跟踪该主版本内的最新稳定版（如 `12`）。 |
| `latest` | 最新的 pnpm 稳定版。不随预发布版本更新。 |

支持的平台：`linux/amd64`、`linux/arm64`。

### 安装 Node.js

让 pnpm 根据 `package.json` 中的 [devEngines.runtime](/docs/package_json#devenginesruntime) 自动安装 Node.js：

package.json

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "22.x",
      "onFail": "download"
    }
  }
}
```

```dockerfile
FROM ghcr.io/pnpm/pnpm:12
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "start"]
```

### 何时使用此镜像

- 你希望 Node.js 版本由项目通过 `devEngines.runtime` 锁定，而不是由基础镜像决定。
- 你希望独立升级 pnpm 和 Node.js。
- 你偏好不含 Node.js 构建工具链的极简 Debian 基础镜像。

本页面后面的实用配方都从该镜像开始并让 pnpm 安装 Node.js。如果你更想使用自己的 Node.js 基础镜像，保留配方的其余部分，改为在该镜像中[安装 pnpm](/docs/installation)。

## 最小化 Docker 镜像体积与构建时间

- 使用小镜像，例如 `ghcr.io/pnpm/pnpm` 或 `node:XX-slim`。
- 在可行且合理的情况下利用多阶段构建。
- 利用 BuildKit 缓存挂载。

以下配方使用官方 pnpm 镜像，它已设置 `PNPM_HOME=/pnpm` 并将 `/pnpm/bin` 加入 `PATH`，因此缓存挂载指向的存储位于 `/pnpm/store`。

:::caution[注意]

把预热好的存储烘焙进镜像层（在构建期间运行安装，使后续容器无需下载）并不能让链接变成零成本。对下层镜像中文件的硬链接可以创建成功，但 overlayfs 会先把该文件复制到容器的可写层，因此安装实际上把存储的大部分内容从镜像中复制了出来，却报告为硬链接。在这种配置下，[packageImportMethod: copy](/docs/settings/node-modules#a-store-baked-into-a-container-image-layer) 通常更快，在 ext4 上更是能明显测出差异。BuildKit 缓存挂载没有这个问题，因为存储是一个挂载点而不是镜像层。

:::

### 示例 1：在 Docker 容器中构建 bundle

由于 `devDependencies` 仅在构建 bundle 时需要，`pnpm install --prod` 会作为与 `pnpm install` 和 `pnpm run build` 分离的阶段，使最终阶段只从早期阶段复制必要的文件，从而将最终镜像的体积降到最低。

.dockerignore

```
node_modules
.git
.gitignore
*.md
dist
```

Dockerfile

```dockerfile
FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 24 -g
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]
```

### 示例 2：在 monorepo 中构建多个 Docker 镜像

假设你有一个包含 3 个包的 monorepo：app1、app2 和 common；app1 和 app2 依赖 common，但彼此不依赖。

如果你只想为每个包保留必要的依赖，`pnpm deploy` 可以帮你只复制必要的文件和包。

monorepo 结构

```
./
├── Dockerfile
├── .dockerignore
├── .gitignore
├── packages/
│   ├── app1/
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── app2/
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   └── common/
│       ├── dist/
│       ├── package.json
│       ├── src/
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```

pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
syncInjectedDepsAfterScripts:
- build
injectWorkspacePackages: true
```

.dockerignore

```
node_modules
.git
.gitignore
*.md
dist
```

Dockerfile

```dockerfile
FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 24 -g

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=app1 --prod /prod/app1
RUN pnpm deploy --filter=app2 --prod /prod/app2

FROM base AS app1
COPY --from=build /prod/app1 /prod/app1
WORKDIR /prod/app1
EXPOSE 8000
CMD [ "pnpm", "start" ]

FROM base AS app2
COPY --from=build /prod/app2 /prod/app2
WORKDIR /prod/app2
EXPOSE 8001
CMD [ "pnpm", "start" ]
```

运行以下命令为 app1 和 app2 构建镜像：

```bash
docker build . --target app1 --tag app1:latest
docker build . --target app2 --tag app2:latest
```

### 示例 3：在 CI/CD 中构建

在 CI 或 CD 环境中，BuildKit 缓存挂载可能不可用，因为虚拟机或容器是临时的，只有普通的 docker 缓存能起作用。

因此替代方案是使用按层逐步构建的常规 Dockerfile。在这种场景下，`pnpm fetch` 是最佳选择，因为它只需要 `pnpm-lock.yaml` 文件，且只有在你更改依赖时才会丢失层缓存。

Dockerfile

```dockerfile
FROM ghcr.io/pnpm/pnpm:12 AS base

RUN pnpm runtime set node 24 -g

FROM base AS prod

WORKDIR /app
COPY pnpm-lock.yaml /app
RUN pnpm fetch --prod

COPY . /app
RUN pnpm run build

FROM base
COPY --from=prod /app/node_modules /app/node_modules
COPY --from=prod /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]
```
