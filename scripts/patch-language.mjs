/**
 * 把子代理翻译结果（scripts/out/trans/done-*.jsonl）回填进抓取产生的哨兵文本。
 * 同时用 k=title 条目改写 frontmatter 的 title。
 */
import fs from "node:fs";
import path from "node:path";

const map = new Map();
for (const f of fs.readdirSync("scripts/out/trans").filter((f) => f.startsWith("done-") && f.endsWith(".jsonl"))) {
  let n = 0;
  for (const line of fs.readFileSync(path.join("scripts/out/trans", f), "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line);
      if (typeof o.b === "string" && typeof o.z === "string") {
        map.set(o.b, o.z);
        n++;
      }
    } catch (e) {
      console.log("BAD LINE in", f, ":", line.slice(0, 120));
    }
  }
  console.log(f, n, "entries");
}

let total = 0;
let applied = 0;
const leftover = [];
const walk = (dir) => fs.readdirSync(dir, { recursive: true }).map(String).filter((p) => p.endsWith(".md"));
for (const rel of walk("src/content/docs")) {
  const p = path.join("src/content/docs", rel);
  let text = fs.readFileSync(p, "utf8");
  const id = rel.replace(/\.md$/, "").replace(/\\/g, "/");
  total += (text.match(/<!--T:/g) || []).length;
  text = text.replace(/<!--T:([^>]+?)-->([\s\S]*?)<!--\/T-->/g, (m, bid, inner) => {
    const z = map.get(bid);
    if (z === undefined) {
      leftover.push(bid);
      return m;
    }
    applied++;
    return z;
  });
  const title = map.get(id + "@title");
  if (title && !/[\u4e00-\u9fff]/.test(text.match(/^title: "([^"]*)"/m)?.[1] || "")) {
    text = text.replace(/^title: "([^"]*)"/m, (_, old) => `title: ${JSON.stringify(title)}`);
  }
  fs.writeFileSync(p, text);
}
console.log(`sentinels: ${total}, replaced: ${applied}, leftover: ${leftover.length}`);
if (leftover.length) console.log("missing:", [...new Set(leftover.map((l) => l.split("#")[0]))].join(", "));
