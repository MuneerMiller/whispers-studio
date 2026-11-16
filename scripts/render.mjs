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
const chrome0 = findChrome();

if (post.composition === 'BingoCard') {
  const out = path.resolve('work', `${code}.jpg`);
  const args = ['remotion', 'still', 'src/index.ts', 'BingoCard', out, '--frame=0', '--image-format=jpeg', '--jpeg-quality=92', `--props=${JSON.stringify(post.props)}`, '--log=error'];
  if (chrome0) args.push(`--browser-executable=${chrome0}`);
  execFileSync('npx', args, { cwd: 'remotion', stdio: 'inherit' });
  fs.writeFileSync(path.join('work', `${code}.txt`), post.caption);
  // As a Reel: 9:16 frame, the card centred on ink, slow push-in, music bed. Image posts barely reach non-followers.
  const bed = path.resolve('work', `${code}.bed.wav`);
  execFileSync('python3', ['audio/mixgen.py', 'none', bed, '10', '2'], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-loop', '1', '-i', out, '-i', bed, '-t', '10',
    '-filter_complex', "[0]scale=1080:-2,pad=1080:1920:0:(1920-ih)/2:color=0x0a0d18,zoompan=z='min(1+on*0.0009,1.09)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1080x1920:fps=30[v]",
    '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-c:a', 'aac', '-shortest', path.resolve('work', `${code}.mp4`)], { stdio: 'inherit' });
  fs.rmSync(out); fs.rmSync(bed);
  fs.writeFileSync(path.join('work', `${code}.cover`), '1500');
  console.log(`rendered work/${code}.mp4 (bingo reel)`);
  process.exit(0);
}

// Carousels are stills, one JPEG per slide (Instagram only takes JPEG), into work/<code>/.
if (post.composition === 'MemeCarousel') {
  const dir = path.resolve('work', code);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = post.props.slides.length + 2;
  for (let i = 0; i < n; i++) {
    const args = ['remotion', 'still', 'src/index.ts', 'MemeCarousel', path.join(dir, `slide-${String(i + 1).padStart(2, '0')}.jpg`), `--frame=${i}`, '--image-format=jpeg', '--jpeg-quality=92', `--props=${JSON.stringify(post.props)}`, '--log=error'];
    if (chrome0) args.push(`--browser-executable=${chrome0}`);
    execFileSync('npx', args, { cwd: 'remotion', stdio: 'inherit' });
  }
  fs.writeFileSync(path.join('work', `${code}.txt`), post.caption);
  console.log(`rendered work/${code}/ (${n} slides)`);
  process.exit(0);
}
const audio = `bed-${code}.wav`;
const audioPath = path.join('remotion', 'public', audio);
// Chat stories: length comes from the messages (same timing as ChatReel.tsx).
const chatSeconds = (msgs) => { let t = 1.6; for (const m of msgs) { const at = t + (m.from === 'them' ? 0.9 : 0.35); t = at + Math.min(3.2, 0.9 + m.text.length * 0.045); } return t + 3.2; };
// Lengths for the other timed templates (same formulas as MoreReels.tsx, plus the 3.2s question card).
const P = post.props ?? {};
const lengths = {
  ChatReel: () => chatSeconds(P.messages),
  TierList: () => 1.3 + P.items.length * 1.25 + 0.6 + 3.2,
  NotesReel: () => P.lines.reduce((t, l) => t + 0.5 + l.length * 0.05, 1.2) + 1.2 + 3.2,
  SearchReel: () => 1.4 + P.query.length * 0.07 + 0.4 + P.suggestions.length * 0.55 + 1.8 + 3.2,
  TwistReel: () => P.setup.reduce((t, l) => t + 1 + l.length * 0.05, 1.4) + 0.3 + 3.3 + 1.6 + P.ending.length * 0.045 + 3.2,
};
// Voice stories: narrate first (Kokoro TTS), then the video length follows the narration.
let voice = null;
if (post.composition === 'VoiceStory') {
  const story = path.join('work', `${code}.story.txt`);
  fs.writeFileSync(story, P.story);
  const vo = path.join('work', `${code}.vo.wav`), words = path.join('work', `${code}.words.json`);
  execFileSync('python3', ['audio/tts_story.py', story, vo, words], { stdio: 'inherit' });
  voice = JSON.parse(fs.readFileSync(words, 'utf8'));
  voice.vo = vo;
  lengths.VoiceStory = () => voice.duration + 3.4;
}
if (post.composition === 'StoryboardReel') {
  const { totalSeconds } = await import('../remotion/src/storyboard-timing.mjs');
  lengths.StoryboardReel = () => totalSeconds(P.scenes);
}
const seconds = lengths[post.composition] ? Math.ceil(lengths[post.composition]()) : (post.seconds ?? 8);
// Scheduled runs start on a fresh machine: install the music generator's packages if they're missing.
try { execFileSync('python3', ['-c', 'import numpy, scipy, soundfile'], { stdio: 'ignore' }); }
catch { execFileSync('python3', ['-m', 'pip', 'install', '--break-system-packages', '-q', '-r', 'audio/requirements.txt'], { stdio: 'inherit' }); }
execFileSync('python3', ['audio/mixgen.py', voice ? voice.vo : 'none', audioPath, String(seconds), String(post.props?.seed ?? 1)], { stdio: 'inherit' });
// Storyboards get sound effects on every cut and hit, timed from the same timeline the picture uses.
if (post.composition === 'StoryboardReel') {
  const { soundCues } = await import('../remotion/src/storyboard-timing.mjs');
  const cuesFile = path.join('work', `${code}.cues.json`);
  fs.writeFileSync(cuesFile, JSON.stringify(soundCues(P.scenes)));
  execFileSync('python3', ['audio/sfx.py', audioPath, cuesFile, audioPath], { stdio: 'inherit' });
  fs.rmSync(cuesFile);
}

const out = path.resolve('work', `${code}.mp4`);
const args = ['remotion', 'render', 'src/index.ts', post.composition, out, `--props=${JSON.stringify({ ...post.props, ...(voice ? { words: voice.words, duration: voice.duration, story: undefined } : {}), audio })}`, '--log=error'];
const chrome = findChrome();
if (chrome) args.push(`--browser-executable=${chrome}`);
try {
  execFileSync('npx', args, { cwd: 'remotion', stdio: 'inherit' });
} finally {
  fs.rmSync(audioPath, { force: true });
  for (const f of fs.readdirSync('work')) if (f.startsWith(`${code}.`) && /\.(story\.txt|vo\.wav|words\.json)$/.test(f)) fs.rmSync(path.join('work', f));
}
fs.writeFileSync(path.join('work', `${code}.txt`), post.caption);
// Cover frame: when everything is on screen (just after the call to action appears), unless the plan says otherwise.
const cover = post.cover_seconds ?? Math.max(1, seconds - 1.5);
fs.writeFileSync(path.join('work', `${code}.cover`), String(Math.round(cover * 1000)));
console.log(`rendered work/${code}.mp4`);
