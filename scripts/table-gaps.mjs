/**
 * 表格单元格补译：扫描最终 md 中的英文表格单元，去重生成待译清单。
 * 用法：bun scripts/table-gaps.mjs extract   → scripts/out/cells.jsonl
 *       （翻译后生成 done-cells.jsonl）
 *       bun scripts/table-gaps.mjs apply     → 回填
 */
import fs from "node:fs";
import path from "node:path";

const hasCJK = (s) => /[\u3400-\u9fff]/.test(s);
const walk = (dir) => fs.readdirSync(dir, { recursive: true }).map(String).filter((p) => p.endsWith(".md"));

const mode = process.argv[2] ?? "extract";

if (mode === "extract") {
  const cells = new Map();
  for (const rel of walk("src/content/docs")) {
    const text = fs.readFileSync(path.join("src/content/docs", rel), "utf8");
    for (const line of text.split("\n")) {
      if (!/^\s*\|/.test(line)) continue;
      if (/^\s*\|[ :|-]+\|\s*$/.test(line)) continue;
      const parts = line.split("|").slice(1, -1);
      for (let raw of parts) {
        let c = raw.trim();
        if (!c) continue;
        const bare = c.replace(/`[^`]*`/g, " ").replace(/!?\[[^\]]*\]\([^)]*\)/g, " link ").replace(/\*\*/g, "");
        const words = (bare.match(/[A-Za-z]{2,}/g) || []).length;
        if (words >= 2 && !hasCJK(bare)) {
          const key = c;
          if (!cells.has(key)) cells.set(key, 0);
          cells.set(key, cells.get(key) + 1);
        }
      }
    }
  }
  const list = [...cells.entries()].sort((a, b) => b[1] - a[1]);
  fs.writeFileSync(
    "scripts/out/cells.jsonl",
    list.map(([t, n], i) => JSON.stringify({ b: "cell#" + String(i).padStart(4, "0"), t, n })).join("\n") + "\n"
  );
  console.log(list.length, "unique cells");
} else {
  const map = new Map();
  for (const line of fs.readFileSync("scripts/out/trans/done-cells.jsonl", "utf8").split("\n")) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    map.set(o.b, o.z);
  }
  const cells = fs
    .readFileSync("scripts/out/cells.jsonl", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  let applied = 0;
  const files = walk("src/content/docs");
  const texts = new Map(files.map((rel) => [rel, fs.readFileSync(path.join("src/content/docs", rel), "utf8")]));
  for (const { b, t } of cells) {
    const z = map.get(b);
    if (!z || z === t) continue;
    const zEsc = z.replace(/\|/g, "\\|");
    for (const [rel, text] of texts) {
      const lines = text.split("\n");
      let changed = false;
      for (let i = 0; i < lines.length; i++) {
        if (!/^\s*\|/.test(lines[i])) continue;
        const parts = lines[i].split("|");
        for (let j = 1; j < parts.length - 1; j++) {
          if (parts[j].trim() === t) {
            parts[j] = " " + zEsc + " ";
            changed = true;
          }
        }
        if (changed) lines[i] = parts.join("|");
      }
      if (changed) {
        texts.set(rel, lines.join("\n"));
        applied++;
      }
    }
  }
  for (const [rel, text] of texts) fs.writeFileSync(path.join("src/content/docs", rel), text);
  console.log("cell replacements:", applied);
}
