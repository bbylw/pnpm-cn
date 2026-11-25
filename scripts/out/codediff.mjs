import fs from "node:fs";
import { upstreamDoc } from "../sync-upstream.mjs";

const rel = process.argv[2];
const up = upstreamDoc(rel + ".md");
const local = fs.readFileSync(`src/content/docs/${rel}.md`, "utf8");
const codeBlocks = (md) => {
  const out = [];
  const re = /^(`{3,})[^\n]*\n([\s\S]*?)^\1\s*$/gm;
  let m;
  while ((m = re.exec(md))) out.push(m[2].trim());
  return out;
};
const lb = codeBlocks(local);
const ub = codeBlocks(up);
console.log("=== 上游有、本地没有的代码块 ===");
ub.forEach((c, i) => {
  if (!lb.includes(c)) {
    console.log(`--- [${i}] ---`);
    console.log(c.split("\n").slice(0, 25).join("\n"));
  }
});
console.log("\n=== 本地有、上游没有的代码块 ===");
lb.forEach((c) => {
  if (!ub.includes(c)) {
    console.log("---");
    console.log(c.split("\n").slice(0, 12).join("\n"));
  }
});
