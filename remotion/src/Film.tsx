import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/newsreader/400.css';

// Film: a short story cut like a film. Each shot covers part of the narration; captions run on top.
// Shot types: scene (a rendered clip), chat (a group chat on the phone), notify (a message dropping in
// over a scene), whispers (the Whispers app opening on a post that types itself), zoom (one word lit),
// call (a call screen). Whispers is one shot in the story, never the point of it.
type Word = {w: string; s: number; e: number};
type Msg = {from: string; text: string; me?: boolean; at: number};
export type Shot =
  | {type: 'scene'; at: number; src: string; push?: number; tint?: string}
  | {type: 'chat'; at: number; title: string; msgs: Msg[]}
  | {type: 'notify'; at: number; src: string; from: string; text: string; delay?: number}
  | {type: 'whispers'; at: number; text: string; meta?: string; highlight?: string}
  | {type: 'zoom'; at: number; text: string; word: string}
  | {type: 'call'; at: number; name: string; connectAt?: number};
export type FilmProps = {hook: string; words: Word[]; duration: number; shots: Shot[]; audio?: string; end?: string; tag?: boolean};

const sans = 'Instrument Sans, system-ui, sans-serif';
const serif = 'Newsreader, Georgia, serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

const Scene: React.FC<{src: string; t: number; len: number; push?: number; tint?: string}> = ({src, t, len, push = 0.1, tint}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${1.04 + push * Math.min(1, t / Math.max(len, 0.1))})`}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
    {tint && <AbsoluteFill style={{background: tint}} />}
  </AbsoluteFill>
);

// iPhone-ish chat screen, full frame (screen-recording style)
export const Chat: React.FC<{title: string; msgs: Msg[]; t: number}> = ({title, msgs, t}) => (
  <AbsoluteFill style={{background: '#000', fontFamily: sans}}>
    <div style={{height: 250, background: 'rgba(28,28,30,0.96)', borderBottom: '1px solid #2c2c2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 26}}>
      <div style={{width: 92, height: 92, borderRadius: 46, background: 'linear-gradient(#8e8e93,#636366)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 40, fontWeight: 700}}>{title.slice(0, 1)}</div>
      <div style={{color: '#fff', fontSize: 30, marginTop: 10, fontWeight: 500}}>{title}</div>
    </div>
    <div style={{padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: 14}}>
      {msgs.filter((m) => t >= m.at).map((m, i) => {
        const k = interpolate(t - m.at, [0, 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
        return (
          <div key={i} style={{alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '78%', transform: `scale(${0.7 + 0.3 * k})`, opacity: k, transformOrigin: m.me ? 'right bottom' : 'left bottom'}}>
            {!m.me && <div style={{color: '#8e8e93', fontSize: 24, margin: '0 0 6px 18px'}}>{m.from}</div>}
            <div style={{background: m.me ? '#0b84fe' : '#26252a', color: '#fff', fontSize: 40, lineHeight: 1.25, padding: '18px 26px', borderRadius: 38}}>{m.text}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

const Notify: React.FC<{src: string; from: string; text: string; t: number; len: number; delay?: number}> = ({src, from, text, t, len, delay = 0.3}) => {
  const k = interpolate(t - delay, [0, 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.5))});
  return (
    <AbsoluteFill>
      <Scene src={src} t={t} len={len} />
      <div style={{position: 'absolute', top: 160, left: 40, right: 40, transform: `translateY(${(1 - k) * -200}px)`, opacity: k}}>
        <div style={{background: 'rgba(40,40,44,0.9)', borderRadius: 40, padding: '26px 30px', fontFamily: sans, boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(#5cf777,#0bbd2a)'}} />
            <div style={{flex: 1, color: '#fff', fontSize: 32, fontWeight: 700}}>{from}</div>
            <div style={{color: 'rgba(255,255,255,0.5)', fontSize: 26}}>now</div>
          </div>
          <div style={{marginTop: 12, color: '#fff', fontSize: 38, lineHeight: 1.25}}>{text}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The Whispers app: the feed slides up, one post types itself; a word can be lit at the end.
export const Whispers: React.FC<{text: string; meta?: string; highlight?: string; t: number}> = ({text, meta = '2:14 AM', highlight, t}) => {
  const open = interpolate(t, [0, 0.35], [0, 1], {...clamp, easing: ease});
  const shown = Math.floor(text.length * interpolate(t, [0.45, 0.45 + text.length * 0.04], [0, 1], clamp));
  const done = shown >= text.length;
  const parts = highlight && done ? text.split(highlight) : [text.slice(0, shown)];
  return (
    <AbsoluteFill style={{background: '#0b0d16', transform: `translateY(${(1 - open) * 300}px)`, opacity: open}}>
      <div style={{height: 230, display: 'flex', alignItems: 'flex-end', padding: '0 44px 24px', gap: 14, borderBottom: '1px solid rgba(201,164,92,0.18)'}}>
        <div style={{width: 52, height: 52, borderRadius: 26, border: '2px solid rgba(201,164,92,0.75)', display: 'grid', placeItems: 'center'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a45c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        </div>
        <div style={{fontFamily: serif, fontSize: 46, color: '#f6efe2'}}>Whispers</div>
      </div>
      <div style={{margin: '40px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,164,92,0.25)', borderRadius: 32, padding: '34px 36px'}}>
        <div style={{fontFamily: sans, color: 'rgba(246,239,226,0.55)', fontSize: 28}}>Anonymous · {meta}</div>
        <div style={{marginTop: 20, fontFamily: serif, color: '#f6efe2', fontSize: 52, lineHeight: 1.3, minHeight: 300}}>
          {highlight && done
            ? parts.map((p, i) => <React.Fragment key={i}>{p}{i < parts.length - 1 && <span style={{background: '#FFE14D', color: '#111', borderRadius: 8, padding: '0 6px'}}>{highlight}</span>}</React.Fragment>)
            : parts[0]}
          {!done && <span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>|</span>}
        </div>
      </div>
      {[0, 1].map((i) => <div key={i} style={{margin: '0 40px 28px', height: 220, borderRadius: 32, background: 'rgba(255,255,255,0.025)', filter: 'blur(2px)'}} />)}
    </AbsoluteFill>
  );
};

const Zoom: React.FC<{text: string; word: string; t: number}> = ({text, word, t}) => {
  const z = interpolate(t, [0, 0.6], [1, 2.4], {...clamp, easing: ease});
  const [a, ...rest] = text.split(word);
  return (
    <AbsoluteFill style={{background: '#0b0d16', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${z})`, fontFamily: serif, color: 'rgba(246,239,226,0.5)', fontSize: 44, textAlign: 'center', padding: 60}}>
        {a}<span style={{color: '#111', background: '#FFE14D', borderRadius: 8, padding: '0 8px'}}>{word}</span>{rest.join(word)}
      </div>
    </AbsoluteFill>
  );
};

const Call: React.FC<{name: string; t: number; connectAt?: number}> = ({name, t, connectAt}) => {
  const on = connectAt != null && t >= connectAt;
  const secs = on ? Math.floor(t - connectAt!) : 0;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#3a3a3c,#1c1c1e)', alignItems: 'center', fontFamily: sans}}>
      <div style={{marginTop: 330, color: '#fff', fontSize: 84, fontWeight: 500}}>{name}</div>
      <div style={{marginTop: 18, color: 'rgba(255,255,255,0.65)', fontSize: 38}}>{on ? `00:0${secs}` : `calling${'...'.slice(0, 1 + (Math.floor(t * 2) % 3))}`}</div>
      <div style={{position: 'absolute', bottom: 260, width: 150, height: 150, borderRadius: 75, background: '#ff3b30', display: 'grid', placeItems: 'center'}}>
        <svg width="70" height="70" viewBox="0 0 24 24"><path fill="#fff" d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85a.993.993 0 0 1-1.4 0L.29 13.08a.996.996 0 0 1 0-1.41C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48a.993.993 0 0 1-1.4 0c-.79-.73-1.68-1.36-2.66-1.85a1 1 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
      </div>
    </AbsoluteFill>
  );
};

export const Film: React.FC<FilmProps> = ({hook, words, duration, shots, audio, end, tag = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const endAt = duration + 0.2;
  const idx = shots.reduce((k, s, i) => (t >= s.at ? i : k), 0);
  const shot = shots[idx];
  const st = t - shot.at;
  const len = (shots[idx + 1]?.at ?? endAt + 2.4) - shot.at;
  // a quick flash on every cut keeps the pace
  const cut = idx > 0 ? interpolate(st, [0, 0.12], [0.35, 0], clamp) : 0;
  const chunks: {ws: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w); const next = words[i + 1];
    if (cur.length >= 3 || /[.,?!:…]$/.test(w.w) || !next) { chunks.push({ws: cur, s: cur[0].s, e: next ? next.s : w.e + 0.4}); cur = []; }
  });
  const c = t < endAt ? (chunks.find((ch) => t >= ch.s && t < ch.e) ?? (t < (chunks[0]?.s ?? 0) ? chunks[0] : undefined)) : undefined;
  const capTop = shot.type === 'chat' || shot.type === 'whispers' ? 1380 : 1040;
  const endK = interpolate(t - endAt, [0, 0.3], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile(audio)} />}
      {shot.type === 'scene' && <Scene src={shot.src} t={st} len={len} push={shot.push} tint={shot.tint} />}
      {shot.type === 'chat' && <Chat title={shot.title} msgs={shot.msgs.map((m) => ({...m, at: m.at}))} t={st} />}
      {shot.type === 'notify' && <Notify src={shot.src} from={shot.from} text={shot.text} t={st} len={len} delay={shot.delay} />}
      {shot.type === 'whispers' && <Whispers text={shot.text} meta={shot.meta} highlight={shot.highlight} t={st} />}
      {shot.type === 'zoom' && <Zoom text={shot.text} word={shot.word} t={st} />}
      {shot.type === 'call' && <Call name={shot.name} t={st} connectAt={shot.connectAt} />}
      <AbsoluteFill style={{background: '#fff', opacity: cut}} />
      {t < 2.4 && (
        <div style={{position: 'absolute', top: 200, left: 70, right: 70, textAlign: 'center', opacity: interpolate(t, [2.1, 2.4], [1, 0], clamp)}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 56, lineHeight: 1.32, color: '#111', background: '#fff', padding: '8px 20px', borderRadius: 16, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span>
        </div>
      )}
      {c && (
        <div style={{position: 'absolute', top: capTop, left: 40, right: 40, textAlign: 'center', transform: `scale(${interpolate(t - c.s, [0, 0.09], [0.82, 1], clamp)})`}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 108, lineHeight: 1.04, letterSpacing: -2, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textTransform: 'lowercase'}}>
            {c.ws.map((w, i) => <span key={i} style={{color: t >= w.s && t < w.e + 0.1 ? '#FFE14D' : '#fff'}}>{w.w}{i < c.ws.length - 1 ? ' ' : ''}</span>)}
          </span>
        </div>
      )}
      {end && t >= endAt && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${0.6 * endK})`, alignItems: 'center', justifyContent: 'center'}}>
          <span style={{opacity: endK, transform: `scale(${0.9 + 0.1 * endK})`, fontFamily: sans, fontWeight: 700, fontSize: 104, color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill'}}>{end}</span>
        </AbsoluteFill>
      )}
      {tag && <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>dramatised</div>}
    </AbsoluteFill>
  );
};
