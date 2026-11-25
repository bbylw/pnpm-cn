import fs from 'node:fs';
import path from 'node:path';
import { upstreamDoc } from '../sync-upstream.mjs';

const root = 'src/content/docs';
const files = process.argv.slice(2);
function stats(text) {
  const lines = text.split('\n');
  let incode = false, paras = 0, bullets = 0, chars = 0;
  for (let l of lines) {
    if (l.startsWith('```')) { incode = !incode; continue; }
    if (incode) continue;
    const s = l.trim();
    if (!s) continue;
    if (/^:::/.test(s)) continue;
    if (/^#{1,6}\s/.test(s)) continue;
    if (/^[-*]\s|^\d+\.\s/.test(s)) { bullets++; chars += s.length; continue; }
    paras++; chars += s.length;
  }
  return { paras, bullets, chars };
}
for (const f of files) {
  const up = upstreamDoc(f + '.md');
  const local = fs.readFileSync(path.join(root, f + '.md'), 'utf8');
  const s = stats(up), l = stats(local);
  const ratio = l.chars / (s.chars || 1);
  if (ratio < 0.75 || ratio > 1.35) {
    console.log(`${f}\t上游 段落${s.paras}/条目${s.bullets}/${s.chars}字\t本地 段落${l.paras}/条目${l.bullets}/${l.chars}字\t比值${ratio.toFixed(2)}`);
  }
}
