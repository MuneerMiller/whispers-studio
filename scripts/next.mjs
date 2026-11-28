// Print the code of the next post for an account: the first queue entry that isn't posted yet.
//   node scripts/next.mjs stories   ->  ig-fin-01   (prints nothing if the queue is used up)
// "Posted" is read from Instagram itself (the account's recent captions), plus log/posts.jsonl if present,
// so a run doesn't need to push anything back to GitHub to remember what it posted.
import fs from 'node:fs';
import { account, ig } from './lib.mjs';

const name = process.argv[2];
const queue = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8')).filter((p) => p.account === name);
const done = new Set((fs.existsSync('log/posts.jsonl') ? fs.readFileSync('log/posts.jsonl', 'utf8').split('\n').filter(Boolean) : []).map((l) => JSON.parse(l).code));

// Compare the start of the caption only, so small changes Instagram makes at the end (hashtags) don't matter.
const norm = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 80);
try {
  const acct = account(name);
  const media = await ig('GET', `/${acct.userId}/media`, { fields: 'caption', limit: '100' }, acct.token);
  const captions = new Set((media.data ?? []).map((m) => norm(m.caption)));
  for (const p of queue) if (captions.has(norm(p.caption))) done.add(p.code);
} catch (e) {
  // Without Instagram we can't be sure what's posted: refuse rather than risk a double post.
  console.error(`next.mjs: could not read ${name}'s posts from Instagram: ${e.message}`);
  process.exit(2);
}
// A post handed to the phone (phone/jobs.json) is not posted yet, but it isn't the API's to post either.
if (fs.existsSync('phone/jobs.json')) for (const j of JSON.parse(fs.readFileSync('phone/jobs.json', 'utf8'))) done.add(j.code);
const next = queue.find((p) => !done.has(p.code));
if (next) console.log(next.code);
