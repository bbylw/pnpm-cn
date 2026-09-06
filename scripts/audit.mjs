/**
 * 内容健康审计：检查中文文档站的一致性。
 * 用法：bun scripts/audit.mjs
 *
 * 检查项：
 *   1. 站内 /docs/ 链接（含 #fragment 锚点）是否有对应文档与锚点
 *   2. 站内图片（/img/、/assets/、/favicon、/og）是否有对应文件（public/ 下）
 *   3. 是否残留翻译哨兵（<!--T: … -->）
 *   4. 是否残留系统性英文标签（Default:/Type:/Aliases:，代码块外）
 *   5. 残留整行英文（代码围栏 / 缩进代码 / frontmatter / 表格 / 标题之外）
 *   6. 正文标题数 vs frontmatter headingIds 长度（锚点漂移检测，围栏感知）
 *   7. nav.json 与 docs 目录的一致性（孤儿文档 / 悬空条目）
 *   8. 缺失 frontmatter desc（SEO 提示，不阻断）
 *
 * 断链/缺失资源/断锚点视为硬性问题，退出码非 0；其余为警告。
 */
import fs from "node:fs";
import path from "node:path";

const norm = (r) => r.split(path.sep).join("/");
const DOCS_DIR = "src/content/docs";
const walk = (dir) =>
  fs.readdirSync(dir, { recursive: true }).map(String).filter((p) => p.endsWith(".md")).map(norm);
const read = (rel) => fs.readFileSync(path.join(DOCS_DIR, rel), "utf8");

const hasCJK = (s) => /[\u3400-\u9fff]/.test(s);
const docs = walk(DOCS_DIR).sort();
const docIds = new Set(docs.map((r) => r.slice(0, -3)));

const out = [];
const hard = [];
const warn = (msg) => out.push("[warn] " + msg);
const problem = (msg) => hard.push(msg);
const ok = (msg) => out.push("✓ " + msg);

/* ---------- 工具：frontmatter / 围栏感知的行扫描 ---------- */
function splitParts(text) {
  const lines = text.split("\n");
  let fm = [];
  let fmClosed = false;
  let body = lines;
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    if (end > 0) {
      fm = lines.slice(1, end);
      body = lines.slice(end + 1);
      fmClosed = true;
    }
  }
  return { fm, fmClosed, body };
}

/* 逐行输出正文中“可见文本行”（跳过围栏与缩进代码、表格、标题、注释）。可回调 fence 状态。 */
function visibleLines(body, fn) {
  let inFence = false;
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      fn({ i, line, inFence, code: true });
      continue;
    }
    if (inFence) {
      fn({ i, line, inFence, code: true });
      continue;
    }
    const head = line.trim();
    if (/^\s{4,}/.test(line)) {
      fn({ i, line, inFence, code: true, indented: true });
      continue;
    }
    if (/^\s*#/.test(line)) {
      fn({ i, line, inFence, heading: true });
      continue;
    }
    if (/^\s*\|/.test(line)) {
      fn({ i, line, inFence, table: true });
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      fn({ i, line, inFence, comment: true });
      continue;
    }
    fn({ i, line, inFence, text: true });
  }
}

/* ---------- 元数据：每篇文档的 headingIds 与锚点 ---------- */
const meta = new Map(); // docId -> { ids: string[], idSet: Set }
for (const rel of docs) {
  const docId = rel.slice(0, -3);
  const { fm } = splitParts(read(rel));
  const ids = [];
  for (const l of fm) {
    if (!/^headingIds\s*:/.test(l)) continue;
    for (const m of l.matchAll(/["']([^"']+)["']/g)) {
      if (m[1]) ids.push(m[1]);
    }
  }
  meta.set(docId, { ids, idSet: new Set(ids) });
}

/* ---------- 1/2. 断链 / 断锚点 / 缺失图片 ---------- */
const broken = [];
for (const rel of docs) {
  const text = read(rel);
  for (const m of text.matchAll(/\]\(([^()\s]+?)(?:\s+["'][^)]*)?\)/g)) {
    let u = m[1];
    const [pathPart, frag] = u.split("#");
    if (pathPart.startsWith("/docs/")) {
      const id = pathPart.slice("/docs/".length).split("?")[0];
      if (!docIds.has(id)) {
        broken.push(`${rel} → ${u}（文档不存在）`);
        continue;
      }
      if (frag && !meta.get(id).idSet.has(frag)) {
        broken.push(`${rel} → ${u}（锚点 #${frag} 不在 headingIds 中）`);
      }
    } else if (u.startsWith("#") && !u.startsWith("##")) {
      // 站内同页锚点
      const frag2 = u.slice(1);
      const ownMeta = meta.get(rel.slice(0, -3));
      if (!ownMeta.idSet.has(frag2)) {
        broken.push(`${rel} → ${u}（本页无锚点 #${frag2}）`);
      }
    } else if (/^\/(img|assets|favicon|og)\//.test(pathPart)) {
      const p = path.join("public", pathPart.replace(/^\//, "").split("?")[0]);
      if (!fs.existsSync(p)) broken.push(`${rel} → ${u}（public 下无此资源）`);
    }
  }
}
if (broken.length) {
  problem(`断链/断锚点/缺失资源 ${broken.length} 处：`);
  for (const b of broken.slice(0, 40)) problem("   " + b);
} else {
  ok("无断链，站内资源与 #fragment 锚点全部有效");
}

/* ---------- 3. 残留翻译哨兵 ---------- */
const sents = [];
for (const rel of docs) {
  const n = (read(rel).match(/<!--T:/g) || []).length;
  if (n) sents.push(`${rel} ×${n}`);
}
if (sents.length) problem("残留翻译哨兵：\n   " + sents.join("\n   "));
else ok("无残留翻译哨兵");

/* ---------- 4. 系统性英文标签 ---------- */
const labelRe = /(?<![A-Za-z])(?:Default value|Default|Type|Aliases)\s*:/;
const labelFiles = [];
for (const rel of docs) {
  const { body } = splitParts(read(rel));
  const found = [];
  visibleLines(body, ({ text, line }) => {
    if (text && labelRe.test(line) && !line.includes("`")) found.push(1);
  });
  if (found.length) labelFiles.push(rel);
}
if (labelFiles.length) warn(`仍有英文标签（Default:/Type:/Aliases:）：${labelFiles.join(", ")}`);
else ok("无遗漏的 Default:/Type:/Aliases: 标签");

/* ---------- 5. 整行英文残留 ---------- */
const engWords = (s) =>
  (s.replace(/`[^`]*`/g, " ").replace(/!?\[[^\]]*\]\([^)]*\)/g, " ").match(/[A-Za-z][A-Za-z'-]{1,}/g) || []).length;
const residue = [];
for (const rel of docs) {
  const { body } = splitParts(read(rel));
  const hits = [];
  visibleLines(body, ({ text, line }) => {
    if (!text) return;
    if (line.includes("/")) return; // 路径/URL 形态
    if (hits.length >= 3) return;
    const w = engWords(line);
    if (w >= 4 && !hasCJK(line)) hits.push(line.trim().slice(0, 90));
  });
  if (hits.length) residue.push([rel, hits]);
}
if (residue.length) {
  warn(`仍含整行英文的文档 ${residue.length} 篇（列前 10 篇，各取 3 行）：`);
  for (const [rel, hits] of residue.slice(0, 10)) warn(`   ${rel}\n      ` + hits.join("\n      "));
} else {
  ok("无整行英文残留");
}

/* ---------- 6. 标题数 vs headingIds（围栏感知） ---------- */
const drift = [];
for (const rel of docs) {
  const { body } = splitParts(read(rel));
  let nHead = 0;
  let inFence = false;
  for (const line of body) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^#{1,6}\s/.test(line)) nHead++;
  }
  const nIds = meta.get(rel.slice(0, -3)).ids.length;
  if (nHead !== nIds) drift.push(`${rel}: 标题 ${nHead} vs headingIds ${nIds}`);
}
if (drift.length) {
  warn(`锚点漂移（标题数与 headingIds 不一致）${drift.length} 篇——若链接指向缺 id 的标题会失效：`);
  for (const d of drift) warn("   " + d);
} else {
  ok("全部文档标题数 == headingIds 数");
}

/* ---------- 7. nav.json 一致性 ---------- */
const nav = JSON.parse(fs.readFileSync("src/data/nav.json", "utf8"));
const navIds = new Set();
// 组对象（Introduction/Usage/…）与分类包装节点不是文档：只收集叶子条目
const navLeaves = new Set();
(function collect(items) {
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const kids = Array.isArray(it.children) ? it.children : Array.isArray(it.items) ? it.items : null;
    if (kids && kids.length) collect(kids);
    else if (typeof it.id === "string" && kids === null) navLeaves.add(it.id);
  }
})(nav.flatMap((g) => g.items || g.children || []));
const orphan = docs.map((r) => r.slice(0, -3)).filter((id) => !navLeaves.has(id));
const dangling = [...navLeaves].filter((id) => !docIds.has(id));
if (orphan.length) warn(`docs 中不在导航里的文档 ${orphan.length} 篇（可能是有意为之）：${orphan.slice(0, 12).join(", ")}${orphan.length > 12 ? " …" : ""}`);
if (dangling.length) warn(`导航中的条目无对应文档 ${dangling.length} 个：${dangling.join(", ")}`);
if (!orphan.length && !dangling.length) ok("docs 目录与导航一致");

/* ---------- 8. desc 缺失（SEO 提示） ---------- */
const noDesc = [];
for (const rel of docs) {
  const { fm } = splitParts(read(rel));
  if (!fm.some((l) => /^desc\s*:/.test(l))) noDesc.push(rel);
}
warn(`缺少 frontmatter desc 的文档 ${noDesc.length} 篇——已由构建期自动摘要兜底，仅提示可人工补写（SEO）`);

/* ---------- 汇总 ---------- */
console.log("\n==== pnpm-cn 内容健康报告 ====");
for (const p of out) console.log(p);
for (const p of hard) console.log("✗ " + p);
console.log(`\n概要：文档 ${docs.length} 篇；硬性问题 ${hard.length} 个；警告 ${out.filter((x) => x.startsWith("[warn]")).length} 条；desc 缺失 ${noDesc.length} 篇。`);
process.exit(hard.length ? 1 : 0);
