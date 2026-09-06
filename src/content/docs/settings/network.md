---
title: "网络与请求设置"
headingIds: ["network-settings","httpsproxy","httpproxy","noproxy","localaddress","maxsockets","strictssl","request-settings","gitshallowhosts","networkconcurrency","fetchretries","fetchretryfactor","fetchretrymintimeout","fetchretrymaxtimeout","fetchtimeout","fetchwarntimeoutms","fetchminspeedkibps"]
---

## 网络设置

### httpsProxy

- 默认值：**null**
- 类型：**url**

用于传出 HTTPS 请求的代理。如果设置了 `HTTPS_PROXY`、`https_proxy`、`HTTP_PROXY` 或 `http_proxy` 环境变量，则将改用它们的值。

如果你的代理 URL 包含用户名和密码，请确保对其进行 URL 编码。例如：

```yaml
httpsProxy: "https://use%21r:pas%2As@my.proxy:1234/foo"
```

不要对用户名和密码之间的冒号（`:`）进行编码。

自 v11.20.0 起，空值会被视为未设置，而不是以 `ERR_PNPM_INVALID_PROXY` 使安装失败，因此导出 `HTTPS_PROXY=` 的 shell 只是简单地禁用了代理。在 `pnpm-workspace.yaml` 或 `.npmrc` 中把值设为 `false` 或 `null` 也会关闭代理。在命令行上，`false` 和 `null` 是普通主机名，因为标志会原样携带其值。

### httpProxy

- 默认值：**null**
- 类型：**url**

用于传出 HTTP 请求的代理。如果设置了 `HTTP_PROXY` 或 `http_proxy` 环境变量，底层请求库会遵循这些代理设置。

空值、`false` 和 `null` 的行为如 [httpsProxy](#httpsproxy) 所述。

`.npmrc` 还支持 npm 的旧版 `proxy` 设置，它作为 `https-proxy` 和 `http-proxy` 的后备。自 v11.20.0 起，空的 `proxy=` 会被视为未设置，因此不再屏蔽 `HTTPS_PROXY` 环境变量；而 `proxy=false`（或在 `pnpm-workspace.yaml` 中写 `proxy: false`）会关闭代理，而不是被读成一个名为 `false` 的代理主机（`[#13533](https://github.com/pnpm/pnpm/issues/13533)`）。

### noProxy

- 默认值：**null**
- 类型：**字符串**

一个以逗号分隔的字符串，列出不应使用代理的域名后缀。

空值、`false` 和 `null` 的行为如 [httpsProxy](#httpsproxy) 所述。

### localAddress

- 默认值：**undefined**
- 类型：**IP 地址**

连接 npm registry 时所使用的本地接口的 IP 地址。

### maxsockets

- 默认值：**networkConcurrency x 3**
- 类型：**数字**

每个源（协议/主机/端口组合）所使用的最大连接数。

`maxSockets` 可作为别名接受。两种拼写都会从 `pnpm-workspace.yaml`、全局配置文件、环境和命令行读取，且优先级依次递增，因此即使在两边对该设置的拼写不同时，命令行上传入的值也会胜出。

### strictSsl

- 默认值：**true**
- 类型：**布尔值**

通过 HTTPS 向 registry 发出请求时是否执行 SSL 密钥验证。

## 请求设置

### gitShallowHosts

- 默认值：**['github.com', 'gist.github.com', 'gitlab.com', 'bitbucket.com', 'bitbucket.org']**
- 类型：**string[]**

拉取作为 Git 仓库的依赖时，如果主机列在此设置中，pnpm 会使用浅克隆，只拉取所需的提交而非全部历史。

### networkConcurrency

- 默认值：**auto (workers × 3 clamped to 16-64)**
- 类型：**数字**

控制并发处理的 HTTP(S) 请求最大数量。

自 v10.24.0 起，pnpm 会根据 worker 数量自动选择 16 到 64 之间的一个值（networkConcurrency = clamp(workers × 3, 16, 64)）。显式设置此值可覆盖自动缩放。

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
