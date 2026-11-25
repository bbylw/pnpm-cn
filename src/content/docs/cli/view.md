---
title: "pnpm view"
headingIds: ["usage","options","--json","--registry-url"]
---

自 v11.0.0 起提供

别名： `info`, `show`, `v`

从 registry 查看包元数据。

```bash
pnpm view [<pkg>]
pnpm view <pkg> [field...]
```

## 用法

显示某个包的全部元数据：

```bash
pnpm view express
```

摘要的末尾会注明读取元数据所用的 registry。如果某个版本缺失，或某个 dist-tag 指向了较旧的版本，请检查该 registry 是否是尚未同步的镜像。

显示特定字段：

```bash
pnpm view express version
pnpm view express dependencies
pnpm view express dist-tags
```

也可以传入多个字段和带点号的路径：

```bash
pnpm view express dist.tarball version
```

显示特定版本的元数据：

```bash
pnpm view express@4.18.0
```

未提供包名时，`pnpm view` 会向上查找最近的项目清单文件（`package.json`、`package.yaml` 或 `package.json5`）并使用其 `name` 字段。若清单文件存在但没有 `name`，命令将失败。要选择字段，请指定包名：第一个参数始终是包，因此 `pnpm view version` 查询的是名为 `version` 的包。

从存储发布说明的 registry（如 [pnpr](https://github.com/pnpm/pnpm/tree/main/pnpr)）查看某个版本以及发布该版本的发布说明：

```bash
pnpm view express@4.18.0 releaseNotes
```

pnpm 以纯文本打印发布说明。它会去掉控制字符和双向覆盖字符，并在每个链接的文本旁边显示其目标。

## 选项

### --json

以 JSON 格式输出元数据。

### --registry <url>

读取元数据所用的 registry。默认为配置的默认 registry。
