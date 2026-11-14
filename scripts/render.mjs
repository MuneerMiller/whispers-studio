// Render one planned post to work/<code>.mp4 (+ work/<code>.txt caption).
//   node scripts/render.mjs ig-prm-01
// Reads plan/queue.json. Music is generated fresh (procedural, no licences needed) and deleted after the render.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const code = process.argv[2];
const queue = JSON.parse(fs.readFileSync('plan/queue.json', 'utf8'));
const post = queue.find((p) => p.code === code);
if (!post) throw new Error(`No post ${code} in plan/queue.json`);

const findChrome = () => {
  const root = '/opt/pw-browsers';
  if (!fs.existsSync(root)) return null;
  for (const d of fs.readdirSync(root).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
    const p = path.join(root, d, 'chrome-linux64', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return null;
};

fs.mkdirSync('work', { recursive: true });
const audio = `bed-${code}.wav`;
const audioPath = path.join('remotion', 'public', audio);
const seconds = post.seconds ?? 8;
// Scheduled runs start on a fresh machine: install the music generator's packages if they're missing.
try { execFileSync('python3', ['-c', 'import numpy, scipy, soundfile'], { stdio: 'ignore' }); }
catch { execFileSync('python3', ['-m', 'pip', 'install', '--break-system-packages', '-q', '-r', 'audio/requirements.txt'], { stdio: 'inherit' }); }
execFileSync('python3', ['audio/mixgen.py', 'none', audioPath, String(seconds), String(post.props?.seed ?? 1)], { stdio: 'inherit' });

const out = path.resolve('work', `${code}.mp4`);
const args = ['remotion', 'render', 'src/index.ts', post.composition, out, `--props=${JSON.stringify({ ...post.props, audio })}`, '--log=error'];
const chrome = findChrome();
if (chrome) args.push(`--browser-executable=${chrome}`);
try {
  execFileSync('npx', args, { cwd: 'remotion', stdio: 'inherit' });
} finally {
  fs.rmSync(audioPath, { force: true });
}
fs.writeFileSync(path.join('work', `${code}.txt`), post.caption);
// Cover frame: when everything is on screen (just after the call to action appears), unless the plan says otherwise.
const cover = post.cover_seconds ?? Math.max(1, seconds - 1.5);
fs.writeFileSync(path.join('work', `${code}.cover`), String(Math.round(cover * 1000)));
console.log(`rendered work/${code}.mp4`);
