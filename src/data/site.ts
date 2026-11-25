import type { IconName } from "./icons";

/** 使用 pnpm 的知名开源项目（源自 pnpm.io/zh） */
export const ECOSYSTEM_PROJECTS: string[] = [
  "Next.js",
  "Vite",
  "Nuxt",
  "Vue",
  "Astro",
  "Prisma",
  "Turborepo",
  "SvelteKit",
  "Material UI",
  "Element Plus",
  "Vercel",
  "Nx",
  "Angular",
  "n8n",
  "Slidev",
  "Qwik",
];

/** 首页核心特性：参考 pnpm.io/zh，覆盖 pnpm 12 的 8 项核心能力 */
export const FEATURES: { icon: IconName; title: string; body: string; href?: string }[] = [
  {
    icon: "lightning",
    title: "极速安装",
    body: "解析、获取与链接三阶段并行推进，而非串行等待。热存储下安装几乎只需创建硬链接。",
    href: "#benchmarks",
  },
  {
    icon: "database",
    title: "节省磁盘空间",
    body: "node_modules 中的文件通过硬链接来自单一内容寻址存储，100 个项目共用同一份字节。",
    href: "#background",
  },
  {
    icon: "squares-four",
    title: "工作空间支持",
    body: "一流的 monorepo 体验：workspace 协议、按改动增量过滤任务、全仓库单一锁文件。",
    href: "/docs/workspaces",
  },
  {
    icon: "tag",
    title: "Catalogs 版本目录",
    body: "在 pnpm-workspace.yaml 中统一声明依赖版本，各子包以 catalog: 引用，升级只需改一行。",
    href: "/docs/catalogs",
  },
  {
    icon: "shield-check",
    title: "默认严格",
    body: "只有声明在 package.json 中的依赖才会出现在 node_modules 根目录，杜绝幽灵依赖。",
    href: "/docs/symlinked-node-modules-structure",
  },
  {
    icon: "lock-key",
    title: "更安全的构建",
    body: "默认阻止任意依赖执行 postinstall 脚本，按需显式审批，开箱即享供应链防护。",
    href: "/docs/supply-chain-security",
  },
  {
    icon: "code",
    title: "修补依赖项",
    body: "无需等待上游发版，使用 pnpm patch 生成持久补丁，每次安装自动重新应用。",
    href: "/docs/cli/patch",
  },
  {
    icon: "gauge",
    title: "管理运行时",
    body: "按项目直接安装并固定 Node.js 版本，无需 nvm 或 shell 钩子，团队环境完全一致。",
    href: "/docs/cli/runtime",
  },
];

/** 真实 6 场景基准数据（alotta-files，源自 pnpm.io/zh） */
export const BENCHMARK_SCENARIOS: {
  name: string;
  desc: string;
  speedup: string;
  pnpmTime: string;
  npmTime: string;
  pnpmPct: number;
}[] = [
  { name: "全新安装", desc: "刚克隆仓库，无任何缓存", speedup: "9.6×", pnpmTime: "4.97s", npmTime: "47.8s", pnpmPct: 10 },
  { name: "命中缓存", desc: "无锁文件重新安装", speedup: "14×", pnpmTime: "952ms", npmTime: "13.4s", pnpmPct: 7 },
  { name: "有锁文件", desc: "CI 环境首次安装", speedup: "3.8×", pnpmTime: "3.31s", npmTime: "12.7s", pnpmPct: 26 },
  { name: "缓存 + 锁文件", desc: "重装已有项目依赖", speedup: "14×", pnpmTime: "595ms", npmTime: "8.61s", pnpmPct: 7 },
  { name: "全热重跑", desc: "无变更时再次执行 install", speedup: "69×", pnpmTime: "19ms", npmTime: "1.32s", pnpmPct: 2 },
  { name: "更新依赖", desc: "升级 package.json 中的依赖", speedup: "4.6×", pnpmTime: "968ms", npmTime: "4.43s", pnpmPct: 22 },
];

/** 供应链安全四重防护（源自 pnpm.io/zh） */
export const SECURITY_GUARDS: {
  title: string;
  status: string;
  body: string;
  setting: string;
}[] = [
  {
    title: "默认拦截安装脚本",
    status: "默认开启",
    body: "未经批准的依赖无法执行 postinstall 等生命周期脚本，被投毒的版本无法在安装瞬间执行任意代码。",
    setting: "allowBuilds",
  },
  {
    title: "新发布版本静默等待 24 小时",
    status: "默认 1 天",
    body: "自动跳过发布不足 24 小时的新版本。恶意包通常在数小时内被发现并下架，从而在触达你之前被拦截。",
    setting: "minimumReleaseAge",
  },
  {
    title: "禁止间接依赖拉取外部源",
    status: "默认开启",
    body: "传递依赖不能从任意 Git 仓库或裸 tarball URL 拉取代码，只能来自受信任的 registry。",
    setting: "blockExoticSubdeps",
  },
  {
    title: "拒绝发布信任降级",
    status: "一行开启",
    body: "当某个包从可信发布（Trusted Publishing）突然退化为更弱的发布方式时，直接拒绝安装。",
    setting: "trustPolicy: no-downgrade",
  },
];

/** 安装三阶段（动机篇） */
export const STAGES: { icon: IconName; title: string; body: string }[] = [
  { icon: "funnel", title: "依赖解析", body: "识别全部所需依赖，并拉取到内容寻址存储。" },
  { icon: "stack", title: "结构计算", body: "基于依赖声明计算非扁平的 node_modules 目录树。" },
  { icon: "link-simple", title: "硬链接装配", body: "从存储把文件硬链接进各项目，缺失才回源。" },
];

/** 功能对比精选（完整表见 /docs/feature-comparison） */
export const COMPARE_ROWS: { label: string; pnpm: string | boolean; npm: string | boolean; yarn: string | boolean; note: string }[] = [
  { label: "磁盘内容寻址存储", pnpm: true, npm: false, yarn: false, note: "所有项目共享同一份文件字节" },
  { label: "严格的非扁平 node_modules", pnpm: true, npm: false, yarn: false, note: "未声明的依赖不可访问" },
  { label: "Catalogs 版本目录", pnpm: true, npm: false, yarn: true, note: "工作区内共享版本范围，一行统一升级" },
  { label: "构建脚本审批与供应链防护", pnpm: true, npm: false, yarn: false, note: "默认拦截 postinstall 与高风险新版本" },
  { label: "修补依赖（pnpm patch）", pnpm: true, npm: false, yarn: true, note: "持久化修改第三方包，无需等待上游" },
  { label: "Node.js 运行时管理", pnpm: true, npm: false, yarn: false, note: "pnpm env / runtime 内置支持，无需 nvm" },
  { label: "monorepo 工作区与 workspace: 协议", pnpm: true, npm: "部分", yarn: true, note: "原生任务编排，本地包拒绝回退到 registry" },
];

/** 开发者证言（源自 pnpm.io/zh 与官方社区） */
export const TESTIMONIALS: { quote: string; author: string; role: string; href: string }[] = [
  {
    quote: "Microsoft 在 Rush 仓库中使用 pnpm 管理数百个项目，每天有数百个 PR，我们发现它非常快速且可靠。",
    author: "Rush 团队",
    role: "Microsoft",
    href: "https://rushjs.io/",
  },
  {
    quote: "pnpm 是防范供应链攻击的强力选择，开发体验同样出色：默认拦截 postinstall 脚本，并通过 minimumReleaseAge 让新版本静默等待一天以上。",
    author: "Feross",
    role: "@feross",
    href: "https://x.com/feross",
  },
  {
    quote: "切换到 pnpm 并利用内置的并行任务能力后，我们的 CI 构建时间从 12 分钟直接降到了 2 分钟。",
    author: "Cory House",
    role: "@housecor",
    href: "https://x.com/housecor",
  },
];

export const COMMUNITY = [
  { icon: "github-logo" as IconName, label: "GitHub", href: "https://github.com/pnpm/pnpm" },
  { icon: "x-logo" as IconName, label: "X / @pnpmjs", href: "https://x.com/pnpmjs" },
  { icon: "discord-logo" as IconName, label: "Discord", href: "https://r.pnpm.io/chat" },
  { icon: "globe" as IconName, label: "官方博客", href: "https://pnpm.io/blog" },
  { icon: "sparkle" as IconName, label: "OpenCollective 赞助", href: "https://opencollective.com/pnpm" },
];
