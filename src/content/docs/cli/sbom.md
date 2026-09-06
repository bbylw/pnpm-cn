---
title: "pnpm sbom"
headingIds: ["usage","options","--sbom-format-cyclonedxspdx","--sbom-type-libraryapplication","--sbom-spec-version-version","--lockfile-only","--sbom-authors-names","--sbom-supplier-name","--out-path","--split","--exclude-peers","--prod--p","--dev--d","--no-optional","--filter-package_selector"]
---

自 v11.0.0 起提供

为项目生成软件物料清单（SBOM）。

支持的格式：

- **CycloneDX 1.7**（JSON）
- **SPDX 2.3**（JSON）

## 用法

```bash
pnpm sbom --sbom-format cyclonedx
pnpm sbom --sbom-format spdx
pnpm sbom --sbom-format cyclonedx --lockfile-only
pnpm sbom --sbom-format spdx --prod
pnpm sbom --sbom-format cyclonedx --out sbom.cdx.json
pnpm sbom --sbom-format cyclonedx --split
pnpm sbom --sbom-format cyclonedx --exclude-peers
```

在工作区内，`pnpm sbom` 支持过滤。当只选中一个工作区包时，SBOM 中的根组件使用该包的元数据。

自 v11.20.0 起，从[命名 registry](/docs/settings/dependency-resolution#namedregistries) 解析出的组件会带上 purl 的 `repository_url` 限定符（例如 `pkg:npm/foo@1.0.0?repository_url=https%3A%2F%2Fnpm.work.example.com%2F`），因此两个 registry 提供的同名同版本包不会被合并为一个组件。`namedRegistries` URL 中可能嵌入的凭据（userinfo 或查询字符串）会从限定符中剥离，而来源与路径会被保留，因为两个 registry 可能仅在路径上不同。

CycloneDX 输出会将仅通过 `devDependencies` 可达的组件标记为 `scope: "excluded"` 并附加 `cdx:npm:package:development` 属性。运行时组件（包括已安装的可选依赖）使用默认的 required 作用域。

## 选项

### --sbom-format <cyclonedx|spdx>

SBOM 输出格式。此选项必填。支持的值：`cyclonedx`、`spdx`。

### --sbom-type <library|application>

- 默认值：**library**

根包的组件类型。

### --sbom-spec-version <version>

自 v11.1.0 起提供

- 默认值：**1.7**
- 类型：**1.5**, **1.6**, **1.7**

输出的 CycloneDX 规范版本。仅在与 `--sbom-format cyclonedx` 搭配时有效。

### --lockfile-only

仅使用锁文件数据（跳过从存储读取）。

### --sbom-authors <names>

以逗号分隔的 SBOM 作者列表。将写入 CycloneDX 输出的 `metadata.authors`。

### --sbom-supplier <name>

SBOM 供应商名称。将写入 CycloneDX 输出的 `metadata.supplier`。

### --out <path>

自 v11.8.0 起提供

将 SBOM 写入文件而不是 stdout。

在路径中，`%s` 用作包名的占位符，`%v` 用作包版本的占位符。在工作区中，包含 `%s` 的路径会为每个选中的包各写一份 SBOM：

```bash
pnpm sbom --sbom-format cyclonedx --out out/%s.cdx.json
pnpm sbom --sbom-format cyclonedx --out out/%s-%v.cdx.json
```

### --split

自 v11.8.0 起提供

为每个选中的工作区包分别生成 SBOM。不使用 `--out` 时，SBOM 会以 NDJSON 形式打印到 stdout，每行一个 JSON 文档。

当 `--split` 与 `--out` 搭配使用时，输出路径必须包含 `%s`。

### --exclude-peers

自 v11.9.0 起提供

从 SBOM 中排除对等依赖。仅通过这些对等依赖可达的依赖也会被排除。

这在配合 `auto-install-peers` 时很有用，因为对等依赖会被解析进锁文件，否则看起来与普通依赖无异。

### --prod, -P

仅包含 `dependencies` 和 `optionalDependencies`。

### --dev, -D

仅包含 `devDependencies`。

### --no-optional

不包含 `optionalDependencies`。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)
