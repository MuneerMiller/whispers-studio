import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/newsreader/500.css';

// Relatable text-meme carousel (1080x1350 stills; frame = slide index).
// Built to be SENT to a friend: slide 1 is the hook, the middle slides are one relatable line each in a
// post-card look, the last slide asks a question and names who to send it to.
export type MemeCarouselProps = {hook: string; slides: string[]; question: string; sendTo?: string; handle?: string; dark?: boolean};

const INK = '#0a0d18';
const PAPER = '#f6efe2';
const BRASS = '#e2b964';
const sans = '"Instrument Sans", system-ui, sans-serif';
const serif = 'Newsreader, Georgia, serif';

const Avatar: React.FC = () => (
  <div style={{width: 84, height: 84, borderRadius: 42, background: INK, border: '3px solid rgba(226,185,100,0.6)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <svg width={54} height={54} viewBox="0 0 32 32"><path d="M16 7c1 3.5 5 5.6 5 10a5 5 0 0 1-10 0c0-2 1-3.4 2.2-4.6.2 1.6 1 2.6 2.1 3-.4-3.2.2-6 .7-8.4z" fill="none" stroke={BRASS} strokeWidth={1.8} strokeLinejoin="round" /></svg>
  </div>
);

export const MemeCarousel: React.FC<MemeCarouselProps> = ({hook, slides, question, sendTo, handle = 'whispers_anon', dark = false}) => {
  const i = useCurrentFrame();
  const total = slides.length + 2;
  const bg = dark ? INK : '#ffffff';
  const fg = dark ? PAPER : '#0f1419';
  const sub = dark ? 'rgba(246,239,226,0.55)' : '#536471';

  if (i === 0) {
    return (
      <AbsoluteFill style={{background: INK, padding: 90, justifyContent: 'center'}}>
        <div style={{fontFamily: serif, fontWeight: 500, fontSize: hook.length > 50 ? 96 : 116, lineHeight: 1.04, color: PAPER}}>{hook}</div>
        <div style={{marginTop: 56, display: 'flex', alignItems: 'center', gap: 14, fontFamily: sans, fontWeight: 700, fontSize: 38, color: BRASS}}>swipe →</div>
        <div style={{position: 'absolute', bottom: 70, left: 90, fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: 'rgba(226,185,100,0.8)'}}>WHISPERS</div>
      </AbsoluteFill>
    );
  }
  if (i >= total - 1) {
    return (
      <AbsoluteFill style={{background: INK, padding: 90, justifyContent: 'center'}}>
        <div style={{fontFamily: serif, fontWeight: 500, fontSize: 92, lineHeight: 1.08, color: PAPER}}>{question}</div>
        {sendTo && <div style={{marginTop: 50, fontFamily: sans, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: 'rgba(246,239,226,0.85)'}}>{sendTo}</div>}
        <div style={{position: 'absolute', bottom: 70, left: 90, right: 90, fontFamily: sans, fontWeight: 500, fontSize: 30, color: 'rgba(246,239,226,0.55)'}}>Whispers · say it anonymously · opening soon</div>
      </AbsoluteFill>
    );
  }
  const line = slides[i - 1];
  return (
    <AbsoluteFill style={{background: bg, padding: '0 80px', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
        <Avatar />
        <div>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 40, color: fg}}>Whispers</div>
          <div style={{fontFamily: sans, fontWeight: 500, fontSize: 34, color: sub}}>@{handle}</div>
        </div>
      </div>
      <div style={{marginTop: 44, fontFamily: sans, fontWeight: 500, fontSize: line.length > 120 ? 56 : line.length > 70 ? 64 : 74, lineHeight: 1.22, color: fg}}>{line}</div>
      <div style={{position: 'absolute', bottom: 70, right: 80, fontFamily: sans, fontWeight: 700, fontSize: 32, color: sub}}>{i}/{slides.length}</div>
    </AbsoluteFill>
  );
};
export const memeCarouselMeta = ({props}: {props: MemeCarouselProps}) => ({durationInFrames: props.slides.length + 2});
