---
title: "安装"
headingIds: ["prerequisites", "supported-platforms", "using-pnpm", "using-a-standalone-script", "on-windows", "on-posix-systems", "in-a-docker-container", "installing-a-specific-version", "installing-without-changing-path", "using-npm", "compatibility", "troubleshooting", "updating-pnpm", "uninstalling-pnpm"]
---

## 先决条件

pnpm 12 是一个原生可执行文件，安装后不需要 Node.js。`pnpm` 这个 npm 包可安装在 Node.js 18 或更新版本上。`npx get-pnpm` 安装器需要 Node.js 22.13 或更新版本。

pnpm 12 是当前的发布线。npm 上的 `latest` 标签指向它，因此下面的命令无需指定版本即可安装 pnpm 12。

### 支持的平台

pnpm 12 为下列每个目标提供预构建的二进制文件：

| 操作系统 | 架构 |
| --- | --- |
| Linux (glibc) | x64, arm64, riscv64, ppc64le, s390x, loong64 |
| Linux (musl) | x64, arm64 |
| macOS | arm64, x64 |
| Windows | x64, arm64 |
| FreeBSD | x64 |
| NetBSD | x64 |
| Android | arm64, x64 |

FreeBSD、ppc64le、s390x、RISC-V 和 Android 是自 v12.4.0 起加入的。NetBSD 的二进制文件在 NetBSD 10 上构建并测试。在没有二进制文件的目标平台上，请改为安装 JavaScript 版的 [pnpm 11](https://www.npmjs.com/package/pnpm/v/11)。

关于 StackBlitz WebContainers，请参见实验性的 [WebAssembly 发行版](/docs/webcontainers)。

## 使用 pnpm

如果你已经拥有 pnpm v11.10.0 或更新版本，可直接更新到 pnpm 12：

```bash
pnpm self-update
```

在通过 `packageManager` 字段锁定 pnpm 的项目内，[self-update](/docs/cli/self-update) 只会更新该锁定值，而不会全局安装 pnpm。

## 使用独立脚本

即使没有安装 Node.js，你也可以使用以下脚本安装 pnpm。

### 在 Windows 上

:::warning[警告]

有时，如果你以这种方式安装 pnpm，Windows Defender 可能会阻止我们的可执行文件。

由于此问题，我们目前在 Windows 上建议使用 [npm](#using-npm) 安装 pnpm。

:::

使用 PowerShell：

```powershell
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

在 Windows 上，Microsoft Defender 会显著拖慢包的安装。你可以在具有管理员权限的 PowerShell 窗口中，通过执行以下命令把 pnpm 加入 Microsoft Defender 的排除文件夹列表：

```powershell
Add-MpPreference -ExclusionPath $(pnpm store path)
```

### 在 POSIX 系统上

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

如果你没有安装 curl，可以使用 wget：

```bash
wget -qO- https://get.pnpm.io/install.sh | sh -
```

:::tip[提示]

之后你可以使用 [pnpm runtime](/docs/cli/runtime) 命令安装 Node.js。

:::

在 Linux（内核 5.9 或更新版本）上使用 LUKS2 加密的 NVMe SSD 时，`dm-crypt` 默认通过内核工作队列排布读写，这会拖慢包的安装。用 `lsblk -o NAME,TYPE,MOUNTPOINTS` 找到你的 `crypt` 卷名，然后绕过这些工作队列并把该设置持久化到 LUKS2 头部：

```sh
sudo cryptsetup refresh --perf-no_read_workqueue --perf-no_write_workqueue --persistent <crypt-volume-name>
```

### 在 Docker 容器中

```bash
# bash
wget -qO- https://get.pnpm.io/install.sh | env ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
# sh
wget -qO- https://get.pnpm.io/install.sh | env ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
# dash
wget -qO- https://get.pnpm.io/install.sh | env ENV="$HOME/.dashrc" SHELL="$(which dash)" dash -
```

### 安装特定版本

在运行安装脚本之前，你可以选择设置环境变量 `PNPM_VERSION` 来安装 pnpm 的特定版本：

```bash
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=<version> sh -
```

### 安装时不修改 PATH

默认情况下，安装脚本会通过你的 shell 配置文件把 pnpm 加入 `PATH`，在 Windows 上则通过你的用户环境变量。若想保持它们不变，请设置 `PNPM_NO_MODIFY_PATH=1`。pnpm 仍会安装到 `PNPM_HOME`，安装器会打印出你需要自行添加的 `PNPM_HOME` 与 `PATH` 两行。此特性需要 pnpm 12.16.0 或更新版本。

```sh
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_NO_MODIFY_PATH=1 sh -
```

```powershell
$env:PNPM_NO_MODIFY_PATH='1'; Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

## 使用 npm

```bash
npx get-pnpm
```

运行这个安装器需要 Node.js 22.13 或更新版本，但之后运行 pnpm 本身并不需要。

若想安装时保持 `PATH` 不变，请运行 `npx get-pnpm --no-modify-path`。参见[安装时不修改 PATH](#installing-without-changing-path)。

你也可以用 npm 全局安装 `pnpm` 包，这需要 Node.js 18 或更新版本：

```bash
npm install -g pnpm@latest
```

:::tip[提示]

想在 CI 服务器上使用 pnpm 吗？参见[持续集成](/docs/continuous-integration)。

:::

运行此安装程序需要 Node.js 22.13 或更新版本，但之后运行 pnpm 并不需要。

:::tip[提示]

想在 CI 服务器上使用 pnpm？参见[持续集成](/docs/continuous-integration)。

:::

## 兼容性

以下是历次 pnpm 版本及其 Node.js 版本支持的列表。

| **Node.js** | **pnpm 8** | **pnpm 9** | **pnpm 10** | **pnpm 11** | **pnpm 12** |
| --- | --- | --- | --- | --- | --- |
| Node.js 14 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Node.js 16 | ✔️ | ❌ | ❌ | ❌ | ❌ |
| Node.js 18 | ✔️ | ✔️ | ✔️ | ❌ | ✔️ |
| Node.js 20 | ✔️ | ✔️ | ✔️ | ❌ | ✔️ |
| Node.js 22 | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| Node.js 24 | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |
| Node.js 26 | ✔️ | ✔️ | ✔️ | ✔️ | ✔️ |

pnpm 12 只有在从 npm 安装时才需要 Node.js；由独立脚本安装的版本无需 Node.js 即可运行。

## 故障排查

如果 pnpm 已损坏且你无法通过重装修复它，可能需要手动将其从 PATH 中移除。

假设你在运行 `pnpm install` 时遇到以下错误：

```
C:\src>pnpm install
internal/modules/cjs/loader.js:883
  throw err;
  ^



Error: Cannot find module 'C:\Users\Bence\AppData\Roaming\npm\pnpm-global\4\node_modules\pnpm\bin\pnpm.js'
←[90m    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:880:15)←[39m
←[90m    at Function.Module._load (internal/modules/cjs/loader.js:725:27)←[39m
←[90m    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:72:12)←[39m
←[90m    at internal/main/run_main_module.js:17:47←[39m {
  code: ←[32m'MODULE_NOT_FOUND'←[39m,
  requireStack: []
}
```

首先，通过运行 `which pnpm` 找到 pnpm 的位置。如果你在 Windows 上，运行 `where.exe pnpm.*`。你会得到 pnpm 命令的位置，例如：

```
$ which pnpm
/c/Program Files/nodejs/pnpm
```

现在你知道了 pnpm CLI 所在的位置，打开该目录并移除所有 pnpm 相关文件（`pnpm.cmd`、`pnpx.cmd`、`pnpm` 等）。完成后，重新安装 pnpm，它应该就能正常工作。

## 更新 pnpm

要更新 pnpm，运行 [self-update](/docs/cli/self-update) 命令：

```
pnpm self-update
```

## 卸载 pnpm

如果你需要从系统中移除 pnpm CLI 以及它写入磁盘的任何文件，参见[卸载 pnpm](/docs/uninstall)。
