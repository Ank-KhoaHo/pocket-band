/* Pocket Band -- the sound engine.
   One tune (THEME) in scale degrees; a mood picks an arrangement, key, mode, chords and tempo;
   a style (src/styles/*.js) is a band that arranges it. renderRaw() renders 16 bars plus a tail
   in an OfflineAudioContext and folds the tail onto the start, so every loop is seamless;
   getLoop() matches it to -24 LUFS. Everything is shared through window.PB. */
(function(){
'use strict';
var PB=window.PB=window.PB||{},NS=PB.ns=PB.ns||{};
var SR=44100, TARGET=-24, TAU=Math.PI*2;
function clamp(x,a,b){return x<a?a:x>b?b:x}
function rng(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function R(a,b){var o=[];for(var i=a;i<b;i++)o.push(i);return o}

/* ---------- BS.1770 loudness, so every loop plays equally loud ---------- */
function lufs(chans,fs){
 function kw(x){var f0=1681.974450955533,G=3.999843853973347,Q=.7071752369554196,K=Math.tan(Math.PI*f0/fs),Vh=Math.pow(10,G/20),Vb=Math.pow(Vh,.4996667741545416),a0=1+K/Q+K*K;
  var b=[(Vh+Vb*K/Q+K*K)/a0,2*(K*K-Vh)/a0,(Vh-Vb*K/Q+K*K)/a0],a=[2*(K*K-1)/a0,(1-K/Q+K*K)/a0];
  var f1=38.13547087602444,Q1=.5003270373238773,K1=Math.tan(Math.PI*f1/fs),d=1+K1/Q1+K1*K1,a2=[2*(K1*K1-1)/d,(1-K1/Q1+K1*K1)/d];
  var y=new Float32Array(x.length),x1=0,x2=0,y1=0,y2=0,z1=0,z2=0,w1=0,w2=0;
  for(var i=0;i<x.length;i++){var v=b[0]*x[i]+b[1]*x1+b[2]*x2-a[0]*y1-a[1]*y2;x2=x1;x1=x[i];y2=y1;y1=v;var u=v-2*z1+z2-a2[0]*w1-a2[1]*w2;z2=z1;z1=v;w2=w1;w1=u;y[i]=u}return y}
 var ks=chans.map(kw),blk=Math.round(.4*fs),hop=Math.round(.1*fs),L=[];
 for(var s=0;s+blk<=ks[0].length;s+=hop){var z=0;for(var c=0;c<ks.length;c++){var q=ks[c],m=0;for(var i=s;i<s+blk;i++)m+=q[i]*q[i];z+=m/blk}L.push(z)}
 function lk(z){return -.691+10*Math.log10(z)}
 var g1=L.filter(function(z){return lk(z)>-70});if(!g1.length)return -99;
 var mean=g1.reduce(function(p,q){return p+q},0)/g1.length,rel=lk(mean)-10,g2=g1.filter(function(z){return lk(z)>rel});
 return lk(g2.reduce(function(p,q){return p+q},0)/g2.length)}

/* =====================================================================
   THE THEME: one 16-bar tune in scale degrees (0 = the key's tonic).
   Bars 1-2 are the CALL, bars 3-4 the ANSWER, and so on in pairs.
   ===================================================================== */
var THEME=[[0,0,2,.5],[0,.5,4,.5],[0,1,5,1],[0,2,4,.5],[0,2.5,2,.5],[0,3,1,1],
 [1,0,2,1.5],[1,1.5,1,.5],[1,2,0,2],
 [2,0,-2,.5],[2,.5,0,.5],[2,1,1,1],[2,2,2,1],[2,3,1,.5],[2,3.5,0,.5],
 [3,0,1,3],
 [4,0,4,.5],[4,.5,5,.5],[4,1,7,1],[4,2,5,.5],[4,2.5,4,.5],[4,3,2,1],
 [5,0,5,1.5],[5,1.5,4,.5],[5,2,2,2],
 [6,0,1,.5],[6,.5,2,.5],[6,1,3,1],[6,2,4,1],[6,3,3,.5],[6,3.5,1,.5],
 [7,0,0,3],[7,3.5,4,.5],
 [8,0,7,1.5],[8,1.5,6,.5],[8,2,5,1],[8,3,4,1],
 [9,0,5,2],[9,2,3,1],[9,3,4,1],
 [10,0,2,1.5],[10,1.5,3,.5],[10,2,4,1],[10,3,5,1],
 [11,0,4,3],[11,3.5,4,.5],
 [12,0,7,1],[12,1,7,.5],[12,1.5,8,.5],[12,2,7,1],[12,3,5,1],
 [13,0,4,1.5],[13,1.5,5,.5],[13,2,4,1],[13,3,2,1],
 [14,0,1,1],[14,1,2,.5],[14,1.5,4,.5],[14,2,3,1],[14,3,1,1],
 [15,0,0,3]];
/* chords per bar, as scale degrees: I vi IV V | I vi ii-V I | IV ii vi V | IV I ii-V I */
var P=[[0],[5],[3],[4],[0],[5],[1,4],[0],[3],[1],[5],[4],[3],[0],[1,4],[0]];
var PWARM=[[0],[5],[3],[6],[0],[5],[1,6],[0],[3],[1],[5],[6],[3],[0],[1,4],[0]];
var PTENSE=[[0],[0],[5],[5],[3],[3],[4],[4],[0],[0],[5],[5],[1],[1],[4],[4]];
/* Lydian's IV is diminished, so Dreamy leans on I and the major II instead */
var PDREAM=[[0],[1],[0],[1],[5],[1],[4],[0],[0],[1],[5],[4],[0],[1],[4],[0]];
/* Dorian's vi is diminished, so Mystery leans on i and the major IV instead */
var PMYST=[[0],[3],[0],[3],[0],[6],[3],[0],[2],[6],[3],[4],[0],[3],[6],[0]];
/* Phrygian's v is diminished, so Spooky leans on i and the major bII instead */
var PSPOOK=[[0],[1],[0],[1],[5],[1],[3],[0],[0],[1],[6],[3],[5],[1],[0],[0]];
function rot(a,n){return a.slice(n).concat(a.slice(0,n))}
var MODES={ion:[0,2,4,5,7,9,11],lyd:[0,2,4,6,7,9,11],mix:[0,2,4,5,7,9,10],dor:[0,2,3,5,7,9,10],phr:[0,1,3,5,7,8,10],aeo:[0,2,3,5,7,8,10],harm:[0,2,3,5,7,8,11]};
var MODEN={ion:'major',lyd:'Lydian',mix:'Mixolydian',dor:'Dorian',phr:'Phrygian',aeo:'minor',harm:'harmonic minor'};
var KEYN=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
function semi(mode,d){var s=MODES[mode],o=Math.floor(d/7),i=d-7*o;return 12*o+s[i]}
/* a mood = an arrangement (arr) in its own key, mode and chords. tm scales the arrangement's tempo;
   fast ('rush'|'chase') takes the style's own fast tempo instead; gate shortens melodic notes;
   tex adds a texture over the whole loop. */
var CUES=[
 {id:'gentle',nm:'Gentle',grp:'Calm',arr:'gentle',key:5,mode:'ion',prog:P,mel:'theme'},
 {id:'quiet',nm:'Quiet',grp:'Calm',arr:'quiet',key:9,mode:'aeo',prog:P,mel:'theme',softV:true},
 {id:'dreamy',nm:'Dreamy',grp:'Calm',arr:'quiet',key:2,mode:'lyd',prog:PDREAM,mel:'theme',tm:1.08},
 {id:'rainy',nm:'Rainy',grp:'Calm',arr:'quiet',key:5,mode:'aeo',prog:P,mel:'theme',softV:true,tm:.95,tex:'rain'},
 {id:'theme',nm:'Theme',grp:'Bright',arr:'theme',key:0,mode:'ion',prog:P,mel:'theme'},
 {id:'lively',nm:'Lively',grp:'Bright',arr:'lively',key:7,mode:'ion',prog:P,mel:'theme'},
 {id:'playful',nm:'Playful',grp:'Bright',arr:'lively',key:2,mode:'ion',prog:P,mel:'theme',tm:1.12,gate:.5},
 {id:'stroll',nm:'Stroll',grp:'Bright',arr:'stroll',key:3,mode:'ion',prog:rot(P,8),mel:'rot8'},
 {id:'warm',nm:'Warm',grp:'Bright',arr:'warm',key:2,mode:'mix',prog:PWARM,mel:'theme'},
 {id:'mystery',nm:'Mystery',grp:'Moody',arr:'warm',key:4,mode:'dor',prog:PMYST,mel:'theme',tm:.92},
 {id:'melancholy',nm:'Melancholy',grp:'Moody',arr:'gentle',key:2,mode:'aeo',prog:P,mel:'theme',softV:true,tm:.88},
 {id:'spooky',nm:'Spooky',grp:'Moody',arr:'quiet',key:11,mode:'phr',prog:PSPOOK,mel:'theme',tm:.85},
 {id:'adventure',nm:'Adventure',grp:'Bold',arr:'stroll',key:7,mode:'mix',prog:PWARM,mel:'theme',tm:1.1},
 {id:'tense',nm:'Tense',grp:'Bold',arr:'tense',key:4,mode:'harm',prog:PTENSE,mel:'motif'},
 {id:'epic',nm:'Epic',grp:'Bold',arr:'epic',key:0,mode:'harm',prog:P,mel:'theme'},
 {id:'triumph',nm:'Triumph',grp:'Bold',arr:'epic',key:10,mode:'ion',prog:P,mel:'theme',tm:.9},
 {id:'rush',nm:'Rush',grp:'Fast',arr:'lively',key:9,mode:'ion',prog:P,mel:'theme',fast:'rush'},
 {id:'chase',nm:'Chase',grp:'Fast',arr:'epic',key:2,mode:'harm',prog:P,mel:'theme',fast:'chase'}];
var CUEI={};CUES.forEach(function(c,i){CUEI[c.id]=i});
function buildMel(kind){var out=[];
 if(kind==='motif'){
  var motif=THEME.filter(function(n){return n[0]<2});
  [[0,0],[4,-1],[8,0],[12,2]].forEach(function(p){motif.forEach(function(n){out.push({bar:n[0]+p[0],beat:n[1],deg:n[2]+p[1],dur:n[3],role:'A'})})});
  [[2,0],[6,4],[10,2],[14,6]].forEach(function(p){out.push({bar:p[0],beat:0,deg:p[1],dur:2,role:'B'},{bar:p[0],beat:2,deg:p[1]+2,dur:2,role:'B'},{bar:p[0]+1,beat:0,deg:p[1],dur:3.5,role:'B'})});
  return out}
 THEME.forEach(function(n){var bar=kind==='rot8'?(n[0]+8)%16:n[0];out.push({bar:bar,beat:n[1],deg:n[2],dur:n[3],role:Math.floor(bar/2)%2===0?'A':'B'})});
 return out}


/* =====================================================================
   THE RENDER CONTEXT X: time, harmony, voicing, parts, layers
   ===================================================================== */
function makeX(ctx,S,C,bpm,mask,seed){
 var X={ctx:ctx,rng:rng(seed),spb:60/bpm,bpm:bpm,bars:16,mask:mask,S:S,C:C,hum:S.hum||.008,ev:[],parts:{}};
 X.loopSec=16*4*X.spb;X.sw=S.swing[C.id]!=null?S.swing[C.id]:S.swing[C.arr]!=null?S.swing[C.arr]:S.swing.def;X.grid=S.grid||8;
 X.on=function(L){return mask==='all'||mask===L};
 var t0=60+C.key;if(t0<62)t0+=12;X.tonic=t0;
 // master: bus -> colour -> (tense low-pass) -> saturation -> post -> compressor -> out
 var comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=10;comp.ratio.value=2.2;comp.attack.value=.015;comp.release.value=.25;comp.connect(ctx.destination);
 X.post=ctx.createGain();X.post.gain.value=.5;X.post.connect(comp);X.bus=ctx.createGain();var node=X.bus;
 (S.master||[]).forEach(function(m){var b=ctx.createBiquadFilter();b.type=m.t;b.frequency.value=m.f;if(m.q!=null)b.Q.value=m.q;if(m.g!=null)b.gain.value=m.g;node.connect(b);node=b});
 if(C.arr==='tense'){var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=S.dangerCut||1800;lp.Q.value=.7;node.connect(lp);node=lp}
 if(S.sat){var ws=ctx.createWaveShaper();ws.curve=NS.satCurve(S.sat);ws.oversample='2x';var pre=ctx.createGain();pre.gain.value=.45;node.connect(pre);pre.connect(ws);node=ws}
 node.connect(X.post);
 X.rev=ctx.createGain();var cv=ctx.createConvolver();cv.buffer=NS.IR(S.ir);var rg=ctx.createGain();rg.gain.value=S.revRet||.5;X.rev.connect(cv);cv.connect(rg);rg.connect(X.bus);
 X.vibOsc=ctx.createOscillator();X.vibOsc.frequency.value=5.3;X.vibOsc.start(0);
 if(S.wobble){var wo=ctx.createOscillator(),wg=ctx.createGain();wo.frequency.value=.5;wg.gain.value=S.wobble;wo.connect(wg);wo.start(0);X.wobG=wg}
 X.cleanup=[];X.curEnd=1e9;X.wob=function(p){if(X.wobG){X.wobG.connect(p);X.cleanup.push([X.wobG,p,X.curEnd])}};
 X.lfo=function(g){X.vibOsc.connect(g);X.cleanup.push([X.vibOsc,g,X.curEnd])};
 X.jobs=[];X.later=function(t,e,f){X.jobs.push({t:t,e:e,f:f})};
 var PW={};X.pw=function(d){if(PW[d])return PW[d];var n=64,re=new Float32Array(n),im=new Float32Array(n);for(var i=1;i<n;i++)re[i]=2/(i*Math.PI)*Math.sin(i*Math.PI*d);PW[d]=ctx.createPeriodicWave(re,im);return PW[d]};
 X.noise=function(t,dur){var s=ctx.createBufferSource();s.buffer=NS.noiseBuf();s.loop=true;s.start(t,X.rng()*2.5);s.stop(t+dur+.05);return s};
 X.out=function(name){if(X.parts[name])return X.parts[name];var o=S.parts[name]||{},g=ctx.createGain(),nd=g;g.gain.value=o.g==null?1:o.g;
  if(o.hp){var f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;nd.connect(f);nd=f}
  if(o.lp){f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=.6;nd.connect(f);nd=f}
  if(o.pk){f=ctx.createBiquadFilter();f.type='peaking';f.frequency.value=o.pk[0];f.gain.value=o.pk[1];f.Q.value=o.pk[2];nd.connect(f);nd=f}
  var p=ctx.createStereoPanner();p.pan.value=o.pan||0;nd.connect(p);var dest=o.post?X.post:X.bus;p.connect(dest);
  if(o.rev){var s=ctx.createGain();s.gain.value=o.rev;p.connect(s);s.connect(X.rev)}
  if(o.delay){var dl=ctx.createDelay(3),fb=ctx.createGain(),wet=ctx.createGain(),pp=ctx.createStereoPanner();dl.delayTime.value=o.delay[0]*X.spb;fb.gain.value=o.delay[1];wet.gain.value=o.delay[2]||.5;pp.pan.value=-(o.pan||0)-.2;
   p.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(pp);pp.connect(dest);if(o.rev){var s2=ctx.createGain();s2.gain.value=o.rev;pp.connect(s2);s2.connect(X.rev)}}
  X.parts[name]=g;return g};
 // swing and time
 function swb(b){var base=Math.floor(b+1e-9),f=b-base,sw=X.sw;if(sw===.5)return b;
  if(X.grid===8){f=f<.5?f*(sw/.5):sw+(f-.5)*((1-sw)/.5)}else{var hb=Math.floor(f*2+1e-9),g=f*2-hb;g=g<.5?g*(sw/.5):sw+(g-.5)*((1-sw)/.5);f=(hb+g)/2}return base+f}
 X.T=function(bar,beat){return bar*4*X.spb+swb(beat)*X.spb};
 // harmony
 X.segs=function(bar){var p=C.prog[((bar%16)+16)%16];return p.length===1?[{b0:0,b1:4,deg:p[0]}]:[{b0:0,b1:2,deg:p[0]},{b0:2,b1:4,deg:p[1]}]};
 X.chordAt=function(bar,beat){var s=X.segs(bar);return beat>=2&&s.length>1?s[1].deg:s[0].deg};
 X.scaleFor=function(deg){var d7=((deg%7)+7)%7;if(C.mode==='aeo'&&!C.softV&&d7===4)return 'harm';return C.mode};
 var VC={};
 X.V=function(deg,o){o=o||{};var key=deg+'|'+(o.c||64)+'|'+(o.sev?1:0)+'|'+(o.add9||0)+'|'+(o.n||0);if(VC[key])return VC[key];var sc=X.scaleFor(deg),d7=((deg%7)+7)%7,ks2=[0,2,4];
  if(o.sev)ks2.push(6);if(o.add9===1||(o.add9==='auto'&&(d7===0||d7===3)))ks2.push(8);var c=o.c||64;
  var ms=ks2.map(function(k){var pc=((C.key+semi(sc,deg+k))%12+12)%12;return pc+12*Math.round((c-pc)/12)}).sort(function(a,b){return a-b});
  for(var i=1;i<ms.length;i++)if(ms[i]===ms[i-1])ms[i]+=12;if(o.n)ms=ms.slice(0,o.n);VC[key]=ms;return ms};
 X.BR=function(deg,w){var sc=X.scaleFor(deg),r=((C.key+semi(sc,deg))%12+12)%12,m=33+((r-9+12)%12);
  if(w==='5')return m+semi(sc,deg+4)-semi(sc,deg);if(w==='3')return m+semi(sc,deg+2)-semi(sc,deg);if(w==='oct')return m+12;return m};
 X.M=function(deg){return X.tonic+semi(C.mode==='aeo'&&false?'harm':C.mode,deg)};
 X.mel=buildMel(C.mel);
 X.ev=[];X.evn=function(cat,m,t,d){X.ev.push({c:cat,m:m,t:t,d:d})};X.evd=function(part,kind,t,v){X.ev.push({c:part==='nat'?'fx':(part==='hb'?'hb':'perc'),k:kind,t:t,v:v})};
 return X}
/* one note: humanised, recorded for the piano roll */
function N(X,L,part,cat,inst,o,m,t,d,v){if(!X.on(L))return;if(X.C.gate&&cat!=='bass')d*=X.C.gate;if(L==='hi')v*=1.7;t+=(X.rng()-.5)*2*X.hum;v*=1+(X.rng()-.5)*.16;t=Math.max(0,t);X.evn(cat,m,t,d);var out=X.out(part);X.later(t,t+d+4,function(){inst(X,{m:m,t:t,d:d,v:v,out:out},o||{})})}

/* =====================================================================
   ARRANGING HELPERS (bars: an array of bar indices)
   ===================================================================== */
function pick(X,L,part,inst,o,pat,bars,vel){bars.forEach(function(b){pat.forEach(function(p){var deg=X.chordAt(b,p[0]),m;
 if(p[1]==='R')m=X.BR(deg,'r')+(o.bo==null?12:o.bo);else if(p[1]==='F')m=X.BR(deg,'5')+(o.bo==null?12:o.bo);else{var vc=X.V(deg,o.voice);m=vc[Math.min(vc.length-1,p[1])]}
 N(X,L,part,'chord',inst,o,m,X.T(b,p[0]),(p[2]||1)*X.spb,(vel||.6)*(p[3]||1))})})}
function strum(X,L,part,inst,o,pat,bars,vel){var st=o.step||.5;bars.forEach(function(b){for(var i=0;i<pat.length;i++){var ch=pat[i];if(ch==='.')continue;var beat=i*st,deg=X.chordAt(b,beat),
 notes=[X.BR(deg,'r')+12].concat(X.V(deg,o.voice)),up=ch==='U'||ch==='u',soft=ch==='d'||ch==='u',mute=ch==='x';if(up)notes=notes.slice(1).reverse();if(mute)notes=notes.slice(0,2);
 var nx=i+1;while(nx<pat.length&&pat[nx]==='.')nx++;var len=(nx-i)*st*X.spb+(o.ring||0);
 notes.forEach(function(m,k){N(X,L,part,'chord',inst,{damp:mute?.02:(o.damp||.08)},m,X.T(b,beat)+k*(o.spread||.012),mute?.06:len,(vel||.55)*(soft?.6:1)*(up?.75:1)*(1-k*.04))})}})}
function block(X,L,part,inst,o,rhy,bars,vel){bars.forEach(function(b){rhy.forEach(function(r){var deg=X.chordAt(b,r[0]);X.V(deg,o.voice).forEach(function(m,k){N(X,L,part,'chord',inst,o,m,X.T(b,r[0])+k*(o.roll||0),r[1]*X.spb,(vel||.5)*(r[2]||1))})})})}
function padSeg(X,L,part,inst,o,bars,vel){bars.forEach(function(b){X.segs(b).forEach(function(s){X.V(s.deg,o.voice).forEach(function(m,k){N(X,L,part,'chord',inst,o,m,X.T(b,s.b0)+k*(o.roll||0),(s.b1-s.b0)*X.spb*(o.hold||1),vel||.5)})})})}
function arp(X,L,part,inst,o,bars,vel){var st=o.step||.25,per=Math.round(4/st);bars.forEach(function(b){for(var i=0;i<per;i++){var beat=i*st,deg=X.chordAt(b,beat),vc=X.V(deg,o.voice),seq=vc.concat(vc.map(function(m){return m+12}));
 if(o.n)seq=seq.slice(0,o.n);if(o.shape==='updown')seq=seq.concat(seq.slice(1,-1).reverse());var m=seq[(i+b*per)%seq.length];
 N(X,L,part,'chord',inst,o,m,X.T(b,beat),st*X.spb*(o.gate||.9),(vel||.4)*(i%4===0?1:.78))}})}
function ost(X,L,part,inst,o,bars,vel){var st=o.step||.25,per=Math.round(4/st);bars.forEach(function(b){for(var i=0;i<per;i++){var beat=i*st,deg=X.chordAt(b,beat),m=X.BR(deg,i%2&&o.alt?'5':'r')+(o.oct||24);
 N(X,L,part,'chord',inst,o,m,X.T(b,beat),st*X.spb*(o.gate||.85),(vel||.5)*(i%4===0?1:.7))}})}
function bassl(X,L,part,inst,o,kind,bars,vel){var oc=o.oct||0,v=vel||.8;bars.forEach(function(b){var segs=X.segs(b),nb=X.BR(X.chordAt(b+1,0),'r')+oc;
 function n(m,beat,len,vv){N(X,L,part,'bass',inst,o,m+oc,X.T(b,beat),len*X.spb,v*(vv||1))}
 segs.forEach(function(s,si){var r=X.BR(s.deg,'r'),f=X.BR(s.deg,'5'),th=X.BR(s.deg,'3'),L2=s.b1-s.b0,last=si===segs.length-1;
  if(kind==='long')n(r,s.b0,L2*.96);
  else if(kind==='r5'){n(r,s.b0,Math.min(1.8,L2*.9));if(L2>=4)n(f,s.b0+2,1.8,.85)}
  else if(kind==='boom'){n(r,s.b0,.8);if(L2>=4)n(f,s.b0+2,.8,.85);else n(f,s.b0+1,.8,.8)}
  else if(kind==='walk'){if(L2>=4){n(r,0,.9);n(th,1,.9,.8);n(f,2,.9,.85);var ap=nb-oc>r?nb-oc-1:nb-oc+1;n(ap,3,.9,.8)}else{n(r,s.b0,.9);if(last){var ap2=nb-oc>r?nb-oc-1:nb-oc+1;n(ap2,s.b0+1,.9,.8)}else n(f,s.b0+1,.9,.8)}}
  else if(kind==='r5w'){n(r,s.b0,.95);n(f,s.b0+1,.45,.7);if(L2>=4){n(r,2,.95,.9);if(last&&(b%2===1)){n(f,3,.45,.75);n(nb-oc>r?nb-oc-1:nb-oc+1,3.5,.45,.75)}else n(f,3,.9,.8)}}
  else if(kind==='synco'){n(r,s.b0,1.3);n(r+12,s.b0+1.5,.4,.6);if(L2>=4){n(f,2,1,.8);n(nb-oc>r?nb-oc-1:nb-oc+1,3.5,.45,.7)}}
  else if(kind==='oct8'){for(var i=0;i<L2*2;i++)n(r+(i%2?12:0),s.b0+i*.5,.42,i%2?.7:1)}
  else if(kind==='ost8'){for(var j=0;j<L2*2;j++)n(j===L2*2-1&&last?f:r,s.b0+j*.5,.42,j%2?.72:1)}
 })})}
function melody(X,roles){X.mel.forEach(function(nt){var Rr=roles[nt.role];if(!Rr)return;if(Rr.bars&&Rr.bars.indexOf(nt.bar)<0)return;var m=X.M(nt.deg)+(Rr.oct||0),acc=nt.beat%1===0?(nt.beat%2===0?1:.9):.78;
 N(X,Rr.L||'base',Rr.part,nt.role==='A'?'call':'resp',Rr.inst,Rr.o||{},m,X.T(nt.bar,nt.beat),nt.dur*X.spb*(Rr.leg||.95),(Rr.v||.8)*acc);
 if(Rr.dbl&&(!Rr.dbl.bars||Rr.dbl.bars.indexOf(nt.bar)>=0))N(X,Rr.dbl.L||'hi',Rr.dbl.part,'harm',Rr.dbl.inst,Rr.dbl.o||{},m+(Rr.dbl.oct||0),X.T(nt.bar,nt.beat),nt.dur*X.spb*.95,(Rr.dbl.v||.6)*acc)})}
function harm(X,L,part,inst,o,bars,iv,oct,vel){X.mel.forEach(function(nt){if(bars.indexOf(nt.bar)<0)return;N(X,L,part,'harm',inst,o,X.M(nt.deg+iv)+(oct||0),X.T(nt.bar,nt.beat),nt.dur*X.spb*.95,vel||.5)})}
function drums(X,L,part,pat,bars,vel,o){bars.forEach(function(b){for(var k in pat){var s=pat[k],st=4/s.length;for(var i=0;i<s.length;i++){var c=s[i];if(c==='.')continue;NS.D(X,L,part,k,X.T(b,i*st),(c==='x'?1:c==='o'?.72:c==='g'?.32:.55)*(vel||1),o)}}})}
function fill(X,L,part,kind,bars,vel){bars.forEach(function(b){for(var i=0;i<4;i++)NS.D(X,L,part,kind,X.T(b,3+i*.25),(vel||.7)*(.55+i*.15))})}
function sparkle(X,L,part,inst,o,bars,vel){bars.forEach(function(b){var vc=X.V(X.chordAt(b,3),{c:o.c||84});vc.forEach(function(m,k){N(X,L,part,'fx',inst,o,m,X.T(b,3+k*.25),.6*X.spb,(vel||.35)*(1-k*.1))})})}
function hearts(X,bars,vel){bars.forEach(function(b){NS.D(X,'hb','hb','heart',X.T(b,0),vel||.9);NS.D(X,'hb','hb','heart',X.T(b,2),(vel||.9)*.85)})}
var ALL=R(0,16),ODD2=[3,7,11,15];

/* =====================================================================
   RENDER: offline, fold the tail onto the start (seamless), loudness-match
   ===================================================================== */
function seedOf(si,ci){return 1000+si*97+ci*13}
function renderRaw(si,ci,mask){var S=STY[si],C=CUES[ci],bpm=bpmOf(S,C),spb=60/bpm,loopSec=64*spb,tail=4;
 var ctx=new OfflineAudioContext(2,Math.ceil((loopSec+tail)*SR),SR),X=makeX(ctx,S,C,bpm,mask,seedOf(si,ci)),t0=performance.now();
 S.arrange(X);if(mask==='hb'&&C.arr!=='tense')hearts(X,ALL);
 if(C.tex==='rain'&&(mask==='all'||mask==='base'))NS.rain(X);
 runJobs(ctx,X,loopSec+tail);
 return ctx.startRendering().then(function(buf){var L=Math.round(loopSec*SR),ch=[new Float32Array(L),new Float32Array(L)];
  for(var c=0;c<2;c++){var d=buf.getChannelData(c),o=ch[c];for(var i=0;i<d.length;i++)o[i%L]+=d[i]}
  return {ch:ch,L:L,loopSec:L/SR,bpm:bpm,spb:spb,ev:X.ev,ms:performance.now()-t0}})}
function runJobs(ctx,X,total){X.jobs.sort(function(a,b){return a.t-b.t});var idx=0,Wn=1;
 function upto(tE){while(idx<X.jobs.length&&X.jobs[idx].t<tE){var j=X.jobs[idx++];X.curEnd=j.e;j.f()}}
 function clean(now){X.cleanup=X.cleanup.filter(function(c){if(c[2]<now){try{c[0].disconnect(c[1])}catch(e){}return false}return true})}
 upto(Wn*1.5);for(var s2=Wn;s2<total-.05;s2+=Wn)(function(s3){ctx.suspend(s3).then(function(){upto(s3+Wn*1.5);clean(s3);ctx.resume()})})(s2)}
function toBuf(ch,L,gain){var b=new AudioBuffer({length:L,numberOfChannels:2,sampleRate:SR});for(var c=0;c<2;c++){var d=new Float32Array(L),s=ch[c];for(var i=0;i<L;i++)d[i]=s[i]*gain;b.copyToChannel(d,c)}return b}
function peakOf(ch,g){var p=0;ch.forEach(function(d){for(var i=0;i<d.length;i++){var a=Math.abs(d[i]);if(a>p)p=a}});return 20*Math.log10(p*g+1e-9)}
var CACHE={},ORDER=[];
function remember(k,v){CACHE[k]=v;ORDER=ORDER.filter(function(q){return q!==k});ORDER.push(k);while(ORDER.length>14){var old=ORDER.shift();if(old!==(PB.currentKey?PB.currentKey():''))delete CACHE[old]}}
function getCue(si,ci){var k=si+'|'+ci;if(CACHE[k]){ORDER=ORDER.filter(function(q){return q!==k});ORDER.push(k);return CACHE[k]}
 var p=renderRaw(si,ci,'all').then(function(r){var lu=lufs(r.ch,SR),g=Math.pow(10,(TARGET-lu)/20);return {buf:toBuf(r.ch,r.L,g),loopSec:r.loopSec,bpm:r.bpm,spb:r.spb,ev:r.ev,ms:r.ms,raw:lu,lufs:TARGET,peak:peakOf(r.ch,g),si:si,ci:ci,mi:ci}});
 remember(k,p);return p}
function getStems(si,ci){var k='stems|'+si+'|'+ci;if(CACHE[k])return CACHE[k];
 var p=Promise.all([renderRaw(si,ci,'base'),renderRaw(si,ci,'hi'),renderRaw(si,ci,'hb')]).then(function(rs){var L=rs[0].L,sum=[new Float32Array(L),new Float32Array(L)];
  for(var c=0;c<2;c++)for(var i=0;i<L;i++)sum[c][i]=rs[0].ch[c][i]+rs[1].ch[c][i];var g=Math.pow(10,(TARGET-lufs(sum,SR))/20);
  return {base:toBuf(rs[0].ch,L,g),hi:toBuf(rs[1].ch,L,g),hb:toBuf(rs[2].ch,L,g),loopSec:rs[0].loopSec,spb:rs[0].spb,bpm:rs[0].bpm,ev:rs[0].ev.concat(rs[1].ev)}});
 remember(k,p);return p}


/* ---------- styles register themselves (src/styles/*.js) ---------- */
var STY=[],STYI={};
function addStyle(s){STYI[s.id]=STY.length;STY.push(s)}
function bpmOf(S,C){return C.fast?S.fast[C.fast]:S.bpm[C.id]||Math.round(S.bpm[C.arr]*(C.tm||1))}

Object.assign(NS,{SR:SR,TARGET:TARGET,clamp:clamp,rng:rng,mtof:mtof,R:R,rot:rot,lufs:lufs,THEME:THEME,
 P:P,PWARM:PWARM,PTENSE:PTENSE,PDREAM:PDREAM,PMYST:PMYST,PSPOOK:PSPOOK,MODES:MODES,MODEN:MODEN,KEYN:KEYN,semi:semi,
 CUES:CUES,CUEI:CUEI,buildMel:buildMel,makeX:makeX,N:N,pick:pick,strum:strum,block:block,padSeg:padSeg,
 arp:arp,ost:ost,bassl:bassl,melody:melody,harm:harm,drums:drums,fill:fill,sparkle:sparkle,hearts:hearts,
 ALL:ALL,ODD2:ODD2,renderRaw:renderRaw,toBuf:toBuf,peakOf:peakOf,CACHE:CACHE,getCue:getCue,getStems:getStems,
 STY:STY,STYI:STYI,addStyle:addStyle,bpmOf:bpmOf});
Object.assign(PB,{SR:SR,TARGET:TARGET,util:{rng:rng,mtof:mtof,clamp:clamp,R:R,rot:rot},lufs:lufs,
 peakDb:function(ch,g){return peakOf(ch,g==null?1:g)},MODES:MODES,MODEN:MODEN,KEYN:KEYN,
 MOODS:CUES,moodIndex:CUEI,STYLES:STY,styleIndex:STYI,addStyle:addStyle,bpmOf:bpmOf,makeX:makeX,
 arr:{N:N,D:function(){return NS.D.apply(null,arguments)},pick:pick,strum:strum,block:block,padSeg:padSeg,arp:arp,ost:ost,
  bassl:bassl,melody:melody,harm:harm,drums:drums,fill:fill,sparkle:sparkle,hearts:hearts,
  birds:function(){return NS.birds.apply(null,arguments)},crickets:function(){return NS.crickets.apply(null,arguments)},
  crackle:function(){return NS.crackle.apply(null,arguments)},ALL:ALL,ODD2:ODD2},
 renderRaw:renderRaw,getLoop:getCue,getStems:getStems});
})();
