import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

// Original "satisfying" backgrounds. All deterministic: simulated once per process, indexed by frame.
export const PALETTE = ['#e2b964', '#d98aa3', '#9b7fe0', '#5fb3c4', '#7fd1a8', '#f0956b'];
const FPS = 30;
const MAXF = 60 * FPS;

// ---------- 1. Escape the ring: balls bounce inside a spinning ring with a gap; each escape spawns two more ----------
type Ball = {x: number; y: number; vx: number; vy: number; r: number; c: number; out: boolean; born: number};
const escapeSim = (() => {
  const cx = 540, cy = 1200, R = 360, gap = (42 * Math.PI) / 180, spin = 1.1; // rad/s
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let balls: Ball[] = [{x: cx, y: cy - 120, vx: 380, vy: -100, r: 22, c: 0, out: false, born: 0}];
  const frames: {balls: [number, number, number, number][]; angle: number; escaped: number}[] = [];
  let escaped = 0;
  const SUB = 6, dt = 1 / FPS / SUB;
  for (let f = 0; f < MAXF; f++) {
    for (let s = 0; s < SUB; s++) {
      const t = (f * SUB + s) * dt;
      const ang = (t * spin) % (Math.PI * 2);
      const spawn: Ball[] = [];
      for (const b of balls) {
        b.vy += 900 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.out) continue;
        const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy);
        if (d + b.r > R) {
          let a = Math.atan2(dy, dx) - ang;
          a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          if (a < gap) {
            b.out = true;
            escaped++;
            if (balls.length + spawn.length < 46)
              for (let k = 0; k < 2; k++)
                spawn.push({x: cx + (rnd() - 0.5) * 40, y: cy - 60, vx: (rnd() - 0.5) * 900, vy: -300 - rnd() * 300, r: 20, c: (b.c + 1 + k) % PALETTE.length, out: false, born: t});
          } else {
            const nx = dx / d, ny = dy / d;
            b.x = cx + nx * (R - b.r - 0.5);
            b.y = cy + ny * (R - b.r - 0.5);
            const dot = b.vx * nx + b.vy * ny;
            b.vx -= 2 * dot * nx;
            b.vy -= 2 * dot * ny;
            const sp = Math.hypot(b.vx, b.vy), target = Math.min(Math.max(sp, 650), 1100);
            b.vx = (b.vx / sp) * target + (rnd() - 0.5) * 40;
            b.vy = (b.vy / sp) * target;
          }
        }
      }
      balls = balls.concat(spawn).filter((b) => b.y < 2300);
    }
    frames.push({balls: balls.map((b) => [Math.round(b.x), Math.round(b.y), b.r, b.c]), angle: ((f / FPS) * spin) % (Math.PI * 2), escaped});
  }
  return {cx, cy, R, gap, frames};
})();

export const EscapeRing: React.FC<{frame: number}> = ({frame}) => {
  const {cx, cy, R, gap, frames} = escapeSim;
  const fr = frames[Math.min(frame, frames.length - 1)];
  const a0 = fr.angle + gap, a1 = fr.angle + 2 * Math.PI;
  const arc = `M ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A ${R} ${R} 0 1 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d={arc} fill="none" stroke="#f6efe2" strokeWidth={10} strokeLinecap="round" />
      {fr.balls.map(([x, y, r, c], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={PALETTE[c]} stroke="#f6efe2" strokeWidth={3} />
      ))}
    </svg>
  );
};

// ---------- 2. Ball drop board: balls fall through pegs into bins ----------
const plinkoSim = (() => {
  const pegs: [number, number][] = [];
  for (let row = 0; row < 11; row++)
    for (let col = 0; col <= row + 2; col++) pegs.push([540 + (col - (row + 2) / 2) * 76, 760 + row * 70]);
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  type P = {x: number; y: number; vx: number; vy: number; c: number; settled: boolean};
  const ps: P[] = [];
  const frames: [number, number, number][][] = [];
  const SUB = 4, dt = 1 / FPS / SUB, pr = 10, br = 15;
  for (let f = 0; f < MAXF; f++) {
    if (f % 7 === 0 && ps.length < 160) ps.push({x: 540 + (rnd() - 0.5) * 12, y: 640, vx: 0, vy: 0, c: ps.length % PALETTE.length, settled: false});
    for (let s = 0; s < SUB; s++)
      for (const p of ps) {
        if (p.settled) continue;
        p.vy += 1400 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        for (const [qx, qy] of pegs) {
          const dx = p.x - qx, dy = p.y - qy, d = Math.hypot(dx, dy);
          if (d < pr + br) {
            const nx = dx / d, ny = dy / d;
            p.x = qx + nx * (pr + br);
            p.y = qy + ny * (pr + br);
            const dot = p.vx * nx + p.vy * ny;
            p.vx = (p.vx - 1.5 * dot * nx) * 0.82 + (rnd() - 0.5) * 30;
            p.vy = (p.vy - 1.5 * dot * ny) * 0.82;
          }
        }
        if (p.y > 1660) {
          // stack into bins
          const bin = Math.round((p.x - 540) / 76);
          const count = ps.filter((o) => o.settled && Math.round((o.x - 540) / 76) === bin).length;
          p.x = 540 + bin * 76 + ((count % 2) - 0.5) * 30;
          p.y = 1700 - Math.floor(count / 2) * 30;
          p.settled = true;
        }
      }
    frames.push(ps.map((p) => [Math.round(p.x), Math.round(p.y), p.c]));
  }
  return {pegs, frames};
})();

export const BallDrop: React.FC<{frame: number}> = ({frame}) => {
  const fr = plinkoSim.frames[Math.min(frame, plinkoSim.frames.length - 1)];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {plinkoSim.pegs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={10} fill="#f6efe2" opacity={0.85} />
      ))}
      {Array.from({length: 15}).map((_, i) => (
        <line key={i} x1={540 + (i - 7) * 76 + 38} y1={1490} x2={540 + (i - 7) * 76 + 38} y2={1730} stroke="#f6efe2" strokeOpacity={0.25} strokeWidth={3} />
      ))}
      {fr.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={15} fill={PALETTE[c]} stroke="#0a0d18" strokeWidth={2} />
      ))}
    </svg>
  );
};

// ---------- 3. Spirograph: a glowing line drawing itself ----------
export const Spiro: React.FC<{frame: number}> = ({frame}) => {
  const R = 300, r = 113, d = 190, cx = 540, cy = 1200;
  const steps = Math.min(frame * 9, 4000);
  const segs: React.ReactNode[] = [];
  let prev: [number, number] | null = null;
  let path = '';
  let segIdx = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i * 0.02;
    const x = cx + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = cy + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    path += prev ? ` L ${x.toFixed(1)} ${y.toFixed(1)}` : `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    prev = [x, y];
    if (i % 400 === 399 || i === steps) {
      segs.push(<path key={segIdx} d={path} fill="none" stroke={PALETTE[segIdx % PALETTE.length]} strokeWidth={3} opacity={0.85} />);
      path = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      segIdx++;
    }
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g style={{transform: `rotate(${frame * 0.15}deg)`, transformOrigin: `${cx}px ${cy}px`}}>{segs}</g>
      {prev && <circle cx={prev[0]} cy={prev[1]} r={12} fill="#fff" />}
    </svg>
  );
};

// ---------- 4. Real night footage ----------
export const Footage: React.FC<{src: string}> = ({src}) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)'}} />
  </AbsoluteFill>
);
