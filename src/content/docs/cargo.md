---
title: "Cargo 依赖"
headingIds: ["adding-a-crate","what-an-install-does","registries","authentication","git-sourced-crates","source-overrides","building-the-standard-library","faster-resolution-through-pnpr","rust-toolchain","settings","cargoenabled"]
---

自 v12.4.0 起提供（仅 pnpm v12）

:::warning[警告]

多生态支持仍是实验性的。它所写入的设置和目录结构可能变化。

:::

pnpm 可以安装 Cargo 工作区所依赖的 crate，与同一仓库中的 npm 包并存。一次 `pnpm install` 会同时解析两张依赖图，共用同一套连接预算，并把每个 crate 放进 pnpm 的内容寻址存储中，因此为某个项目下载过的 crate 不会为下一个项目重复下载。

在 `pnpm-workspace.yaml` 中开启：

```yaml
cargo:
  enabled: true
```

然后照常安装：

```sh
pnpm install
```

## 添加 crate

给 crate 名称加上 `crate:` 前缀：

```sh
pnpm add crate:serde
pnpm add crate:serde@^1.0.200
```

pnpm 会把该依赖写入 `Cargo.toml`，不改动文件中的其他内容，并重新生成 `Cargo.lock`。没有版本要求时，会选中最新的稳定版发布。只有 `Cargo.toml` 的仓库不需要 `package.json`：`pnpm add crate:` 不会生成一个。

`pnpm add crate:` 和 `pnpm add rust@` 在带 `--recursive` 或 `--filter` 时会失败。请在项目中运行它们。

`pnpm add crate:` 在虚拟工作区根目录（即只有 `[workspace]` 而没有 `[package]` 的 `Cargo.toml`）中也会失败。请在工作区成员的目录中运行。

当 `cargo.enabled` 为 `true` 时，[`pnpm outdated`](/docs/cli/outdated) 和 [`pnpm update`](/docs/cli/update) 也会检查并更新 Cargo 依赖，并接受 `crate:<name>` 选择器来定位具体的 crate。

`pnpm add crate:<name>` 和 `pnpm update crate:<name>` 会保留 `Cargo.lock` 中记录的其他兼容版本。不带选择器的 `pnpm update` 会更新 `Cargo.lock` 中的所有 crate，与 `cargo update` 的行为一致。

## 安装做了什么

1. 读取工作区的 `Cargo.toml`，包括其成员和工作区之外的路径依赖。Cargo 在锁定这些路径依赖时不包含它们的开发依赖，pnpm 也一样。
2. 针对稀疏索引解析依赖图，或使用 Cargo（参见[源覆盖](#source-overrides)），并写出确定性的 `Cargo.lock`。如果 `Cargo.lock` 已存在，则原样使用。
3. 按校验和验证每个已锁定的 `.crate` 归档，并解包到 pnpm 的存储中。
4. 把存储中的槽位链接到 `.pnpm/crates/crates-io` 下的 Cargo[目录源](https://doc.rust-lang.org/cargo/reference/source-replacement.html)，并生成 Cargo 所期望的 `.cargo-checksum.json` 文件。
5. 把这些 crate 的源替换写入 `.pnpm/crates/config.toml`。
6. 在 `.cargo/config.toml` 中加入该文件的可选 `[[include]]`，位于标记 `# >>> pnpm-managed cargo sources >>>` 与 `# <<< pnpm-managed cargo sources <<<` 之间。你写在这些标记之外的内容会保持不变。如果你要添加自己的 include，请同样写成 `[[include]]` 表。

早先某次安装已解包到存储中的 crate 会直接被链接，不会再与存储比较其文件。[`verifyStoreIntegrity`](/docs/settings/store#verifystoreintegrity) 在 crate 被解包时生效。`pnpm install --force` 会重新解包每个 crate。

之后 `cargo build` 会基于已置入的源码离线编译。pnpm 自身不编译任何东西。Cargo 1.95 及更高版本会读取该 include。

在没有 `.pnpm` 的情况下（例如全新克隆的仓库），Cargo 会跳过该 include，像往常一样从各自 registry 拉取 crate。

crate 记录在 `Cargo.lock` 中，而不会写入 `pnpm-lock.yaml`。两个锁文件彼此独立。

对 crate 而言，`--lockfile-only`、`--frozen-lockfile` 和 `--offline` 的含义与对 npm 包相同：只解析不做落地、宁可失败也不改动锁文件、拒绝访问网络。

## Registry

```yaml
cargo:
  enabled: true
registries:
  https://index.crates.io/:
    ecosystem: cargo
```

通过带 `ecosystem: cargo` 的 [`registries`](/docs/registries#ecosystem) 声明稀疏索引。不做声明时，pnpm 使用 `https://index.crates.io`。只能声明一个 Cargo 索引。设置 `cargo.indexUrl` 时 pnpm 会报错，请把索引改到 `registries` 中。crate 来自哪个 registry 会记录在 `Cargo.lock` 中，pnpm 会让 Cargo 的源替换指向该 registry，因此本地解析和[pnpr 加速](https://pnpm.io/pnpr/install-acceleration)解析记录的是同一个来源。

依赖自身指定第三方 registry（在 `Cargo.toml` 中写 `registry = "..."`）会被拒绝：pnpm 每个工作区只解析一个索引。

### 认证

索引和归档请求都使用 pnpm 按 URL 作用域划分的凭据，与认证 npm registry 使用的是同一份映射。对于 crates.io，pnpm 还会读取 `CARGO_REGISTRY_TOKEN` 和 `$CARGO_HOME/credentials.toml`。Cargo 令牌保持不带前缀的 `Authorization` 形式，并且只会发送给它所属的索引主机。

## 来自 Git 的 crate

固定到某个 git 修订的 crate（无论通过 `[patch.crates-io]` 还是普通 git 依赖）会按 `Cargo.lock` 指定的提交检出，并按 `cargo vendor` 布置 git 包的方式置入本地：包含包自身的目录、一份 `package` 为 null 的 `.cargo-checksum.json`，以及该 git 源的源替换。置入的 git 包拥有自己的目录 `.pnpm/crates/git`，因为 git 包与 registry crate 可能同名同版本，而一个目录源无法同时容纳两者。

存储槽位以提交为键，因此第二次安装可以直接链接，无需再次克隆，离线时也是如此。`--frozen-lockfile` 不会改动已固定的修订。

## 源覆盖

pnpm 在生成 `Cargo.lock` 或添加 crate 时会遵循根 `Cargo.toml` 中的 `[patch]` 和 `[replace]` 覆盖。路径覆盖保持在本地。
Git 覆盖会固定到 Cargo 解析出的提交，并置入本地以便离线构建。

带有源覆盖或直接 Git 依赖的工作区会使用 Cargo 来解析。pnpm 会运行工作区[Rust 工具链](#rust-toolchain)的 `cargo`，因此这条路径需要工具链。它还需要默认的 crates.io 稀疏索引。使用自定义索引时，请先用 Cargo 生成并提交 `Cargo.lock`，然后再用 pnpm 安装。

Cargo 解析只读取检出目录中 `.cargo/config.toml` 的 `unstable.bindeps` 和 `resolver.incompatible-rust-versions`，忽略该文件中的其他所有设置。用户的 Cargo home 配置仍然生效。`--offline` 要求解析所需的索引和 Git 仓库已被缓存。`--frozen-lockfile` 不会生成缺失的 `Cargo.lock`，也不会改动已有的修订。

Git 解析允许 `file`、`git`、`http`、`https` 和 `ssh` 协议。当 Cargo 使用命令行方式拉取 Git 时，pnpm 会保留工作区 Git 配置和 `GIT_ALLOW_PROTOCOL` 中更严格的协议设置。在锁文件解析期间，pnpm 会拒绝其他协议（如 `ext::`）的 Git 远程助手。

## 构建标准库

当 `.cargo/config.toml` 把 `unstable.build-std` 设为非空列表时，pnpm 也会置入标准库的依赖。它从工具链的 `rust-src` 组件中读取，因此工具链需要包含该组件。使用由 pnpm 安装的工具链文件时，请在 `components` 中列出 `rust-src`。

## 通过 pnpr 加速解析

设置 [`pnprServer`](https://pnpm.io/pnpr/install-acceleration) 后，pnpm 会让服务器解析 Cargo 依赖图，而不是为每个 crate 拉取一个稀疏索引文件。如果服务器不支持 Cargo、不接受请求使用的某个设置或锁文件格式，pnpm 会在本地解析；其他服务器错误则会中止安装。

## Rust 工具链

自 v12.11.0 起提供

`pnpm install` 会安装工作区[工具链文件](https://rust-lang.github.io/rustup/overrides.html#the-toolchain-file)所指定的 Rust 工具链。pnpm 的读取方式与 rustup 一致：优先 `rust-toolchain.toml`，其次是较旧的 `rust-toolchain`。每个 Cargo 清单都使用仓库内距离自身最近的那个文件。

```toml
[toolchain]
channel = "1.95.0"
components = ["rust-src"]
targets = ["wasm32-unknown-unknown"]
```

* `channel` 接受版本号（`1.95.0` 或 `1.95`）、`stable`、`beta`、`nightly`，或诸如 `nightly-2026-01-01` 这样的带日期渠道。
* `profile` 接受 `minimal`（`rustc`、`cargo` 和标准库）以及 `default`（额外包含 `rustfmt` 和 `clippy`）。除非 `components` 列出 `rust-docs`，否则 pnpm 不会安装它。
* `components` 和 `targets` 用于添加组件以及其他目标平台的标准库。
* 设置了 `path`、未设置 `channel`、指向一个用 `rustup toolchain link` 链接的工具链，或要求 `complete` 等其他 profile 的文件，都交由 rustup 处理。机器官方 Rust 未发布工具链时同样如此。
* 在 Windows 上，pnpm 会为 rustup 的默认宿主安装工具链，该默认宿主由 `rustup set default-host` 修改。若未设置，则像 rustup 那样安装与机器架构对应的 MSVC 工具链。

pnpm 会用 Rust 发布签名密钥验证发布清单，并按清单列出的哈希校验每次下载。工具链每台机器只存一份，位于[存储](/docs/settings/store#storedir)下的 `rust` 中，并被链接到工具链文件旁边的 `.pnpm/rust`。

`pnpm run`、`pnpm exec` 以及 pnpm 在安装期间运行的 `cargo` 命令都会使用该已链接的工具链。没有 rustup 的机器可以用 `pnpm exec cargo build` 或脚本来构建工作区。若只想让某一条命令使用其他发布版（例如 nightly），请使用 [`pnx --package=rust@<channel>`](/docs/cli/pnx#running-a-rust-release)。

像 `stable` 这样会移动的渠道每天检查一次，因此新版本发布后就会被安装。离线时或服务器无法访问时，pnpm 会使用存储中该渠道已有的最新版本。可固定版本号以避免检查。

`pnpm add rust@1.95` 会为你写入工具链文件。`pnpm add -g rust` 会全局安装工具链，让你 shell 中的 `cargo`、`rustc` 等 Rust 工具在项目内运行时使用项目工具链文件指定的版本，在其他地方则使用全局版本。在装有 rustup 的机器上，`pnpm shim add rust` 无需全局工具链即可达到同样效果。参见[添加 Rust 工具链](/docs/cli/add#adding-the-rust-toolchain)和 [`pnpm shim`](/docs/cli/shim#how-a-version-is-chosen)。

把 [`runtimeOnFail`](/docs/settings/cli#runtimeonfail) 设为 `error`、`warn` 或 `ignore` 可以关闭该行为，把工具链交回 rustup。自带 Rust 工具链构建包的分发版可以运行 `pnpm install --config.runtime-on-fail=ignore`。可用 [`tools.rust.mirror`](/docs/settings/cli#tools) 从镜像下载工具链。

## 设置

### cargo.enabled

- 默认值：**false**
- 类型：**布尔值**

`pnpm install` 是否解析并安装工作区的 Cargo 依赖。
