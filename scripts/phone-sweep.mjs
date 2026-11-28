// Tidy phone jobs on every run: a job the phone has posted is logged to log/posts.jsonl (via: "phone"); a job past its
// expiry is dropped as missed. Either way its Cloudinary copy is deleted and it leaves phone/jobs.json.
//   node scripts/phone-sweep.mjs
import fs from 'node:fs';
import { account, ig, cloudinaryDelete } from './lib.mjs';

if (!fs.existsSync('phone/jobs.json')) process.exit(0);
const jobs = JSON.parse(fs.readFileSync('phone/jobs.json', 'utf8'));
if (!jobs.length) { console.log('phone: no jobs'); process.exit(0); }
const norm = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 80);
const recent = {};
for (const name of new Set(jobs.map((j) => j.account))) {
  const acct = account(name);
  recent[name] = (await ig('GET', `/${acct.userId}/media`, { fields: 'id,caption,permalink,timestamp', limit: '30' }, acct.token)).data ?? [];
}
const keep = [];
for (const j of jobs) {
  const hit = recent[j.account].find((m) => norm(m.caption) === norm(j.caption));
  const expired = Date.now() > Date.parse(j.expires);
  if (!hit && !expired) { keep.push(j); continue; }
  try { await cloudinaryDelete(j.cloudinary); } catch (e) { console.error(`WARNING: ${e.message}`); process.exitCode = 1; }
  if (hit) {
    fs.appendFileSync('log/posts.jsonl', JSON.stringify({ code: j.code, account: j.account, format: j.format, media_id: hit.id, permalink: hit.permalink, posted_at: hit.timestamp, via: 'phone' }) + '\n');
    console.log(`phone: ${j.code} posted ${hit.permalink}`);
  } else {
    fs.appendFileSync('log/phone-missed.jsonl', JSON.stringify({ code: j.code, account: j.account, expired: j.expires }) + '\n');
    console.log(`phone: ${j.code} MISSED (not posted before ${j.expires})`);
  }
}
fs.writeFileSync('phone/jobs.json', JSON.stringify(keep, null, 2) + '\n');
