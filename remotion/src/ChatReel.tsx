import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/700.css';

// Text-message story: a chat plays out bubble by bubble (with a typing indicator before each of theirs),
// building to a twist, then asks the viewer what they'd do. Always labelled "Dramatised story".
export type ChatMsg = {from: 'me' | 'them'; text: string};
export type ChatReelProps = {hook: string; contact: string; messages: ChatMsg[]; question: string; audio?: string; seed?: number};

const INK = '#0a0d18';
const BRASS = '#e2b964';
const sans = '"Instrument Sans", system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Timing: reading speed decides how long each bubble stays before the next arrives.
export const chatTimeline = (messages: ChatMsg[]) => {
  let t = 1.6; // hook on screen first
  return messages.map((m) => {
    const typing = m.from === 'them' ? 0.9 : 0.35;
    const at = t + typing;
    t = at + Math.min(3.2, 0.9 + m.text.length * 0.045);
    return {at, typingFrom: at - typing, end: t};
  });
};
export const chatReelMeta = ({props}: {props: ChatReelProps}) => {
  const tl = chatTimeline(props.messages);
  return {durationInFrames: Math.round((tl[tl.length - 1].end + 3.2) * 30)};
};

export const ChatReel: React.FC<ChatReelProps> = ({hook, contact, messages, question, audio}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const tl = chatTimeline(messages);
  const endAt = tl[tl.length - 1].end;
  const shown = messages.map((m, i) => ({...m, ...tl[i]})).filter((m) => t >= m.at);
  const typing = messages.find((m, i) => m.from === 'them' && t >= tl[i].typingFrom && t < tl[i].at);
  // keep the newest bubbles in view: scroll up once the stack gets tall
  const visible = shown.slice(-7);
  const q = interpolate(t, [endAt, endAt + 0.4], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.5))});

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile(audio)} volume={0.55} />}
      {/* header like a phone chat */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: '#111318', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 26, borderBottom: '1px solid #23262e'}}>
        <div style={{width: 96, height: 96, borderRadius: 48, background: 'linear-gradient(135deg,#6b7280,#374151)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontWeight: 700, fontSize: 44, color: '#fff'}}>{contact.slice(0, 1).toUpperCase()}</div>
        <div style={{marginTop: 12, fontFamily: sans, fontWeight: 500, fontSize: 34, color: '#fff'}}>{contact}</div>
      </div>
      <div style={{position: 'absolute', top: 318, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: 1, color: 'rgba(246,239,226,0.45)'}}>dramatised</div>
      {/* hook bar: on screen from frame 0 */}
      <div style={{position: 'absolute', top: 372, left: 60, right: 60, textAlign: 'center'}}>
        <span style={{fontFamily: sans, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: INK, background: BRASS, padding: '8px 22px', borderRadius: 16, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{hook}</span>
      </div>
      <div style={{position: 'absolute', top: 600, bottom: 300, left: 50, right: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 18}}>
        {visible.map((m, i) => {
          const pop = interpolate(t - m.at, [0, 0.18], [0.7, 1], {...clamp, easing: Easing.out(Easing.back(2))});
          const me = m.from === 'me';
          return (
            <div key={i} style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '78%', transform: `scale(${pop})`, transformOrigin: me ? 'right bottom' : 'left bottom', background: me ? '#0b84fe' : '#26252a', color: '#fff', fontFamily: sans, fontWeight: 500, fontSize: 46, lineHeight: 1.25, padding: '20px 30px', borderRadius: 40}}>
              {m.text}
            </div>
          );
        })}
        {typing && (
          <div style={{alignSelf: 'flex-start', background: '#26252a', borderRadius: 40, padding: '26px 34px', display: 'flex', gap: 12}}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{width: 18, height: 18, borderRadius: 9, background: '#8e8e93', opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 5 + k))}} />
            ))}
          </div>
        )}
      </div>
      {t >= endAt && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${0.75 * q})`, justifyContent: 'center', alignItems: 'center', padding: 80}}>
          <div style={{transform: `scale(${q})`, background: '#f6efe2', borderRadius: 40, padding: '56px 50px', textAlign: 'center'}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 70, lineHeight: 1.12, color: INK}}>{question}</div>
            <div style={{marginTop: 26, fontFamily: sans, fontWeight: 500, fontSize: 22, color: 'rgba(10,13,24,0.4)'}}>dramatised</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
