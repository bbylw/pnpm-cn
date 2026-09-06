import type { IconName } from "./icons";

/** 首页特性：源自 pnpm 官方 README（简体中文）的要点清单 */
export const FEATURES: { icon: IconName; title: string; body: string; href?: string }[] = [
  {
    icon: "lightning",
    title: "快速",
    body: "比同类方案快达 2 倍，安装速度随缓存与并行策略持续领先。",
    href: "#benchmarks",
  },
  {
    icon: "database",
    title: "高效",
    body: "node_modules 中的文件都从单一内容寻址存储硬链接而来，数万项目共享同一份字节。",
    href: "#background",
  },
  {
    icon: "squares-four",
    title: "非常适合 monorepo",
    body: "一等公民的工作区支持：任务编排、目录（catalogs）、分支锁文件。",
    href: "/docs/workspaces",
  },
  {
    icon: "shield-check",
    title: "严格",
    body: "一个包只能访问其 package.json 中声明的依赖，幽灵依赖无从生存。",
    href: "/docs/limitations",
  },
  {
    icon: "lock-key",
    title: "确定性",
    body: "由 pnpm-lock.yaml 锁文件保证任何机器上重现完全相同的依赖树。",
    href: "/docs/lockfile",
  },
  {
    icon: "gauge",
    title: "还是 Node.js 版本管理器",
    body: "pnpm env / pnpm runtime 管理 Node 版本与全局 shim，一个工具两条管线。",
    href: "/docs/cli/runtime",
  },
  {
    icon: "monitor",
    title: "随处可用",
    body: "支持 Windows、Linux 与 macOS，从 CI 容器到 WSL 行为一致。",
  },
  {
    icon: "seal-check",
    title: "久经考验",
    body: "自 2016 年起，各种规模的团队在生产环境中使用，微软 Rush 仓库以数百项目验证。",
    href: "/docs/motivation",
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
  { label: "确定性的锁文件", pnpm: true, npm: true, yarn: true, note: "pnpm-lock.yaml 附带 peer 与链接信息" },
  { label: "monorepo 工作区", pnpm: true, npm: true, yarn: true, note: "pnpm 原生支持任务编排与 catalogs" },
  { label: "workspace: 协议", pnpm: true, npm: false, yarn: true, note: "本地包引用拒绝回退到 registry" },
  { label: "构建脚本审批", pnpm: true, npm: false, yarn: false, note: "默认拦截 postinstall 等副作用" },
  { label: "Node.js 版本管理", pnpm: true, npm: false, yarn: false, note: "pnpm env / runtime 内置支持" },
];

/** 赞助商：logo 取自 pnpm.io（dark 版用于亮色主题，light 版用于暗色主题） */
export const SPONSORS: { tier: string; items: { name: string; url: string; dark?: string; light?: string; h: number }[] }[] = [
  {
    tier: "白金赞助",
    items: [
      { name: "Bit", url: "https://bit.cloud/?utm_source=pnpm&utm_medium=readme", dark: "bit.svg", h: 30 },
      { name: "OpenAI", url: "https://openai.com/?utm_source=pnpm&utm_medium=readme", dark: "openai_dark.svg", light: "openai_light.svg", h: 26 },
      { name: "Notion", url: "https://notion.com/?utm_source=pnpm&utm_medium=readme", dark: "notion.svg", h: 30 },
      { name: "CodeRabbit", url: "https://coderabbit.ai/?utm_source=pnpm&utm_medium=readme", dark: "coderabbit.svg", light: "coderabbit_light.svg", h: 30 },
    ],
  },
  {
    tier: "金牌赞助",
    items: [
      { name: "Sanity", url: "https://sanity.io/?utm_source=pnpm&utm_medium=readme", dark: "sanity.svg", light: "sanity_light.svg", h: 24 },
      { name: "Discord", url: "https://discord.com/?utm_source=pnpm&utm_medium=readme", dark: "discord.svg", light: "discord_light.svg", h: 26 },
      { name: "Vite", url: "https://vite.dev/?utm_source=pnpm&utm_medium=readme", dark: "vitejs.svg", h: 26 },
      { name: "SerpApi", url: "https://serpapi.com/?utm_source=pnpm&utm_medium=readme", dark: "serpapi_dark.svg", light: "serpapi_light.svg", h: 24 },
      { name: "StackBlitz", url: "https://stackblitz.com/?utm_source=pnpm&utm_medium=readme", dark: "stackblitz.svg", light: "stackblitz_light.svg", h: 24 },
      { name: "Workleap", url: "https://workleap.com/?utm_source=pnpm&utm_medium=readme", dark: "workleap.svg", light: "workleap_light.svg", h: 24 },
      { name: "Nx", url: "https://nx.dev/?utm_source=pnpm&utm_medium=readme", dark: "nx.svg", light: "nx_light.svg", h: 26 },
      { name: "Latitude", url: "https://latitude.so/?utm_source=pnpm&utm_medium=readme", dark: "latitude.svg", h: 24 },
    ],
  },
  {
    tier: "银牌赞助",
    items: [
      { name: "Replit", url: "https://replit.com/?utm_source=pnpm&utm_medium=readme", dark: "replit.png", light: "replit_light.png", h: 22 },
      { name: "Cybozu", url: "https://cybozu.co.jp/?utm_source=pnpm&utm_medium=readme", dark: "cybozu.svg", h: 26 },
      { name: "BairesDev", url: "https://www.bairesdev.com/?utm_source=pnpm&utm_medium=readme", dark: "bairesdev.svg", light: "bairesdev_light.svg", h: 22 },
      { name: "Thesys", url: "https://www.thesys.dev/?utm_source=pnpm&utm_medium=readme", dark: "thesys.svg", light: "thesys_light.svg", h: 22 },
      { name: "devowl.io", url: "https://devowl.io/?utm_source=pnpm&utm_medium=readme", dark: "devowlio.svg", h: 24 },
      { name: "u|screen", url: "https://uscreen.de/?utm_source=pnpm&utm_medium=readme", dark: "uscreen.svg", light: "uscreen_light.svg", h: 22 },
      { name: "Leniolabs", url: "https://www.leniolabs.com/?utm_source=pnpm&utm_medium=readme", dark: "leniolabs.jpg", h: 26 },
      { name: "Depot", url: "https://depot.dev/?utm_source=pnpm&utm_medium=readme", dark: "depot.svg", light: "depot_light.svg", h: 22 },
      { name: "Cerbos", url: "https://cerbos.dev/?utm_source=pnpm&utm_medium=readme", dark: "cerbos.svg", light: "cerbos_light.svg", h: 22 },
    ],
  },
];

export const COMMUNITY = [
  { icon: "github-logo" as IconName, label: "GitHub", href: "https://github.com/pnpm/pnpm" },
  { icon: "x-logo" as IconName, label: "X / @pnpmjs", href: "https://x.com/pnpmjs" },
  { icon: "discord-logo" as IconName, label: "Discord", href: "https://r.pnpm.io/chat" },
  { icon: "globe" as IconName, label: "官方博客", href: "https://pnpm.io/blog" },
  { icon: "hand-thumb-up" as IconName, label: "OpenCollective 赞助", href: "https://opencollective.com/pnpm" },
];
