---
title: "pnpm dist-tag"
headingIds: ["subcommands","add-pkgversion-tag","rm-pkg-tag","ls-pkg","trusted-publishing","options","--registry-url","--otp-code"]
---

自 v11.0.0 起提供

管理某个包的分发标签。dist-tag 提供人类可读的别名（如 `latest`、`next`、`beta`），指向 registry 上特定的包版本。

别名： `dist-tags`

```sh
pnpm dist-tag add <pkg>@<version> [<tag>]
pnpm dist-tag rm <pkg> <tag>
pnpm dist-tag ls [<pkg>]
```

## 子命令

### add <pkg>@<version> [<tag>]

用 dist-tag 为包的指定版本打标签。如果省略 `<tag>`，则使用 `latest`。版本必须是精确的 semver 版本，使用版本范围会以 `ERR_PNPM_DIST_TAG_ADD_INVALID_VERSION` 失败。

```sh
pnpm dist-tag add foo@1.2.0 next
```

### rm <pkg> <tag>

从某个包移除一个 dist-tag。

```sh
pnpm dist-tag rm foo next
```

### ls [<pkg>]

列出某个包的所有 dist-tag。`ls` 也接受别名 `list`。如果未给出包名，则显示当前包的 dist-tag（从本地 `package.json` 读取）。

```sh
pnpm dist-tag ls foo
```

## 可信发布

在 registry 信任 CI 身份时，`pnpm dist-tag add`、`rm` 和 `ls` 无需保存 npm token 也能管理标签。请在包的 trusted publishing 设置中启用 **Allow npm dist-tag**。

- 在 GitHub Actions 中，为该 job 授予 `id-token: write`。pnpm 会读取 `GITHUB_ACTIONS`、`ACTIONS_ID_TOKEN_REQUEST_TOKEN` 和 `ACTIONS_ID_TOKEN_REQUEST_URL` 来请求身份 token。
- 受支持的可信 CI 提供方可以通过 `NPM_ID_TOKEN` 提供身份 token。其 `aud` claim 必须与所选 registry 匹配，例如 `npm:registry.npmjs.org`。它的优先级高于 GitHub 的请求变量。仅设置 `GITLAB_CI` 并不会提供 token。

pnpm 会用 CI 身份 token 换取一个范围限定为该包及其所配置 registry 的临时 token。该 token 只保存在内存中，不会写入 `.npmrc`。dist-tag 命令不会生成 provenance。

当 OIDC 不可用或 registry 拒绝该交换时，pnpm 会回退到已配置的凭据。缺少 GitHub 请求变量以及身份请求被拒绝时同样会走这个回退。网络错误和无效的身份请求 URL 会被报告出来。

OIDC 请求使用所配置的 fetch 超时和重试设置。

## 选项

### --registry <url>

要操作的 registry。默认为该包所配置的 registry。

### --otp <code>

当 registry 要求双因素认证时，通过此标志提供一次性密码。当 registry 使用基于网页的认证时，pnpm 会打印一个需要打开的 URL；登录完成后重新运行该命令并带上 `--otp`。
