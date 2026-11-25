---
title: "配置"
headingIds: ["local-project-configuration","global-configuration","settings-for-global-packages","environment-variables"]
---

pnpm 设置分为两类：

- **认证与证书设置**存储在 INI 文件中。它们包含敏感凭据，不应提交到你的仓库。详见[认证设置](/docs/npmrc#auth-file-locations)。
- **其余所有设置**存储在 YAML 文件中：项目的 `pnpm-workspace.yaml` 和全局的 `config.yaml`。

pnpm 也不再读取 `package.json` 中 `pnpm` 字段的设置。设置应定义在 `pnpm-workspace.yaml` 中。

## 本地项目配置

项目级设置写在 `pnpm-workspace.yaml` 中：

pnpm-workspace.yaml

```yaml
nodeVersion: "22.22.3"
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

### 全局包的设置

`globalPackagesConfig` 下的设置只对作用于[全局包](/docs/global-packages)的命令生效，例如 `pnpm add -g`、`pnpm update -g` 和 `pnpm approve-builds -g`。对这些命令而言，它们会覆盖 `config.yaml` 的其余部分。环境变量和命令行选项又会覆盖它们。`globalPackagesConfig` 也可以承载通常是项目专用的设置，例如 [`permissions`](/docs/settings/build#permissions)：

```yaml
trustPolicy: no-downgrade
globalPackagesConfig:
  trustPolicyExclude:
    - vercel
  permissions:
    esbuild:
      build: true
```

`catalog`、`catalogs`、`overrides`、`packageExtensions` 和 `patchedDependencies` 不支持放在 `globalPackagesConfig` 下。pnpm 会忽略它们并给出警告。

`globalPackagesConfig.skills.dirs` 控制已批准的全局 Agent 技能被链接到何处。路径相对于主目录，且必须留在其内部。参见 [skills.dirs](/docs/settings/build#skillsdirs)。

`pnpm login` 把 registry 令牌保存在这个 `config.yaml` 中。其他全局认证和证书设置放在同一目录下的 `auth.ini` 中。参见[认证文件位置](/docs/npmrc#auth-file-locations)。

## 环境变量

名称以 `pnpm_config_`（或 `PNPM_CONFIG_`）开头的环境变量会被载入配置。它们会覆盖来自 `pnpm-workspace.yaml` 的设置，但不会覆盖 CLI 参数。

:::warning[警告]

pnpm 不再读取 `npm_config_*` 环境变量。改用 `pnpm_config_*` 环境变量（例如用 `pnpm_config_registry` 而非 `npm_config_registry`）。

:::

例如：

```bash
pnpm_config_save_exact=true pnpm add foo
```

如果你需要 pnpm 在多个硬盘或文件系统之间工作，可阅读[常见问题](/docs/faq#does-pnpm-work-across-multiple-drives-or-filesystems)。

关于管理配置的更多信息，见 [config 命令](/docs/cli/config)。
