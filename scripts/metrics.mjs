// Snapshot likes, comments and (if the token allows) views for every post on both accounts.
// Writes log/metrics.json (latest numbers per post) and prints a short table. node scripts/metrics.mjs
import fs from 'node:fs';
import { account, ig } from './lib.mjs';

const queue = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8'));
const norm = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 80);
const byCaption = new Map(queue.map((p) => [norm(p.caption), p]));
const out = { updated: new Date().toISOString(), posts: [] };

for (const name of ['stories', 'brand']) {
  const acct = account(name);
  const media = await ig('GET', `/${acct.userId}/media`, { fields: 'id,caption,permalink,timestamp,like_count,comments_count', limit: '100' }, acct.token);
  for (const m of media.data ?? []) {
    const p = byCaption.get(norm(m.caption));
    let views = null;
    try {
      const ins = await ig('GET', `/${m.id}/insights`, { metric: 'views' }, acct.token);
      views = ins.data?.[0]?.values?.[0]?.value ?? null;
    } catch { /* the token may not include insights; likes and comments still count */ }
    out.posts.push({ code: p?.code ?? null, account: name, format: p?.format ?? null, posted_at: m.timestamp, permalink: m.permalink, views, likes: m.like_count ?? 0, comments: m.comments_count ?? 0 });
  }
}
fs.mkdirSync('log', { recursive: true });
fs.writeFileSync('log/metrics.json', JSON.stringify(out, null, 2));

// Per-format summary, best first by comments per post (the engagement we care about most), then views.
const fmt = {};
for (const p of out.posts) {
  const f = (fmt[p.format ?? 'unknown'] ??= { posts: 0, comments: 0, likes: 0, views: 0 });
  f.posts++; f.comments += p.comments; f.likes += p.likes; f.views += p.views ?? 0;
}
const rows = Object.entries(fmt).map(([k, v]) => ({ format: k, posts: v.posts, comments_per_post: +(v.comments / v.posts).toFixed(2), likes_per_post: +(v.likes / v.posts).toFixed(2), views_per_post: Math.round(v.views / v.posts) }))
  .sort((a, b) => b.comments_per_post - a.comments_per_post || b.views_per_post - a.views_per_post);
console.table(rows);
