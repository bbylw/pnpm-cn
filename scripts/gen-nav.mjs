/**
 * 由 _upstream/sidebars.json + 已回填的中文 frontmatter title 生成 src/data/nav.json
 * 栏目与分类标签为人工审校的中文化（对齐官方中文术语）。
 */
import fs from "node:fs";

const SECTION_ZH = {
  Introduction: "开始了解",
  Usage: "使用指南",
  "CLI commands": "CLI 命令",
  Configuration: "配置",
  Features: "功能",
  Recipes: "实用配方",
  Advanced: "进阶",
};
const CATEGORY_ZH = {
  "Manage dependencies": "管理依赖",
  "Patch dependencies": "依赖补丁",
  "Review dependencies": "审查依赖",
  "Run scripts": "运行脚本",
  Releasing: "发布",
  Registry: "Registry 操作",
  "Manage environments": "管理环境",
  "Inspect the store": "检查存储",
  "Manage cache": "缓存管理",
  "Misc.": "更多",
  "Settings (pnpm-workspace.yaml)": "设置（pnpm-workspace.yaml）",
};
const EXTRA_ZH = {
  faq: "常见问题",
  "only-allow-pnpm": "仅允许 pnpm",
  production: "生产环境",
};

const sidebars = JSON.parse(fs.readFileSync("../_upstream/sidebars.json", "utf8")).docs;

function titleOf(id) {
  for (const cand of [`src/content/docs/${id}.md`, `src/content/docs/${id.replace(/\//g, "/")}.md`]) {
    if (fs.existsSync(cand)) {
      const m = fs.readFileSync(cand, "utf8").match(/^title: "([^"]*)"/m);
      if (m) return m[1];
    }
  }
  return id;
}

const used = new Set();
const nav = [];
for (const [section, items] of Object.entries(sidebars)) {
  const group = {
    id: section,
    label: SECTION_ZH[section] || section,
    items: walk(items),
  };
  nav.push(group);
}
function walk(items) {
  const out = [];
  for (const it of items) {
    if (typeof it === "string") {
      used.add(it);
      out.push({ id: it, label: titleOf(it) });
    } else if (it.type === "category") {
      const id = it.link?.id;
      if (id) used.add(id);
      out.push({
        id: id || it.label,
        label: CATEGORY_ZH[it.label] || it.label,
        collapsed: true,
        children: walk(it.items),
      });
    }
  }
  return out;
}
// 未入侧栏的补充页挂在「开始了解」下
const extras = Object.keys(EXTRA_ZH).filter((id) => !used.has(id));
if (extras.length) {
  const adv = nav.find((g) => g.id === "Advanced") ?? nav[nav.length - 1];
  for (const id of extras) adv.items.push({ id, label: EXTRA_ZH[id] });
}
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("src/data/nav.json", JSON.stringify(nav, null, 1) + "\n");
console.log("nav groups:", nav.length, "links:", used.size + extras.size);
