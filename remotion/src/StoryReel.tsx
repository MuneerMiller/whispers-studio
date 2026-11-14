import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/newsreader/500.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import data from './words3.json';

const FPS = 30;
export const storyDuration = Math.ceil((data as {duration: number}).duration * FPS);

const INK = '#0a0d18';
const PAPER = '#f6efe2';
const BRASS = '#e2b964';
const PALETTE = ['#e2b964', '#d98aa3', '#9b7fe0', '#5fb3c4', '#7fd1a8', '#f0956b'];
const serif = 'Newsreader, Georgia, serif';
const sans = '"Instrument Sans", system-ui, sans-serif';

type W = {w: string; s: number; e: number};
const D = data as unknown as {
  words: W[];
  marks: Record<string, [number, number]>;
  sim: {cx: number; cy: number; R: number; frames: [number, number, number][]};
  bounces: number[];
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Chunk = {words: W[]; s: number; e: number};
const chunks: Chunk[] = [];
{
  let cur: W[] = [];
  D.words.forEach((w, i) => {
    cur.push(w);
    const next = D.words[i + 1];
    const gap = next ? next.s - w.e : 99;
    if (cur.length >= 3 || /[.,?!]$/.test(w.w) || gap > 0.3) {
      chunks.push({words: cur, s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.5) : w.e + 0.8});
      cur = [];
    }
  });
}

const WHISPERS = [
  {key: 'w1', n: 4821, place: 'South Africa'},
  {key: 'w2', n: 5106, place: 'United Kingdom'},
  {key: 'w3', n: 5390, place: 'United States'},
  {key: 'w4', n: 5577, place: 'South Africa'},
];

const Physics: React.FC<{frame: number}> = ({frame}) => {
  const {cx, cy, R, frames} = D.sim;
  const f = Math.min(frame, frames.length - 1);
  const bounceCount = D.bounces.filter((b) => b <= frame / FPS).length;
  const lastBounce = D.bounces.filter((b) => b <= frame / FPS).pop() ?? -9;
  const flash = interpolate(frame / FPS - lastBounce, [0, 0.25], [1, 0], clamp);
  const trail = [] as React.ReactNode[];
  for (let k = 36; k >= 0; k -= 2) {
    const i = f - k;
    if (i < 0) continue;
    const [x, y, r] = frames[i];
    const c = PALETTE[(bounceCount + Math.floor(k / 12)) % PALETTE.length];
    trail.push(<circle key={k} cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={3} opacity={(1 - k / 38) * 0.55} />);
  }
  const [x, y, r] = frames[f];
  const col = PALETTE[bounceCount % PALETTE.length];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="ballg" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="35%" stopColor={col} />
          <stop offset="100%" stopColor={col} stopOpacity={0.75} />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <circle cx={cx} cy={cy} r={R + 6} fill="none" stroke={col} strokeWidth={10} opacity={0.25 + flash * 0.5} filter="url(#glow)" />
      <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,0.025)" stroke={PAPER} strokeOpacity={0.55 + flash * 0.4} strokeWidth={6} />
      {trail}
      <circle cx={x} cy={y} r={r + 10} fill={col} opacity={0.35} filter="url(#glow)" />
      <circle cx={x} cy={y} r={r} fill="url(#ballg)" stroke={PAPER} strokeWidth={4} />
    </svg>
  );
};

const Header: React.FC<{t: number}> = ({t}) => {
  const idx = WHISPERS.findIndex((w) => t >= D.marks[w.key][0] - 0.05 && t < D.marks[w.key][1] + 0.6);
  if (idx < 0) return null;
  const w = WHISPERS[idx];
  const start = D.marks[w.key][0];
  const age = t - start;
  const pop = interpolate(age, [0, 0.18], [0.85, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
  const o = idx === 0 ? 1 : interpolate(age, [0, 0.12], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 250, left: 90, right: 90, opacity: o, transform: `scale(${pop})`}}>
      <div style={{background: PAPER, borderRadius: 30, padding: '26px 32px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.45)'}}>
        <div style={{width: 76, height: 76, borderRadius: 38, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 44, color: BRASS}}>W</div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, color: INK}}>Anonymous · {w.place}</div>
          <div style={{fontFamily: sans, fontWeight: 500, fontSize: 28, color: 'rgba(10,13,24,0.6)'}}>Whisper #{w.n} on Whispers</div>
        </div>
        <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: INK, background: BRASS, borderRadius: 999, padding: '8px 20px'}}>{idx + 1}/4</div>
      </div>
    </div>
  );
};

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = chunks.find((ch) => t >= ch.s && t < ch.e);
  if (!c || t >= D.words.find((w) => w.w === 'Which')!.s - 0.1) return null;
  const pop = interpolate(t - c.s, [0, 0.1], [0.8, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  return (
    <div style={{position: 'absolute', top: 560, left: 50, right: 50, textAlign: 'center', transform: `scale(${pop})`}}>
      <span style={{fontFamily: sans, fontWeight: 700, fontSize: 118, lineHeight: 1.05, letterSpacing: -2, WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,0.6)'}}>
        {c.words.map((w, i) => (
          <span key={i} style={{color: t >= w.s && t < w.e + 0.08 ? BRASS : PAPER}}>
            {w.w}{i < c.words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </div>
  );
};

const Title: React.FC<{t: number}> = ({t}) => {
  if (t >= D.marks.cta[0]) return null;
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16}}>
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 40, color: PAPER, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>Things people never say out loud</div>
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 30, color: INK, background: BRASS, borderRadius: 999, padding: '6px 16px'}}>Pt 1</div>
    </div>
  );
};

const Cta: React.FC<{t: number}> = ({t}) => {
  const s = D.words.find((w) => w.w === 'Which')!.s - 0.1;
  if (t < s) return null;
  const words = D.words.slice(D.words.findIndex((w) => w.w === 'Which'));
  const pop = interpolate(t - s, [0, 0.2], [0.85, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <div style={{transform: `scale(${pop})`, width: 900, background: PAPER, borderRadius: 40, padding: '56px 56px 48px', textAlign: 'center', boxShadow: '0 30px 90px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: serif, fontWeight: 500, fontSize: 84, lineHeight: 1.08, color: INK}}>
          {words.slice(0, 8).map((w, i) => (
            <span key={i} style={{opacity: t >= w.s - 0.05 ? 1 : 0.15}}>{w.w} </span>
          ))}
        </div>
        <div style={{marginTop: 40, display: 'inline-block', fontFamily: sans, fontWeight: 700, fontSize: 46, color: PAPER, background: INK, borderRadius: 999, padding: '22px 44px', opacity: interpolate(t, [words[9]?.s ?? s + 2, (words[9]?.s ?? s + 2) + 0.2], [0, 1], clamp)}}>
          Comment <span style={{color: BRASS}}>WHISPER</span>
        </div>
        <div style={{marginTop: 26, fontFamily: sans, fontWeight: 500, fontSize: 30, color: 'rgba(10,13,24,0.6)'}}>Say yours anonymously on Whispers</div>
      </div>
    </AbsoluteFill>
  );
};

export const StoryReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 62%, #1c1838 0%, ${INK} 70%)`}}>
      <Audio src={staticFile('mix3.wav')} />
      <Physics frame={frame} />
      <Title t={t} />
      <Header t={t} />
      <Captions t={t} />
      <Cta t={t} />
    </AbsoluteFill>
  );
};
