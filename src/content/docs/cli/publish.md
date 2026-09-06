---
title: "pnpm publish"
headingIds: ["options","--recursive--r","--json","--tag-tag","--access-publicrestricted","--no-git-checks","--publish-branch-branch","--force","--batch","--skip-manifest-obfuscation","--report-summary","--dry-run","--otp","--provenance","--filter-package_selector","configuration","life-cycle-scripts"]
---

将包发布到 registry。

```bash
pnpm [-r] publish [<tarball|folder>] [--tag <tag>]
     [--access <public|restricted>] [options]
```

:::note[说明]

自 v11 起，`pnpm publish` 由 pnpm 原生实现，不再委托给 `npm` CLI。若你依赖的某个功能现已缺失，可前往 [pnpm/pnpm](https://github.com/pnpm/pnpm/issues) 提交 issue。作为变通方案，你仍可运行 `pnpm pack && npm publish *.tgz`。

:::

在[工作区](/docs/workspaces)内发布包时，工作区根目录的 LICENSE 文件会随包一起打包（除非该包自带许可证）。

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

### --access <public|restricted>

告知 registry 发布的包应为公开还是受限。

### --no-git-checks

不检查当前分支是否为发布分支、是否干净以及与远程是否保持同步。

### --publish-branch <branch>

- 默认值：**master** 和 **main**
- 类型：**字符串**

用于发布最新变更的仓库主分支。

### --force

即使包的当前版本已存在于 registry 中，也尝试发布。

### --batch

自 v11.7.0 起提供

递归发布（`pnpm -r publish`）时，将所有选中的包通过单个 `PUT /-/pnpm/v1/publish` 请求发送到 registry，而不是每个包一个请求。

目标 registry 必须实现批量发布端点（[pnpr](https://github.com/pnpm/pnpm/tree/main/pnpr) 已实现）；未实现该端点的 registry 会报 `ERR_PNPM_BATCH_PUBLISH_UNSUPPORTED` 错误。批处理遵循全有或全无：只要批中任一包校验失败，所有包都不会发布。

自 v11.24.0 起，选中的包会按各自发布目标 registry 分组，每组发送一个请求。同组内的每个包必须使用同一凭据认证，共享同一个按 scope 配置的 token 即可；若某 registry 的凭据不匹配，会在*任何内容发布之前*就被拒绝，而不是在部分发布出去之后。每组完成后会运行 `publish` 和 `postpublish` 脚本。

### --skip-manifest-obfuscation

自 v11.3.0 起提供

在发布的 manifest 中保留原始 `packageManager` 字段和发布生命周期脚本，而不是将其剥离。pnpm 专有的 `pnpm` 字段仍会被省略。

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

### --filter <package_selector>

[Read more about filtering.](/docs/filtering)

## 配置

你也可以在 `pnpm-workspace.yaml` 文件中设置 `gitChecks`、`publishBranch` 选项。

例如：

pnpm-workspace.yaml

```yaml
gitChecks: false
publishBranch: production
```

## 生命周期脚本

- `prepublishOnly`
- `prepublish`
- `prepack`
- `prepare`
- `postpack`
- `publish`
- `postpublish`
