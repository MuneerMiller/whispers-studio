import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
parts = [
 ("w1","My wedding ring is fake. I sold the real one two years ago to cover rent... and my husband still thinks I just don't like wearing it to work."),
 ("w2","Number two. I tell everyone I'm allergic to cats. I'm not. My ex had one, and I still can't be in a room with a cat without crying."),
 ("w3","Number three. I've been going to the gym at five a.m. for a whole year. Not for fitness. It's the only hour where nobody needs anything from me."),
 ("w4","And number four. I still have my dad's last voicemail. It's been six years, and I've never played it. Because as long as I don't... there's still one thing he said to me that I haven't heard yet."),
 ("cta","Which one could you never say out loud? Say yours, anonymously. Comment whisper."),
]
sr=24000; out=[]; marks={}; t=0.0
for key,text in parts:
    a, sr = k.create(text, voice="af_heart", speed=1.04, lang="en-us")
    marks[key]=[round(t,3), round(t+len(a)/sr,3)]
    pause = 0.7 if key in ("w1","w2","w3") else (1.0 if key=="w4" else 0.25)
    out += [a, np.zeros(int(sr*pause), dtype=a.dtype)]
    t += len(a)/sr + pause
sf.write("vo3.wav", np.concatenate(out), sr)
json.dump(marks, open("marks3.json","w")); print(marks, t)
