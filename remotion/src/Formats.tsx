import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/500-italic.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import {EscapeRing, BallDrop, Spiro, Footage} from './Backgrounds';
import vData from './wordsv.json';

const FPS = 30;
const INK = '#0a0d18';
const PAPER = '#f6efe2';
const BRASS = '#e2b964';
const serif = 'Newsreader, Georgia, serif';
const sans = '"Instrument Sans", system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
type W = {w: string; s: number; e: number};

const chunkWords = (words: W[]) => {
  const out: {words: W[]; s: number; e: number}[] = [];
  let cur: W[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (cur.length >= 3 || /[.,?!]$/.test(w.w) || (next && next.s - w.e > 0.3) || !next) {
      out.push({words: cur, s: cur[0].s, e: next ? Math.min(next.s, w.e + 0.5) : w.e + 0.6});
      cur = [];
    }
  });
  return out;
};

const BigCaption: React.FC<{t: number; words: W[]; top: number}> = ({t, words, top}) => {
  const chunks = React.useMemo(() => chunkWords(words), [words]);
  const c = chunks.find((ch) => t >= ch.s && t < ch.e);
  if (!c) return null;
  const pop = interpolate(t - c.s, [0, 0.1], [0.8, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  return (
    <div style={{position: 'absolute', top, left: 50, right: 50, textAlign: 'center', transform: `scale(${pop})`}}>
      <span style={{fontFamily: sans, fontWeight: 700, fontSize: 118, lineHeight: 1.05, letterSpacing: -2, WebkitTextStroke: '14px #000', paintOrder: 'stroke fill'}}>
        {c.words.map((w, i) => (
          <span key={i} style={{color: t >= w.s && t < w.e + 0.08 ? BRASS : PAPER}}>
            {w.w}{i < c.words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </div>
  );
};

// ================= Format: VERDICT ("Is she wrong for this?") =================
const V = vData as unknown as {words: W[]; marks: Record<string, [number, number]>};
export const verdictDuration = Math.ceil(16.5 * FPS);
export const VerdictReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const qStart = V.marks.q[0];
  const words = V.words.filter((w) => w.s < qStart - 0.05);
  const end = t >= qStart - 0.05;
  const vote = (side: number) => interpolate(t, [qStart + side * 0.25, qStart + side * 0.25 + 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 62%, #241632 0%, ${INK} 70%)`}}>
      <Audio src={staticFile('mixv.wav')} />
      <EscapeRing frame={frame} />
      {/* persistent question = the hook, on frame 0 */}
      <div style={{position: 'absolute', top: 150, left: 70, right: 70, textAlign: 'center'}}>
        <span style={{fontFamily: sans, fontWeight: 700, fontSize: 64, color: INK, background: BRASS, padding: '10px 26px', borderRadius: 20, boxDecorationBreak: 'clone'}}>Is she wrong for this?</span>
      </div>
      {!end && <BigCaption t={t} words={words} top={430} />}
      {end && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 380, gap: 34}}>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 70, color: PAPER, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textAlign: 'center'}}>Comment your verdict</div>
          <div style={{display: 'flex', gap: 30}}>
            <div style={{transform: `scale(${vote(0)})`, fontFamily: sans, fontWeight: 700, fontSize: 56, color: PAPER, background: '#c2414b', padding: '22px 40px', borderRadius: 999}}>🔴 Wrong</div>
            <div style={{transform: `scale(${vote(1)})`, fontFamily: sans, fontWeight: 700, fontSize: 56, color: INK, background: '#7fd1a8', padding: '22px 40px', borderRadius: 999}}>🟢 Not wrong</div>
          </div>
          <div style={{opacity: vote(2), fontFamily: sans, fontWeight: 500, fontSize: 34, color: PAPER, marginTop: 10}}>Say yours anonymously · Whispers</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ================= Format: AESTHETIC B-ROLL (no voice; swap in a trending sound when posting) =================
const LINES = ['I still have my dad’s', 'last voicemail.', 'It’s been six years.', 'I’ve never played it.', 'As long as I don’t,', 'there’s still one thing', 'he said to me', 'that I haven’t heard yet.'];
export const brollDuration = 12 * FPS;
export const BrollReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: INK}}>
      <Audio src={staticFile('mixb.wav')} />
      <Footage src="rain.mp4" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 90px'}}>
        <div style={{textAlign: 'center'}}>
          {LINES.map((l, i) => {
            const at = i < 2 ? 0 : 0.9 + i * 1.05; // first two lines on frame 0 = the hook
            const o = i < 2 ? 1 : interpolate(t, [at, at + 0.5], [0, 1], clamp);
            const last = i >= 5;
            return (
              <div key={i} style={{opacity: o, fontFamily: serif, fontStyle: last ? 'italic' : 'normal', fontWeight: 500, fontSize: 76, lineHeight: 1.18, color: last ? BRASS : PAPER, textShadow: '0 4px 30px rgba(0,0,0,0.8)', marginTop: i === 2 || i === 4 ? 30 : 0}}>
                {l}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 32, color: PAPER, opacity: interpolate(t, [9.5, 10.2], [0, 0.9], clamp)}}>
        whispered anonymously on Whispers
      </div>
    </AbsoluteFill>
  );
};

// ================= Background previews (for showing the library) =================
export const BgPreview: React.FC<{kind: 'drop' | 'spiro'}> = ({kind}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 62%, #1c1838 0%, ${INK} 70%)`}}>
      {kind === 'drop' ? <BallDrop frame={frame} /> : <Spiro frame={frame} />}
    </AbsoluteFill>
  );
};

// ================= Format: CAROUSEL / PHOTO MODE (1080x1350 stills; frame = slide index) =================
const SLIDES = [
  {kind: 'cover', text: '6 things people only admit anonymously'},
  {kind: 'w', n: 5106, text: 'I tell everyone I’m allergic to cats. I’m not. My ex had one.'},
  {kind: 'w', n: 5390, text: 'I go to the gym at 5 a.m. Not for fitness. It’s the only hour nobody needs me.'},
  {kind: 'w', n: 4821, text: 'My wedding ring is fake. I sold the real one to cover rent.'},
  {kind: 'w', n: 5212, text: 'I still set a place at the table for my grandmother on Sundays.'},
  {kind: 'w', n: 5480, text: 'I pretend my phone died to get out of calls. It has never died.'},
  {kind: 'w', n: 5577, text: 'I’ve never played my dad’s last voicemail.'},
  {kind: 'cta', text: 'Which one is you?'},
];
export const carouselCount = SLIDES.length;
export const Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  const s = SLIDES[Math.min(frame, SLIDES.length - 1)];
  const bg = `radial-gradient(80% 60% at ${30 + (frame * 13) % 40}% 75%, ${['#3a2150', '#1d3550', '#4a2638', '#24304f'][frame % 4]} 0%, ${INK} 70%)`;
  return (
    <AbsoluteFill style={{background: bg, padding: 90, justifyContent: 'center'}}>
      {s.kind === 'cover' && (
        <>
          <div style={{fontFamily: serif, fontSize: 108, lineHeight: 1.04, color: PAPER}}>{s.text}</div>
          <div style={{marginTop: 50, fontFamily: sans, fontWeight: 700, fontSize: 36, color: BRASS}}>swipe →</div>
        </>
      )}
      {s.kind === 'w' && (
        <>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: BRASS, letterSpacing: 4, marginBottom: 36}}>#{s.n}</div>
          <div style={{fontFamily: serif, fontSize: 84, lineHeight: 1.14, color: PAPER}}>“{s.text}”</div>
          <div style={{position: 'absolute', bottom: 80, left: 90, fontFamily: sans, fontWeight: 500, fontSize: 30, color: 'rgba(246,239,226,0.6)'}}>
            {frame}/{SLIDES.length - 2} · anonymous · Whispers
          </div>
        </>
      )}
      {s.kind === 'cta' && (
        <>
          <div style={{fontFamily: serif, fontSize: 110, color: PAPER}}>{s.text}</div>
          <div style={{marginTop: 40, fontFamily: sans, fontWeight: 500, fontSize: 44, color: PAPER, opacity: 0.85}}>Tell us the number in the comments.</div>
          <div style={{marginTop: 60, alignSelf: 'flex-start', fontFamily: sans, fontWeight: 700, fontSize: 42, color: INK, background: BRASS, padding: '20px 40px', borderRadius: 999}}>Say yours anonymously · Whispers</div>
        </>
      )}
    </AbsoluteFill>
  );
};
