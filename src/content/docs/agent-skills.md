---
title: "Agent Skills"
headingIds: ["shipping-skills-in-a-package","approving-skills","where-skills-are-linked"]
---

自 v12.11.0 起提供

一个包可以携带 Agent 技能（agent skills）：即包含 `SKILL.md` 的目录，AI 编码 Agent 会把它当作指令加载。pnpm 会把已批准依赖的技能链接到项目的 Agent 技能目录中，让在仓库中工作的 Agent 能看到它们。

## 在包中携带技能

把每个技能放在 `skills/` 下的独立目录中：

```
my-package/
├── package.json
└── skills/
    └── migrations/
        ├── SKILL.md
        └── reference.md
```

pnpm 会在 `skills/` 下最多三层目录中查找技能：即 `skills/<name>/SKILL.md`，以及 `skills/engineering/<name>/SKILL.md` 这类分类路径。按照 [Agent 技能规范](https://agentskills.io/specification)的要求，每个技能目录要以其 `SKILL.md` 中的 `name` 命名。如果两个分类目录下存在同名技能，pnpm 会使用路径顺序中靠前的那一个。一个包也可以完全由技能组成。

## 批准技能

技能是 Agent 在每次会话中都会遵循的指令，其中可能包含要执行的脚本。因此在你批准该包之前，pnpm 不会链接任何内容。

安装时，pnpm 会在每个项目的直接依赖中查找技能。只有本次安装包含的依赖组才会计入，因此 `pnpm install --prod` 会跳过 `devDependencies` 中的技能。安装结束后会列出技能待批准的包：

```
Packages awaiting approval:
  drizzle-kit  skills

Run "pnpm approve" to review the packages awaiting approval.
```

待批准的技能不会导致安装失败。请运行 [`pnpm approve`](/docs/cli/permissions) 做出决定。该决定会记录在 [`permissions`](/docs/settings/build#permissions) 设置中：

```yaml
permissions:
  drizzle-kit:
    skills: true
```

当一个包携带多个技能时，批准提示会列出它们，由你选择要链接哪些：

```yaml
permissions:
  drizzle-kit:
    skills: [guide, migrate]
```

只有列表中的技能会被链接，未被选中的技能不会再被提供。`skills: true` 会链接该包携带的所有技能，在之后的每个版本中都如此。git 或 tarball 依赖按其精确来源批准，对 git 依赖则按其仓库批准，使用的键与 [`allowBuilds`](/docs/settings/build#allowbuilds) 相同。

如果一个包在工作区中解析到多个版本，由最高版本决定链接哪些技能。如果最高版本没有携带技能，那么一个都不会被链接，即使更旧的版本携带了。如果同一个版本因不同的 peer 依赖被安装了多次，每次安装都会链接同一份副本的技能，只要副本集合没有变化。pnpm 会把虚拟存储中同一个包的同一个技能的不同链接视为彼此独立，即使该副本已不在锁文件中。

## 技能被链接到哪里

默认情况下，pnpm 会链接到工作区根目录中已经存在的 Agent 技能目录：即每个 `.<name>/skills` 目录，如 `.claude/skills`、`.cursor/skills` 或 `.agents/skills`。当运行 pnpm 的 Agent 通过环境变量表明身份时，如果它的目录不存在，pnpm 会创建它：

| 变量 | 目录 |
|---|---|
| `CLAUDECODE`、`CLAUDE_CODE` | `.claude/skills` |
| `CURSOR_AGENT` | `.cursor/skills` |
| `GEMINI_CLI` | `.gemini/skills` |
| `ANTIGRAVITY_AGENT` | `.agents/skills` |
| `COPILOT_AGENT`、`COPILOT_CLI` | `.github/skills` |
| `CODEX_THREAD_ID`、`CODEX_SANDBOX` | `.agents/skills` |
| `AI_AGENT` | `.agents/skills` |

要自行选择目录，请设置 [`skills.dirs`](/docs/settings/build#skillsdirs)。空列表会关闭 Agent 技能功能。项目首次批准某个技能时，`pnpm approve` 会列出检测到的目录并询问要链接到哪些，因此你很少需要手动写这个设置。

每个技能都以其目录名链接，因此 `@acme/kit` 的 `auth` 技能会被链接为 `auth`。当该名称已被占用，或两个已批准的包携带同名技能时，pnpm 会改为在所有 Agent 目录中将其链接为 `pnpm-<package>-<skill>`。带 scope 的包名会将其 `/` 替换为 `+`，因此 `@acme/kit` 的 `auth` 技能会被链接为 `pnpm-@acme+kit-auth`。tarball 或本地目录依赖会按项目给它的别名链接，而不是按包名链接。由于这些链接指向 `node_modules`，pnpm 会在每个目录的 `.gitignore` 中以 `# pnpm` 块的形式列出它们：

```gitignore
# pnpm
/auth
# pnpm end
```

pnpm 会在每次安装时重写该块，并保持文件中的其他行不变。

当包被移除、批准被撤销，或该包不再携带该技能时，pnpm 会删除相应链接。如果存在非 pnpm 创建的同名条目，该技能会退回到带前缀的名称；如果连这个名称也被占用，安装就会失败。

如果某个技能已获批准但没有可链接的目录，pnpm 会安装依赖但不链接该技能。

`pnpm dlx` 和 `pnpm deploy` 不链接技能。全局安装会把已批准的技能链接到用户主目录下的 Agent 技能目录中。使用 `pnpm approve -g` 或 `pnpm permissions approve -g` 审查待批准的全局技能与构建，它们保存在全局 `config.yaml` 的 [`globalPackagesConfig.permissions`](/docs/configuring#settings-for-global-packages) 中。
