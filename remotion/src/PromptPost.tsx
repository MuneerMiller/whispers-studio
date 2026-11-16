import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/500-italic.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';

// Prompt post: one question on a soft moving gradient. No voice, no invented whispers.
// Props come from the post plan (scripts/render.mjs passes them with --props).
export type PromptProps = {question: string; sub?: string; cta?: string; audio?: string; seed?: number};
export const promptDuration = 8 * 30;

const INK = '#0a0d18';
const PAPER = '#f6efe2';
const BRASS = '#e2b964';
const serif = 'Newsreader, Georgia, serif';
const sans = '"Instrument Sans", system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HUES = [['#3a2150', '#1d3550'], ['#4a2638', '#24304f'], ['#1d3550', '#3a2a18'], ['#2b1d4a', '#14363a']];

const Flame: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M16 7c1 3.5 5 5.6 5 10a5 5 0 0 1-10 0c0-2 1-3.4 2.2-4.6.2 1.6 1 2.6 2.1 3-.4-3.2.2-6 .7-8.4z" fill="none" stroke={BRASS} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

export const PromptPost: React.FC<PromptProps> = ({question, sub, cta, audio, seed = 0}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const [a, b] = HUES[seed % HUES.length];
  const x1 = 30 + 20 * Math.sin(t * 0.5), y1 = 35 + 10 * Math.cos(t * 0.4);
  const x2 = 70 - 20 * Math.sin(t * 0.45), y2 = 70 + 10 * Math.sin(t * 0.35);
  const words = question.split(' ');
  const subIn = interpolate(t, [2.4, 3.0], [0, 1], clamp);
  const ctaIn = interpolate(t, [3.6, 4.1], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <AbsoluteFill style={{background: `radial-gradient(60% 45% at ${x1}% ${y1}%, ${a} 0%, transparent 70%), radial-gradient(60% 45% at ${x2}% ${y2}%, ${b} 0%, transparent 70%), ${INK}`}}>
      {audio && <Audio src={staticFile(audio)} />}
      <AbsoluteFill style={{padding: '0 100px', justifyContent: 'center'}}>
        {/* frame 0 already shows the whole question (the hook); words only brighten in */}
        <div style={{fontFamily: serif, fontWeight: 500, fontSize: 104, lineHeight: 1.08, color: PAPER}}>
          {words.map((w, i) => (
            <span key={i} style={{opacity: interpolate(t, [i * 0.12, i * 0.12 + 0.3], [0.55, 1], clamp)}}>{w} </span>
          ))}
        </div>
        {sub && <div style={{marginTop: 44, opacity: subIn, fontFamily: serif, fontStyle: 'italic', fontSize: 52, color: 'rgba(246,239,226,0.8)'}}>{sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
