import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/500-italic.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import data from './words.json';

const FPS = 30;
export const reelDuration = 25 * FPS;

const INK = '#090c16';
const PAPER = '#f3ece0';
const MUTED = 'rgba(243,236,224,0.55)';
const BRASS = '#d9b46a';
const serif = 'Newsreader, Georgia, serif';
const sans = '"Instrument Sans", system-ui, sans-serif';

type W = {w: string; s: number; e: number};
const words = (data as {words: W[]}).words;

// story beats (seconds), taken from the voiceover timings
const DROP = 11.6; // "That's not it." — music cuts out
const PAYOFF = 13.45;
const CTA = 19.3;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// group words into caption chunks: hook sentence stays whole, then max 3 words, break on punctuation
type Chunk = {words: W[]; s: number; e: number};
const chunk = (list: W[], max: number): Chunk[] => {
  const out: Chunk[] = [];
  let cur: W[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const next = list[i + 1];
    const gap = next ? next.s - w.e : 99;
    if (cur.length >= max || /[.,?!]$/.test(w.w) || gap > 0.35) {
      out.push({words: cur, s: cur[0].s, e: next ? next.s : cur[cur.length - 1].e + 0.6});
      cur = [];
    }
  });
  return out;
};
const hook: Chunk = {words: words.slice(0, 7), s: 0, e: words[7].s};
const story = chunk(words.filter((w) => w.s >= words[7].s && w.s < DROP), 3);
const payoffWords = words.filter((w) => w.s >= PAYOFF && w.s < CTA);

// ---------- background: drifting mesh gradient + grain + vignette ----------
const Mesh: React.FC<{t: number}> = ({t}) => {
  const dark = interpolate(t, [DROP - 0.05, DROP, PAYOFF - 0.3, PAYOFF + 0.8], [1, 0.08, 0.08, 1], clamp);
  const warm = interpolate(t, [PAYOFF, 18.5, CTA + 1], [0, 1, 0.6], clamp);
  const blob = (x: number, y: number, r: number, c: string, o: number, k: number) => (
    <div
      style={{
        position: 'absolute',
        left: x + Math.sin(t * 0.35 + k) * 120,
        top: y + Math.cos(t * 0.28 + k * 1.7) * 140,
        width: r,
        height: r,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${c} 0%, ${c}00 68%)`,
        opacity: o * dark,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {blob(-200, 150, 900, '#2b2f6b', 0.9, 0)}
      {blob(500, 900, 1000, '#4a2148', 0.75, 2)}
      {blob(100, 1300, 800, '#1b3a5a', 0.7, 4)}
      {blob(300, 600, 700, BRASS, 0.22 + warm * 0.35, 1)}
      <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.13, mixBlendMode: 'overlay'}}>
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(t * 24) % 50} />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- the voicemail itself (the story's object) ----------
const Waveform: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 56, flex: 1}}>
    {Array.from({length: 34}).map((_, i) => {
      const h = 10 + Math.abs(Math.sin(i * 1.7) * 30 + Math.sin(i * 0.6) * 16);
      return <div key={i} style={{width: 6, height: h, borderRadius: 3, background: 'rgba(243,236,224,0.28)'}} />;
    })}
  </div>
);

const Voicemail: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14, mass: 0.7}});
  // "Every time I get a new phone..." — it gets carried over, twice
  const hop = (at: number) => {
    const p = interpolate(t, [at, at + 0.22, at + 0.23, at + 0.5], [0, -1, 1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
    return p * 1150;
  };
  const x = hop(5.55) + hop(7.0);
  const phones = ['', 'Moved to new phone', 'Moved to new phone'];
  const moved = t > 5.78 ? (t > 7.23 ? 2 : 1) : 0;
  const leave = interpolate(t, [DROP - 0.15, DROP], [1, 0], clamp);
  const back = interpolate(t, [18.3, 18.8, CTA - 0.2, CTA], [0, 1, 1, 0], clamp);
  const opacity = t < PAYOFF ? leave : back;
  const scale = t < PAYOFF ? interpolate(enter, [0, 1], [0.9, 1]) : 0.92;
  const dim = interpolate(t, [8.7, 9.2], [1, 0.55], clamp);
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 3));
  const toast = moved && interpolate(t, moved === 1 ? [5.8, 6.0, 6.8, 7.0] : [7.25, 7.45, 8.4, 8.6], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: t < PAYOFF ? 300 : 1180, left: 90, width: 900, opacity, transform: `translateX(${x}px) scale(${scale})`}}>
      <div
        style={{
          padding: '38px 42px',
          borderRadius: 36,
          background: 'rgba(20,24,44,0.72)',
          border: '1px solid rgba(243,236,224,0.10)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22}}>
          <div style={{width: 16, height: 16, borderRadius: 8, background: BRASS, opacity: pulse}} />
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 46, color: PAPER}}>Dad</div>
          <div style={{flex: 1}} />
          <div style={{fontFamily: sans, fontWeight: 500, fontSize: 30, color: t > 2.9 && t < 4.3 ? BRASS : MUTED}}>6 years ago</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, opacity: dim}}>
          <div style={{width: 84, height: 84, borderRadius: 42, border: `3px solid ${PAPER}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 0, height: 0, borderTop: '17px solid transparent', borderBottom: '17px solid transparent', borderLeft: `27px solid ${PAPER}`, marginLeft: 8}} />
          </div>
          <Waveform />
          <div style={{fontFamily: sans, fontWeight: 500, fontSize: 30, color: MUTED}}>0:47</div>
        </div>
      </div>
      <div style={{height: 70, display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
        <div style={{opacity: toast || 0, fontFamily: sans, fontWeight: 500, fontSize: 28, color: PAPER, background: 'rgba(243,236,224,0.12)', padding: '10px 24px', borderRadius: 999}}>
          {phones[moved]} ✓
        </div>
      </div>
    </div>
  );
};

// ---------- karaoke captions ----------
const Caption: React.FC<{c: Chunk; t: number; size: number; top: number}> = ({c, t, size, top}) => {
  const age = t - c.s;
  const pop = interpolate(age, [0, 0.12], [0.86, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <div style={{position: 'absolute', top, left: 70, right: 70, textAlign: 'center', transform: `scale(${pop})`}}>
      <span style={{fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -1, textWrap: 'balance', textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>
        {c.words.map((w, i) => {
          const on = t >= w.s;
          const now = t >= w.s && t < w.e + 0.05;
          return (
            <span key={i} style={{color: now ? BRASS : on ? PAPER : 'rgba(243,236,224,0.45)'}}>
              {w.w}{' '}
            </span>
          );
        })}
      </span>
    </div>
  );
};

export const WhisperReel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const active = story.find((c) => t >= c.s && t < c.e);
  const push = 1 + (t % 100) * 0.0025;
  const drift = `translate(${Math.sin(t * 0.7) * 4}px, ${Math.cos(t * 0.5) * 5}px)`;

  // "That's not it."
  const notIt = interpolate(t, [11.78, 11.9, PAYOFF - 0.25, PAYOFF], [0, 1, 1, 0], clamp);
  const notItScale = interpolate(t, [11.78, 13.4], [1.0, 1.08], clamp);

  const ctaIn = spring({frame: frame - CTA * FPS, fps: FPS, config: {damping: 16}});
  const ctaWords = words.filter((w) => w.s >= CTA);

  return (
    <AbsoluteFill style={{background: INK}}>
      <Audio src={staticFile('mix.wav')} />
      <AbsoluteFill style={{transform: `scale(${push}) ${drift}`}}>
        <Mesh t={t} />
      </AbsoluteFill>

      <Voicemail t={t} frame={frame} />

      {/* hook: on screen from frame 0, no fade */}
      {t < hook.e && <Caption c={hook} t={t} size={96} top={830} />}
      {active && <Caption c={active} t={t} size={108} top={900} />}

      {/* the turn */}
      {notIt > 0 && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: notIt}}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 130, color: PAPER, transform: `scale(${notItScale})`}}>That&rsquo;s not it.</div>
        </AbsoluteFill>
      )}

      {/* payoff: serif, words land as she says them */}
      {t >= PAYOFF && t < CTA && (
        <AbsoluteFill style={{justifyContent: 'center', padding: '0 90px', paddingBottom: 260, opacity: interpolate(t, [CTA - 0.3, CTA], [1, 0], clamp)}}>
          <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 500, fontSize: 92, lineHeight: 1.16, color: PAPER, textAlign: 'center', textWrap: 'balance'}}>
            {payoffWords.map((w, i) => {
              const o = interpolate(t, [w.s - 0.05, w.s + 0.15], [0, 1], clamp);
              const y = interpolate(t, [w.s - 0.05, w.s + 0.25], [18, 0], {...clamp, easing: Easing.out(Easing.cubic)});
              const gold = i >= payoffWords.length - 5;
              return (
                <span key={i} style={{display: 'inline-block', opacity: o, transform: `translateY(${y}px)`, color: gold ? BRASS : PAPER, marginRight: '0.24em'}}>
                  {w.w}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* end card */}
      {t >= CTA && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 90px', paddingBottom: 200}}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 100, lineHeight: 1.08, color: PAPER, textAlign: 'center', marginBottom: 40}}>
            {ctaWords.map((w, i) => (
              <span key={i} style={{opacity: interpolate(t, [w.s - 0.05, w.s + 0.12], [0.18, 1], clamp)}}>
                {w.w}{' '}
              </span>
            ))}
          </div>
          <div style={{opacity: interpolate(t, [22.8, 23.1], [0, 1], clamp), transform: `translateY(${interpolate(ctaIn, [0, 1], [30, 0])}px)`, textAlign: 'center'}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 40, color: INK, background: BRASS, padding: '22px 44px', borderRadius: 999, display: 'inline-block'}}>
              Comment WHISPER for the link
            </div>
            <div style={{fontFamily: serif, fontSize: 48, color: PAPER, marginTop: 40, letterSpacing: 1}}>Whispers</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
