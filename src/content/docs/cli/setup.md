---
title: "pnpm setup"
headingIds: ["options","--force--f","--no-modify-path"]
---

将正在运行的 pnpm 安装到 `PNPM_HOME` 并把它加入 `PATH`。pnpm 的独立安装脚本会执行该命令，例如 [https://get.pnpm.io/install.sh](https://get.pnpm.io/install.sh)。

```bash
pnpm setup [--force] [--no-modify-path]
```

setup 会执行以下操作：

- 为 pnpm CLI 创建一个主目录
- 通过更新 shell 配置文件，将 pnpm 主目录添加到 `PATH`
- 将正在运行的 pnpm 可执行文件作为[全局包](/docs/global-packages)安装
- 将 `pn`、`pnpx` 和 `pnx` 脚本写入全局安装二进制所在的目录 `$PNPM_HOME/bin`

若想让运行时命令在 setup 之后也能感知项目，请参阅 [`pnpm shim`](/docs/cli/shim)。

如果 `pnpm setup` 无法判断要更新哪个 shell 配置文件，例如在未设置 `SHELL` 的容器中，它仍然会安装 pnpm，然后打印需要你自己添加到 shell 配置中的 `PNPM_HOME` 和 `PATH` 两行。

在 Windows 上，如果无法读取或写入 registry 环境值，`pnpm setup` 仍然会安装 pnpm。它会打印在当前 PowerShell 会话中设置 `PNPM_HOME` 和 `PATH` 的命令。把这些命令加入你的 PowerShell 配置文件，之后的会话无需访问 registry 即可使用 pnpm。

在 GitHub Actions 上运行时，`pnpm setup` 还会把 `PNPM_HOME` 和全局 bin 目录追加到 GitHub Actions 环境文件（`GITHUB_ENV` 和 `GITHUB_PATH`），使同一作业中的后续步骤能够运行 `pnpm add --global` 和其他全局命令。

## 选项

### --force, -f

如果 `PNPM_HOME` 环境变量已存在，则覆盖它。

### --no-modify-path

安装 pnpm，但不把它加入 `PATH`。shell 配置文件、Windows registry 和 GitHub Actions 环境文件都保持不变。`pnpm setup` 会打印需要你自己添加的 `PNPM_HOME` 和 `PATH` 两行。

当你自行管理 shell 配置时，或者 pnpm 是为没有登录 shell 的用户安装的（例如容器镜像中），可以使用该选项。
