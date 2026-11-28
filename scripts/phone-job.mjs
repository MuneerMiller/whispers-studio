// Hand one rendered post to the phone (the Whispers Poster Android app) instead of publishing it through the API.
//   node scripts/phone-job.mjs <code>      (needs work/<code>.mp4 and work/<code>.txt from render.mjs)
// The video goes to Cloudinary for the phone to download, and a job is added to phone/jobs.json (public repo: the
// job holds only the post itself, which will be public anyway). The phone posts it in the Instagram app with a
// trending song; scripts/phone-sweep.mjs then logs it, deletes the Cloudinary copy and removes the job.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { cloudinaryUpload } from './lib.mjs';

const code = process.argv[2];
if (!code) throw new Error('Usage: node scripts/phone-job.mjs <code>');
const post = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8')).find((p) => p.code === code);
if (!post) throw new Error(`${code} is not in plan/queue.json`);
const cfg = JSON.parse(fs.readFileSync('phone/config.json', 'utf8'));
if (!cfg.enabled) { console.log('phone posting is off (phone/config.json): nothing done'); process.exit(3); }
const video = `work/${code}.mp4`, captionFile = `work/${code}.txt`;
if (!fs.existsSync(video) || !fs.existsSync(captionFile)) throw new Error(`Render ${code} first (work/${code}.mp4 and .txt)`);

const jobs = JSON.parse(fs.readFileSync('phone/jobs.json', 'utf8'));
if (jobs.some((j) => j.code === code)) { console.log(`${code} is already a phone job`); process.exit(0); }

// Times are Johannesburg local; the job is valid from notBeforeHour until expiresHour today.
const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
const at = (h) => new Date(`${ymd}T${String(h).padStart(2, '0')}:00:00+02:00`).toISOString().replace('.000', '');
// The phone adds a trending song in Instagram, so the upload has no sound of its own (our generated music would
// play underneath the song).
const silent = `work/${code}.phone.mp4`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-an', '-c:v', 'copy', '-movflags', '+faststart', silent]);
const asset = await cloudinaryUpload(silent);
const handle = { stories: 'whispers_anon', brand: 'whispers_app' }[post.account];
jobs.push({
  id: `${code}-${Date.now().toString(36)}`, code, account: post.account, handle, format: post.format,
  video_url: asset.url, cloudinary: { publicId: asset.publicId, type: asset.type },
  caption: fs.readFileSync(captionFile, 'utf8').trim(), audio: 'trending',
  not_before: at(cfg.notBeforeHour), expires: at(cfg.expiresHour), created: new Date().toISOString(),
});
fs.writeFileSync('phone/jobs.json', JSON.stringify(jobs, null, 2) + '\n');
for (const f of fs.readdirSync('work').filter((f) => f.startsWith(`${code}.`))) fs.rmSync(`work/${f}`);
console.log(`PHONE JOB ${code} for @${handle}, ${jobs.at(-1).not_before} to ${jobs.at(-1).expires}`);
