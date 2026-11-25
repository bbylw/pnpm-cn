---
title: "pnpm pack"
headingIds: ["files-included-in-the-tarball","private-workspace-dependencies","options","--recursive--r","--out-path","--pack-destination-dir","--pack-gzip-level-level","--json","--filter-package_selector","--dry-run","--ignore-pnpmfile","--ignore-scripts","--skip-manifest-obfuscation","life-cycle-scripts"]
---

从包创建 tarball。

## 包含在 tarball 中的文件

使用 `package.json` 中的 `files` 字段来选择文件和目录。模式支持 extglob，例如 `lib/!(*.test.js)` 和 `@(dist|lib)`。`files` 字段会取代根目录下的 `.npmignore` 或 `.gitignore`；被选中子目录内的忽略文件仍然生效。即使父目录被排除，显式命名的文件或内部符号链接也会被包含。

大括号范围会展开为各个具体值。例如，`part{1..3}.js` 匹配 `part1.js`、`part2.js` 和 `part3.js`，而 `part{a..c}.js` 匹配 `parta.js`、`partb.js` 和 `partc.js`。范围支持递减值、步长（如 `part{1..5..2}.js`）以及补零（如 `part{01..03}.js`）。步长为 0 时使用默认步进 1。像 `part{1..10..02}.js` 这样在步长中带补零的写法，也会把结果补齐到较宽端点的宽度。这些范围同样适用于 `.npmignore` 和 `.gitignore`。

如果没有 `files`，pnpm 会读取 `.npmignore`，并回退到 `.gitignore`。取反的忽略模式可以重新包含默认被排除的内容，例如 `*.orig` 和 `npm-debug.log`。根目录的 lockfile 和 `.npmrc` 始终被排除。

## 私有工作区依赖

非 private 的包不能在 `dependencies` 中列出私有的工作区包，因为私有包永远不会被发布。打包这样的包会失败并报错 `ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY`。可以把该私有包列在 `devDependencies` 中，在已安装的情况下把它列进 `bundleDependencies` 进行打包，或在 [`beforePacking`](/docs/pnpmfile#hooksbeforepackingpkg-pkg--promisepkg) 钩子中移除该依赖。

## 选项

### --recursive, -r

打包工作区中的所有包。

### --out <path>

自定义 tarball 的输出路径。使用 `%s` 和 `%v` 包含包名和版本，例如 `%s.tgz` 或 `some-dir/%s-%v.tgz`。默认情况下，tarball 以 `<package-name>-<version>.tgz` 的名称保存在当前工作目录中。

### --pack-destination <dir>

`pnpm pack` 保存 tarball 的目录。默认为当前工作目录。

### --pack-gzip-level <level>

tarball 的 gzip 压缩级别，取值范围为 `0` 到 `9`。超出该范围的取值会被拒绝。

### --json

以 JSON 格式输出日志。每个写入的归档都带有 `integrity`（SRI 形式的 SHA-512）和以字节为单位的 `size`。dry run 不会写入归档，因此两者都不会输出。

`manifest` 字段包含将要打入 tarball 的 `package.json`，其中已应用 `publishConfig` 及其他发布时的改动。运行 `pnpm pack --dry-run --json` 可以在不写入 tarball 的情况下预览它。dry run 仍会运行 `prepack` 和 `prepare`，除非传入 `--ignore-scripts`。

### --filter <package_selector>

更多过滤说明见[过滤](/docs/filtering)。

### --dry-run

执行正常运行的所有操作，但不实际打包 tarball。适用于验证 tarball 的内容。

### --ignore-pnpmfile

不加载项目的 `.pnpmfile.cjs`，因此它的钩子（包括 `beforePacking`）不会运行。

### --ignore-scripts

不运行 `prepack`、`prepare` 和 `postpack` 脚本。

### --skip-manifest-obfuscation

在打包的 manifest 中保留原有的 `packageManager` 字段和发布生命周期脚本，而不是将其剥离。pnpm 特有的 `pnpm` 字段仍会被省略，但 `pnpm.config` 除外。

## 生命周期脚本

- `prepack`
- `prepare`
- `postpack`

:::tip[提示]

你还可以使用 [beforePacking 钩子](/docs/pnpmfile#hooksbeforepackingpkg-pkg--promisepkg)，在创建 tarball 之前以编程方式修改 `package.json` 的内容。这适合用于移除仅开发用的字段，或在不修改本地 `package.json` 的情况下添加发布元数据。

:::
