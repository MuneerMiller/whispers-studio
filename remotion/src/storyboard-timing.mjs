// Shared by StoryboardReel.tsx (to draw) and scripts/render.mjs (to place sound effects and size the music).
// One place decides when every scene starts, so picture and sound always line up.
export const FPS = 30;

// How long a scene lasts if the storyboard doesn't say: long enough to read, short enough to keep pace.
export const sceneDefault = (s) => {
  const words = (s.text ?? '').split(/\s+/).filter(Boolean).length;
  switch (s.type) {
    case 'slam': return Math.max(1.4, 0.32 * words + 0.8);
    case 'type': return Math.max(1.6, 0.06 * (s.text ?? '').length + 1.0);
    case 'chat': return (s.messages ?? []).reduce((t, m) => t + 0.5 + Math.min(1.8, m.text.length * 0.035), 0.6);
    case 'emoji': return 1.4;
    case 'versus': return 2.6;
    case 'redact': return Math.max(2.4, 0.05 * (s.text ?? '').length + 1.6);
    case 'list': return 0.6 + (s.items ?? []).length * 0.9 + 0.6;
    case 'glitch': return Math.max(1.4, 0.3 * words + 0.8);
    case 'zoom': return Math.max(1.3, 0.28 * words + 0.7);
    case 'question': return 3.4;
    default: return 2;
  }
};

export const timeline = (scenes) => {
  let t = 0;
  return scenes.map((s) => {
    const dur = s.dur ?? sceneDefault(s);
    const out = { ...s, start: t, dur, end: t + dur };
    t += dur;
    return out;
  });
};

export const totalSeconds = (scenes) => { const tl = timeline(scenes); return tl[tl.length - 1].end; };

// Sound cues: what kind of hit, and when (seconds). The music generator mixes these over the bed.
export const soundCues = (scenes) => {
  const cues = [];
  for (const s of timeline(scenes)) {
    if (s.start > 0 && s.transition !== 'cut') cues.push({ t: s.start, kind: 'whoosh' });
    const words = (s.text ?? '').split(/\s+/).filter(Boolean);
    if (s.type === 'slam') words.forEach((_, i) => cues.push({ t: s.start + 0.12 + i * 0.28, kind: i === words.length - 1 ? 'boom' : 'tick' }));
    if (s.type === 'emoji') cues.push({ t: s.start + 0.05, kind: 'pop' });
    if (s.type === 'versus') cues.push({ t: s.start + 0.1, kind: 'whoosh' }, { t: s.start + 0.9, kind: 'boom' });
    if (s.type === 'redact') cues.push({ t: s.start + s.dur * 0.55, kind: 'ding' });
    if (s.type === 'list') (s.items ?? []).forEach((_, i) => cues.push({ t: s.start + 0.6 + i * 0.9, kind: 'pop' }));
    if (s.type === 'glitch') cues.push({ t: s.start + 0.05, kind: 'glitch' });
    if (s.type === 'zoom') cues.push({ t: s.start + 0.05, kind: 'riser' });
    if (s.type === 'chat') { let t = s.start + 0.6; for (const m of s.messages ?? []) { cues.push({ t, kind: 'pop' }); t += 0.5 + Math.min(1.8, m.text.length * 0.035); } }
    if (s.type === 'question') cues.push({ t: s.start + 0.05, kind: 'ding' });
  }
  return cues;
};
