// Print the code of the next post for an account: the first queue entry not yet in log/posts.jsonl.
//   node scripts/next.mjs stories   ->  ig-fin-01   (prints nothing if the queue is used up)
import fs from 'node:fs';
const acct = process.argv[2];
const queue = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8'));
const done = new Set((fs.existsSync('log/posts.jsonl') ? fs.readFileSync('log/posts.jsonl', 'utf8').split('\n').filter(Boolean) : []).map((l) => JSON.parse(l).code));
const next = queue.find((p) => p.account === acct && !done.has(p.code));
if (next) console.log(next.code);
