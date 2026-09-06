---
title: "认证设置"
headingIds: ["auth-file-locations","environment-variables-in-auth-settings","authentication-settings","url_authtoken","scope-specific-auth-tokens","urltokenhelper","_auth","certificate-settings","ca","cafile","urlcafile","urlca","cert","urlcert","urlcertfile","key","urlkey","urlkeyfile"]
---

本页的设置包含敏感凭据。大多数设置使用 npm 兼容的 INI 文件；结构化的 [_auth](#_auth) 设置位于全局 YAML 配置中。不要把凭据文件提交到你的仓库。

非敏感设置（代理、SSL、registry 等）参见 [Settings (pnpm-workspace.yaml)](/docs/settings)。

## 认证文件位置

pnpm 按优先级从高到低，从以下文件中读取 npm 兼容的 INI 认证设置：

1. **<workspace root>/.npmrc** — 项目级认证。此文件应列入 `.gitignore`。
2. **<pnpm config>/auth.ini** — 旧版用户级认证文件。pnpm 11 将登录令牌写入此处；pnpm 12.1 及更高版本改为把结构化的 `_auth` 写入全局 `config.yaml`，但仍会继续读取此文件。
3. **~/.npmrc** — 作为回退读取，便于从 npm 迁移。使用 [npmrcAuthFile](/docs/settings/other#npmrcauthfile) 设置可指向其他文件。

全局 `config.yaml` 还可承载 pnpm 结构化的 [_auth](#_auth) 设置。pnpm 12.1 及更高版本会将登录令牌写入其中。

`<pnpm config>` 目录为：

- 设置了 **$XDG_CONFIG_HOME** 环境变量时：**$XDG_CONFIG_HOME/pnpm/**
- 在 Windows 上：**~/AppData/Local/pnpm/config/**
- 在 macOS 上：**~/Library/Preferences/pnpm/**
- 在 Linux 上：**~/.config/pnpm/**

## 认证设置中的环境变量

**用户级**认证文件（`<pnpm config>/auth.ini` 和用户的 `.npmrc`）中的值，可以用 `${NAME}` 语法引用环境变量：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

自 v11.5.3 起，工作区根目录的**项目级** `.npmrc` 中，以下设置**不会**展开环境变量：

- registry 与代理 URL（`registry`、`@scope:registry`、代理设置）；
- URL 作用域的键（以 `//` 开头的键）；
- 凭据值（`_authToken`、`_auth`、`_password`、`username`、`tokenHelper`、`cert`、`key`）。

只要这些位置中的任何一个含有 `${...}` 占位符，该设置就会被忽略，pnpm 会打印一条警告。项目的 `.npmrc` 随仓库一起检出，如果在其中展开环境变量，恶意仓库就能在安装期间把环境中的机密（如 CI 令牌）外传到攻击者控制的 registry（[GHSA-3qhv-2rgh-x77r](https://github.com/pnpm/pnpm/security/advisories/GHSA-3qhv-2rgh-x77r)）。

如果你的项目依赖了提交在仓库中的 `.npmrc`，其中包含类似 `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` 的行，则把令牌移到受信任的位置：

- 在安装之前，把令牌写入用户级认证文件（例如，在某个 CI 步骤中）：
  ```bash
  pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
  ```
  `pnpm config set` 默认写入全局位置（认证设置写入 `<pnpm config>/auth.ini`），而不是项目的 `.npmrc`，因此令牌绝不会进入仓库。
- **通过环境变量设置凭据，完全不使用任何 .npmrc 文件**（自 v11.6 起）。pnpm 从 `pnpm_config_//…` 环境变量读取 URL 作用域的 registry 设置：
  ```bash
  env "pnpm_config_//registry.npmjs.org/:_authToken=$NPM_TOKEN" pnpm install
  ```
  变量名中包含 `/`、`:` 和 `.`，`export` 和 `NAME=value` 的 shell 赋值语法会以无效标识符为由拒绝它。使用 `env` 工具（如上所示）把它传给单条命令，或通过支持任意变量名的工具设置（例如你的 CI 服务商的环境变量设置，或 Node 的 `process.env`）。
  对于提交在仓库中的 `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` 行，这是最直接的免文件替代方案。由于凭据适用的 registry 编码在（受信任的）变量名中，恶意仓库无法把它重定向到其他主机。此类环境变量的值会覆盖项目的 `.npmrc`，但其本身又会被命令行选项覆盖。`tokenHelper` 设置有意不从环境变量读取。
- 或者，保留 `${NPM_TOKEN}` 占位符行，但把它放进用户级的 `~/.npmrc`（或 [npmrcAuthFile](/docs/settings/other#npmrcauthfile) 指向的文件），而不是放在仓库里。
- 在 GitHub Actions 中，带 `registry-url` 输入的 `actions/setup-node` 会把认证设置写入用户级 `.npmrc`（由 `NPM_CONFIG_USERCONFIG` 环境变量指向，pnpm 会遵循该变量），因此通过 `NODE_AUTH_TOKEN` 环境变量认证依然有效。
- 如果你难以逐条修改 CI 流水线，可以在 CI 环境中设置一个环境变量（例如在组织或工作区级别），把项目的 `.npmrc` 声明为受信任：
  ```
  PNPM_CONFIG_NPMRC_AUTH_FILE=.npmrc
  ```
  这是 [npmrcAuthFile](/docs/settings/other#npmrcauthfile) 设置的环境变量形式：它让 pnpm 把项目的 `.npmrc` 作为用户级认证文件读取（相对路径基于工作目录解析），因此其中的环境变量会像以前一样展开。由于信任声明来自环境而非仓库，恶意仓库无法替你设置它。npm 风格的 `NPM_CONFIG_USERCONFIG` 变量也会作为回退被遵循。
  :::danger[警告]
  只在专门构建受信任仓库的环境中使用。这会对检出的仓库完全禁用此保护，包括 `tokenHelper` 只能设置在用户级配置中的限制。
  :::

同样的规则也适用于项目 `.npmrc` 中的 **registry 与代理 URL**（`registry`、`@scope:registry`、`proxy`、`https-proxy`、`http-proxy`）。如果你曾用环境变量拼出 registry URL，把该设置移到受信任的来源：你的用户级 `~/.npmrc`，或 `pnpm config set "<key>" <value>`。如果 URL 不是机密，也可以把解析后的值直接写进项目的 `.npmrc`，因为只有 `${...}` 占位符会被忽略。关于 `pnpm-workspace.yaml` 中的 registry 设置，参见 [Settings](/docs/settings/dependency-resolution#registries)。

## 认证设置

### <URL>:_authToken

定义访问指定 registry 时使用的认证 bearer 令牌。例如：

```ini
//registry.npmjs.org/:_authToken=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

你也可以使用环境变量。例如：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

环境变量只在用户级认证文件中展开，不会在项目级 `.npmrc` 中展开。参见[认证设置中的环境变量](#environment-variables-in-auth-settings)。

#### 作用域专属的认证令牌

自 v11.7.0 起提供

pnpm 可以为不同的包作用域使用不同的认证令牌，即使这些作用域指向同一个 registry URL。在认证键中，把包作用域追加在 registry URL 之后：

```ini
@org-a:registry=https://npm.pkg.github.com/
@org-b:registry=https://npm.pkg.github.com/

//npm.pkg.github.com/:@org-a:_authToken=ORG_A_TOKEN
//npm.pkg.github.com/:@org-b:_authToken=ORG_B_TOKEN

//npm.pkg.github.com/:_authToken=FALLBACK_TOKEN
```

安装或发布 `@org-a/*` 时，pnpm 使用 `ORG_A_TOKEN`；对于 `@org-b/*`，使用 `ORG_B_TOKEN`。可选地，没有匹配作用域的包会回退到 registry 级令牌（即上面的 `FALLBACK_TOKEN`），前提是提供了该令牌。

在 pnpm 11 中，`pnpm login --registry=https://npm.pkg.github.com --scope=@org-a` 会把令牌写入同样的作用域专属认证键。pnpm 12.1 及更高版本改为在全局 `config.yaml` 的 `_auth` 下写入等效的作用域条目，并把该作用域加入此 registry 的全局 `registries` 声明。

这对按组织或按作用域颁发令牌的 registry（如 GitHub Packages）很有用。此前，认证只按 registry URL 选择，因此共享同一 registry 的两个作用域必须共享同一个令牌。

### <URL>:tokenHelper

令牌助手（token helper）是一个输出认证令牌的可执行程序。它适用于 authToken 不是固定值、而是需要定期刷新的情形：脚本或其他工具可以用现有的刷新令牌换取新的访问令牌。

助手路径的配置必须是绝对路径，不能带参数。出于安全考虑，此值只允许设置在用户级 `.npmrc` 中。否则，项目可以在其本地 `.npmrc` 中填入某个值来运行任意可执行文件。

为默认 registry 设置令牌助手：

```ini
tokenHelper=/home/ivan/token-generator
```

为指定 registry 设置令牌助手：

```
//registry.corp.com:tokenHelper=/home/ivan/token-generator
```

### _auth

自 v11.10.0 起提供

以 registry URL 为键，用单个结构化值配置 registry 认证。它是大量 `//host/:_authToken=…` 条目的替代形式，专为 CI 设计：在某些 runner 上，URL 作用域形式（其变量名包含 `/`、`:` 和 `.`）无法通过环境变量传入。

`_auth` **仅**从以下两个受信任位置生效：

- **全局** pnpm 配置（`config.yaml`）；
- `pnpm_config__auth` 环境变量（用于 CI）。

它在项目的 `pnpm-workspace.yaml` 或 `.npmrc` 中会被**忽略**，因此检出的仓库永远无法提供 registry 认证。

该值以 registry URL 为键，因此每个机密都显式绑定到可能接收它的主机。registry URL 键必须使用 `http` 或 `https`，且不得包含凭据、查询字符串或片段。在每个 registry URL 内，`@` 表示 registry 级（默认）凭据，`@org` 之类的包作用域则把凭据绑定到同一主机上的该作用域。唯一支持的凭据字段是 `authToken`（对应 `_authToken` / bearer 认证）；已废弃的 `basicAuth` / `username` + `password` 形式和 `tokenHelper` 在此不被接受。

在全局 `config.yaml` 中：

```yaml
_auth:
  https://registry.npmjs.org:
    "@":
      authToken: npm-token
    "@org":
      authToken: org-token
```

等效的环境变量（一个 JSON 字符串）：

```bash
export pnpm_config__auth='{"https://registry.npmjs.org":{"@":{"authToken":"npm-token"},"@org":{"authToken":"org-token"}}}'
```

`pnpm_config__auth`（小写）和 `PNPM_CONFIG__AUTH`（全大写，某些 CI runner 采用的约定）都会被遵循。若两者都已设置，以小写为准，除非其为空，此时使用大写。

每个条目还会推断一条受信任的 registry 路由：`@` 路由到默认 registry（`pnpm add <pkg>` 也会在那里解析），`@org` 路由到该作用域。由于凭据及其目标主机在同一个受信任的值中到达，仓库控制的配置无法把令牌重定向到其他主机。

自 v12.1.0 起，`pnpm login` 以此形式写入令牌。不带作用域的登录会添加一个 `@` 凭据，而不更改机器的默认 registry。带作用域的登录会把该作用域以同一 URL 加入全局 `registries` 设置；把某个作用域登录到另一个 registry 时，其凭据和路由都会移动。`pnpm logout` 会移除 pnpm 写入 `config.yaml` 以及旧版 `auth.ini` 的凭据，但保留 registry 路由。

`pnpm_config__auth` / `PNPM_CONFIG__AUTH` 环境变量的值可以有意地路由某个作用域或默认 registry，并覆盖仓库配置，这使 CI 可以强制使用代理。从存于全局 `config.yaml` 的 `_auth` 推断出的路由只是回退：`pnpm-workspace.yaml` 或全局配置中显式的 `registry` 或 `registries` 声明优先。存储的凭据仍会为其 URL 认证请求，只是不会把包从显式选定的 registry 重定向走。命令行 registry 参数仍是最高优先级路由。

解析是严格的：格式错误的值（无效 JSON、结构错误、registry URL 或作用域无效、不受支持的凭据字段）会立即报错失败，而不会被静默丢弃。

## 证书设置

### ca

- 默认值：**npm CA 证书**
- 类型：**字符串、数组或 null**

对 registry 的 SSL 连接所信任的证书颁发机构签名证书。值应为 PEM 格式（即 "Base-64 encoded X.509 (.CER)"）。例如：

```bash
ca="-----BEGIN CERTIFICATE-----\nXXXX\nXXXX\n-----END CERTIFICATE-----"
```

设为 null 则只允许已知的注册机构；设为某个特定 CA 证书则只信任该特定签名机构。

可以通过指定证书数组来信任多个 CA：

```bash
ca[]="..."
ca[]="..."
```

另见 [strictSsl](/docs/settings/network#strictssl) 设置。

### cafile

- 默认值：**null**
- 类型：**路径**

指向某个文件的路径，该文件包含一个或多个证书颁发机构签名证书。与 `ca` 设置类似，但支持多个 CA，且 CA 信息存储在文件中，而不是通过命令行指定。

### <URL>:cafile

定义访问指定 registry 时使用的证书颁发机构文件的路径。例如：

```bash
//registry.npmjs.org/:cafile=ca-cert.pem
```

### <URL>:ca

自 v10.25.0 起提供

为指定 registry 定义内联的证书颁发机构证书。与全局 `ca` 设置一样，值必须是 PEM 编码，但仅适用于匹配的 registry URL。

```bash
//registry.example.com/:ca=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
```

### cert

- 默认值：**null**
- 类型：**字符串**

访问 registry 时传递的客户端证书。值应为 PEM 格式（即 "Base-64 encoded X.509 (.CER)"）。例如：

```test
cert="-----BEGIN CERTIFICATE-----\nXXXX\nXXXX\n-----END CERTIFICATE-----"
```

这不是证书文件的路径。

### <URL>:cert

自 v10.25.0 起提供

定义访问指定 registry 时使用的内联客户端证书。示例：

```bash
//registry.example.com/:cert=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
```

### <URL>:certfile

定义访问指定 registry 时使用的证书文件的路径。例如：

```bash
//registry.npmjs.org/:certfile=server-cert.pem
```

### key

- 默认值：**null**
- 类型：**字符串**

访问 registry 时传递的客户端密钥。值应为 PEM 格式（即 "Base-64 encoded X.509 (.CER)"）。例如：

```bash
key="-----BEGIN PRIVATE KEY-----\nXXXX\nXXXX\n-----END PRIVATE KEY-----"
```

这不是密钥文件的路径。如果需要引用文件系统而不是内联密钥，使用 `<URL>&#58;keyfile`。

此设置包含敏感信息。不要把它写入会提交到仓库的本地 `.npmrc` 文件。

### <URL>:key

自 v10.25.0 起提供

为指定的 registry URL 定义内联客户端密钥。

```bash
//registry.example.com/:key=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
```

### <URL>:keyfile

定义访问指定 registry 时使用的客户端密钥文件的路径。例如：

```bash
//registry.npmjs.org/:keyfile=server-key.pem
```
