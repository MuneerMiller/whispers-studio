import json, sys, soundfile as sf, numpy as np
from faster_whisper import WhisperModel
a, sr = sf.read(sys.argv[1], dtype='float32')
import scipy.signal as s
a16 = s.resample_poly(a, 16000, sr).astype('float32')
m = WhisperModel("base.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a16, word_timestamps=True)
words=[{"w":w.word.strip(),"s":round(w.start,3),"e":round(w.end,3)} for sg in segs for w in sg.words]
json.dump({"duration":len(a)/sr,"words":words}, open(sys.argv[2],"w"), indent=0)
print(" ".join(w["w"] for w in words)); print(len(words), len(a)/sr)
