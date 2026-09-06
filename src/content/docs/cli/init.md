---
title: "pnpm init"
headingIds: ["options","--bare","--init-type-type","--init-package-manager","configuration","initversion","initlicense","initauthorname-initauthoremail-initauthorurl"]
---

创建 `package.json` 文件。

## 选项

### --bare

自 v10.25.0 起提供

创建仅包含必需字段的 `package.json`。

### --init-type <type>

- 默认值：**module**
- 类型：**commonjs**、**module**

设置包的模块系统。

### --init-package-manager

将项目锁定到某个 pnpm 版本。

自 v11 起，锁定以 [devEngines.packageManager](/docs/package_json#devenginespackagemanager) 条目的形式写入，因此解析出的版本会记录在 `pnpm-lock.yaml` 中。自 v11.23.0 起，它还会以精确版本（而非 `^` 范围）写入旧版的 `packageManager` 字段，因为 Corepack 只读取 `packageManager` 且仅接受精确版本。

自 v12.0.0 起，锁定的版本可以新于运行该命令的 pnpm，因此由过时 pnpm 生成的项目不再通过自身锁定继承这种陈旧性（[#7490](https://github.com/pnpm/pnpm/issues/7490)）。pnpm 会在包管理器 registry 上查找 `latest` 标签下发布的版本，并且**仅当它新于当前运行版本时**才锁定它，这种查找只会抬高锁定版本，绝不会降低。

由此得出两点。`latest` 是一个标签而非“最新发布”，所以锁定版本跟随标签指向的版本线：当 `latest` 位于 pnpm 11 版本线时，用 pnpm 11.20 运行 `pnpm init` 会锁定最新的 pnpm 11，而 pnpm 12 会锁定自身，因为没有比它更新的 pnpm 11 版本。而当查询无法给出结果时（无网络、registry 不可达或响应缓慢、`--offline`，或 `latest` 被 [minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage) 或 [trustPolicy](/docs/settings/dependency-resolution#trustpolicy) 拒绝），则与以往一样锁定当前运行版本。查询绝不会导致命令失败或卡住。

在工作区子包中此选项不生效：锁定只会添加到工作区根目录的 `package.json`，子包跟随该锁定。传入 `--no-init-package-manager` 可生成完全不带锁定的清单。

## 配置

这些设置用于填充生成的 `package.json` 的字段。可在 `pnpm-workspace.yaml`、[全局配置文件](/docs/cli/config) 中设置，或通过环境变量 `PNPM_CONFIG_INIT_VERSION` 等设置。

### initVersion

- 默认值：**1.0.0**
- 类型：**字符串**

写入新 `package.json` 的 `version`。

### initLicense

- 默认值：**ISC**
- 类型：**字符串**

写入新 `package.json` 的 `license`。

### initAuthorName, initAuthorEmail, initAuthorUrl

- 类型：**字符串**

组装进 `author` 字段，采用 npm 的 `Name <email> (url)` 形式。未设置的字段会从字符串中省略；三者都未设置时，不写入 `author` 字段。

pnpm-workspace.yaml

```yaml
initLicense: MIT
initAuthorName: Zoltan Kochan
initAuthorUrl: https://kochan.io
```
