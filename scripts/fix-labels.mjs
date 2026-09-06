/**
 * 设置类标签翻译：把遗漏的英文标签（Default: / Type: / Aliases: 等）就地译为中文。
 * 只处理代码围栏之外、且不在行内反引号内的文本（避免碰到 `virtualStoreType:` 这类标识符）。
 * 用法：bun scripts/fix-labels.mjs            → 就地回填
 *       bun scripts/fix-labels.mjs --dry      → 只打印将要改动的位置
 */
import fs from "node:fs";
import path from "node:path";

const norm = (r) => r.split(path.sep).join("/");
const walk = (dir) =>
  fs.readdirSync(dir, { recursive: true }).map(String).filter((p) => p.endsWith(".md")).map(norm);

const LABELS = [
  [/(?<![A-Za-z])Default value\s*:/, "默认值："],
  [/(?<![A-Za-z])Default\s*:/, "默认值："],
  [/(?<![A-Za-z])Type\s*:/, "类型："],
  [/(?<![A-Za-z])Aliases\s*:/, "别名："],
];

const dry = process.argv.includes("--dry");
let hits = 0;
for (const rel of walk("src/content/docs")) {
  const p = path.join("src/content/docs", rel);
  const lines = fs.readFileSync(p, "utf8").split("\n");
  let inFence = false;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // 只处理反引号之外的片段（偶数下标），行内代码原样保留
    const segs = lines[i].split("`");
    let segChanged = false;
    for (let k = 0; k < segs.length; k += 2) {
      for (const [re, zh] of LABELS) {
        if (re.test(segs[k])) {
          if (!dry) segs[k] = segs[k].replace(re, zh);
          segChanged = true;
          hits++;
        }
      }
    }
    if (segChanged) {
      if (dry) console.log(rel + ":" + (i + 1) + "  " + lines[i].slice(0, 110));
      else changed = true;
      lines[i] = segs.join("`");
    }
  }
  if (changed) fs.writeFileSync(p, lines.join("\n"));
}
console.log(dry ? `dry-run: 共 ${hits} 处` : `已回填 ${hits} 处标签`);
