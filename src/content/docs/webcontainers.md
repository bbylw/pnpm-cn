---
title: "StackBlitz WebContainers"
headingIds: ["install-pnpm","build-the-distribution","runtime-differences"]
---

实验性的 `@pnpm/wasm` 包可以在 StackBlitz WebContainer 中运行 pnpm。它需要 Node.js 22.13 或更新版本，以及共享的 WebAssembly 内存。常规的 `pnpm` 包运行的是原生可执行文件，WebContainers 无法执行它。

## 安装 pnpm

用 npm 安装 `@pnpm/wasm`。它提供 `pnpm`、`pn`、`pnpx` 和 `pnx` 命令：

```sh
npm install --global @pnpm/wasm
pnpm --version
pnpm install
```

全局安装需要可写的 npm 前缀目录。你也可以把 `@pnpm/wasm` 加入项目后用 `npx pnpm` 运行。

Corepack 和 `packageManager` 字段安装的是常规的 `pnpm` 包，因此无法选择该分发版。固定了其他包管理器版本的项目，在切换需要安装原生分发版时会收到 `ERR_PNPM_UNSUPPORTED_RUNTIME`。
若要在这类项目中继续使用已安装的 WebAssembly 分发版，请把 [`pmOnFail`](/docs/settings/cli#pmonfail) 设为 `ignore`：

```yaml
pmOnFail: ignore
```

若只想为某一条命令禁用自动版本切换，请设置 `npm_config_manage_package_manager_versions=false`：

```sh
npm_config_manage_package_manager_versions=false pnpm install
```

## 构建分发版

检出 pnpm 仓库，并按照 [WASM 运行时指南](https://github.com/pnpm/pnpm/tree/main/pnpm/wasm)完成工具链配置。在仓库根目录运行：

```sh
pnpm build:pnpm:wasm
pnpm pack:pnpm:wasm
```

产物是 `target/pnpm-wasm.tgz`，即 `@pnpm/wasm` 包。`pnpm WebAssembly` 的 CI 工作流会在浏览器测试通过后上传该 tarball。
把它复制进 WebContainer 并用 `npm install --global ./pnpm-wasm.tgz` 安装。

## 运行时差异

文件系统访问、HTTP 请求和子进程都使用 WebContainer 的 Node.js API。生命周期脚本在同一个容器内运行，并遵循 pnpm 的构建批准规则。需要原生可执行文件或原生 Node.js 插件的包，仍受 WebContainer 的限制。

内置命令使用与其他 pnpm 分发版相同的 CLI，但有以下宿主相关的限制：

- `pnpm bugs`、`pnpm docs`、`pnpm login` 和 `pnpm repo` 无法打开浏览器。需要浏览器操作时，它们会打印 URL。
- `pnpm setup` 和 `pnpm self-update` 无法安装或切换 WebContainer 分发版。`pnpm pack-app` 无法运行其原生应用构建器。

WebContainer 自带的 npm 会应用它自己的包兼容性替换。本运行时不使用这些私有集成。当依赖通常会下载原生代码时，请显式选择 WebAssembly 替代品。例如，一个 Vite 项目可以使用以下条目：

```yaml
overrides:
  esbuild: npm:esbuild-wasm@^0.27.0
  rollup: npm:@rollup/wasm-node@^4.43.1
```

请选择与你项目依赖版本兼容的替换版本，然后运行 `pnpm install` 并提交更新后的锁文件。这些覆盖会在使用该工作区配置的任何地方生效，包括 WebContainers 之外。

当 pnpm 把子进程的 stdout 或 stderr 重定向到文件时，它会等待被重定向的输出写完。继承了该流的后台后代进程可能在原子进程退出后仍让 pnpm 继续等待。请在后台子进程中关闭或替换继承来的重定向流。

浏览器负责管理 HTTP 连接。自定义证书颁发机构、客户端证书、显式代理设置、本地网络地址和 DNS 固定都不可用。不受支持的网络设置会产生错误。

包存储使用独立的 `v11-wasm` 目录，文件与索引格式相同。由于两者的文件锁不同，它无法与原生 pnpm 共享同一个活跃存储。WASM 存储使用 SQLite 回滚日志和进程租约。共享同一存储的并发命令会等待其持有者。嵌套的 pnpm 命令在父命令持有该存储时无法获取同一个存储；请为该命令使用独立的存储。

出错后自动恢复已改动的安装元数据不可用，因为 WebContainers 无法安全地固定父目录。pnpm 会报告这一限制，而不是通过替换目录来恢复。

WebContainers 同样缺少用于权限继承的基于描述符的目录打开操作。pnpm 会在打开每个路径组件之前先做检查，因此并发的重命名或符号链接替换可能在这些操作之间改变权限设置的目标。不要在不可信进程能并发修改的目录树中运行 pnpm。

该分发版不支持自动来源签名。Cargo 工作区集成需要 Cargo 可执行文件，而 WebContainers 中并未安装它。pnpm 在为清单发现而运行 Cargo 时，Cargo 相关依赖命令会失败。

WebContainer 的浏览器网络不支持显式 HTTP 代理、自定义 TLS 信任根或客户端身份、禁用 TLS 校验以及固定本地地址。请求这些设置的命令会在创建 HTTP 客户端时失败，早于向 registry 发出请求。`ca` 或 `cafile` 设置若没有产生任何证书，不会添加信任根，也不会报错。

要更新 WebContainer 中的 pnpm，请用 npm 安装更新版本的 `@pnpm/wasm`。
