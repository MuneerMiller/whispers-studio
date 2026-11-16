import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/500-italic.css';
import '@fontsource/noto-color-emoji/400.css';
import {timeline, FPS} from './storyboard-timing.mjs';

// A Reel told as a storyboard: a list of short animated scenes (kinetic text, chats, reveals, versus, lists...)
// with transitions and a gentle camera drift. No logos, no labels: just the content.
// Scene types: slam | type | chat | emoji | versus | redact | list | glitch | zoom | question
export type Scene = {
  type: 'slam' | 'type' | 'chat' | 'emoji' | 'versus' | 'redact' | 'list' | 'glitch' | 'zoom' | 'question';
  text?: string; sub?: string; emoji?: string; items?: string[]; left?: string; right?: string;
  messages?: {from: 'me' | 'them'; text: string}[];
  hidden?: string; // redact: the part revealed after the bar wipes away
  bg?: keyof typeof BGS; transition?: 'cut' | 'slide' | 'zoom' | 'flash'; dur?: number;
};
export type StoryboardProps = {scenes: Scene[]; tag?: string; audio?: string};

const BGS = {
  ink: ['#0a0d18', '#f6efe2', '#e2b964'],
  black: ['#000000', '#ffffff', '#ffd400'],
  red: ['#c8102e', '#ffffff', '#ffe066'],
  yellow: ['#ffd400', '#111111', '#c8102e'],
  blue: ['#1d4ed8', '#ffffff', '#ffd400'],
  pink: ['#ff4fa3', '#ffffff', '#111111'],
  green: ['#16a34a', '#ffffff', '#111111'],
  cream: ['#f6efe2', '#111111', '#c8102e'],
  purple: ['#3b1f6e', '#ffffff', '#ff4fa3'],
} as const;
const sans = '"Instrument Sans", "Noto Color Emoji", system-ui, sans-serif';
// Big emoji are drawn as Twemoji images (consistent everywhere, no font loading); small inline ones use the emoji font.
const twemojiUrl = (e: string) => {
  const cps = [...e].map((c) => c.codePointAt(0)!.toString(16));
  const seq = e.includes('\u200d') ? cps : cps.filter((c) => c !== 'fe0f');
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${seq.join('-')}.svg`;
};
const serif = 'Newsreader, "Noto Color Emoji", Georgia, serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.2, 0.9, 0.2, 1);
const back = (k = 2) => Easing.out(Easing.back(k));

export const storyboardMeta = ({props}: {props: StoryboardProps}) => {
  const tl = timeline(props.scenes);
  return {durationInFrames: Math.round(tl[tl.length - 1].end * FPS)};
};

const Slam: React.FC<{text: string; t: number; fg: string; accent: string}> = ({text, t, fg, accent}) => {
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0 26px', justifyContent: 'center', padding: '0 70px'}}>
      {words.map((w, i) => {
        const at = 0.12 + i * 0.28;
        const k = interpolate(t, [at, at + 0.16], [0, 1], {...clamp, easing: back(2.4)});
        const shake = t > at && t < at + 0.12 ? Math.sin(t * 120) * 6 : 0;
        const last = i === words.length - 1;
        return <span key={i} style={{display: 'inline-block', opacity: t < at ? 0 : 1, transform: `translate(${shake}px, 0) scale(${0.3 + 0.7 * k + (1 - k) * 1.6})`, fontFamily: sans, fontWeight: 700, fontSize: text.length > 60 ? 92 : text.length > 30 ? 112 : 138, lineHeight: 1.05, letterSpacing: -2, color: last ? accent : fg}}>{w}</span>;
      })}
    </div>
  );
};

const Chat: React.FC<{msgs: {from: 'me' | 'them'; text: string}[]; t: number}> = ({msgs, t}) => {
  let at = 0.6;
  const shown = msgs.map((m) => { const a = at; at += 0.5 + Math.min(1.8, m.text.length * 0.035); return {...m, a}; }).filter((m) => t >= m.a);
  return (
    <div style={{width: '100%', padding: '0 60px', display: 'flex', flexDirection: 'column', gap: 18}}>
      {shown.slice(-6).map((m, i) => {
        const k = interpolate(t - m.a, [0, 0.2], [0.6, 1], {...clamp, easing: back(2)});
        const me = m.from === 'me';
        return <div key={i} style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '80%', transform: `scale(${k})`, transformOrigin: me ? 'right bottom' : 'left bottom', background: me ? '#0b84fe' : '#e9e9eb', color: me ? '#fff' : '#111', fontFamily: sans, fontWeight: 500, fontSize: 50, lineHeight: 1.22, padding: '22px 32px', borderRadius: 42}}>{m.text}</div>;
      })}
    </div>
  );
};

const SceneView: React.FC<{s: Scene & {start: number; dur: number}; t: number}> = ({s, t}) => {
  const [bg, fg, accent] = BGS[s.bg ?? 'ink'];
  const local = t - s.start;
  const out = interpolate(local, [s.dur - 0.18, s.dur], [1, 0], clamp);
  const inK = interpolate(local, [0, 0.22], [0, 1], {...clamp, easing: ease});
  let enter = '';
  if (s.transition === 'slide' || s.transition === undefined) enter = `translateX(${(1 - inK) * 120}%)`;
  if (s.transition === 'zoom') enter = `scale(${1.6 - 0.6 * inK})`;
  const drift = `scale(${1 + local * 0.012})`; // slow push-in: the "camera" never sits still
  const flash = s.transition === 'flash' ? interpolate(local, [0, 0.12], [1, 0], clamp) : 0;
  let body: React.ReactNode = null;

  if (s.type === 'slam') body = <Slam text={s.text ?? ''} t={local} fg={fg} accent={accent} />;
  if (s.type === 'zoom') {
    const k = interpolate(local, [0, s.dur], [0.7, 1.25], {...clamp, easing: Easing.in(Easing.quad)});
    body = <div style={{transform: `scale(${k})`, fontFamily: sans, fontWeight: 700, fontSize: 120, lineHeight: 1.02, color: fg, textAlign: 'center', padding: '0 70px', letterSpacing: -2}}>{s.text}</div>;
  }
  if (s.type === 'glitch') {
    const j = local < 0.5 || Math.floor(local * 9) % 7 === 0;
    const dx = j ? (Math.sin(local * 97) * 14) : 0;
    const txt = {fontFamily: sans, fontWeight: 700, fontSize: 116, lineHeight: 1.04, textAlign: 'center' as const, padding: '0 70px', letterSpacing: -2};
    body = (
      <div style={{position: 'relative'}}>
        <div style={{...txt, color: '#ff004c', position: 'absolute', inset: 0, transform: `translate(${dx}px, ${-dx / 3}px)`, mixBlendMode: 'screen'}}>{s.text}</div>
        <div style={{...txt, color: '#00e5ff', position: 'absolute', inset: 0, transform: `translate(${-dx}px, ${dx / 3}px)`, mixBlendMode: 'screen'}}>{s.text}</div>
        <div style={{...txt, color: fg, position: 'relative'}}>{s.text}</div>
      </div>
    );
  }
  if (s.type === 'type') {
    const n = Math.floor(interpolate(local, [0.1, 0.1 + (s.text ?? '').length * 0.045], [0, (s.text ?? '').length], clamp));
    body = <div style={{fontFamily: serif, fontWeight: 500, fontSize: 96, lineHeight: 1.12, color: fg, padding: '0 80px'}}>{(s.text ?? '').slice(0, n)}<span style={{color: accent, opacity: Math.floor(local * 2.5) % 2 ? 0 : 1}}>|</span></div>;
  }
  if (s.type === 'chat') body = <Chat msgs={s.messages ?? []} t={local} />;
  if (s.type === 'emoji') {
    const k = interpolate(local, [0, 0.3], [0, 1], {...clamp, easing: back(3)});
    const wob = Math.sin(local * 8) * 6 * interpolate(local, [0.3, 1.2], [1, 0], clamp);
    body = (
      <div style={{textAlign: 'center'}}>
        <div style={{transform: `scale(${k}) rotate(${wob}deg)`, display: 'flex', justifyContent: 'center'}}>{s.emoji && <Img src={twemojiUrl(s.emoji)} style={{width: 380, height: 380}} />}</div>
        {s.text && <div style={{marginTop: 40, fontFamily: sans, fontWeight: 700, fontSize: 84, color: fg, padding: '0 70px', opacity: interpolate(local, [0.25, 0.5], [0, 1], clamp)}}>{s.text}</div>}
      </div>
    );
  }
  if (s.type === 'versus') {
    const l = interpolate(local, [0.05, 0.4], [-110, 0], {...clamp, easing: ease});
    const r = interpolate(local, [0.05, 0.4], [110, 0], {...clamp, easing: ease});
    const vs = interpolate(local, [0.85, 1.05], [0, 1], {...clamp, easing: back(3)});
    const card = {flex: 1, borderRadius: 36, padding: '60px 36px', fontFamily: sans, fontWeight: 700, fontSize: 64, lineHeight: 1.1, textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 560};
    body = (
      <div style={{display: 'flex', gap: 28, width: '100%', padding: '0 50px', alignItems: 'center', position: 'relative'}}>
        <div style={{...card, background: '#ffffff', color: '#111', transform: `translateX(${l}%)`}}>{s.left}</div>
        <div style={{...card, background: accent, color: bg, transform: `translateX(${r}%)`}}>{s.right}</div>
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${vs})`, width: 150, height: 150, borderRadius: 75, background: '#111', color: '#fff', fontFamily: sans, fontWeight: 700, fontSize: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '6px solid #fff'}}>VS</div>
      </div>
    );
  }
  if (s.type === 'redact') {
    const wipe = interpolate(local, [s.dur * 0.5, s.dur * 0.62], [1, 0], {...clamp, easing: ease});
    body = (
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 96, lineHeight: 1.12, color: fg, padding: '0 70px', textAlign: 'center'}}>
        {s.text}{' '}
        <span style={{position: 'relative', display: 'inline-block', color: accent}}>
          {s.hidden}
          <span style={{position: 'absolute', inset: '-4px -10px', background: fg, transformOrigin: 'right center', transform: `scaleX(${wipe})`, borderRadius: 8}} />
        </span>
      </div>
    );
  }
  if (s.type === 'list') {
    body = (
      <div style={{width: '100%', padding: '0 70px'}}>
        {s.text && <div style={{fontFamily: sans, fontWeight: 700, fontSize: 76, lineHeight: 1.08, color: fg, marginBottom: 40}}>{s.text}</div>}
        {(s.items ?? []).map((it, i) => {
          const at = 0.6 + i * 0.9;
          const k = interpolate(local, [at, at + 0.25], [0, 1], {...clamp, easing: back(2)});
          return <div key={i} style={{opacity: local < at ? 0 : 1, transform: `translateX(${(1 - k) * -60}px) scale(${0.9 + 0.1 * k})`, display: 'flex', gap: 24, alignItems: 'baseline', marginBottom: 22, fontFamily: sans, fontWeight: 700, fontSize: 60, lineHeight: 1.15, color: fg}}><span style={{color: accent}}>{i + 1}.</span><span>{it}</span></div>;
        })}
      </div>
    );
  }
  if (s.type === 'question') {
    const k = interpolate(local, [0, 0.35], [0, 1], {...clamp, easing: back(1.8)});
    body = (
      <div style={{transform: `scale(${k})`, textAlign: 'center', padding: '0 70px'}}>
        <div style={{fontFamily: serif, fontWeight: 500, fontSize: 110, lineHeight: 1.06, color: fg}}>{s.text}</div>
        {s.sub && <div style={{marginTop: 34, fontFamily: sans, fontWeight: 500, fontSize: 48, color: accent}}>{s.sub}</div>}
      </div>
    );
  }

  return (
    <AbsoluteFill style={{background: bg, opacity: out}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `${enter} ${drift}`}}>{body}</AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
    </AbsoluteFill>
  );
};

export const StoryboardReel: React.FC<StoryboardProps> = ({scenes, tag, audio}) => {
  // The emoji font is split into many small files; make sure the ones this video needs are loaded before any frame is captured.
  const [handle] = React.useState(() => delayRender('emoji font'));
  React.useEffect(() => {
    const chars = scenes.map((s) => `${s.emoji ?? ''}${s.text ?? ''}${s.sub ?? ''}${(s.items ?? []).join('')}`).join('');
    Promise.all([document.fonts.load('100px "Noto Color Emoji"', chars || '🙂'), document.fonts.load('700 100px "Instrument Sans"'), document.fonts.load('500 100px Newsreader')])
      .catch(() => null).then(() => continueRender(handle));
  }, [handle, scenes]);
  const t = useCurrentFrame() / FPS;
  const tl = timeline(scenes);
  const cur = tl.find((s) => t >= s.start && t < s.end) ?? tl[tl.length - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile(audio)} />}
      <SceneView key={tl.indexOf(cur)} s={cur} t={t} />
      {tag && <div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: 1, color: 'rgba(255,255,255,0.45)', mixBlendMode: 'difference'}}>{tag}</div>}
    </AbsoluteFill>
  );
};
