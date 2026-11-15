// Publish one video (Reel) or image to an Instagram account, then clean up everything except the post itself.
//   node scripts/publish.mjs --account stories --file work/ig-prm-01.mp4 --caption-file work/ig-prm-01.txt --code ig-prm-01 --format "Prompt post"
// Steps: upload to Cloudinary -> create IG container -> wait until Instagram has processed it -> publish ->
// read back the permalink -> delete the Cloudinary copy -> delete the local files -> append to log/posts.jsonl.
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { account, ig, cloudinaryUpload, cloudinaryDelete, sleep } from './lib.mjs';

const { values: a } = parseArgs({ options: {
  account: { type: 'string' }, file: { type: 'string' }, caption: { type: 'string' }, 'caption-file': { type: 'string' },
  code: { type: 'string' }, format: { type: 'string' }, 'keep-local': { type: 'boolean' },
} });
if (!a.account || !a.file) throw new Error('Need --account and --file');
const acct = account(a.account);
const caption = a.caption ?? (a['caption-file'] ? fs.readFileSync(a['caption-file'], 'utf8').trim() : '');
const isVideo = /\.(mp4|mov)$/i.test(a.file);
// a.file may be a directory of slides (carousel); its cover file doesn't apply.
// Cover frame chosen by render.mjs (milliseconds into the video), so the grid shows the whole post, not frame 0.
const coverFile = fs.statSync(a.file).isDirectory() ? null : a.file.replace(/\.[^.]+$/, '.cover');
const thumbOffset = coverFile && fs.existsSync(coverFile) ? fs.readFileSync(coverFile, 'utf8').trim() : null;

const isCarousel = fs.statSync(a.file).isDirectory();
const assets = [];
let published;
try {
  let container;
  if (isCarousel) {
    // Carousel: each slide is uploaded, becomes a carousel item, then one CAROUSEL container holds them (max 10).
    const slides = fs.readdirSync(a.file).filter((f) => /\.jpe?g$/i.test(f)).sort().slice(0, 10);
    if (slides.length < 2) throw new Error('A carousel needs at least 2 JPEG slides');
    const children = [];
    for (const f of slides) {
      const up = await cloudinaryUpload(`${a.file}/${f}`);
      assets.push(up);
      children.push((await ig('POST', `/${acct.userId}/media`, { image_url: up.url, is_carousel_item: 'true' }, acct.token)).id);
    }
    console.log(`uploaded ${slides.length} slides to Cloudinary`);
    container = await ig('POST', `/${acct.userId}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption }, acct.token);
  } else {
    const asset = await cloudinaryUpload(a.file);
    assets.push(asset);
    console.log(`uploaded to Cloudinary (${asset.type})`);
    container = await ig('POST', `/${acct.userId}/media`, isVideo
      ? { media_type: 'REELS', video_url: asset.url, caption, share_to_feed: 'true', ...(thumbOffset ? { thumb_offset: thumbOffset } : {}) }
      : { image_url: asset.url, caption }, acct.token);
  }

  // Instagram fetches and processes the file; wait for FINISHED (up to ~5 minutes).
  for (let i = 0; i < 60; i++) {
    const st = await ig('GET', `/${container.id}`, { fields: 'status_code,status' }, acct.token);
    if (st.status_code === 'FINISHED') break;
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new Error(`Instagram could not process the media: ${st.status}`);
    if (i === 59) throw new Error('Instagram did not finish processing within 5 minutes');
    await sleep(5000);
  }
  const pub = await ig('POST', `/${acct.userId}/media_publish`, { creation_id: container.id }, acct.token);
  published = await ig('GET', `/${pub.id}`, { fields: 'id,permalink,timestamp,media_type' }, acct.token);
  console.log(`PUBLISHED ${published.media_type} on ${a.account}: ${published.permalink}`);
} finally {
  // The post lives on Instagram now; nothing else is kept. Cloudinary copy is removed whether or not publishing worked.
  let failed = 0;
  for (const asset of assets) {
    try { await cloudinaryDelete(asset); } catch (e) { failed++; console.error(`WARNING: ${e.message}`); process.exitCode = 1; }
  }
  if (assets.length && !failed) console.log('deleted Cloudinary copy');
}

if (published) {
  if (!a['keep-local']) for (const f of [a.file, a['caption-file'], coverFile]) if (f && fs.existsSync(f)) fs.rmSync(f, { recursive: true });
  fs.mkdirSync('log', { recursive: true });
  fs.appendFileSync('log/posts.jsonl', JSON.stringify({
    code: a.code ?? null, account: a.account, format: a.format ?? null, media_id: published.id,
    permalink: published.permalink, posted_at: published.timestamp,
  }) + '\n');
}
