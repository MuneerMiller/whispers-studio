"""Lay sound effects over a music bed.  python3 audio/sfx.py <bed.wav> <cues.json> <out.wav>
cues.json: [{"t": seconds, "kind": "whoosh|boom|tick|pop|ding|glitch|riser"}] (made by storyboard-timing.mjs).
Everything is synthesised here, so there's nothing to license."""
import json, sys, numpy as np, soundfile as sf, scipy.signal as s

bed, sr = sf.read(sys.argv[1], dtype='float32')
if bed.ndim == 1: bed = np.stack([bed, bed], 1)
cues = json.load(open(sys.argv[2]))
rng = np.random.default_rng(3)
n = lambda d: np.arange(int(sr * d)) / sr
def env(t, a=0.004, d=8.0): return np.minimum(1, t / a) * np.exp(-t * d)
def bp(x, lo, hi): return s.sosfilt(s.butter(2, [lo, hi], 'band', fs=sr, output='sos'), x)

def whoosh():
    t = n(0.45); x = rng.normal(0, 1, len(t)); out = np.zeros_like(x); k = 24
    for i in range(k):  # a band of noise sweeping up then down
        a, b = i * len(t) // k, (i + 1) * len(t) // k; f = 600 + 3500 * np.sin(np.pi * i / k)
        out[a:b] = bp(x[a:b], f * 0.7, min(f * 1.4, sr / 2 - 100))
    return out * np.sin(np.pi * t / t[-1]) * 0.5
def boom():
    t = n(0.7); f = 48 + 80 * np.exp(-t * 18)
    return (np.sin(2 * np.pi * np.cumsum(f) / sr) * env(t, 0.002, 5) * 0.9 + bp(rng.normal(0, 1, len(t)), 80, 900) * env(t, 0.001, 25) * 0.3)
def tick(): t = n(0.06); return bp(rng.normal(0, 1, len(t)), 2000, 7000) * env(t, 0.0005, 70) * 0.35
def pop(): t = n(0.12); f = 900 - 500 * t / 0.12; return np.sin(2 * np.pi * np.cumsum(f) / sr) * env(t, 0.001, 30) * 0.45
def ding():
    t = n(1.1); return sum(np.sin(2 * np.pi * f * t) * a for f, a in ((1320, .5), (1980, .25), (2640, .12))) * env(t, 0.002, 3.5) * 0.5
def glitch():
    t = n(0.35); x = np.sign(np.sin(2 * np.pi * 180 * t)) * (rng.random(len(t)) > 0.5) * 0.25
    return x * (np.floor(t * 40) % 2) * env(t, 0.001, 6)
def riser():
    t = n(1.0); x = rng.normal(0, 1, len(t)); out = np.zeros_like(x); k = 20
    for i in range(k):
        a, b = i * len(t) // k, (i + 1) * len(t) // k; f = 300 + 5000 * i / k
        out[a:b] = bp(x[a:b], f * 0.8, min(f * 1.3, sr / 2 - 100))
    return out * (t / t[-1]) ** 2 * 0.35
MAKE = dict(whoosh=whoosh, boom=boom, tick=tick, pop=pop, ding=ding, glitch=glitch, riser=riser)

fx = np.zeros(len(bed), dtype='float32')
for c in cues:
    x = MAKE.get(c['kind'], tick)().astype('float32'); i = int(c['t'] * sr); j = min(len(fx), i + len(x))
    if j > i: fx[i:j] += x[:j - i]
mix = bed * 0.75 + np.stack([fx, fx], 1)
mix = np.tanh(mix * 1.2) / np.tanh(1.2); mix *= 0.95 / max(1e-6, np.abs(mix).max())
sf.write(sys.argv[3], mix.astype('float32'), sr); print('sfx', len(cues), 'cues')
