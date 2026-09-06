import fs from "node:fs";
const MAP = {
  aliases: "别名",
  catalogs: "目录（catalogs）",
  configuring: "配置",
  filtering: "过滤",
  finders: "查找器",
  installation: "安装",
  limitations: "局限性",
  logos: "标志素材",
  motivation: "为什么选择 pnpm",
  production: "生产环境",
  "reading-lockfile": "读取 pnpm-lock.yaml",
  lockfile: "读取 pnpm-lock.yaml",
  registries: "使用多个 registry",
  scripts: "脚本",
  workspace: "工作区",
  workspaces: "工作区",
  settings: "设置（pnpm-workspace.yaml）",
  "using-npx": null,
};
for (const [id, zh] of Object.entries(MAP)) {
  const p = `src/content/docs/${id}.md`;
  if (!zh || !fs.existsSync(p)) continue;
  let t = fs.readFileSync(p, "utf8");
  t = t.replace(/^title: "[^"]*"/m, `title: ${JSON.stringify(zh)}`);
  fs.writeFileSync(p, t);
  console.log("title override:", id, "→", zh);
}
