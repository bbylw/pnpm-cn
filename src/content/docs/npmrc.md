---
title: "认证设置"
headingIds: ["quick-start", "auth-file-locations", "settings-in-npmrc-and-authini", "url_authtoken", "scope-specific-auth-tokens", "urltokenhelper", "settings-in-configyaml", "_auth", "environment-variables-in-auth-settings", "moving-a-token-out-of-the-project-npmrc", "certificate-settings", "ca", "cafile", "node_extra_ca_certs", "urlca", "urlcafile", "cert", "urlcert", "urlcertfile", "key", "urlkey", "urlkeyfile"]
---

本页介绍 registry 凭据和客户端证书。这些设置含有机密信息，请不要把它们放进你的仓库。

其它设置（例如代理和 registry）参见 [Settings (pnpm-workspace.yaml)](/docs/settings)。

## 快速开始

在你的机器上，登录 registry：

```sh
pnpm login
```

pnpm 会把令牌保存在 `<pnpm config>/auth.ini` 中。

在 CI 中，通过环境变量传入令牌：

```sh
export pnpm_config__auth='{"https://registry.npmjs.org":{"@":{"authToken":"${NPM_TOKEN}"}}}'
```

## 认证文件位置

pnpm 从两类文件中读取认证设置。

npm `.npmrc` 格式的 INI 文件承载[`.npmrc` 与 `auth.ini` 中的设置](#settings-in-npmrc-and-authini)和[证书设置](#certificate-settings)。如果同一个键在多个文件中被设置，则以下列表中靠前的文件生效：

1. `<workspace root>/.npmrc`，项目级文件。请把它加入 `.gitignore`。
2. `<pnpm config>/auth.ini`。`pnpm login` 和 `pnpm config set` 会把认证键写到这里。
3. `~/.npmrc`，这样你为 npm 设置的凭据可以继续使用。要读取其它文件，请使用 [`npmrcAuthFile`](/docs/settings/other#npmrcauthfile) 设置。

全局的 `<pnpm config>/config.yaml` 承载 [`_auth`](#_auth) 设置。

`<pnpm config>` 目录为：

- `PNPM_CONFIG_HOME` 非空时：**$PNPM_CONFIG_HOME/**
- 否则，若设置了 `XDG_CONFIG_HOME`：**$XDG_CONFIG_HOME/pnpm/**
- 在 Windows 上：**~/AppData/Local/pnpm/config/**
- 在 macOS 上：**~/Library/Preferences/pnpm/**
- 在 Linux 上：**~/.config/pnpm/**

## `.npmrc` 与 `auth.ini` 中的设置

把下列设置写入[认证文件位置](#auth-file-locations)中列出的某个 INI 文件里。

### <URL>:_authToken

访问某个 registry 所用的 bearer 令牌：

```ini
//registry.npmjs.org/:_authToken=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

在用户级认证文件中，该值可以引用环境变量：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

参见[认证设置中的环境变量](#environment-variables-in-auth-settings)。

#### 作用域专属的认证令牌

有些 registry（例如 GitHub Packages）会为每个作用域颁发单独的令牌。把作用域放在键中 registry URL 的后面：

```ini
@org-a:registry=https://npm.pkg.github.com/
@org-b:registry=https://npm.pkg.github.com/

//npm.pkg.github.com/:@org-a:_authToken=ORG_A_TOKEN
//npm.pkg.github.com/:@org-b:_authToken=ORG_B_TOKEN

//npm.pkg.github.com/:_authToken=FALLBACK_TOKEN
```

pnpm 会为 `@org-a/*` 包发送 `ORG_A_TOKEN`，为 `@org-b/*` 包发送 `ORG_B_TOKEN`。来自该 registry 的其它包会使用 `FALLBACK_TOKEN`（如果设置了的话）。

`pnpm login --registry=https://npm.pkg.github.com --scope=@org-a` 会把作用域专属的令牌保存到 `auth.ini`。

### <URL>:tokenHelper

打印令牌的可执行程序的路径。用于会过期的令牌，这样脚本可以获取一个新的令牌。

pnpm 会运行该程序，并把它的输出作为 `Authorization: Bearer <输出>` 发送。如果输出已经以一个单词加空格开头，例如 `Bearer abc`、`Basic abc` 或 `Token abc`，pnpm 会原样发送。

该路径必须是绝对路径，且不接受参数。pnpm 只从用户级认证文件中读取 `tokenHelper`。否则，项目 `.npmrc` 就能让 pnpm 运行任意程序。环境变量同样无法设置它。

为默认 registry 设置令牌助手：

```ini
tokenHelper=/home/ivan/token-generator
```

为指定 registry 设置令牌助手：

```ini
//registry.corp.com:tokenHelper=/home/ivan/token-generator
```

## `config.yaml` 中的设置

### _auth

把一个 registry 的所有令牌放在同一个值中，以 registry URL 为键。用于 CI，在某些 runner 上 `//host/:_authToken` 这样的键无法作为环境变量名。

pnpm 只从以下两处读取 `_auth`：

- 全局的 `config.yaml`
- `pnpm_config__auth` 环境变量（JSON 形式）

pnpm 会忽略 `pnpm-workspace.yaml` 和 `.npmrc` 中的 `_auth`。

在全局的 `config.yaml` 中：

```yaml
_auth:
  https://registry.npmjs.org:
    "@":
      authToken: npm-token
    "@org":
      authToken: org-token
```

等效的环境变量：

```sh
export pnpm_config__auth='{"https://registry.npmjs.org":{"@":{"authToken":"npm-token"},"@org":{"authToken":"org-token"}}}'
```

pnpm 也会读取 `PNPM_CONFIG__AUTH`，即某些 CI runner 使用的全大写名称。如果两者都设置了，以小写的为准，除非它为空。

该值遵循以下规则：

- 每个顶层键都是一个 `http` 或 `https` 的 registry URL，不含凭据、查询字符串或片段。
- 在某个 URL 下，`"@"` 存放整个 registry 的令牌，`"@org"` 存放 `@org` 作用域下包的令牌。
- `authToken` 是唯一的凭据字段，它是一个 bearer 令牌。
- `authToken` 可以通过 `${NAME}` 引用环境变量。

每个条目还会把包路由到它自己的 URL。`"@"` 让该 URL 成为默认 registry，`"@org"` 把 `@org/*` 包发送到那里。这种路由的优先级取决于条目的来源：

1. 命令行上的 `--registry` 和 `--@scope:registry` 优先。
2. 来自 `pnpm_config__auth` 的条目会覆盖 `registry` 和 `registries` 设置。CI 可以用它来强制使用代理 registry。
3. 来自全局 `config.yaml` 的条目只在没有 `registry` 或 `registries` 设置选择 registry 的地方生效。令牌仍会发送到它自己的 URL。

从 v12.1.0 到 v12.15.0，`pnpm login` 会把令牌保存在这里。自 v12.16.0 起，它改为把令牌保存到 `auth.ini`，并从 `_auth` 中移除被替换的令牌。`pnpm logout` 会从这两个文件中移除令牌。

## 认证设置中的环境变量

**用户级**认证文件（`<pnpm config>/auth.ini` 和 `~/.npmrc`）中的值可以用 `${NAME}` 引用环境变量：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

pnpm 不会在工作区根目录的**项目级** `.npmrc` 中展开以下设置的环境变量：

- registry 与代理 URL：`registry`、`@scope:registry`、`proxy`、`https-proxy`、`http-proxy`；
- 以 `//` 开头的键；
- 凭据：`_authToken`、`_auth`、`_password`、`username`、`tokenHelper`、`cert`、`key`；
- TLS 文件路径：`cafile`、`<URL>:cafile`、`<URL>:certfile`、`<URL>:keyfile`。

pnpm 会忽略这类设置并打印警告。而带占位符的 `registry` 或 `@scope:registry` URL 会让命令直接失败，而不是被忽略，因为忽略它会让包从另一个 registry 解析。项目级 `.npmrc` 随仓库一起提供，恶意仓库否则可以把你的 CI 令牌发往它控制的 registry（[GHSA-3qhv-2rgh-x77r](https://github.com/pnpm/pnpm/security/advisories/GHSA-3qhv-2rgh-x77r)）。

### 把令牌移出项目 .npmrc

如果你的仓库提交了类似 `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` 的行，请改用下面任一方式。

用一个以该键命名的环境变量传入令牌：

```sh
env "pnpm_config_//registry.npmjs.org/:_authToken=$NPM_TOKEN" pnpm install
```

shell 无法 `export` 这个名字，因为它含有 `/`、`:` 和 `.`。请像上面那样使用 `env`，或者在你的 CI 服务商的设置中设置该变量。它会覆盖项目 `.npmrc`，而命令行选项又会覆盖它。

或者使用 [`_auth`](#_auth)，如[快速开始](#quick-start)中所示。

或者在某个 CI 步骤中把令牌保存到 `<pnpm config>/auth.ini`：

```sh
pnpm config set //registry.npmjs.org/:_authToken "$NPM_TOKEN"
```

或者把 `${NPM_TOKEN}` 那一行移到 `~/.npmrc`，或移到 [`npmrcAuthFile`](/docs/settings/other#npmrcauthfile) 所指明的文件中。

在 GitHub Actions 中，带 `registry-url` 输入的 `actions/setup-node` 已经可以直接使用。它会写入一个用户级的 `.npmrc`，并把 `NPM_CONFIG_USERCONFIG` 指向该文件。pnpm 会读取该文件，因此 `NODE_AUTH_TOKEN` 依然有效。

如果你无法修改每一条 CI 流水线，可以在 CI 环境中设置一个变量，把项目的 `.npmrc` 标记为受信任：

```text
PNPM_CONFIG_NPMRC_AUTH_FILE=.npmrc
```

这会设置 [`npmrcAuthFile`](/docs/settings/other#npmrcauthfile)。pnpm 随后会把项目的 `.npmrc` 当作用户级认证文件读取，并展开其中的变量。相对路径基于工作目录解析。仓库无法设置这个变量，因为它来自环境。当这个变量未设置时，pnpm 也会读取 npm 的 `NPM_CONFIG_USERCONFIG`。

:::danger[警告]

只在每一个你构建的仓库都受信任的地方使用它。它会对检出的仓库关闭这层保护，包括「只有用户级文件才能设置 `tokenHelper`」这条规则。

:::

同样的规则也适用于由环境变量拼出的 registry URL。请把它移到 `~/.npmrc`，或者用 `pnpm config set "<key>" <value>` 设置。如果该 URL 不是机密，也可以直接写进项目的 `.npmrc`。关于 `pnpm-workspace.yaml` 中的 registry，参见 [`registries`](/docs/settings/dependency-resolution#registries)。

## 证书设置

相对 TLS 文件路径基于声明它们的文件所在目录解析。

和令牌设置一样，这些设置写在 `.npmrc` 或 `auth.ini` 中。

### ca

- 默认值：**null**（系统信任库）
- 类型：**字符串、数组或 null**

信任用于 registry TLS 连接的证书颁发机构（CA）证书，格式为 PEM：

```ini
ca="-----BEGIN CERTIFICATE-----\nXXXX\nXXXX\n-----END CERTIFICATE-----"
```

要信任多个 CA，请使用数组：

```ini
ca[]="..."
ca[]="..."
```

`ca` 或 `cafile` 会替换默认受信任的 CA。当它为 `null` 时，pnpm 信任操作系统信任库中的 CA。如果 pnpm 无法加载系统信任库，它会信任 pnpm 内置的 Mozilla CA 集合。

另见 [`strictSsl`](/docs/settings/network#strictssl)。

### cafile

- 默认值：**null**
- 类型：**路径**

包含一个或多个 CA 证书的文件路径。用它代替 `ca`，以便把证书保存在文件中。

### NODE_EXTRA_CA_CERTS

以环境变量设置的、包含额外 CA 证书的 PEM 文件路径。pnpm 会把它们加入受信任的 CA：系统信任库，或已设置的 `ca` 或 `cafile`。pnpm 会忽略不存在或无法读取的文件。

### <URL>:ca

PEM 格式的 CA 证书，仅对给定的 registry 信任：

```ini
//registry.example.com/:ca=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
```

### <URL>:cafile

给定的 registry 所使用的 CA 证书文件的路径：

```ini
//registry.npmjs.org/:cafile=ca-cert.pem
```

### cert

- 默认值：**null**
- 类型：**字符串**

发送给 registry 的客户端证书，格式为 PEM。该值是证书本身，而不是路径：

```ini
cert="-----BEGIN CERTIFICATE-----\nXXXX\nXXXX\n-----END CERTIFICATE-----"
```

### <URL>:cert

发送给给定 registry 的客户端证书：

```ini
//registry.example.com/:cert=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
```

### <URL>:certfile

给定 registry 所使用的客户端证书文件的路径：

```ini
//registry.npmjs.org/:certfile=server-cert.pem
```

### key

- 默认值：**null**
- 类型：**字符串**

发送给 registry 的客户端密钥，格式为 PEM。该值是密钥本身，而不是路径。要从文件读取密钥，请使用 `<URL>:keyfile`。

```ini
key="-----BEGIN PRIVATE KEY-----\nXXXX\nXXXX\n-----END PRIVATE KEY-----"
```

### <URL>:key

给定 registry 所使用的客户端密钥：

```ini
//registry.example.com/:key=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
```

### <URL>:keyfile

给定 registry 所使用的客户端密钥文件的路径：

```ini
//registry.npmjs.org/:keyfile=server-key.pem
```
