---
title: "配置"
headingIds: ["local-project-configuration","global-configuration","environment-variables"]
---

pnpm 设置分为两类：

- **认证与证书设置**存储在 INI 文件中。它们包含敏感凭据，不应提交到你的仓库。详见[认证设置](/docs/npmrc#auth-file-locations)。
- **其余所有设置**存储在 YAML 文件中：项目的 `pnpm-workspace.yaml` 和全局的 `config.yaml`。

pnpm 也不再读取 `package.json` 中 `pnpm` 字段的设置。设置应定义在 `pnpm-workspace.yaml` 中。

## 本地项目配置

项目级设置写在 `pnpm-workspace.yaml` 中：

pnpm-workspace.yaml

```yaml
nodeVersion: "22"
saveExact: true
```

## 全局配置

全局 YAML 配置文件（`config.yaml`）位于以下路径之一：

- 如果设置了 **$XDG_CONFIG_HOME** 环境变量，则为 **$XDG_CONFIG_HOME/pnpm/config.yaml**
- Windows 上：**~/AppData/Local/pnpm/config/config.yaml**
- macOS 上：**~/Library/Preferences/pnpm/config.yaml**
- Linux 上：**~/.config/pnpm/config.yaml**

全局 `rc` 文件（仅用于 registry 和认证设置）位于：

- 如果设置了 **$XDG_CONFIG_HOME** 环境变量，则为 **$XDG_CONFIG_HOME/pnpm/rc**
- Windows 上：**~/AppData/Local/pnpm/config/rc**
- macOS 上：**~/Library/Preferences/pnpm/rc**
- Linux 上：**~/.config/pnpm/rc**

## 环境变量

名称以 `pnpm_config_`（或 `PNPM_CONFIG_`）开头的环境变量会被载入配置。它们会覆盖来自 `pnpm-workspace.yaml` 的设置，但不会覆盖 CLI 参数。

:::warning[warning]

pnpm 不再读取 `npm_config_*` 环境变量。改用 `pnpm_config_*` 环境变量（例如用 `pnpm_config_registry` 而非 `npm_config_registry`）。

:::

例如：

```bash
pnpm_config_save_exact=true pnpm add foo
```

如果你需要 pnpm 在多个硬盘或文件系统之间工作，可阅读[常见问题](/docs/faq#does-pnpm-work-across-multiple-drives-or-filesystems)。

关于管理配置的更多信息，见 [config 命令](/docs/cli/config)。
