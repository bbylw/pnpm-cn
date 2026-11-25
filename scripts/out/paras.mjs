import fs from 'node:fs';
import path from 'node:path';
import { upstreamDoc } from '../sync-upstream.mjs';

const root = 'src/content/docs';
const files = process.argv.slice(2);

function sections(text) {
  const out = new Map();
  let cur = '(前言)';
  let incode = false;
  const buf = [];
  const flush = () => {
    if (buf.length) {
      out.set(cur, (out.get(cur) || '') + buf.join('\n') + '\n');
      buf.length = 0;
    }
  };
  for (const l of text.split('\n')) {
    if (l.startsWith('```')) { incode = !incode; continue; }
    if (incode) continue;
    const m = /^#{1,6}\s+(.*)$/.exec(l);
    if (m) { flush(); cur = m[1].trim(); if (!out.has(cur)) out.set(cur, ''); continue; }
    if (/^:::/.test(l.trim())) continue;
    buf.push(l);
  }
  flush();
  return out;
}

function units(text) {
  // 先把硬换行的段落合并成逻辑块，再统计句子数
  const blocks = [];
  let cur = '';
  const itemRe = /^([-*+]\s+|\d+\.\s+)/;
  for (const raw of text.split('\n')) {
    const l = raw.trim();
    if (!l) { if (cur) { blocks.push(cur); cur = ''; } continue; }
    if (itemRe.test(l)) { if (cur) blocks.push(cur); blocks.push(l); cur = ''; continue; }
    if (cur && !/[.!?。！？:：]$/.test(cur)) { cur += ' ' + l; continue; }
    if (cur) blocks.push(cur);
    cur = l;
  }
  if (cur) blocks.push(cur);
  let n = 0;
  for (const b of blocks) {
    if (itemRe.test(b)) { n += 1; continue; }
    const t = b.replace(/`[^`]*`/g, 'X');
    const sents = (t.match(/[.!?](?=\s|$)/g) || []).length + (t.match(/[。！？]/g) || []).length;
    n += Math.max(1, sents);
  }
  return n;
}

for (const f of files) {
  const up = sections(upstreamDoc(f + '.md'));
  const loc = sections(fs.readFileSync(path.join(root, f + '.md'), 'utf8'));
  for (const [h, t] of up) {
    if (!t.trim()) continue;
    const u = units(t);
    const m = loc.get(h);
    if (m === undefined) continue;
    const l = units(m);
    if (u >= 3 && l < u - 1) console.log(`${f}\t${h}\t上游${u}句 本地${l}句`);
  }
}
