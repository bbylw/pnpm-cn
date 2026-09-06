import fs from "node:fs";
const lines = fs
  .readFileSync("scripts/out/blocks.jsonl", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));
const byPage = new Map();
for (const b of lines) {
  if (!byPage.has(b.p)) byPage.set(b.p, []);
  byPage.get(b.p).push(b);
}
const TARGET = 260;
const batches = [];
let cur = [];
for (const [page, items] of [...byPage.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (items.length > TARGET * 1.6) {
    if (cur.length) {
      batches.push(cur);
      cur = [];
    }
    for (let i = 0; i < items.length; i += TARGET) batches.push(items.slice(i, i + TARGET));
    continue;
  }
  if (cur.length + items.length > TARGET && cur.length) {
    batches.push(cur);
    cur = [];
  }
  cur.push(...items);
}
if (cur.length) batches.push(cur);
fs.mkdirSync("scripts/out/trans", { recursive: true });
batches.forEach((bt, i) => {
  const name = `scripts/out/trans/batch-${String(i + 1).padStart(2, "0")}.jsonl`;
  fs.writeFileSync(name, bt.map((b) => JSON.stringify(b)).join("\n") + "\n");
});
console.log(batches.length, "batches:", batches.map((b) => b.length).join(","));
