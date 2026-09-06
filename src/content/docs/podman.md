---
title: "与 Podman 配合使用"
headingIds: ["sharing-files-between-a-container-and-the-host-btrfs-filesystem"]
---

## 在容器与宿主机的 Btrfs 文件系统之间共享文件

:::note[说明]

此方法仅在 Podman 支持的写时复制文件系统（如 Btrfs）上有效。对于其他文件系统（如 Ext4），pnpm 会改为复制文件。

:::

Podman 支持 Btrfs 这类写时复制文件系统。在 Btrfs 上，容器运行时为挂载卷创建真正的 Btrfs 子卷。pnpm 可以利用这一行为，在不同挂载卷之间创建引用链接（reflink）。

要在宿主机与容器之间共享文件，请将宿主机上的存储目录和 `node_modules` 目录挂载到容器中。这样容器内的 pnpm 就能以引用链接的形式自然复用宿主机的文件。

:::important[重要]

只将宿主机上的 pnpm 存储挂载到你信任的容器。对挂载存储有写权限的容器，可能影响后续复用该存储的安装。

:::

以下是一个用于演示的容器配置示例：

在 `package.json` 的 [devEngines.runtime](/docs/package_json#devenginesruntime) 中声明 Node.js。下方的 `pnpm install` 命令会自动安装声明的版本。

Dockerfile

```dockerfile
FROM ghcr.io/pnpm/pnpm:12

WORKDIR /app

VOLUME [ "/pnpm-store", "/app/node_modules" ]
RUN pnpm config --global set store-dir /pnpm-store

# You may need to copy more files than just package.json in your code
COPY package.json /app/package.json

RUN pnpm install
RUN pnpm run build
```

运行以下命令构建 podman 镜像：

```bash
podman build . --tag my-podman-image:latest -v "$HOME/.local/share/pnpm/store:/pnpm-store" -v "$(pwd)/node_modules:/app/node_modules"
```
