import json, numpy as np, soundfile as sf, scipy.signal as s
SR=48000; DUR=json.load(open('../reel/src/words3.json'))['duration']; N=int(SR*DUR); rng=np.random.default_rng(11)
d=json.load(open('../reel/src/words3.json'))
vo,vsr=sf.read('vo3f.wav',dtype='float32'); vo=s.resample_poly(vo,SR,vsr)
def put(b,x,at):
    i=int(at*SR); j=min(N,i+len(x));
    if j>i: b[i:j]+=x[:j-i]
def hz(n): return 440*2**((n-69)/12)
def ep(f,dur,vel):  # soft electric piano
    t=np.arange(int(SR*dur))/SR
    y=np.sin(2*np.pi*f*t+0.9*np.sin(2*np.pi*f*2*t)*np.exp(-t*4))*np.exp(-t*1.4)
    return vel*y*np.minimum(1,t/0.004)
bed=np.zeros(N); drums=np.zeros(N)
bar=3.0; chords=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]]
for b in range(int(DUR/bar)):
    at=b*bar; ch=chords[b%4]
    put(bed,ep(hz(ch[0]-12),2.9,.5),at)
    for k,n in enumerate(ch): put(bed,ep(hz(n),2.6,.22),at+0.03*k)
    put(bed,ep(hz(ch[2]+12),1.2,.12),at+1.5)
    for beat in range(4):
        tt=at+beat*0.75
        if beat in (0,2):
            t=np.arange(int(SR*.35))/SR; f=55+90*np.exp(-t*30)
            put(drums,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*12)*.7,tt)
        else:
            nz=rng.normal(0,1,int(SR*.12))*np.exp(-np.arange(int(SR*.12))/SR*40)
            put(drums,s.sosfilt(s.butter(2,1800,'hp',fs=SR,output='sos'),nz)*.18,tt)
        for h in (0,0.375):
            nz=rng.normal(0,1,int(SR*.04))*np.exp(-np.arange(int(SR*.04))/SR*90)
            put(drums,s.sosfilt(s.butter(2,7000,'hp',fs=SR,output='sos'),nz)*.06,tt+h)
bed=s.sosfilt(s.butter(2,2600,'lp',fs=SR,output='sos'),bed)
# vinyl crackle
cr=np.zeros(N); idx=rng.integers(0,N,int(DUR*25)); cr[idx]=rng.normal(0,.25,len(idx))
cr=s.sosfilt(s.butter(2,1500,'hp',fs=SR,output='sos'),cr)
# bounce ticks: soft marimba notes on pentatonic
pent=[69,72,74,76,79,81,84]; ticks=np.zeros(N)
for i,bt in enumerate(d['bounces']):
    t=np.arange(int(SR*.4))/SR; f=hz(pent[i%len(pent)])
    put(ticks,(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*4*t)*np.exp(-t*30))*np.exp(-t*14),bt)
music=bed/np.abs(bed).max()*.5+drums/np.abs(drums).max()*.35+cr*.3
v=np.zeros(N); put(v,vo,0.0)
v=s.sosfilt(s.butter(2,90,'hp',fs=SR,output='sos'),v)
env=s.sosfilt(s.butter(1,8,fs=SR,output='sos'),np.abs(v)); v=v*np.where(env>0.08,(0.08/np.maximum(env,1e-9))**.5,1)
venv=s.sosfilt(s.butter(1,3,fs=SR,output='sos'),np.abs(v)); duck=1-0.5*np.clip(venv/0.04,0,1)
mix=v/np.abs(v).max()*0.85 + music*0.30*duck
mix=np.tanh(mix*1.1)/np.tanh(1.1); mix*=0.95/np.abs(mix).max()
f=int(SR*1.5); mix[-f:]*=np.linspace(1,0,f)
sf.write('../reel/public/mix3.wav',np.stack([mix,mix],1).astype('float32'),SR); print('ok')
