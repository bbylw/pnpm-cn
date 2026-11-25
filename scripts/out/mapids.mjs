/**
 * 临时工具：逐篇对比本地 headingIds 与上游标题 slug（按顺序）。
 * 用法：node scripts/out/mapids.mjs <doc> [doc...]
 */
import fs from "node:fs";
import { upstreamDoc, headingSlugs } from "../sync-upstream.mjs";

for (const rel of process.argv.slice(2)) {
  const up = upstreamDoc(rel + ".md");
  const local = fs.readFileSync(`src/content/docs/${rel}.md`, "utf8");
  const ids = JSON.parse(/headingIds:\s*(\[.*?\])/s.exec(local)[1]);
  const ups = headingSlugs(up || "");
  console.log(`\n### ${rel}  本地 ${ids.length} / 上游 ${ups.length}`);
  const n = Math.max(ids.length, ups.length);
  for (let i = 0; i < n; i++) {
    const mark = ids[i] && ups[i] && ids[i] === ups[i].slug ? "  " : "!!";
    console.log(`${mark}${String(i).padStart(2)} L:${(ids[i] || "-").padEnd(42)} U:${ups[i] ? ups[i].slug + "   <= " + ups[i].text : "-"}`);
  }
}
