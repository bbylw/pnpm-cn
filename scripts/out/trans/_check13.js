const fs=require('fs');
const inp=fs.readFileSync('batch-13.jsonl','utf8').trim().split('\n').map(l=>JSON.parse(l));
const out=fs.readFileSync('done-13.jsonl','utf8').trim().split('\n').map(l=>JSON.parse(l));
let bad=0;
if(inp.length!==out.length){console.log('LEN MISMATCH',inp.length,out.length);bad++;}
for(let i=0;i<out.length;i++){
  const keys=Object.keys(out[i]).sort().join(',');
  if(keys!=='b,z'){console.log('KEYS',i,keys);bad++;}
  if(out[i].b!==inp[i].b){console.log('B MISMATCH',i,inp[i].b,out[i].b);bad++;}
  if(typeof out[i].z!=='string'||out[i].z.length===0){console.log('EMPTY',i);bad++;}
  if(out[i].z.includes('\n')){console.log('NEWLINE in z',i);bad++;}
}
console.log('input',inp.length,'output',out.length,'bad',bad);
