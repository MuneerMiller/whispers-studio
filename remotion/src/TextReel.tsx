import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, CalculateMetadataFunction} from 'remotion';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/500-italic.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';
import {EscapeRing, BallDrop, Spiro} from './Backgrounds';

// Text formats with no voice and no invented whispers: questions, finish-the-sentence, this-or-that,
// rankings, "red flag or fair enough" and text memes. Every one asks the viewer a question they can answer in a second.
// meme: the title is the setup, items are the beats; they land one at a time and the last one (the punchline) is in brass.
export type TextReelProps = {
  layout: 'question' | 'finish' | 'choice' | 'rank' | 'flag' | 'scale' | 'meme';
  bg: 'gradient' | 'ring' | 'drop' | 'spiro';
  kicker?: string;
  title: string;
  items?: string[];
  cta: string;
  seconds?: number;
  seed?: number;
  audio?: string;
};

export const textReelMetadata: CalculateMetadataFunction<TextReelProps> = ({props}) => ({durationInFrames: Math.round((props.seconds ?? 10) * 30)});

const INK = '#0a0d18';
const PAPER = '#f6efe2';
const BRASS = '#e2b964';
const serif = 'Newsreader, Georgia, serif';
const sans = '"Instrument Sans", system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (t: number, at: number) => interpolate(t, [at, at + 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.7))});
const fade = (t: number, at: number) => interpolate(t, [at, at + 0.35], [0, 1], clamp);
const HUES = [['#3a2150', '#1d3550'], ['#4a2638', '#24304f'], ['#1d3550', '#3a2a18'], ['#2b1d4a', '#14363a']];
const stroke = {WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'} as const;

const Brand: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
    <svg width={52} height={52} viewBox="0 0 32 32"><path d="M16 7c1 3.5 5 5.6 5 10a5 5 0 0 1-10 0c0-2 1-3.4 2.2-4.6.2 1.6 1 2.6 2.1 3-.4-3.2.2-6 .7-8.4z" fill="none" stroke={BRASS} strokeWidth={1.6} strokeLinejoin="round" /></svg>
    <span style={{fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: BRASS}}>WHISPERS</span>
  </div>
);

export const TextReel: React.FC<TextReelProps> = ({layout, bg, kicker, title, items = [], cta, seconds = 10, seed = 0, audio}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const busy = bg !== 'gradient'; // physics backgrounds fill the lower half, so text sits in the top half with an outline
  const [a, b] = HUES[seed % HUES.length];
  const grad = `radial-gradient(60% 45% at ${30 + 20 * Math.sin(t * 0.5)}% ${35 + 10 * Math.cos(t * 0.4)}%, ${a} 0%, transparent 70%), radial-gradient(60% 45% at ${70 - 20 * Math.sin(t * 0.45)}% ${70 + 10 * Math.sin(t * 0.35)}%, ${b} 0%, transparent 70%), ${INK}`;
  const ctaAt = Math.max(2.5, seconds - 3.2);
  const titleSize = title.length > 60 ? 74 : title.length > 36 ? 88 : 104;

  // finish-the-sentence: the sentence types itself out, with a blinking cursor at the end
  const typed = layout === 'finish' ? title.slice(0, Math.floor(interpolate(t, [0.3, 0.3 + title.length * 0.045], [Math.min(14, title.length), title.length], clamp))) : title;
  const cursor = layout === 'finish' && Math.floor(t * 2) % 2 === 0;

  return (
    <AbsoluteFill style={{background: grad}}>
      {audio && <Audio src={staticFile(audio)} />}
      {bg === 'ring' && <EscapeRing frame={frame} />}
      {bg === 'drop' && <BallDrop frame={frame} />}
      {bg === 'spiro' && <Spiro frame={frame} />}
      <AbsoluteFill style={{padding: busy ? '150px 80px 0' : '0 90px', justifyContent: busy ? 'flex-start' : 'center'}}>
        <Brand />
        {kicker && <div style={{marginTop: 34, fontFamily: sans, fontWeight: 700, fontSize: 40, color: BRASS, ...(busy ? stroke : {})}}>{kicker}</div>}
        <div style={{marginTop: kicker ? 14 : 34, fontFamily: serif, fontWeight: 500, fontSize: titleSize, lineHeight: 1.08, color: PAPER, ...(busy ? stroke : {})}}>
          {typed}{layout === 'finish' && <span style={{opacity: cursor ? 1 : 0, color: BRASS}}>|</span>}
        </div>

        {layout === 'choice' && (
          <div style={{marginTop: 46, display: 'flex', flexDirection: 'column', gap: 24}}>
            {items.slice(0, 2).map((it, i) => (
              <div key={i} style={{transform: `scale(${pop(t, 0.8 + i * 0.5)})`, transformOrigin: 'left center', display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(246,239,226,0.94)', borderRadius: 28, padding: '26px 32px'}}>
                <span style={{fontFamily: sans, fontWeight: 700, fontSize: 44, color: INK, background: BRASS, borderRadius: 999, width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{'AB'[i]}</span>
                <span style={{fontFamily: serif, fontSize: 50, lineHeight: 1.12, color: INK}}>{it}</span>
              </div>
            ))}
          </div>
        )}

        {layout === 'rank' && (
          <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18}}>
            {items.map((it, i) => (
              <div key={i} style={{opacity: fade(t, 0.8 + i * 0.7), transform: `translateX(${(1 - fade(t, 0.8 + i * 0.7)) * -40}px)`, display: 'flex', gap: 22, alignItems: 'baseline'}}>
                <span style={{fontFamily: sans, fontWeight: 700, fontSize: 46, color: BRASS, ...(busy ? stroke : {})}}>{i + 1}</span>
                <span style={{fontFamily: serif, fontSize: 52, lineHeight: 1.12, color: PAPER, ...(busy ? stroke : {})}}>{it}</span>
              </div>
            ))}
          </div>
        )}

        {layout === 'flag' && (
          <div style={{marginTop: 50, display: 'flex', gap: 24}}>
            <div style={{transform: `scale(${pop(t, 1.6)})`, fontFamily: sans, fontWeight: 700, fontSize: 48, color: PAPER, background: '#c2414b', padding: '22px 36px', borderRadius: 999}}>{items[0] ?? 'Red flag'}</div>
            <div style={{transform: `scale(${pop(t, 1.9)})`, fontFamily: sans, fontWeight: 700, fontSize: 48, color: INK, background: '#7fd1a8', padding: '22px 36px', borderRadius: 999}}>{items[1] ?? 'Fair enough'}</div>
          </div>
        )}

        {layout === 'meme' && (
          <div style={{marginTop: 44, display: 'flex', flexDirection: 'column', gap: 26}}>
            {items.map((it, i) => {
              const at = 1.0 + i * 1.1;
              const last = i === items.length - 1;
              return (
                <div key={i} style={{opacity: fade(t, at), transform: `scale(${pop(t, at)})`, transformOrigin: 'left center', fontFamily: sans, fontWeight: 700, fontSize: last ? 60 : 52, lineHeight: 1.15, color: last ? BRASS : PAPER, ...(busy ? stroke : {})}}>{it}</div>
              );
            })}
          </div>
        )}

        {layout === 'scale' && (
          <div style={{marginTop: 50, display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} style={{transform: `scale(${pop(t, 1.2 + i * 0.08)})`, width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontWeight: 700, fontSize: 40, color: INK, background: `hsl(${i * 12}, 70%, ${72 - i * 2}%)`}}>{i + 1}</div>
            ))}
          </div>
        )}

        <div style={{marginTop: 54, alignSelf: 'flex-start', transform: `scale(${pop(t, ctaAt)})`, transformOrigin: 'left center', fontFamily: sans, fontWeight: 700, fontSize: 40, color: INK, background: BRASS, padding: '18px 36px', borderRadius: 999}}>{cta}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
