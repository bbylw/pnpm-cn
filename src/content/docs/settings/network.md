---
title: "网络与请求设置"
headingIds: ["network-settings", "httpsproxy", "httpproxy", "noproxy", "localaddress", "maxsockets", "strictssl", "useragent", "request-settings", "gitshallowhosts", "networkconcurrency", "fetchretries", "fetchretryfactor", "fetchretrymintimeout", "fetchretrymaxtimeout", "fetchtimeout", "fetchwarntimeoutms", "fetchminspeedkibps", "maxtarballunpackedsize"]
---

## 网络设置

### httpsProxy

- 默认值：**null**
- 类型：**url**

用于传出 HTTPS 请求的代理。若未设置 `httpsProxy`，pnpm 会使用旧有的 `proxy` 设置，然后是 `HTTPS_PROXY` 或 `https_proxy` 环境变量。

如果你的代理 URL 包含用户名和密码，请确保对其进行 URL 编码。例如：

```yaml
httpsProxy: "https://use%21r:pas%2As@my.proxy:1234/foo"
```

不要对用户名和密码之间的冒号（`:`）进行编码。

空值会被视为未设置。若 `httpsProxy` 与 `proxy` 都没有配置，导出 `HTTPS_PROXY=` 的 shell 会禁用代理。在 `pnpm-workspace.yaml` 或 `.npmrc` 中把值设为 `false` 或 `null` 同样会被视为未设置，因此 pnpm 仍会回退到 `proxy` 与环境变量。要彻底关闭代理，请把 `proxy` 设为 `false`。在命令行上，`false` 与 `null` 是普通主机名，因为标志会原样携带其值。

### httpProxy

- 默认值：**null**
- 类型：**url**

用于传出 HTTP 请求的代理。如果设置了 `HTTP_PROXY` 或 `http_proxy` 环境变量，底层请求库会遵循这些代理设置。

空值、`false` 和 `null` 的行为如 [httpsProxy](#httpsproxy) 所述。

`.npmrc` 还支持 npm 的旧版 `proxy` 设置，它作为 `https-proxy` 和 `http-proxy` 的后备。自 v11.20.0 起，空的 `proxy=` 会被视为未设置，因此不再屏蔽 `HTTPS_PROXY` 环境变量；而 `proxy=false`（或在 `pnpm-workspace.yaml` 中写 `proxy: false`）会关闭代理，而不是被读成一个名为 `false` 的代理主机（`[#13533](https://github.com/pnpm/pnpm/issues/13533)`）。

### noProxy

- 默认值：**null**
- 类型：**字符串**

一个以逗号分隔的字符串，列出不应使用代理的域名后缀。若未设置 `noProxy`，pnpm 会使用 `noproxy`，然后是 `NO_PROXY` 或 `no_proxy` 环境变量。

一项可以带或不带前导点书写：`npmjs.org` 与 `.npmjs.org` 都会让该域名本身及其子域名绕过代理。

空值、`false` 和 `null` 的行为如 [httpsProxy](#httpsproxy) 所述。

### localAddress

- 默认值：**undefined**
- 类型：**IP 地址**

连接 npm registry 时所使用的本地接口的 IP 地址。

### maxsockets

- 默认值：**unset**
- 类型：**数字**

每个源（协议/主机/端口组合）所使用的最大连接数。未设置时，经由代理的连接每个源最多 50 个，而直连只受 [`networkConcurrency`](#networkconcurrency) 限制。设为 `0` 可让经代理的连接也不受限制。

`maxSockets` 可作为别名接受。两种拼写都会从 `pnpm-workspace.yaml`、全局配置文件、环境和命令行读取，且优先级依次递增，因此即使在两边对该设置的拼写不同时，命令行上传入的值也会胜出。

### strictSsl

- 默认值：**true**
- 类型：**布尔值**

通过 HTTPS 向 registry 发出请求时是否执行 SSL 密钥验证。

## 请求设置

### userAgent

- 默认值：`pnpm/<version> npm/? node/? <platform> <arch>`
- 类型：**字符串**

pnpm 每次向 registry 发请求时所用的 `User-Agent` 头的值。

### gitShallowHosts

- 默认值：**['github.com', 'gist.github.com', 'gitlab.com', 'bitbucket.com', 'bitbucket.org']**
- 类型：**string[]**

拉取作为 Git 仓库的依赖时，如果主机列在此设置中，pnpm 会使用浅克隆，只拉取所需的提交而非全部历史。

### networkConcurrency

- 默认值：**auto (workers × 3 clamped to 64-96)**
- 类型：**数字**

控制并发处理的 HTTP(S) 请求最大数量。

pnpm 会根据 worker 数量（可用的并行度减去 1）在 64 到 96 之间选择一个值（networkConcurrency = clamp(workers × 3, 64, 96)）。显式设置此值可覆盖自动缩放。

若在其它针对同一主机的请求仍在进行时某个请求超时，pnpm 会把该主机的限制降为在该命令余下的时间里每次一个请求。已经在运行的请求会先完成。对其它主机的请求仍享有限额。通过同一代理发出的请求算作同一个主机。

若想把某个 registry 的请求限制为一个，请在 `registries` 设置的对应条目上设置 [`networkConcurrency`](/docs/registries#networkconcurrency)。

### fetchRetries

- 默认值：**2**
- 类型：**数字**

当 pnpm 无法从 registry 拉取时重试的次数。

### fetchRetryFactor

- 默认值：**10**
- 类型：**数字**

重试退避的指数因子。

### fetchRetryMintimeout

- 默认值：**10000（10 秒）**
- 类型：**数字**

重试指数退避的下界（以毫秒计）。

### fetchRetryMaxtimeout

- 默认值：**60000（1 分钟）**
- 类型：**数字**

重试指数退避的上界（以毫秒计）。

### fetchTimeout

- 默认值：**60000（1 分钟）**
- 类型：**数字**

HTTP 请求连接并完成所等待的最长时间。这段时间应足以在合理连接下下载最大的包。

### fetchWarnTimeoutMs

自 v10.18.0 起提供

- 默认值：**10000 ms（10 秒）**
- 类型：**数字**

如果向 registry 请求元数据所用的时间超过指定的阈值（以毫秒计），则显示一条警告消息。

### fetchMinSpeedKiBps

自 v10.18.0 起提供

- 默认值：**50 KiB/s**
- 类型：**数字**

如果从 registry 下载 tarball 的速度低于指定的阈值（以 KiB/s 计），则显示一条警告消息。

### maxTarballUnpackedSize

自 v12.15.0 起提供

- 默认值：**4294967296（4 GiB）**
- 类型：**数字**

一个包的文件最多能解包到多少字节。文件总量超过该值的包会安装失败。来自 [tar registry](/docs/registries#tar-registries) 的包还要受其 `dist.unpackedSize` 的约束。

pnpm 在解码 tarball 的过程中检查这一限制，早于它能校验 tarball 哈希的时刻，因此恶意 registry 无法让它写出超过这个量级的内容。
