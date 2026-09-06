---
title: "缓解供应链攻击"
headingIds: ["block-risky-postinstall-scripts","prevent-exotic-transitive-dependencies","delay-dependency-updates","enforce-trust-with-trustpolicy","use-a-lockfile","pin-dependencies-to-the-registry-they-come-from"]
---

有时 npm 包会被攻破并携带恶意软件发布。幸运的是，有像 [Socket](https://socket.dev/)、[Snyk](https://snyk.io)、[Xygeni](https://xygeni.io/) 和 [Aikido](https://www.aikido.dev/) 这样的公司能够及早检测这些被攻破的包。npm registry 通常会在数小时内移除受影响的版本。然而，从恶意软件被发布到被检测出来之间始终存在一个时间窗口，在此期间你可能会受到波及。好在你可以用 pnpm 采取一些措施来将风险降到最低。

### 屏蔽有风险的 postinstall 脚本

从历史上看，大多数被攻破的包都使用 `postinstall` 脚本在安装时立即运行代码。为缓解这一点，pnpm v10 禁用了依赖中 `postinstall` 脚本的自动执行。虽然有设置可以通过 [dangerouslyAllowAllBuilds](/docs/settings/build#dangerouslyallowallbuilds) 全局重新启用它们，但我们建议使用 [allowBuilds](/docs/settings/build#allowbuilds) 仅明确列出受信任的依赖。这样，如果某个依赖过去并不需要构建，那么即便发布了被攻破的版本，它也不会突然运行恶意脚本。尽管如此，我们仍建议在更新一个带有 `postinstall` 脚本的受信任包时保持谨慎，因为[它可能会被攻破](https://socket.dev/blog/nx-packages-compromised)。

### 防止外来的传递依赖

你可以通过将 [blockExoticSubdeps](/docs/settings/dependency-resolution#blockexoticsubdeps) 设为 `true`，来防止传递依赖使用非正规来源（如 git 仓库或直接 tarball URL）。这能确保所有传递依赖都从受信任来源解析，从而降低供应链攻击的风险。

### 延迟依赖更新

降低安装被攻破包风险的另一方法，是延迟你的依赖更新。由于恶意软件通常很快被检测出来，将更新延迟 24 小时很可能就能阻止你安装一个有问题的版本。[minimumReleaseAge](/docs/settings/dependency-resolution#minimumreleaseage) 设置定义了在一个版本发布后必须经过的最少分钟数，之后 pnpm 才会安装它。其默认值为 `1440`（1 天），意味着新发布的包至少要有 1 天才会被解析。如需退出此机制，可在 `pnpm-workspace.yaml` 中设置 `minimumReleaseAge: 0`。你也可以将其设为 `10080`，在安装新版本前等待一周。

### 用 trustPolicy 强制执行信任

为进一步保护你的供应链，pnpm 还支持 [trustPolicy](/docs/settings/dependency-resolution#trustpolicy) 设置。设为 `no-downgrade` 时，如果某个包的信任级别相较之前的发布有所下降，此设置会阻止安装它（例如，它以前由受信任的发布者发布，而现在只有 provenance 或没有任何信任证据）。这有助于你避免安装可能已被攻破或可信度较低的版本。

如果你需要允许特定的包或版本绕过信任策略检查，可以使用 [trustPolicyExclude](/docs/settings/dependency-resolution#trustpolicyexclude) 设置。这对于那些可能不满足信任要求但仍然可以安全使用的已知包很有用。

此外，[trustPolicyIgnoreAfter](/docs/settings/dependency-resolution#trustpolicyignoreafter) 设置允许你忽略对发布时间超过指定时长的包的信任检查。这对于缺少签名或 provenance 发布流程的旧版本包很有帮助。

### 使用锁文件

不言而喻，你应该始终用锁文件锁定你的依赖。将你的锁文件提交到仓库，以避免意外更新。

如果你用漏洞扫描器或 SBOM 生成器扫描 `pnpm-lock.yaml`，要确认它能处理[双文档锁文件](/docs/lockfile)：一个只读取第一个文档的工具会报告该项目没有依赖、也没有漏洞，而且不会失败。

### 将依赖锁定到其来源 registry

如果你从多个 registry 安装，对于必须来自特定 registry 的包，使用 [namedRegistries](/docs/settings/dependency-resolution#namedregistries) 别名。自 v11.20.0 起，pnpm 在锁文件中以 registry 限定的键（`<name>@<registryName>:<version>`）记录这些包，因此某个包不会被发布相同名称和版本的另一个 registry 悄悄替换。参见[锁文件中的具名 registry](/docs/settings/dependency-resolution#named-registries-in-the-lockfile)。未使用别名安装的包仍像以前一样通过默认的 [registries](/docs/settings/dependency-resolution#registries) 配置解析。
