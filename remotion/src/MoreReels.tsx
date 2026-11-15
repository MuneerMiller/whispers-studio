import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/newsreader/500.css';
import {EscapeRing, BallDrop, Spiro} from './Backgrounds';

// More formats. Each export has a *Meta function that sets the video length from its props.
const INK = '#0a0d18';
const PAPER = '#f6efe2';
const BRASS = '#e2b964';
const sans = '"Instrument Sans", system-ui, sans-serif';
const serif = 'Newsreader, Georgia, serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, at: number, d = 0.22) => interpolate(t, [at, at + d], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.7))});
const fade = (t: number, at: number, d = 0.3) => interpolate(t, [at, at + d], [0, 1], clamp);
const Bed: React.FC<{audio?: string; volume?: number}> = ({audio, volume = 1}) => (audio ? <Audio src={staticFile(audio)} volume={volume} /> : null);

const QuestionCard: React.FC<{t: number; at: number; question: string; label?: string}> = ({t, at, question, label}) => {
  if (t < at) return null;
  const q = pop(t, at, 0.35);
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.7 * fade(t, at)})`, justifyContent: 'center', alignItems: 'center', padding: 80}}>
      <div style={{transform: `scale(${q})`, background: PAPER, borderRadius: 40, padding: '56px 50px', textAlign: 'center'}}>
        <div style={{fontFamily: sans, fontWeight: 700, fontSize: 68, lineHeight: 1.12, color: INK}}>{question}</div>
        <div style={{marginTop: 24, fontFamily: sans, fontWeight: 500, fontSize: 32, color: 'rgba(10,13,24,0.6)'}}>{label ?? 'Whispers · opening soon'}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Tier list: items drop into S–D rows one at a time ----------
export type TierItem = {text: string; tier: 'S' | 'A' | 'B' | 'C' | 'D'};
export type TierListProps = {title: string; items: TierItem[]; question: string; audio?: string};
const TIERS = [['S', '#e5626b'], ['A', '#f0956b'], ['B', '#e2b964'], ['C', '#7fd1a8'], ['D', '#5fb3c4']] as const;
const tierT = (n: number) => ({each: 1.25, start: 1.3, end: 1.3 + n * 1.25 + 0.6});
export const tierListMeta = ({props}: {props: TierListProps}) => ({durationInFrames: Math.round((tierT(props.items.length).end + 3.2) * 30)});
export const TierList: React.FC<TierListProps> = ({title, items, question, audio}) => {
  const t = useCurrentFrame() / 30;
  const {each, start, end} = tierT(items.length);
  return (
    <AbsoluteFill style={{background: INK, padding: '150px 50px 0'}}>
      <Bed audio={audio} />
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, letterSpacing: 5, color: BRASS}}>TIER LIST</div>
      <div style={{marginTop: 10, fontFamily: serif, fontWeight: 500, fontSize: title.length > 40 ? 70 : 84, lineHeight: 1.05, color: PAPER}}>{title}</div>
      <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12}}>
        {TIERS.map(([tier, col]) => (
          <div key={tier} style={{display: 'flex', minHeight: 170, background: 'rgba(246,239,226,0.06)', borderRadius: 18, overflow: 'hidden'}}>
            <div style={{width: 120, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontWeight: 700, fontSize: 64, color: INK, flexShrink: 0}}>{tier}</div>
            <div style={{flex: 1, display: 'flex', flexWrap: 'wrap', gap: 10, padding: 14, alignContent: 'center'}}>
              {items.map((it, i) => (it.tier !== tier || t < start + i * each ? null : (
                <div key={i} style={{transform: `scale(${pop(t, start + i * each)})`, background: PAPER, color: INK, borderRadius: 14, padding: '12px 18px', fontFamily: sans, fontWeight: 700, fontSize: 34, lineHeight: 1.15}}>{it.text}</div>
              )))}
            </div>
          </div>
        ))}
      </div>
      {/* the item being placed right now, big, so it's readable before it lands */}
      {items.map((it, i) => {
        const at = start + i * each - 0.55;
        if (t < at || t >= start + i * each) return null;
        return <div key={i} style={{position: 'absolute', bottom: 120, left: 60, right: 60, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 60, color: PAPER, opacity: fade(t, at, 0.15)}}>{it.text}</div>;
      })}
      <QuestionCard t={t} at={end} question={question} />
    </AbsoluteFill>
  );
};

// ---------- Notes app: an unsent message typed out in a notes screen (always fiction) ----------
export type NotesReelProps = {title: string; lines: string[]; question: string; audio?: string};
const notesT = (lines: string[]) => {
  let t = 1.2;
  const at = lines.map((l) => { const a = t; t += 0.5 + l.length * 0.05; return a; });
  return {at, end: t + 1.2};
};
export const notesReelMeta = ({props}: {props: NotesReelProps}) => ({durationInFrames: Math.round((notesT(props.lines).end + 3.2) * 30)});
export const NotesReel: React.FC<NotesReelProps> = ({title, lines, question, audio}) => {
  const t = useCurrentFrame() / 30;
  const {at, end} = notesT(lines);
  return (
    <AbsoluteFill style={{background: '#fbf8f1'}}>
      <Bed audio={audio} />
      <div style={{position: 'absolute', top: 120, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', fontFamily: sans, fontWeight: 500, fontSize: 40, color: '#d29b24'}}><span>‹ Notes</span><span>Done</span></div>
      <div style={{position: 'absolute', top: 200, left: 60, right: 60}}>
        <div style={{fontFamily: sans, fontWeight: 500, fontSize: 28, color: '#a19d94', textAlign: 'center'}}>Dramatised · unsent</div>
        <div style={{marginTop: 30, fontFamily: sans, fontWeight: 700, fontSize: 64, lineHeight: 1.1, color: '#1c1b19'}}>{title}</div>
        <div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 26}}>
          {lines.map((l, i) => {
            if (t < at[i]) return null;
            const n = Math.floor(interpolate(t, [at[i], at[i] + l.length * 0.04], [0, l.length], clamp));
            const typing = n < l.length;
            return <div key={i} style={{fontFamily: sans, fontWeight: 500, fontSize: 46, lineHeight: 1.32, color: '#2a2925'}}>{l.slice(0, n)}{typing && <span style={{color: '#d29b24'}}>|</span>}</div>;
          })}
        </div>
      </div>
      <QuestionCard t={t} at={end} question={question} label="Dramatised · Whispers" />
    </AbsoluteFill>
  );
};

// ---------- Search bar: a late-night search types itself, then the suggestions drop in ----------
export type SearchReelProps = {hook: string; query: string; suggestions: string[]; question: string; audio?: string};
const searchT = (q: string, n: number) => {
  const typed = 1.4 + q.length * 0.07;
  return {typed, sugg: (i: number) => typed + 0.4 + i * 0.55, end: typed + 0.4 + n * 0.55 + 1.8};
};
export const searchReelMeta = ({props}: {props: SearchReelProps}) => ({durationInFrames: Math.round((searchT(props.query, props.suggestions.length).end + 3.2) * 30)});
export const SearchReel: React.FC<SearchReelProps> = ({hook, query, suggestions, question, audio}) => {
  const t = useCurrentFrame() / 30;
  const {typed, sugg, end} = searchT(query, suggestions.length);
  const n = Math.floor(interpolate(t, [0.6, typed], [0, query.length], clamp));
  return (
    <AbsoluteFill style={{background: '#101114', padding: '0 60px'}}>
      <Bed audio={audio} />
      <div style={{marginTop: 170, fontFamily: sans, fontWeight: 700, fontSize: 56, lineHeight: 1.12, color: PAPER, textAlign: 'center'}}>{hook}</div>
      <div style={{marginTop: 70, background: '#202227', borderRadius: 50, padding: '30px 40px', display: 'flex', alignItems: 'center', gap: 22}}>
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <span style={{fontFamily: sans, fontWeight: 500, fontSize: 46, color: '#e8eaed'}}>{query.slice(0, n)}<span style={{opacity: Math.floor(t * 2) % 2 ? 0 : 1, color: BRASS}}>|</span></span>
      </div>
      <div style={{marginTop: 18, background: '#202227', borderRadius: 30, overflow: 'hidden', opacity: t >= sugg(0) ? 1 : 0}}>
        {suggestions.map((s, i) => (t < sugg(i) ? null : (
          <div key={i} style={{opacity: fade(t, sugg(i), 0.2), display: 'flex', gap: 22, alignItems: 'center', padding: '24px 40px', borderTop: i ? '1px solid #2e3036' : 'none'}}>
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth={2.2}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <span style={{fontFamily: sans, fontWeight: 500, fontSize: 40, color: '#e8eaed'}}><span style={{color: '#9aa0a6'}}>{query}</span>{s}</span>
          </div>
        )))}
      </div>
      <QuestionCard t={t} at={end} question={question} />
    </AbsoluteFill>
  );
};

// ---------- Guess the ending: a short story setup, 3-2-1, then the twist (always fiction) ----------
export type TwistReelProps = {hook: string; setup: string[]; ending: string; question: string; bg?: 'ring' | 'drop' | 'spiro'; audio?: string};
const twistT = (setup: string[], ending: string) => {
  let t = 1.4;
  const at = setup.map((l) => { const a = t; t += 1 + l.length * 0.05; return a; });
  const guess = t + 0.3;
  const reveal = guess + 3.3;
  return {at, guess, reveal, end: reveal + 1.6 + ending.length * 0.045};
};
export const twistReelMeta = ({props}: {props: TwistReelProps}) => ({durationInFrames: Math.round((twistT(props.setup, props.ending).end + 3.2) * 30)});
export const TwistReel: React.FC<TwistReelProps> = ({hook, setup, ending, question, bg = 'ring', audio}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const {at, guess, reveal, end} = twistT(setup, ending);
  const count = 3 - Math.floor(t - guess - 0.3);
  const stroke = {WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'} as const;
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 62%, #1c1838 0%, ${INK} 70%)`}}>
      <Bed audio={audio} />
      {bg === 'ring' && <EscapeRing frame={frame} />}
      {bg === 'drop' && <BallDrop frame={frame} />}
      {bg === 'spiro' && <Spiro frame={frame} />}
      <AbsoluteFill style={{padding: '130px 70px 0'}}>
        <div style={{fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: BRASS}}>DRAMATISED STORY</div>
        <div style={{marginTop: 14, alignSelf: 'flex-start'}}><span style={{fontFamily: sans, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: INK, background: BRASS, padding: '6px 18px', borderRadius: 14, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span></div>
        <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18}}>
          {setup.map((l, i) => (t < at[i] || t >= reveal ? null : (
            <div key={i} style={{opacity: fade(t, at[i]), fontFamily: sans, fontWeight: 700, fontSize: 50, lineHeight: 1.2, color: PAPER, ...stroke}}>{l}</div>
          )))}
          {t >= guess && t < reveal && (
            <div style={{marginTop: 20, fontFamily: sans, fontWeight: 700, fontSize: 64, color: BRASS, ...stroke}}>Guess the ending… {count > 0 ? count : ''}</div>
          )}
          {t >= reveal && (
            <div style={{transform: `scale(${pop(t, reveal, 0.3)})`, transformOrigin: 'left top', background: PAPER, borderRadius: 30, padding: '36px 40px', fontFamily: sans, fontWeight: 700, fontSize: 56, lineHeight: 1.18, color: INK}}>{ending}</div>
          )}
        </div>
      </AbsoluteFill>
      <QuestionCard t={t} at={end} question={question} label="Dramatised story · Whispers" />
    </AbsoluteFill>
  );
};

// ---------- Voice story: a narrated dramatised story with big word-by-word captions ----------
export type Word = {w: string; s: number; e: number};
export type VoiceStoryProps = {hook: string; words: Word[]; question: string; bg?: 'ring' | 'drop' | 'spiro'; audio?: string; duration?: number};
export const voiceStoryMeta = ({props}: {props: VoiceStoryProps}) => ({durationInFrames: Math.round(((props.duration ?? (props.words.at(-1)?.e ?? 10)) + 3.4) * 30)});
export const VoiceStory: React.FC<VoiceStoryProps> = ({hook, words, question, bg = 'drop', audio, duration}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const endAt = (duration ?? words.at(-1)?.e ?? 10) + 0.3;
  // chunk into groups of up to 3 words, breaking at punctuation
  const chunks: {ws: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (cur.length >= 3 || /[.,?!]$/.test(w.w) || !next) { chunks.push({ws: cur, s: cur[0].s, e: next ? next.s : w.e + 0.4}); cur = []; }
  });
  const c = chunks.find((ch) => t >= ch.s && t < ch.e);
  const stroke = {WebkitTextStroke: '14px #000', paintOrder: 'stroke fill'} as const;
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 62%, #1c1838 0%, ${INK} 70%)`}}>
      <Bed audio={audio} />
      {bg === 'ring' && <EscapeRing frame={frame} />}
      {bg === 'drop' && <BallDrop frame={frame} />}
      {bg === 'spiro' && <Spiro frame={frame} />}
      <div style={{position: 'absolute', top: 120, left: 60, right: 60, textAlign: 'center'}}>
        <div style={{fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: BRASS}}>DRAMATISED STORY</div>
        <div style={{marginTop: 14}}><span style={{fontFamily: sans, fontWeight: 700, fontSize: 50, lineHeight: 1.15, color: INK, background: BRASS, padding: '6px 18px', borderRadius: 14, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span></div>
      </div>
      {c && t < endAt && (
        <div style={{position: 'absolute', top: 520, left: 50, right: 50, textAlign: 'center', transform: `scale(${interpolate(t - c.s, [0, 0.1], [0.85, 1], clamp)})`}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 112, lineHeight: 1.05, letterSpacing: -2, ...stroke}}>
            {c.ws.map((w, i) => <span key={i} style={{color: t >= w.s && t < w.e + 0.08 ? BRASS : PAPER}}>{w.w}{i < c.ws.length - 1 ? ' ' : ''}</span>)}
          </span>
        </div>
      )}
      <QuestionCard t={t} at={endAt} question={question} label="Dramatised story · Whispers" />
    </AbsoluteFill>
  );
};

// ---------- Bingo card: one still image (1080x1350). "How many can you tick?" ----------
export type BingoProps = {title: string; cells: string[]; question: string; dark?: boolean};
export const BingoCard: React.FC<BingoProps> = ({title, cells, question, dark = true}) => {
  const bg = dark ? INK : '#ffffff', fg = dark ? PAPER : INK;
  const grid = [...cells.slice(0, 12), 'FREE: you opened this', ...cells.slice(12, 24)];
  return (
    <AbsoluteFill style={{background: bg, padding: '70px 50px'}}>
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: BRASS, textAlign: 'center'}}>BINGO</div>
      <div style={{marginTop: 8, fontFamily: serif, fontWeight: 500, fontSize: title.length > 30 ? 66 : 78, lineHeight: 1.05, color: fg, textAlign: 'center'}}>{title}</div>
      <div style={{marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, flex: 1}}>
        {grid.map((c, i) => (
          <div key={i} style={{border: `3px solid ${i === 12 ? BRASS : dark ? 'rgba(246,239,226,0.25)' : 'rgba(10,13,24,0.2)'}`, background: i === 12 ? BRASS : 'transparent', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 8, fontFamily: sans, fontWeight: 700, fontSize: c.length > 34 ? 21 : c.length > 22 ? 24 : 27, lineHeight: 1.12, color: i === 12 ? INK : fg}}>{c}</div>
        ))}
      </div>
      <div style={{marginTop: 28, fontFamily: sans, fontWeight: 700, fontSize: 40, color: fg, textAlign: 'center'}}>{question}</div>
      <div style={{marginTop: 8, fontFamily: sans, fontWeight: 500, fontSize: 26, color: dark ? 'rgba(246,239,226,0.5)' : 'rgba(10,13,24,0.5)', textAlign: 'center'}}>Whispers · opening soon</div>
    </AbsoluteFill>
  );
};
