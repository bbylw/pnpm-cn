<p align="center">
  <img src="https://i.imgur.com/qlW1eEG.png" width="200" alt="pnpm">
</p>

# pnpm 中文文档

快速、节省磁盘空间的包管理器 —— [pnpm](https://pnpm.io) 的简体中文文档站。
本站完整翻译了 pnpm v12.x 官方文档（138 页：动机、CLI 命令参考、设置、功能、实用配方、进阶主题），
配以上游基准数据与可缩放的「内容寻址存储 + 硬链接」原理图解。

## 本地开发

```bash
bun install        # 安装依赖（.npmrc 已钉官方 registry）
bun run dev        # 开发预览
bun run build      # 构建到 dist/
bun run preview    # 预览构建产物
bun run check      # astro check（组件/脚本类型检查）
bun run audit      # 内容健康审计：死链/断锚点/缺失图片/残留英文/锚点漂移/导航一致性
```

审计脚本（`scripts/audit.mjs`）在内容改动后建议跑一遍：断链、指向缺失 heading 的 `#fragment`、
表格单元格补译的覆盖情况、标题数与 `headingIds` 的锚点漂移等都会在报告中列出。

## 内容来源与维护方式

- 文档正文译自 [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) `docs/`（MIT License），以 `scripts/scrape.mjs`
  抓取渲染页为骨架、按块翻译回填（`scripts/patch-language.mjs`），锚点 id 与上游保持一致，跨页链接自动指向站内。
- 术语对齐官方简体中文 README（内容寻址存储、硬链接、工作区、幽灵依赖等），见 `scripts/out/glossary.md`。
- 基准图、赞助商 Logo 取自 pnpm.io 静态资源；更新上游文档后重跑上述脚本即可同步。
- 如有出入，以[英文原文](https://pnpm.io)为准。

### 表格与标签补译

- `bun run cells`（`scripts/table-gaps.mjs extract`）：全量扫描表格中未译单元格并去重成 `scripts/out/cells.jsonl`。
  注意其 CJK 判断已修正为 `[\u3400-\u9fff]`，旧版会漏掉含连字符的英文单元格（如 `Content-addressable storage`）。
- 翻译完成后把 `{"b":"cell#…","z":"译文"}` 写入 `scripts/out/trans/done-cells.jsonl`，再 `bun scripts/table-gaps.mjs apply` 全局回填。
- `bun run labels`（`scripts/fix-labels.mjs`）：把遗漏的设置类标签 `Default:` / `Type:` / `Aliases:` 就地译为中文（跳过代码块与行内代码）。

### 前端约定

- 侧栏在桌面端只渲染一份，移动端 `<details>` 目录由 JS 克隆填充（无 JS 时给出提示），避免每页双份大导航。
- 首页入场动画默认可见，仅 `html.js` 下才先隐藏再显现（渐进增强，无 JS / 爬虫不受影响）。

## 站点结构

- `src/pages/index.astro` —— 首页（原理图解、特性、基准、功能对比、赞助商）
- `src/pages/docs/[...slug].astro` —— 文档路由（侧栏 + 本页目录 + 翻页）
- `src/content/docs/` —— 中文文档内容（frontmatter：title / headingIds）
- `src/data/` —— 导航（nav.json）与设计数据（site.ts、icons.ts）
- `src/styles/global.css` —— 「货仓·琥珀」设计令牌（明暗双主题）

## 许可

本站代码 MIT（见 LICENSE）；文档内容版权归 pnpm 贡献者（MIT）。
