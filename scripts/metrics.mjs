// Snapshot likes, comments and (if the token allows) views for every post on both accounts.
// Writes log/metrics.json (latest numbers per post) and prints a short table. node scripts/metrics.mjs
import fs from 'node:fs';
import { account, ig } from './lib.mjs';

// Parked posts (formats we stopped making) still need their formats looked up for old posts.
const queue = ['plan/queue.json', 'plan/parked.json'].filter((f) => fs.existsSync(f)).flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const norm = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 80);
const byCaption = new Map(queue.map((p) => [norm(p.caption), p]));
const byCode = new Map(queue.map((p) => [p.code, p]));
// The posting log knows exactly which media id each code became; captions can change later, ids don't.
const byMedia = new Map((fs.existsSync('log/posts.jsonl') ? fs.readFileSync('log/posts.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []).map((l) => [l.media_id, l]));
const out = { updated: new Date().toISOString(), posts: [] };

for (const name of ['stories', 'brand']) {
  const acct = account(name);
  const media = await ig('GET', `/${acct.userId}/media`, { fields: 'id,caption,permalink,timestamp,like_count,comments_count', limit: '100' }, acct.token);
  for (const m of media.data ?? []) {
    const logged = byMedia.get(m.id);
    const p = (logged && (byCode.get(logged.code) ?? { code: logged.code, format: logged.format })) ?? byCaption.get(norm(m.caption));
    // Views for Reels; carousels and images sometimes only report reach, so ask for both and keep what comes back.
    // Retention is what decides reach: average watch time (ms) and skip rate (% who swipe away in the first seconds).
    const got = {};
    for (const metric of ['views', 'reach', 'shares', 'saved', 'reposts', 'ig_reels_avg_watch_time', 'reels_skip_rate']) {
      try {
        const ins = await ig('GET', `/${m.id}/insights`, { metric }, acct.token);
        got[metric] = ins.data?.[0]?.values?.[0]?.value ?? ins.data?.[0]?.total_value?.value ?? null;
      } catch { /* not available for this media type or token */ }
    }
    const reach = got.reach ?? null, views = got.views || reach;
    const avg_watch_s = got.ig_reels_avg_watch_time != null ? +(got.ig_reels_avg_watch_time / 1000).toFixed(1) : null;
    const skip_rate = got.reels_skip_rate != null ? +Number(got.reels_skip_rate).toFixed(1) : null;
    out.posts.push({ code: p?.code ?? null, account: name, format: p?.format ?? null, posted_at: m.timestamp, permalink: m.permalink, views, reach, shares: got.shares ?? null, saves: got.saved ?? null, reposts: got.reposts ?? null, avg_watch_s, skip_rate, likes: m.like_count ?? 0, comments: m.comments_count ?? 0 });
  }
}
// Outliers: posts doing 2x or better than their account's median views. These are the ones to remix.
for (const name of ['stories', 'brand']) {
  const vs = out.posts.filter((p) => p.account === name && p.views != null).map((p) => p.views).sort((a, b) => a - b);
  const med = vs.length ? vs[Math.floor(vs.length / 2)] : 0;
  for (const p of out.posts) if (p.account === name) { p.vs_median = med ? +((p.views ?? 0) / med).toFixed(2) : null; p.outlier = !!med && (p.views ?? 0) >= 2 * med; }
}
fs.mkdirSync('log', { recursive: true });
fs.writeFileSync('log/metrics.json', JSON.stringify(out, null, 2));

// Per-format summary, best first by comments per post (the engagement we care about most), then views.
const fmt = {};
for (const p of out.posts) {
  const f = (fmt[p.format ?? 'unknown'] ??= { posts: 0, comments: 0, likes: 0, views: 0, shares: 0, watch: [], skip: [] });
  f.posts++; f.comments += p.comments; f.likes += p.likes; f.views += p.views ?? 0; f.shares += p.shares ?? 0;
  if (p.avg_watch_s != null) f.watch.push(p.avg_watch_s);
  if (p.skip_rate != null) f.skip.push(p.skip_rate);
}
const avg = (a) => (a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null);
const rows = Object.entries(fmt).map(([k, v]) => ({ format: k, posts: v.posts, comments_per_post: +(v.comments / v.posts).toFixed(2), likes_per_post: +(v.likes / v.posts).toFixed(2), shares_per_post: +(v.shares / v.posts).toFixed(2), views_per_post: Math.round(v.views / v.posts), avg_watch_s: avg(v.watch), skip_rate: avg(v.skip) }))
  .sort((a, b) => b.comments_per_post - a.comments_per_post || b.views_per_post - a.views_per_post);
console.table(rows);
const outs = out.posts.filter((p) => p.outlier);
console.log(outs.length ? `Outliers (2x+ median views): ${outs.map((p) => `${p.code} ${p.format} x${p.vs_median}`).join(', ')}` : 'No outliers yet.');
