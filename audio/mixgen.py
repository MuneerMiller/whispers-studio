import sys, json, numpy as np, soundfile as sf, scipy.signal as s
vo_path, out_path, DUR = sys.argv[1], sys.argv[2], float(sys.argv[3]); seed=int(sys.argv[4]) if len(sys.argv)>4 else 1
SR=48000; N=int(SR*DUR); rng=np.random.default_rng(seed)
def put(b,x,at):
    i=int(at*SR); j=min(N,i+len(x))
    if j>i: b[i:j]+=x[:j-i]
def hz(n): return 440*2**((n-69)/12)
def ep(f,dur,vel):
    t=np.arange(int(SR*dur))/SR
    return vel*np.sin(2*np.pi*f*t+0.9*np.sin(2*np.pi*f*2*t)*np.exp(-t*4))*np.exp(-t*1.4)*np.minimum(1,t/0.004)
progs=[[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,65]],[[50,53,57,60],[55,58,62,65],[48,52,55,60],[53,57,60,64]],[[52,55,59,62],[48,52,55,59],[45,48,52,55],[47,50,54,57]]]
chords=progs[seed%3]; bar=60/84*4
bed=np.zeros(N); drums=np.zeros(N)
for b in range(int(DUR/bar)+1):
    at=b*bar; ch=chords[b%4]
    put(bed,ep(hz(ch[0]-12),bar,.5),at)
    for k,n in enumerate(ch): put(bed,ep(hz(n),bar*.9,.22),at+0.03*k)
    for beat in range(4):
        tt=at+beat*bar/4
        if beat in (0,2):
            t=np.arange(int(SR*.35))/SR; f=55+90*np.exp(-t*30); put(drums,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*12)*.7,tt)
        else:
            nz=rng.normal(0,1,int(SR*.12))*np.exp(-np.arange(int(SR*.12))/SR*40); put(drums,s.sosfilt(s.butter(2,1800,'hp',fs=SR,output='sos'),nz)*.18,tt)
        for h in (0,bar/8):
            nz=rng.normal(0,1,int(SR*.04))*np.exp(-np.arange(int(SR*.04))/SR*90); put(drums,s.sosfilt(s.butter(2,7000,'hp',fs=SR,output='sos'),nz)*.06,tt+h)
bed=s.sosfilt(s.butter(2,2600,'lp',fs=SR,output='sos'),bed)
music=bed/np.abs(bed).max()*.5+drums/np.abs(drums).max()*.35
if vo_path!='none':
    vo,vsr=sf.read(vo_path,dtype='float32'); vo=s.resample_poly(vo,SR,vsr)
    v=np.zeros(N); put(v,vo,0.0); v=s.sosfilt(s.butter(2,90,'hp',fs=SR,output='sos'),v)
    env=s.sosfilt(s.butter(1,8,fs=SR,output='sos'),np.abs(v)); v=v*np.where(env>0.08,(0.08/np.maximum(env,1e-9))**.5,1)
    venv=s.sosfilt(s.butter(1,3,fs=SR,output='sos'),np.abs(v)); duck=1-0.5*np.clip(venv/0.04,0,1)
    mix=v/np.abs(v).max()*0.85+music*0.30*duck
else:
    mix=music*0.8
mix=np.tanh(mix*1.1)/np.tanh(1.1); mix*=0.95/np.abs(mix).max(); f=int(SR*1.2); mix[-f:]*=np.linspace(1,0,f)
sf.write(out_path,np.stack([mix,mix],1).astype('float32'),SR); print('ok',out_path)
