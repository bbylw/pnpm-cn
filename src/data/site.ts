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

export const COMMUNITY = [
  { icon: "github-logo" as IconName, label: "GitHub", href: "https://github.com/pnpm/pnpm" },
  { icon: "x-logo" as IconName, label: "X / @pnpmjs", href: "https://x.com/pnpmjs" },
  { icon: "discord-logo" as IconName, label: "Discord", href: "https://r.pnpm.io/chat" },
  { icon: "globe" as IconName, label: "官方博客", href: "https://pnpm.io/blog" },
  { icon: "sparkle" as IconName, label: "OpenCollective 赞助", href: "https://opencollective.com/pnpm" },
];
