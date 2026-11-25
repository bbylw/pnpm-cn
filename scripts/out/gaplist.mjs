/**
 * 临时工具：列出每篇文档相对上游缺失/多余的锚点与标题（供分工回填）。
 * 用法：node scripts/out/gaplist.mjs [doc...]
 *   不带参数时输出全部有缺口的文档
 */
import fs from "node:fs";
import path from "node:path";
import { upstreamDoc, headingSlugs } from "../sync-upstream.mjs";

const LOCAL = "src/content/docs";

function walk(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
    else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out;
}
function localIds(md) {
  const m = /headingIds:\s*(\[.*?\])/s.exec(md);
  return m ? JSON.parse(m[1]) : [];
}

const docs = walk(LOCAL)
  .map((r) => r.replace(/\.md$/, ""))
  .sort();
const list = process.argv.slice(2);
for (const rel of docs) {
  if (list.length && !list.includes(rel)) continue;
  const up = upstreamDoc(rel + ".md");
  if (!up) continue;
  const local = fs.readFileSync(`${LOCAL}/${rel}.md`, "utf8");
  const ids = localIds(local);
  const set = new Set(ids);
  const heads = headingSlugs(up);
  const missing = heads.filter((h) => !set.has(h.slug));
  const extra = ids.filter((i) => !heads.some((h) => h.slug === i));
  if (!missing.length && !extra.length) continue;
  console.log(`\n### ${rel}`);
  if (missing.length)
    console.log(
      `  缺失(${missing.length}):\n` +
        missing.map((h) => `    ${"  ".repeat(h.level - 2)}[${h.slug}] ${h.text}`).join("\n")
    );
  if (extra.length) console.log(`  本地独有(${extra.length}): ${extra.join(", ")}`);
}
