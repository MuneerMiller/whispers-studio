import React from 'react';
import {AbsoluteFill, Audio, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/newsreader/400.css';

// Storytime: a narrated story over a moving scene, with big word-by-word captions (the active word lit),
// the texts that matter popping in like real notifications, and a cliffhanger end card.
type Word = {w: string; s: number; e: number};
type Insert = {at: number; until?: number; from: string; text: string; kind?: 'text' | 'photo' | 'whisper'; meta?: string};
export type StoryTimeProps = {
  hook: string; words: Word[]; duration: number; inserts?: Insert[]; scene?: string; audio?: string;
  end?: string; tag?: boolean;
};
const sans = 'Instrument Sans, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const WhisperCard: React.FC<{ins: Insert; t: number}> = ({ins, t}) => {
  const k = interpolate(t - ins.at, [0, 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const out = ins.until ? interpolate(t - ins.until, [0, 0.25], [1, 0], clamp) : 1;
  const shown = Math.floor(ins.text.length * interpolate(t - ins.at, [0.3, 0.3 + ins.text.length * 0.035], [0, 1], clamp));
  return (
    <div style={{position: 'absolute', top: 190, left: 54, right: 54, opacity: Math.min(k, out), transform: `translateY(${(1 - k) * 60}px)`}}>
      <div style={{background: 'rgba(13,15,24,0.92)', border: '1.5px solid rgba(201,164,92,0.35)', borderRadius: 34, padding: '30px 34px', boxShadow: '0 24px 70px rgba(0,0,0,0.6)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: sans}}>
          <div style={{width: 46, height: 46, borderRadius: 23, border: '2px solid rgba(201,164,92,0.7)', display: 'grid', placeItems: 'center'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a45c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </div>
          <div style={{color: '#f6efe2', fontSize: 30, fontWeight: 700}}>Anonymous</div>
          <div style={{color: 'rgba(246,239,226,0.45)', fontSize: 26, fontWeight: 500}}>· {ins.meta ?? 'just now'}</div>
        </div>
        <div style={{marginTop: 18, color: '#f6efe2', fontFamily: 'Newsreader, Georgia, serif', fontSize: 46, lineHeight: 1.28, minHeight: 230}}>{ins.text.slice(0, shown)}</div>
      </div>
    </div>
  );
};

const Banner: React.FC<{ins: Insert; t: number}> = ({ins, t}) => {
  if (ins.kind === 'whisper') return <WhisperCard ins={ins} t={t} />;
  const k = interpolate(t - ins.at, [0, 0.28], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const out = ins.until ? interpolate(t - ins.until, [0, 0.25], [1, 0], clamp) : 1;
  return (
    <div style={{position: 'absolute', top: 210, left: 48, right: 48, opacity: Math.min(k, out), transform: `translateY(${(1 - k) * -120}px) scale(${0.96 + 0.04 * k})`}}>
      <div style={{background: 'rgba(30,30,32,0.86)', backdropFilter: 'blur(20px)', borderRadius: 38, padding: '26px 30px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: sans}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 58, height: 58, borderRadius: 14, background: 'linear-gradient(#5cf777,#0bbd2a)', display: 'grid', placeItems: 'center'}}>
            <svg width="34" height="34" viewBox="0 0 24 24"><path fill="#fff" d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1-.2 1.3-.9 2.6-2 3.6 2.1-.1 3.9-.9 5.2-2 1.1.3 2.2.4 3.4.4 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>
          </div>
          <div style={{flex: 1, color: '#fff', fontSize: 34, fontWeight: 700}}>{ins.from}</div>
          <div style={{color: 'rgba(255,255,255,0.5)', fontSize: 28, fontWeight: 500}}>now</div>
        </div>
        {ins.kind === 'photo'
          ? <div style={{marginTop: 18, height: 260, borderRadius: 22, background: 'linear-gradient(160deg,#2a2f45,#0d0f18)', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 62% 58%, rgba(255,190,90,0.55), transparent 70%), radial-gradient(18% 12% at 30% 64%, rgba(255,60,60,0.5), transparent 70%)', filter: 'blur(6px)'}} />
              <div style={{position: 'absolute', bottom: 14, left: 18, color: 'rgba(255,255,255,0.8)', fontSize: 26, fontWeight: 500}}>{ins.text}</div>
            </div>
          : <div style={{marginTop: 12, color: '#fff', fontSize: 40, lineHeight: 1.25, fontWeight: 500}}>{ins.text}</div>}
      </div>
    </div>
  );
};

export const StoryTime: React.FC<StoryTimeProps> = ({hook, words, duration, inserts = [], scene = 'scene-bedroom.mp4', audio, end, tag = true}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / 30;
  const endAt = duration + 0.2;
  // captions: up to 3 words, breaking at punctuation
  const chunks: {ws: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w); const next = words[i + 1];
    if (cur.length >= 3 || /[.,?!:…]$/.test(w.w) || !next) { chunks.push({ws: cur, s: cur[0].s, e: next ? next.s : w.e + 0.4}); cur = []; }
  });
  const c = t < endAt ? (chunks.find((ch) => t >= ch.s && t < ch.e) ?? (t < (chunks[0]?.s ?? 0) ? chunks[0] : undefined)) : undefined;
  const zoom = 1.08 + 0.12 * (frame / durationInFrames);
  const hookOn = t < 2.6;
  const ins = inserts.filter((i) => t >= i.at && t < (i.until ?? i.at + 3.2) + 0.25);
  const insertUp = ins.length > 0;
  const endK = interpolate(t - endAt, [0, 0.3], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile(audio)} />}
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Loop durationInFrames={150}><OffthreadVideo src={staticFile(scene)} startFrom={30} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Loop>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.6) 100%)'}} />
      {hookOn && (
        <div style={{position: 'absolute', top: 230, left: 70, right: 70, textAlign: 'center', opacity: interpolate(t, [2.3, 2.6], [1, 0], clamp)}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 58, lineHeight: 1.32, color: '#111', background: '#fff', padding: '8px 20px', borderRadius: 16, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span>
        </div>
      )}
      {ins.map((i, n) => <Banner key={n} ins={i} t={t} />)}
      {c && (
        <div style={{position: 'absolute', top: 1020, left: 40, right: 40, textAlign: 'center', transform: `scale(${interpolate(t - c.s, [0, 0.09], [0.82, 1], clamp)})`}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 116, lineHeight: 1.04, letterSpacing: -2, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textTransform: 'lowercase'}}>
            {c.ws.map((w, i) => <span key={i} style={{color: t >= w.s && t < w.e + 0.1 ? '#FFE14D' : '#fff'}}>{w.w}{i < c.ws.length - 1 ? ' ' : ''}</span>)}
          </span>
        </div>
      )}
      {end && t >= endAt && (
        <div style={{position: 'absolute', top: 820, left: 60, right: 60, textAlign: 'center', opacity: endK, transform: `scale(${0.9 + 0.1 * endK})`}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 96, lineHeight: 1.1, color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill'}}>{end}</span>
        </div>
      )}
      {tag && <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>dramatised</div>}
    </AbsoluteFill>
  );
};
