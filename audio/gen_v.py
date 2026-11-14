import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
parts=[("hook","Is she wrong for this?",0.35),
("w","I skipped my best friend's wedding. She made me pay four hundred dollars for a bridesmaid dress I'll never wear again, and I couldn't afford it. So I said I was sick. She still doesn't know.",0.6),
("q","Wrong, or not wrong? Tell me in the comments.",0.2)]
sr=24000; out=[]; marks={}; t=0
for key,text,p in parts:
    a,sr=k.create(text,voice="af_heart",speed=1.25,lang="en-us")
    marks[key]=[round(t,3),round(t+len(a)/sr,3)]; out+=[a,np.zeros(int(sr*p),dtype=a.dtype)]; t+=len(a)/sr+p
sf.write("vov.wav",np.concatenate(out),sr); json.dump(marks,open("marksv.json","w")); print(marks,t)
