"""Narrate a story with Kokoro TTS and estimate word timings for captions.
usage: python3 audio/tts_story.py <story.txt> <out.wav> <out.json>
Each sentence is spoken separately, so caption timing is exact per sentence and spread across its words
by length inside it. Models download once to ~/.cache/kokoro (about 120 MB)."""
import json, os, re, sys, urllib.request
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

CACHE = os.path.expanduser('~/.cache/kokoro'); os.makedirs(CACHE, exist_ok=True)
BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
FILES = {'model': 'kokoro-v1.0.int8.onnx', 'voices': 'voices-v1.0.bin'}
for f in FILES.values():
    p = os.path.join(CACHE, f)
    if not os.path.exists(p):
        urllib.request.urlretrieve(BASE + f, p + '.part'); os.replace(p + '.part', p)
k = Kokoro(os.path.join(CACHE, FILES['model']), os.path.join(CACHE, FILES['voices']))

text = open(sys.argv[1]).read().strip()
sentences = [s.strip() for s in re.split(r'(?<=[.!?…])\s+', text) if s.strip()]
SPEED = 1.15
out, words, t, sr = [], [], 0.0, 24000
for s in sentences:
    a, sr = k.create(s, voice='af_heart', speed=SPEED, lang='en-us')
    dur = len(a) / sr
    ws = s.split()
    weights = [max(2, len(re.sub(r'\W', '', w))) + 1 for w in ws]
    total = sum(weights); cur = t + 0.05
    for w, wt in zip(ws, weights):
        d = (dur - 0.1) * wt / total
        words.append({'w': w, 's': round(cur, 3), 'e': round(cur + d, 3)}); cur += d
    gap = 0.35
    out += [a, np.zeros(int(sr * gap), dtype=a.dtype)]
    t += dur + gap
sf.write(sys.argv[2], np.concatenate(out), sr)
json.dump({'words': words, 'duration': round(t, 3)}, open(sys.argv[3], 'w'))
print(f'narrated {len(sentences)} sentences, {t:.1f}s')
