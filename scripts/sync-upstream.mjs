/**
 * 对比本站中文文档与上游 pnpm/pnpm 的 pnpm/docs/，报告漂移。
 *
 *   node scripts/sync-upstream.mjs                 # 全量报告
 *   node scripts/sync-upstream.mjs --repo <path>   # 指定上游检出目录（默认读 PNPM_UPSTREAM_REPO）
 *   node scripts/sync-upstream.mjs --slugs a.md b.md
 *   node scripts/sync-upstream.mjs --section a.md <标题 slug>...
 *
 * 上游仓库地址默认取本机临时检出目录；也可用环境变量 PNPM_UPSTREAM_REPO 指定。
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const repoIdx = argv.indexOf("--repo");
const UP = path.resolve(
  repoIdx >= 0 ? argv[repoIdx + 1] : process.env.PNPM_UPSTREAM_REPO || "C:/Users/bbylw/AppData/Local/Temp/pnpm-upstream"
);
const LOCAL = "src/content/docs";
const REV = process.env.UP_REV || "HEAD";

/* ---------------- 上游读取 ---------------- */
function gitShow(p) {
  try {
    return execSync(`git -C "${UP}" show ${REV}:${p}`, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

/**
 * 展开上游文档里的 MDX 片段（`import X from './_y.mdx'` + `<X />`），
 * 使标题列表与正文都与上游站点渲染结果一致。
 */
export function expandMdx(md, rel) {
  if (!md) return md;
  const dir = path.posix.dirname(rel);
  let out = md;
  const importRe = /^import\s+(\w+)\s+from\s+["']([^"']+\.mdx)["']\s*$/gm;
  let m;
  const names = [];
  while ((m = importRe.exec(out))) names.push({ name: m[1], file: m[2] });
  for (const { name, file } of names) {
    const abs = path.posix.normalize(path.posix.join(dir, file));
    const part = gitShow(`pnpm/docs/${abs}`);
    if (part == null) continue;
    // 移除 import 行，并把 <Name /> 替换为片段内容
    out = out.replace(new RegExp(`^import\\s+${name}\\s+from\\s+["'][^"']+\\.mdx["']\\s*$`, "gm"), "");
    out = out.replace(new RegExp(`^<${name}\\s*/>\\s*$`, "m"), part.trimEnd());
  }
  return out;
}

export function upstreamDoc(rel) {
  const raw = gitShow(`pnpm/docs/${rel}`);
  if (raw == null) return null;
  return expandMdx(raw, rel);
}

/* ---------------- 锚点 slug（与 pnpm.io/docusaurus 一致） ---------------- */
const ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", nbsp: " " };
function decodeEntities(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}
export function slugify(text, seen) {
  const base = decodeEntities(String(text))
    .replace(/[`*~]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, "")
    .trim()
    .replace(/\s/g, "-"); // github-slugger：每个空白字符各转成一个连字符
  let slug = base;
  let i = 1;
  while (seen.has(slug)) slug = `${base}-${i++}`;
  seen.add(slug);
  return slug;
}
export function headingSlugs(md) {
  const seen = new Set();
  const out = [];
  let inside = false;
  for (const line of md.split("\n")) {
    if (/^```/.test(line)) {
      inside = !inside;
      continue;
    }
    if (inside) continue;
    const m = /^(#{2,6})\s+(.*)$/.exec(line);
    if (m) {
      const text = m[2].trim();
      // docusaurus 支持显式锚点 `{#id}`，存在时以它为准
      const explicit = /\s*\{#[^}]+\}\s*$/.exec(text);
      const slug = explicit ? explicit[0].trim().slice(2, -1) : slugify(text, seen);
      if (explicit) seen.add(slug);
      out.push({ level: m[1].length, text, slug });
    }
  }
  return out;
}

/* ---------------- 章节抽取 ---------------- */
export function section(rel, slug) {
  const md = upstreamDoc(rel);
  if (!md) return null;
  const lines = md.split("\n");
  const heads = [];
  const slugs = headingSlugs(md);
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^```/.test(line)) inFence = !inFence;
    if (inFence) return;
    const m = /^(#{2,6})\s+(.*)$/.exec(line);
    if (m) heads.push({ i, level: m[1].length });
  });
  const idx = heads.findIndex((h, k) => slugs[k].slug === slug);
  if (idx < 0) return null;
  let end = lines.length;
  for (let k = idx + 1; k < heads.length; k++) {
    if (heads[k].level <= heads[idx].level) {
      end = heads[k].i;
      break;
    }
  }
  return lines.slice(heads[idx].i, end).join("\n").trimEnd();
}

/* ---------------- 本地读取 ---------------- */
function localFiles() {
  const out = [];
  const scan = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (e.name.endsWith(".md"))
        out.push(path.relative(LOCAL, p).split(path.sep).join("/").replace(/\.md$/, ""));
    }
  };
  scan(LOCAL);
  return out.sort();
}
const codeBlocks = (md) => {
  const out = [];
  const re = /^(`{3,})[^\n]*\n([\s\S]*?)^\1\s*$/gm;
  let m;
  while ((m = re.exec(md))) out.push(m[2].trim());
  return out;
};
const headingsOf = (md) =>
  md
    .split("\n")
    .filter((l) => /^(#{2,6})\s+/.test(l))
    .map((l) => l.match(/^(#{2,6})/)[1].length);

/* ---------------- 报告 ---------------- */
function report() {
  const local = localFiles();
  const upstream = new Set(
    execSync(`git -C "${UP}" ls-tree -r --name-only ${REV} pnpm/docs`, { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace("pnpm/docs/", "").replace(/\.md$/, ""))
  );

  const missing = [...upstream].filter((f) => !local.includes(f));
  const extra = local.filter((f) => !upstream.has(f));
  console.log(`上游检出：${UP}（rev ${REV}）`);
  console.log(`本地文档 ${local.length} 篇，上游 ${upstream.size} 篇\n`);

  console.log(`【上游有、本地缺】${missing.length} 篇`);
  missing.forEach((m) => console.log("  - " + m));
  console.log(`【本地有、上游无】${extra.length} 篇`);
  extra.forEach((m) => console.log("  - " + m));

  const anchorIssues = [];
  const orderIssues = [];
  const contentIssues = [];
  for (const rel of local) {
    const up = upstreamDoc(rel + ".md");
    if (!up) continue;
    const raw = fs.readFileSync(path.join(LOCAL, rel + ".md"), "utf8");
    const idsM = /headingIds:\s*(\[.*?\])/s.exec(raw);
    const ids = idsM ? JSON.parse(idsM[1]) : [];
    const upSlugs = headingSlugs(up).map((h) => h.slug);
    const notInUp = ids.filter((i) => !upSlugs.includes(i));
    if (notInUp.length)
      anchorIssues.push(`  ${rel}  本地锚点 ${ids.length}，上游标题 ${upSlugs.length}，本地独有 ${JSON.stringify(notInUp.slice(0, 4))}`);
    // 锚点按出现顺序写入 id，故顺序必须与上游一致
    let last = -1;
    let misordered = [];
    for (const id of ids) {
      const j = upSlugs.indexOf(id);
      if (j >= 0) {
        if (j < last) misordered.push(id);
        last = j;
      }
    }
    if (misordered.length)
      orderIssues.push(`  ${rel}  顺序与上游不一致：${JSON.stringify(misordered.slice(0, 6))}`);
    const lb = codeBlocks(raw);
    const ub = codeBlocks(up);
    const missCodes = ub.filter((c) => !lb.includes(c)).length;
    const extraCodes = lb.filter((c) => !ub.includes(c)).length;
    const hDelta = headingsOf(raw).length - headingsOf(up).length;
    if (missCodes || extraCodes || Math.abs(hDelta) > 2)
      contentIssues.push(
        `  ${rel}  代码块 本地${lb.length}/上游${ub.length}（缺${missCodes} 多${extraCodes}）  标题差 ${hDelta}`
      );
  }
  console.log(`\n【锚点与上游不一致】${anchorIssues.length} 篇`);
  anchorIssues.forEach((l) => console.log(l));
  console.log(`\n【锚点顺序与上游不一致】${orderIssues.length} 篇`);
  orderIssues.forEach((l) => console.log(l));
  console.log(`\n【正文结构有漂移】${contentIssues.length} 篇`);
  contentIssues.forEach((l) => console.log(l));

  /* README 一致性 */
  const upReadme = execSync(`git -C "${UP}" show ${REV}:README.md`, { encoding: "utf8" });
  const localReadme = fs.readFileSync("README.md", "utf8");
  const links = (s) => [...new Set((s.match(/https?:\/\/[^"')\s]+/g) || []))].sort();
  const upLinks = links(upReadme);
  const locLinks = links(localReadme);
  const missingLinks = upLinks.filter((l) => !locLinks.includes(l));
  console.log(`\n【README】上游 ${upReadme.split("\n").length} 行 / 本地 ${localReadme.split("\n").length} 行`);
  console.log(`  本地缺失的上游链接 ${missingLinks.length} 个`);
  missingLinks.forEach((l) => console.log("  - " + l));

  /* 导航一致性 */
  const nav = JSON.parse(fs.readFileSync("src/data/nav.json", "utf8"));
  const navIds = [];
  const walkNav = (items) => {
    for (const it of items) {
      if (it.children) walkNav(it.children);
      else navIds.push(it.id);
    }
  };
  nav.forEach((g) => walkNav(g.items));
  const notInNav = local.filter((f) => !navIds.includes(f));
  const navMissing = navIds.filter((i) => !local.includes(i));
  console.log(`\n【导航】条目 ${navIds.length}`);
  console.log(`  未进侧栏：${notInNav.join(", ") || "（无）"}`);
  console.log(`  侧栏指向缺失页：${navMissing.join(", ") || "（无）"}`);
}

/* ---------------- CLI ---------------- */
function main() {
  const slugsIdx = argv.indexOf("--slugs");
  const sectIdx = argv.indexOf("--section");
  if (slugsIdx >= 0) {
    for (const rel of argv.slice(slugsIdx + 1).filter((a) => !a.startsWith("--"))) {
      console.log(`\n### ${rel}`);
      for (const h of headingSlugs(upstreamDoc(rel) || "")) {
        console.log(`  ${"  ".repeat(h.level - 2)}${h.slug}   <= ${h.text}`);
      }
    }
  } else if (sectIdx >= 0) {
    // slug 本身可能以 -- 开头（如 --frozen-store），故不过滤
    const rest = argv.slice(sectIdx + 1);
    const [rel, ...slugs] = rest;
    for (const slug of slugs) {
      console.log(`\n########## ${rel} :: ${slug} ##########`);
      console.log(section(rel, slug) || "（未找到）");
    }
  } else {
    report();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
