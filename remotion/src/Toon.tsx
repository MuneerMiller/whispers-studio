import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/newsreader/400.css';
import {Chat, Whispers} from './Film';

// Toon: cartoon characters acting out a story. A character is a puppet with a look (skin, hair, top)
// and, per moment, an emotion and a pose. A shot is a camera move over a set (here: the dinner table)
// plus what each character feels and does during it. Captions run on top, like the Film format.
export type Emotion = 'neutral' | 'happy' | 'smirk' | 'shocked' | 'angry' | 'sad' | 'guilty' | 'cry';
export type Look = {skin: string; hair: string; hairStyle: 'long' | 'short' | 'bun' | 'bald'; top: string; beard?: boolean; grey?: boolean};
type Act = {emotion?: Emotion; look?: 'left' | 'right' | 'front' | 'down'; lift?: boolean; sweat?: boolean; lean?: number; phone?: boolean};
type Word = {w: string; s: number; e: number};
export type ToonShot = {at: number; cam: {x: number; y: number; zoom: number}; camTo?: {x: number; y: number; zoom: number}; acts?: Record<string, Act>; insert?: 'screenshot'; shake?: boolean};
export type ToonProps = {words: Word[]; duration: number; shots: ToonShot[]; cast: Record<string, Look & {x: number}>; audio?: string; hook?: string; end?: string; tag?: boolean};

const sans = 'Instrument Sans, system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

const Brows: React.FC<{e: Emotion}> = ({e}) => {
  const tilt = -({angry: 14, shocked: -8, sad: -14, cry: -16, guilty: -10, smirk: 6, happy: -3, neutral: 0}[e]);
  const lift = {shocked: -14, sad: -4, cry: -4, guilty: -6, angry: 6, smirk: 0, happy: -4, neutral: 0}[e];
  return (<g stroke="#2a1d17" strokeWidth={7} strokeLinecap="round">
    <line x1={-46} y1={-34 + lift + tilt / 2} x2={-16} y2={-36 + lift - tilt / 2} />
    <line x1={16} y1={-36 + lift - (e === 'smirk' ? -8 : tilt / 2)} x2={46} y2={-34 + lift + (e === 'smirk' ? -8 : tilt / 2)} />
  </g>);
};
const Mouth: React.FC<{e: Emotion; t: number}> = ({e}) => {
  const d = {
    neutral: 'M-16 42 Q0 46 16 42', happy: 'M-24 36 Q0 62 24 36', smirk: 'M-18 44 Q8 48 24 34',
    shocked: '', angry: 'M-20 50 Q0 38 20 50', sad: 'M-20 52 Q0 40 20 52', cry: 'M-24 54 Q0 34 24 54', guilty: 'M-14 46 Q4 42 18 47',
  }[e];
  if (e === 'shocked') return <ellipse cx={0} cy={46} rx={13} ry={18} fill="#3b1a1a" />;
  return <path d={d} stroke="#3b1a1a" strokeWidth={7} fill={e === 'happy' ? '#3b1a1a' : 'none'} strokeLinecap="round" />;
};
const Hair: React.FC<{look: Look; back?: boolean}> = ({look, back}) => {
  const c = look.grey ? '#8b8580' : look.hair;
  if (look.hairStyle === 'bald') return null;
  if (back) return look.hairStyle === 'long' ? <path d="M-92 -20 Q-100 120 -70 170 L70 170 Q100 120 92 -20 Z" fill={c} /> : null;
  if (look.hairStyle === 'short') return <path d="M-86 -24 Q-90 -100 0 -104 Q90 -100 86 -24 Q70 -64 0 -66 Q-60 -64 -86 -24Z" fill={c} />;
  if (look.hairStyle === 'bun') return <g fill={c}><circle cx={0} cy={-118} r={34} /><path d="M-88 -10 Q-92 -100 0 -102 Q92 -100 88 -10 Q74 -70 0 -70 Q-74 -70 -88 -10Z" /></g>;
  return <path d="M-90 10 Q-96 -102 0 -104 Q96 -102 90 10 Q80 -62 10 -70 Q-40 -50 -90 10Z" fill={c} />;
};

export const Character: React.FC<{look: Look; act: Act; t: number; blinkSeed?: number}> = ({look, act, t, blinkSeed = 0}) => {
  const e = act.emotion ?? 'neutral';
  const lookX = {left: -12, right: 12, front: 0, down: 0}[act.look ?? 'front'];
  const lookY = act.look === 'down' ? 10 : 0;
  const breathe = Math.sin(t * 2.2 + blinkSeed) * 3;
  const blink = ((t + blinkSeed) % 3.7) < 0.12 && e !== 'shocked';
  const shake = e === 'angry' || e === 'cry' ? Math.sin(t * 40) * 1.5 : 0;
  const eyeR = e === 'shocked' ? 14 : 11;
  return (
    <g transform={`translate(${shake}, ${breathe}) rotate(${act.lean ?? 0})`}>
      {/* body */}
      <path d="M-120 330 Q-118 190 -60 170 L60 170 Q118 190 120 330 Z" fill={look.top} />
      <path d="M-30 168 L0 205 L30 168" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={6} />
      <rect x={-26} y={128} width={52} height={50} rx={18} fill={look.skin} />
      <Hair look={look} back />
      {/* head */}
      <g transform={`translate(${lookX * 0.6}, ${lookY * 0.4})`}>
        <ellipse cx={0} cy={0} rx={86} ry={100} fill={look.skin} />
        <ellipse cx={-86} cy={10} rx={14} ry={22} fill={look.skin} /><ellipse cx={86} cy={10} rx={14} ry={22} fill={look.skin} />
        {look.beard && <path d="M-80 20 Q-70 110 0 112 Q70 110 80 20 Q60 70 0 72 Q-60 70 -80 20Z" fill={look.grey ? '#9c958f' : look.hair} />}
        <g transform={`translate(${lookX}, ${lookY})`}>
          {blink ? <g stroke="#2a1d17" strokeWidth={6} strokeLinecap="round"><line x1={-42} y1={-6} x2={-20} y2={-6} /><line x1={20} y1={-6} x2={42} y2={-6} /></g>
            : <g><ellipse cx={-31} cy={-6} rx={eyeR} ry={eyeR + 3} fill="#fff" /><ellipse cx={31} cy={-6} rx={eyeR} ry={eyeR + 3} fill="#fff" />
                <circle cx={-31 + lookX * 0.3} cy={-4 + lookY * 0.3} r={7} fill="#1b1410" /><circle cx={31 + lookX * 0.3} cy={-4 + lookY * 0.3} r={7} fill="#1b1410" /></g>}
          <Brows e={e} />
          <Mouth e={e} t={t} />
          {(e === 'happy' || e === 'smirk') && <g fill="#ff8a80" opacity={0.35}><circle cx={-52} cy={22} r={14} /><circle cx={52} cy={22} r={14} /></g>}
          {e === 'cry' && <g fill="#7fc8ff">{[0, 1].map((i) => <ellipse key={i} cx={i ? 36 : -36} cy={20 + ((t * 120 + i * 40) % 70)} rx={6} ry={10} />)}</g>}
        </g>
        <Hair look={look} />
        {act.sweat && <path d={`M70 ${-40 + (t * 40) % 40} q8 14 0 22 q-8 -8 0 -22z`} fill="#9fd8ff" />}
      </g>
      {act.phone && <g transform="translate(-10, 150) rotate(-8)"><rect x={-38} y={-70} width={76} height={136} rx={14} fill="#111" /><rect x={-32} y={-62} width={64} height={118} rx={9} fill="#9fc3ff" opacity={0.9} /></g>}
      {act.phone && <ellipse cx={0} cy={-10} rx={110} ry={120} fill="#9fc3ff" opacity={0.12} />}
      {/* hands on the table / lifting */}
      <ellipse cx={act.phone ? -40 : -70} cy={act.lift ? 210 : act.phone ? 220 : 300} rx={26} ry={22} fill={look.skin} />
      <ellipse cx={70} cy={300} rx={26} ry={22} fill={look.skin} />
    </g>
  );
};

// The dinner set: warm pendant light over a round table, three chairs' worth of people.
const DinnerSet: React.FC<{t: number; cast: ToonProps['cast']; acts: Record<string, Act>; plateLift: number}> = ({t, cast, acts, plateLift}) => (
  <svg width={2160} height={1920} viewBox="0 0 2160 1920" style={{position: 'absolute', left: -540, top: 0}}>
    <defs>
      <radialGradient id="lamp" cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor="#ffcf8a" stopOpacity={0.55 + Math.sin(t * 3) * 0.02} /><stop offset="100%" stopColor="#ffcf8a" stopOpacity={0} /></radialGradient>
      <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2a1f2e" /><stop offset="100%" stopColor="#3b2a2a" /></linearGradient>
    </defs>
    <rect width={2160} height={1920} fill="url(#wall)" />
    <rect x={1460} y={260} width={360} height={480} rx={10} fill="#11162a" stroke="#4a3a35" strokeWidth={18} />
    <circle cx={1700} cy={360} r={40} fill="#e8ecff" opacity={0.8} />
    <line x1={1080} y1={0} x2={1080} y2={420} stroke="#1a1414" strokeWidth={6} />
    <path d="M990 420 Q1080 360 1170 420 Z" fill="#c9a45c" />
    <ellipse cx={1080} cy={700} rx={900} ry={700} fill="url(#lamp)" />
    {Object.entries(cast).map(([id, c], i) => (
      <g key={id} transform={`translate(${c.x}, 860) scale(1.35)`}><Character look={c} act={acts[id] ?? {}} t={t} blinkSeed={i * 1.3} /></g>
    ))}
    {/* table */}
    <ellipse cx={1080} cy={1360} rx={980} ry={190} fill="#5a3522" />
    <rect x={100} y={1360} width={1960} height={600} fill="#3e2416" />
    <ellipse cx={1080} cy={1340} rx={960} ry={170} fill="#6e4229" />
    {/* plates */}
    {[740, 1080, 1420].map((x, i) => <g key={i}><ellipse cx={x} cy={1330} rx={150} ry={42} fill="#efe9df" /><ellipse cx={x} cy={1326} rx={100} ry={26} fill="#d9d1c4" /></g>)}
    {/* her plate lifts and the folded screenshot shows */}
    <g transform={`translate(0, ${-plateLift * 60})`}><ellipse cx={1080} cy={1330} rx={150} ry={42} fill="#efe9df" /><ellipse cx={1080} cy={1326} rx={100} ry={26} fill="#d9d1c4" /></g>
    {plateLift > 0.2 && <rect x={1020} y={1318} width={120} height={22} rx={4} fill="#fff" opacity={plateLift} />}
    <rect x={1300} y={1200} width={26} height={110} rx={10} fill="rgba(255,255,255,0.35)" /><rect x={1304} y={1260} width={18} height={46} fill="#6a0f1a" />
  </svg>
);

const Screenshot: React.FC<{t: number}> = ({t}) => {
  const k = interpolate(t, [0, 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.55 * k})`}}>
      <div style={{transform: `scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * -8}deg)`, width: 760, background: '#0b0d16', borderRadius: 36, padding: '34px 38px', border: '2px solid rgba(201,164,92,0.4)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)'}}>
        <div style={{fontFamily: sans, color: 'rgba(246,239,226,0.55)', fontSize: 28}}>Whispers · Anonymous · 1:52 AM</div>
        <div style={{marginTop: 16, fontFamily: 'Newsreader, Georgia, serif', color: '#f6efe2', fontSize: 50, lineHeight: 1.3}}>he fixes my car on sundays <span style={{background: '#FFE14D', color: '#111', borderRadius: 8, padding: '0 6px'}}>lol.</span> his son still thinks I'm at work.</div>
      </div>
    </AbsoluteFill>
  );
};

export const Toon: React.FC<ToonProps> = ({words, duration, shots, cast, audio, hook, end, tag = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const endAt = duration + 0.2;
  const idx = shots.reduce((k, s, i) => (t >= s.at ? i : k), 0);
  const shot = shots[idx];
  const st = t - shot.at;
  const len = (shots[idx + 1]?.at ?? endAt + 2.4) - shot.at;
  const p = interpolate(st, [0, len], [0, 1], {...clamp, easing: ease});
  const to = shot.camTo ?? shot.cam;
  const cam = {x: shot.cam.x + (to.x - shot.cam.x) * p, y: shot.cam.y + (to.y - shot.cam.y) * p, zoom: shot.cam.zoom + (to.zoom - shot.cam.zoom) * p};
  const acts: Record<string, Act> = {};
  for (const s of shots.slice(0, idx + 1)) Object.assign(acts, s.acts ?? {});
  const liftAt = shots.find((s) => s.acts && Object.values(s.acts).some((a) => a.lift))?.at;
  const plateLift = liftAt != null ? interpolate(t, [liftAt, liftAt + 0.5], [0, 1], clamp) : 0;
  const shake = shot.shake ? Math.sin(t * 60) * 8 * Math.max(0, 1 - st * 2) : 0;
  const cut = idx > 0 ? interpolate(st, [0, 0.1], [0.25, 0], clamp) : 0;
  const chunks: {ws: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => { cur.push(w); const next = words[i + 1]; if (cur.length >= 3 || /[.,?!:…]$/.test(w.w) || !next) { chunks.push({ws: cur, s: cur[0].s, e: next ? next.s : w.e + 0.4}); cur = []; } });
  const c = t < endAt ? (chunks.find((ch) => t >= ch.s && t < ch.e) ?? (t < (chunks[0]?.s ?? 0) ? chunks[0] : undefined)) : undefined;
  const endK = interpolate(t - endAt, [0, 0.3], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#120d10', overflow: 'hidden'}}>
      {audio && <Audio src={staticFile(audio)} />}
      <AbsoluteFill style={{transform: `translate(${shake}px,0) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '540px 960px'}}>
        <DinnerSet t={t} cast={cast} acts={acts} plateLift={plateLift} />
      </AbsoluteFill>
      {shot.insert === 'screenshot' && <Screenshot t={st} />}
      <AbsoluteFill style={{background: '#fff', opacity: cut}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,0.75)'}} />
      {hook && t < 2.4 && (
        <div style={{position: 'absolute', top: 200, left: 70, right: 70, textAlign: 'center', opacity: interpolate(t, [2.1, 2.4], [1, 0], clamp)}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 56, lineHeight: 1.32, color: '#111', background: '#fff', padding: '8px 20px', borderRadius: 16, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span>
        </div>
      )}
      {c && (
        <div style={{position: 'absolute', top: 1420, left: 40, right: 40, textAlign: 'center', transform: `scale(${interpolate(t - c.s, [0, 0.09], [0.82, 1], clamp)})`}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 104, lineHeight: 1.04, letterSpacing: -2, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textTransform: 'lowercase'}}>
            {c.ws.map((w, i) => <span key={i} style={{color: t >= w.s && t < w.e + 0.1 ? '#FFE14D' : '#fff'}}>{w.w}{i < c.ws.length - 1 ? ' ' : ''}</span>)}
          </span>
        </div>
      )}
      {end && t >= endAt && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * endK})`, alignItems: 'center', justifyContent: 'center', padding: 80, textAlign: 'center'}}>
          <span style={{opacity: endK, fontFamily: sans, fontWeight: 700, fontSize: 92, lineHeight: 1.1, color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill'}}>{end}</span>
        </AbsoluteFill>
      )}
      {tag && <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>dramatised</div>}
    </AbsoluteFill>
  );
};

// ---------- Story mode: several sets, phone inserts, quieter sound design ----------
type Msg = {from: string; text: string; me?: boolean; at: number};
type SetName = 'cafe' | 'bedroom' | 'driveway' | 'dinner';
export type StoryShot = {
  at: number; set?: SetName; people?: string[]; cam?: {x: number; y: number; zoom: number}; camTo?: {x: number; y: number; zoom: number};
  acts?: Record<string, Act>; shake?: boolean;
  phone?: {kind: 'chat'; title: string; msgs: Msg[]} | {kind: 'whispers'; text: string; meta?: string; highlight?: string} | {kind: 'notify'; from: string; text: string} | {kind: 'screenshot'};
};
export type StoryProps = {words: Word[]; duration: number; shots: StoryShot[]; cast: Record<string, Look>; audio?: string; hook?: string; end?: string; tag?: boolean};

const SLOTS: Record<SetName, number[]> = {cafe: [820, 1340], bedroom: [1080], driveway: [], dinner: [700, 960, 1200, 1460]};
const SCALE: Record<SetName, number> = {cafe: 1.35, bedroom: 1.5, driveway: 1, dinner: 1.12};

const SetBack: React.FC<{set: SetName; t: number}> = ({set, t}) => {
  if (set === 'cafe') return (<g>
    <rect width={2160} height={1920} fill="#e9d8c4" />
    {[0, 1, 2].map((i) => <g key={i}><rect x={420 + i * 460} y={180} width={380} height={520} rx={16} fill="#bfe3f5" /><rect x={420 + i * 460} y={180} width={380} height={520} rx={16} fill="none" stroke="#7a5a44" strokeWidth={16} /><circle cx={540 + i * 460} cy={300} r={40} fill="#fff" opacity={0.6} /></g>)}
    <rect x={0} y={760} width={2160} height={30} fill="#7a5a44" />
    {[300, 1860].map((x) => <g key={x}><rect x={x - 20} y={560} width={40} height={200} fill="#3d6b3a" /><circle cx={x} cy={520} r={90} fill="#4f8a4a" /></g>)}
  </g>);
  if (set === 'bedroom') return (<g>
    <rect width={2160} height={1920} fill="#141a2e" />
    <rect x={1400} y={240} width={420} height={560} rx={10} fill="#0b1022" stroke="#2a3150" strokeWidth={18} />
    <circle cx={1660} cy={360} r={46} fill="#e9eeff" opacity={0.85} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={1410} y={260 + i * 78} width={400} height={20} fill="#2a3150" opacity={0.7} />)}
    <rect x={260} y={1180} width={1640} height={760} rx={40} fill="#2b3558" />
    <rect x={300} y={1060} width={520} height={200} rx={60} fill="#cfd6ea" />
  </g>);
  if (set === 'driveway') {
    const flicker = (Math.floor(t * 9) % 7 === 0) ? 0.35 : 1;
    return (<g>
      <rect width={2160} height={1920} fill="#0d1226" />
      {[...Array(40)].map((_, i) => <circle key={i} cx={(i * 397) % 2160} cy={(i * 131) % 520} r={2 + (i % 3)} fill="#fff" opacity={0.5} />)}
      <path d="M380 760 L1080 360 L1780 760 Z" fill="#26263a" />
      <rect x={440} y={760} width={1280} height={760} fill="#33344d" />
      <rect x={640} y={1000} width={880} height={520} fill="#1b1a24" />
      <rect x={640} y={1000} width={880} height={70} fill="#4a4b66" />
      <ellipse cx={1080} cy={1080} rx={300} ry={60} fill="#ffcf8a" opacity={0.25 * flicker} />
      <circle cx={1080} cy={1090} r={14} fill="#ffe2b0" opacity={flicker} />
      {/* the covered car */}
      <path d="M760 1500 Q780 1300 900 1260 Q1080 1200 1260 1260 Q1380 1300 1400 1500 Z" fill="#2e3140" />
      <path d="M820 1490 Q840 1330 940 1300 Q1080 1260 1220 1300 Q1320 1330 1340 1490" fill="none" stroke="#454a5e" strokeWidth={10} />
      <circle cx={1820} cy={980} r={16} fill="#ffcf8a" opacity={flicker} /><ellipse cx={1820} cy={990} rx={160} ry={120} fill="#ffcf8a" opacity={0.12 * flicker} />
      <rect x={0} y={1500} width={2160} height={420} fill="#151621" />
      <path d="M760 1920 L960 1500 L1200 1500 L1400 1920 Z" fill="#20212e" />
    </g>);
  }
  return (<g>
    <defs><radialGradient id="lamp2" cx="50%" cy="35%" r="60%"><stop offset="0%" stopColor="#ffcf8a" stopOpacity={0.5} /><stop offset="100%" stopColor="#ffcf8a" stopOpacity={0} /></radialGradient></defs>
    <rect width={2160} height={1920} fill="#2e2230" />
    <rect x={1500} y={260} width={340} height={460} rx={10} fill="#11162a" stroke="#4a3a35" strokeWidth={18} />
    <line x1={1080} y1={0} x2={1080} y2={420} stroke="#1a1414" strokeWidth={6} />
    <path d="M990 420 Q1080 360 1170 420 Z" fill="#c9a45c" />
    <ellipse cx={1080} cy={700} rx={900} ry={700} fill="url(#lamp2)" />
  </g>);
};
const SetFront: React.FC<{set: SetName; plateLift: number}> = ({set, plateLift}) => {
  if (set === 'cafe') return (<g>
    <ellipse cx={1080} cy={1380} rx={760} ry={150} fill="#c9a07a" /><rect x={320} y={1380} width={1520} height={600} fill="#a77d5a" /><ellipse cx={1080} cy={1360} rx={740} ry={130} fill="#d9b48c" />
    {[860, 1300].map((x) => <g key={x}><rect x={x - 50} y={1270} width={100} height={90} rx={16} fill="#f4efe8" /><ellipse cx={x} cy={1272} rx={50} ry={14} fill="#6b3f22" /></g>)}
    <g transform="translate(1180,1340)"><rect x={-40} y={-14} width={80} height={24} rx={6} fill="#111" /></g>
  </g>);
  if (set === 'bedroom') return <rect x={240} y={1500} width={1680} height={500} rx={50} fill="#3a4677" />;
  if (set === 'dinner') return (<g>
    <ellipse cx={1080} cy={1360} rx={980} ry={190} fill="#5a3522" /><rect x={100} y={1360} width={1960} height={600} fill="#3e2416" /><ellipse cx={1080} cy={1340} rx={960} ry={170} fill="#6e4229" />
    {[700, 1200, 1460].map((x, i) => <g key={i}><ellipse cx={x} cy={1330} rx={120} ry={34} fill="#efe9df" /><ellipse cx={x} cy={1326} rx={80} ry={22} fill="#d9d1c4" /></g>)}
    <g transform={`translate(0, ${-plateLift * 60})`}><ellipse cx={960} cy={1330} rx={120} ry={34} fill="#efe9df" /><ellipse cx={960} cy={1326} rx={80} ry={22} fill="#d9d1c4" /></g>
    {plateLift > 0.2 && <rect x={910} y={1318} width={100} height={20} rx={4} fill="#fff" opacity={plateLift} />}
  </g>);
  return null;
};

const NotifyBanner: React.FC<{from: string; text: string; t: number}> = ({from, text, t}) => {
  const k = interpolate(t - 0.3, [0, 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.5))});
  return (
    <div style={{position: 'absolute', top: 160, left: 40, right: 40, transform: `translateY(${(1 - k) * -220}px)`, opacity: k}}>
      <div style={{background: 'rgba(40,40,44,0.94)', borderRadius: 40, padding: '26px 30px', fontFamily: sans, boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(#5cf777,#0bbd2a)'}} />
          <div style={{flex: 1, color: '#fff', fontSize: 32, fontWeight: 700}}>{from}</div>
          <div style={{color: 'rgba(255,255,255,0.5)', fontSize: 26}}>now</div>
        </div>
        <div style={{marginTop: 12, color: '#fff', fontSize: 38, lineHeight: 1.25}}>{text}</div>
      </div>
    </div>
  );
};

export const Story: React.FC<StoryProps> = ({words, duration, shots, cast, audio, hook, end, tag = true}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const endAt = duration + 0.2;
  const idx = shots.reduce((k, s, i) => (t >= s.at ? i : k), 0);
  // a shot without its own set keeps the last one (phone inserts sit over it)
  const base = [...shots.slice(0, idx + 1)].reverse().find((s) => s.set) ?? shots[0];
  const shot = shots[idx];
  const st = t - shot.at;
  const len = (shots[idx + 1]?.at ?? endAt + 2.6) - shot.at;
  const camShot = shot.cam ? shot : base;
  const cst = t - camShot.at;
  const clen = camShot === shot ? len : (shots[idx + 1]?.at ?? endAt + 2.6) - camShot.at;
  const p = interpolate(cst, [0, clen], [0, 1], {...clamp, easing: ease});
  const c0 = camShot.cam ?? {x: 0, y: 0, zoom: 1}; const c1 = camShot.camTo ?? c0;
  const cam = {x: c0.x + (c1.x - c0.x) * p, y: c0.y + (c1.y - c0.y) * p, zoom: c0.zoom + (c1.zoom - c0.zoom) * p};
  const set = base.set ?? 'dinner';
  const acts: Record<string, Act> = {};
  for (const s of shots.slice(0, idx + 1)) { if (s.set && s !== shots[0]) { /* new set: keep acts */ } Object.assign(acts, s.acts ?? {}); }
  const liftAt = shots.find((s) => s.acts && Object.values(s.acts).some((a) => a.lift))?.at;
  const plateLift = liftAt != null ? interpolate(t, [liftAt, liftAt + 0.5], [0, 1], clamp) : 0;
  const shake = shot.shake ? Math.sin(t * 50) * 7 * Math.max(0, 1 - st * 2) : 0;
  const people = base.people ?? [];
  const chunks: {ws: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => { cur.push(w); const next = words[i + 1]; if (cur.length >= 3 || /[.,?!:…]$/.test(w.w) || !next) { chunks.push({ws: cur, s: cur[0].s, e: next ? next.s : w.e + 0.4}); cur = []; } });
  const c = t < endAt ? (chunks.find((ch) => t >= ch.s && t < ch.e) ?? (t < (chunks[0]?.s ?? 0) ? chunks[0] : undefined)) : undefined;
  const endK = interpolate(t - endAt, [0, 0.3], [0, 1], clamp);
  const full = shot.phone && (shot.phone.kind === 'chat' || shot.phone.kind === 'whispers');
  const capTop = full ? 1420 : 1420;
  return (
    <AbsoluteFill style={{background: '#120d10', overflow: 'hidden'}}>
      {audio && <Audio src={staticFile(audio)} />}
      <AbsoluteFill style={{transform: `translate(${shake}px,0) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '540px 960px'}}>
        <svg width={2160} height={1920} viewBox="0 0 2160 1920" style={{position: 'absolute', left: -540, top: 0}}>
          <SetBack set={set} t={t} />
          {people.map((id, i) => cast[id] && (
            <g key={id} transform={`translate(${SLOTS[set][i] ?? 1080}, ${set === 'bedroom' ? 900 : 860}) scale(${SCALE[set]})`}><Character look={cast[id]} act={acts[id] ?? {}} t={t} blinkSeed={i * 1.3} /></g>
          ))}
          <SetFront set={set} plateLift={plateLift} />
        </svg>
      </AbsoluteFill>
      {shot.phone?.kind === 'chat' && <Chat title={shot.phone.title} msgs={shot.phone.msgs} t={st} />}
      {shot.phone?.kind === 'whispers' && <Whispers text={shot.phone.text} meta={shot.phone.meta} highlight={shot.phone.highlight} t={st} />}
      {shot.phone?.kind === 'notify' && <NotifyBanner from={shot.phone.from} text={shot.phone.text} t={st} />}
      {shot.phone?.kind === 'screenshot' && <Screenshot t={st} />}
      {!full && <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,0.7)'}} />}
      {hook && t < 2.6 && (
        <div style={{position: 'absolute', top: 200, left: 70, right: 70, textAlign: 'center', opacity: interpolate(t, [2.3, 2.6], [1, 0], clamp)}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 56, lineHeight: 1.32, color: '#111', background: '#fff', padding: '8px 20px', borderRadius: 16, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span>
        </div>
      )}
      {c && (
        <div style={{position: 'absolute', top: capTop, left: 40, right: 40, textAlign: 'center', transform: `scale(${interpolate(t - c.s, [0, 0.09], [0.85, 1], clamp)})`}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 100, lineHeight: 1.04, letterSpacing: -2, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textTransform: 'lowercase'}}>
            {c.ws.map((w, i) => <span key={i} style={{color: t >= w.s && t < w.e + 0.1 ? '#FFE14D' : '#fff'}}>{w.w}{i < c.ws.length - 1 ? ' ' : ''}</span>)}
          </span>
        </div>
      )}
      {end && t >= endAt && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * endK})`, alignItems: 'center', justifyContent: 'center', padding: 80, textAlign: 'center'}}>
          <span style={{opacity: endK, fontFamily: sans, fontWeight: 700, fontSize: 88, lineHeight: 1.12, color: '#fff', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill'}}>{end}</span>
        </AbsoluteFill>
      )}
      {tag && <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>dramatised</div>}
    </AbsoluteFill>
  );
};
