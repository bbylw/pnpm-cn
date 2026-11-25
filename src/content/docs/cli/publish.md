---
title: "pnpm publish"
headingIds: ["options","--recursive--r","--json","--tag-tag","--new-version-version","--access-publicrestricted","--no-git-checks","--publish-branch-branch","--ignore-pnpmfile","--ignore-scripts","--embed-readme","--force","--batch","--release-notes-file","--no-release-notes","--publication-name-name","--skip-manifest-obfuscation","--publish-wait-timeout-milliseconds","--report-summary","--dry-run","--otp","--provenance","--filter-package_selector","configuration","publishbranch","publishwaittimeout","provenance","access","life-cycle-scripts"]
---

将包发布到 registry。

```bash
pnpm [-r] publish [<tarball|folder>] [--tag <tag>]
     [--access <public|restricted>] [options]
```

:::note[说明]

自 v11 起，`pnpm publish` 由 pnpm 原生实现，不再委托给 `npm` CLI。若你依赖的某个功能现已缺失，可前往 [pnpm/pnpm](https://github.com/pnpm/pnpm/issues) 提交 issue。作为变通方案，你仍可运行 `pnpm pack && npm publish *.tgz`。

:::

当发布一个目录或一个 tarball 时，若清单中没有 `readme` 值，pnpm 会把包根目录的 README 放进 registry 元数据。它能识别 `README.md`、其它使用 npm 兼容 Markdown 扩展名的 README 文件（如 `README.markdown` 与 `README.mdown`），以及 `README`。它优先选择 `README.md`，然后是其它 Markdown README，最后是 `README`。这与 [`--embed-readme`](#--embed-readme) 不同，后者把 README 嵌入已发布的清单中。

当发布一个预构建的 tarball 时，pnpm 会拒绝超过 64 MiB 的清单、README 文件与归档元数据。

在[工作区](/docs/workspaces)内发布包时，工作区根目录的 `LICENSE`、`LICENCE` 或 `COPYING` 文件会随包一起打包（除非该包自带许可证）。

一个非私有的包不能在 `dependencies` 中列出私有的工作区包，因为私有包永远不会被发布。发布这样的包会以 `ERR_PNPM_PRIVATE_WORKSPACE_DEPENDENCY` 失败。请改为把私有包列在 `devDependencies` 中，通过把它列在 `bundleDependencies` 中并完成安装来打包它，或在 [`beforePacking`](/docs/pnpmfile#hooksbeforepackingpkg-pkg--promisepkg) 钩子中移除该依赖。

发布前，你可以通过 `package.json` 中的 [publishConfig](/docs/package_json#publishconfig) 字段覆盖部分字段。你还可以使用 [publishConfig.directory](/docs/package_json#publishconfigdirectory) 自定义要发布的子目录（通常配合第三方构建工具使用）。

递归运行此命令（`pnpm -r publish`）时，pnpm 会发布所有版本尚未发布到 registry 的包。

## 选项

### --recursive, -r

发布工作区中的所有包。

### --json

以 JSON 格式显示信息。

### --tag <tag>

使用指定的 tag 发布包。默认情况下，`pnpm publish` 会更新 `latest` tag。

例如：

```bash
# inside the foo package directory
pnpm publish --tag next
# in a project where you want to use the next version of foo
pnpm add foo@next
```

### --new-version <version>

在发布前把 `package.json` 中的 `version` 字段设为给定版本。该版本必须是合法的 semver，开头的 `v` 会被去掉。

```sh
pnpm publish --new-version 1.2.3-alpha.12 --tag alpha
```

它的效果等同于 `pnpm version <version> --no-git-tag-version` 之后再运行 `pnpm publish`。不会创建提交或标签，版本相关的生命周期脚本也不会运行。对 `package.json` 的改动在 git 检查之后写入，发布后仍然保留，即使使用了 `--dry-run`。
若 `publishConfig.directory` 指向的目录中已有 `package.json`，那份清单也会获得新版本。

配合 `--recursive` 时，每个被选中的工作区包都会获得新版本，包括仍不会发布的私有包。指向这些已更新包的工作区依赖会以新版本发布。

发布 tarball 时不能使用它。

### --access <public|restricted>

告知 registry 发布的包应为公开还是受限。

### --no-git-checks

不检查当前分支是否为发布分支、是否干净以及与远程是否保持同步。

### --publish-branch <branch>

- 默认值：**master** 和 **main**
- 类型：**字符串**

用于发布最新变更的仓库主分支。

### --ignore-pnpmfile

不加载项目的 `.pnpmfile.cjs`，因此它的钩子（包括 `beforePacking`）都不会运行。

### --ignore-scripts

不运行发布相关的生命周期脚本。

### --embed-readme

- 默认值：**false**
- 类型：**布尔值**

把 README 的内容嵌入到发布出去的清单中。`embedReadme` 设置决定其默认值。

### --force

即使包的当前版本已存在于 registry 中，也尝试发布。

### --batch

自 v11.7.0 起提供

递归发布（`pnpm -r publish`）时，将所有选中的包通过单个 `PUT /-/pnpm/v1/publish` 请求发送到 registry，而不是每个包一个请求。

目标 registry 必须实现批量发布端点（[pnpr](https://github.com/pnpm/pnpm/tree/main/pnpr) 已实现）；未实现该端点的 registry 会报 `ERR_PNPM_BATCH_PUBLISH_UNSUPPORTED` 错误。批处理遵循全有或全无：只要批中任一包校验失败，所有包都不会发布。

自 v11.24.0 起，选中的包会按各自发布目标 registry 分组，每组发送一个请求。同组内的每个包必须使用同一凭据认证，共享同一个按 scope 配置的 token 即可；若某 registry 的凭据不匹配，会在*任何内容发布之前*就被拒绝，而不是在部分发布出去之后。每组完成后会运行 `publish` 和 `postpublish` 脚本。

### --release-notes <file>

要发送给以 [`serverType: pnpr`](/docs/registries#servertype) 声明的 registry 的发布说明文件。文件不存在时发布失败。只发布一个包时，这些说明就是该包的版本说明；用 `--batch` 发布多个包时，它们是整个发布的说明。

在使用 [pnpm 的版本管理](/docs/versioning#release-notes-on-pnpr)的工作区中，请改为把摘要传给 `pnpm version -r --release-notes`：`pnpm version -r` 会组合出本次发布的每一条说明，而当 `--release-notes` 用于它已组合出说明的包时，`pnpm publish` 会以 `ERR_PNPM_RELEASE_NOTES_FROM_VERSIONING` 失败。

不使用该选项时，pnpm 会为每个包发送它所发布版本的说明：

- 在使用 [pnpm 的版本管理](/docs/versioning#release-notes-on-pnpr)的工作区中，是根据其变更意图组合出的说明。
- 否则是该包 `CHANGELOG.md` 中版本标题下的那一段，即 changesets（`## 1.4.0`）与 Keep a Changelog（`## [1.4.0] - 2026-10-28`）的写法，不含标题本身。

pnpm 会打印每个包的说明来自哪里。说明最长 64 KiB，且除换行和制表符外不能包含控制字符，也不能包含双向覆盖字符。pnpm 会在上传任何内容之前检查这些。未以 `serverType: pnpr` 声明的 registry 不会收到说明。

### --no-release-notes

不发送发布说明。

### --publication-name <name>

`--batch` 发布到以 `serverType: pnpr` 声明的 registry 时，发布所对应的发布名称，例如 `v12.0.0`。它可以包含字母、数字、`.`、`_`、`+` 和 `-`，最长 214 字节，且不能是纯数字（数字会按标识符来命名某次发布）。在使用 pnpm 版本管理的工作区中，该发布默认以其 epic lead 的版本或固定的某个分组的版本命名。

### --skip-manifest-obfuscation

自 v11.3.0 起提供

在发布的 manifest 中保留原始 `packageManager` 字段和发布生命周期脚本，而不是将其剥离。pnpm 专有的 `pnpm` 字段仍会被省略。

### --publish-wait-timeout <milliseconds>

自 v12.7.0 起提供

- 默认值：**0**
- 类型：**数字**（非负整数）

等待所发布的确切版本出现在 registry 的安装元数据中，然后检查对其 tarball URL 发起的 `HEAD` 请求是否返回 HTTP `200`。这有助于发布流程应对 registry 的延迟，例如 npm 的[发布时恶意软件扫描](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/)。
值为 `0` 时禁用该检查。

```sh
pnpm publish --publish-wait-timeout 600000
pnpm -r publish --publish-wait-timeout 600000 --report-summary
```

超时以毫秒计，包含 registry 请求与重试延迟。每个包都有自己的超时，包括 registry 中已存在的所选版本。对于新上传，超时从 registry 接受它之后开始；对于已存在的版本，从 pnpm 开始检查其可用性时开始。使用 `--batch` 时，每个上传的 registry 分组共享同一个超时。

递归发布同样会检查 registry 中已存在的所选版本。不使用 `--batch` 时，pnpm 会在发布依赖包之前确认其可用性；使用 `--batch` 时，pnpm 会在每个 registry 分组上传完成后检查它。

### --report-summary

将已发布包列表保存到 `pnpm-publish-summary.json`。当需要借助其他工具报告已发布包列表时很有用。

`pnpm-publish-summary.json` 文件示例：

```json
{
  "publishedPackages": [
    {
      "name": "foo",
      "version": "1.0.0"
    },
    {
      "name": "bar",
      "version": "2.0.0"
    }
  ]
}
```

### --dry-run

执行发布所做的全部事情，但不实际发布到 registry。

### --otp

发布需要双因素认证的包时，可用此选项指定一次性密码。

你也可以通过 `PNPM_CONFIG_OTP` 环境变量提供 OTP：

```bash
export PNPM_CONFIG_OTP='<your OTP here>'
pnpm publish --no-git-checks
```

如果 registry 要求 OTP，而你未通过环境变量或 `--otp` 标志提供，pnpm 会直接提示你输入 OTP 代码。

如果 registry 要求基于 Web 的认证，pnpm 会打印一个可扫描的二维码及 URL。

### --provenance

从受支持的云 CI/CD 系统发布时，包会被公开链接到其构建与发布的来源位置。

在受信任发布（trusted publishing）下，pnpm 会自行把 provenance 附加到来自公开仓库的公开包上。使用 `--no-provenance`（或 `--provenance=false`）可以在不带 provenance 的情况下发布，例如从自托管的 runner 发布。使用 [`provenance`](#provenance) 可以设置默认值。

向声明了 [`serverType: pnpr`](../registries.md#servertype) 的 registry 再次发布是安全的，无论是否带 provenance。重新运行时若再次签署 provenance，会发送一条新的声明，于是 registry 回答该版本已经发布过。只有在以下条件全部成立时，pnpm 才会把该版本报告为已发布：

- 该版本的发布记录指向同一个归档；
- 重新运行签署了 provenance 时，该版本有一条指向该归档的声明；
- 发布所设置的 dist-tag 指向该版本。

否则，它会以 `ERR_PNPM_PUBLISHED_RELEASE_DIFFERS` 失败，并指出差异所在。

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

## 配置

你也可以在 `pnpm-workspace.yaml` 文件中设置 `gitChecks`、`publishBranch`、`publishWaitTimeout`、`provenance` 和 `access` 选项。

例如：

pnpm-workspace.yaml

```yaml
gitChecks: false
publishBranch: production
```

### publishBranch

- 默认值：**master** 和 **main**
- 类型：**字符串**

设置 [`--publish-branch`](#--publish-branch-branch) 的默认值。请在 `pnpm-workspace.yaml` 中配置。

`PNPM_CONFIG_PUBLISH_BRANCH` 环境变量会覆盖 `pnpm-workspace.yaml`。命令行选项的优先级高于两者。

### publishWaitTimeout

自 v12.7.0 起提供

- 默认值：**0**
- 类型：**数字**（非负整数）

设置 [`--publish-wait-timeout`](#--publish-wait-timeout-milliseconds) 的默认超时（毫秒）。请在 `pnpm-workspace.yaml` 或全局 `config.yaml` 中配置：

```yaml
publishWaitTimeout: 600000
```

`PNPM_CONFIG_PUBLISH_WAIT_TIMEOUT` 环境变量会覆盖这些配置文件。命令行选项的优先级高于两者，包括用 `--publish-wait-timeout=0` 为单条命令禁用等待。

### provenance

- 默认值：**undefined**
- 类型：**布尔值**

设置 [`--provenance`](#--provenance) 的默认值。未设置时由可信发布流程决定。设为 `false` 则永不附带来源信息：

```yaml
provenance: false
```

`PNPM_CONFIG_PROVENANCE` 环境变量会覆盖这些配置文件。命令行选项的优先级高于两者。

### access

- 默认值：**undefined**
- 类型：**public**、**restricted**

设置 [`--access`](#--access-publicrestricted) 的默认值。未设置时，pnpm 使用该包 `package.json` 中的 `publishConfig.access`；设置后，它优先于 `publishConfig.access`。请在 `pnpm-workspace.yaml` 或全局 `config.yaml` 中配置：

```yaml
access: restricted
```

`PNPM_CONFIG_ACCESS` 环境变量会覆盖这些配置文件。命令行选项的优先级高于两者。

## 生命周期脚本

- `prepublishOnly`
- `prepublish`
- `prepack`
- `prepare`
- `postpack`
- `publish`
- `postpublish`
