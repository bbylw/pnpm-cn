---
title: "功能对比"
headingIds: []
---

| **Feature** | **pnpm** | **npm** | **Notes** |
| --- | --- | --- | --- |
| [Workspace support](/docs/workspaces) | ✅ | ✅ |  |
| Isolated `node_modules` | ✅ | ✅ | pnpm 中的默认行为。 |
| [Hoisted node_modules](/docs/settings/node-modules#nodelinker) | ✅ | ✅ | npm 中的默认行为。 |
| Plug'n'Play | ✅ | ❌ |  |
| [Autoinstalling peers](/docs/settings/peer-dependencies#autoinstallpeers) | ✅ | ✅ |  |
| [Patching dependencies](/docs/cli/patch) | ✅ | ❌ |  |
| [Managing runtimes](/docs/cli/runtime) | ✅ | ❌ |  |
| [Managing versions of itself](/docs/settings/cli#pmonfail) | ✅ | ❌ |  |
| 有锁文件 | ✅ | ✅ | `pnpm-lock.yaml`, `package-lock.json`. |
| [Overrides support](/docs/settings/dependency-resolution#overrides) | ✅ | ✅ |  |
| 内容寻址存储 | ✅ | ❌ |  |
| [Dynamic package execution](/docs/cli/pnx) | ✅ | ✅ | `pnx`, `npx`. |
| [Side-effects cache](/docs/settings/build#sideeffectscache) | ✅ | ❌ |  |
| [Catalogs](/docs/catalogs) | ✅ | ❌ |  |
| [Config dependencies](/docs/config-dependencies) | ✅ | ❌ |  |
| [JSR registry support](/docs/package-sources#jsr-registry) | ✅ | ❌ |  |
| [Auto-install before script run](/docs/settings/build#verifydepsbeforerun) | ✅ | ❌ |  |
| [Hooks](/docs/pnpmfile) | ✅ | ❌ |  |
| [Build script security](/docs/settings/build#allowbuilds) | ✅ | ❌ |  |
| [SBOM generation](/docs/cli/sbom) | ✅ | ✅ | `pnpm sbom`, `npm sbom`. |
| [Listing licenses](/docs/cli/licenses) | ✅ | ❌ | pnpm 通过 `pnpm licenses list` 支持它。 |

**注意：**为了保持对比简洁，我们只包含可能经常使用的功能。
