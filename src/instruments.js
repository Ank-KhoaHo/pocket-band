/* Pocket Band -- every instrument, drum and texture, synthesised by the Web Audio API.
   An instrument is (X, n, o): X the render context, n = {m (midi), t (s), d (s), v (0..1), out (node)},
   o its options. Nothing here is a recording. */
(function(){
'use strict';
var PB=window.PB,NS=PB.ns;
var SR=NS.SR,rng=NS.rng,mtof=NS.mtof,clamp=NS.clamp,R=NS.R;
/* =====================================================================
   SHARED BUFFERS: noise, an 8-bit noise, plucked strings, reverb
   ===================================================================== */
var NB=null,CB=null;
function noiseBuf(){if(NB)return NB;NB=new AudioBuffer({length:SR*3,numberOfChannels:1,sampleRate:SR});var d=NB.getChannelData(0),r=rng(99);for(var i=0;i<d.length;i++)d[i]=r()*2-1;return NB}
function crushBuf(){if(CB)return CB;CB=new AudioBuffer({length:SR*2,numberOfChannels:1,sampleRate:SR});var d=CB.getChannelData(0),r=rng(7),v=0;for(var i=0;i<d.length;i++){if(i%6===0)v=r()<.5?-1:1;d[i]=v}return CB}
var KSC={};
function ksBuf(m,t60,bright,pos,vr){var key=m+'|'+t60+'|'+bright+'|'+pos+'|'+vr;if(KSC[key])return KSC[key];
 var f=mtof(m),N=Math.max(2,Math.floor(SR/f-.5)),fa=SR/(N+.5),dur=Math.min(4,t60*1.15+.05),len=Math.ceil(SR*dur);
 var b=new AudioBuffer({length:len,numberOfChannels:1,sampleRate:SR}),o=b.getChannelData(0),r=rng(m*977+vr*31+Math.round(bright*100)),d=new Float32Array(N),lp=0,mean=0,i;
 for(i=0;i<N;i++){lp+=(r()*2-1-lp)*(.1+.9*bright);d[i]=lp;mean+=lp}mean/=N;for(i=0;i<N;i++)d[i]-=mean;
 if(pos){var Pp=Math.max(1,Math.round(N*pos)),e=new Float32Array(N);for(i=0;i<N;i++)e[i]=d[i]-.85*d[(i+Pp)%N];d=e}
 var g=Math.pow(.001,1/(t60*fa)),idx=0,pk=1e-6;
 for(i=0;i<len;i++){var a=d[idx],n2=d[(idx+1)%N];o[i]=a;d[idx]=g*.5*(a+n2);idx=(idx+1)%N;if(i<N*3&&Math.abs(a)>pk)pk=Math.abs(a)}
 for(i=0;i<len;i++)o[i]/=pk;
 var fade=Math.min(len,Math.round(.03*SR));for(i=0;i<fade;i++)o[len-1-i]*=i/fade;
 KSC[key]={buf:b,rate:f/fa,dur:dur};return KSC[key]}
var IRC={};
function IR(sp){var key=JSON.stringify(sp);if(IRC[key])return IRC[key];var len=Math.ceil((sp.sec*1.3+sp.pre)*SR),b=new AudioBuffer({length:len,numberOfChannels:2,sampleRate:SR});
 for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch),r=rng(1234+ch*77),lp=0,pre=Math.round(sp.pre*SR);
  for(var i=pre;i<len;i++){var tt=(i-pre)/SR,env=Math.exp(-6.9*tt/sp.sec),a=clamp(.92-sp.damp*.85*tt/sp.sec,.04,.95);lp+=(r()*2-1-lp)*a;d[i]=lp*env}
  [[.011,.5],[.019,.35],[.027,.3],[.041,.22],[.053,.16]].forEach(function(e,k){var at=pre+Math.round((e[0]+(ch?.003*k:0))*SR);if(at<len)d[at]+=e[1]*(ch?.9:1)})}
 IRC[key]=b;return b}
function satCurve(k){var n=2048,c=new Float32Array(n);for(var i=0;i<n;i++){var x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}return c}

/* =====================================================================
   INSTRUMENTS. n = {m (midi), t (s), d (s), v (0..1), out (node)}
   ===================================================================== */
function ks(X,n,o){var k=ksBuf(n.m,o.t60||2,o.bright==null?.5:o.bright,o.pos==null?.18:o.pos,Math.floor(X.rng()*3)),c=X.ctx,s=c.createBufferSource(),g=c.createGain();
 s.buffer=k.buf;s.playbackRate.value=k.rate;X.wob(s.detune);var v=n.v*(o.g||.6);g.gain.setValueAtTime(v,n.t);
 var end=n.t+k.dur/k.rate;if(o.damp){g.gain.setTargetAtTime(0,n.t+n.d,o.damp);end=Math.min(end,n.t+n.d+o.damp*7)}
 s.connect(g);g.connect(n.out);s.start(n.t);s.stop(end)}
function ep(X,n,o){var c=X.ctx,f=mtof(n.m),t=n.t,car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain(),tm=c.createOscillator(),tg=c.createGain();
 car.frequency.value=f;mod.frequency.value=f*(o.ratio||1);var ix=(o.index||1.5)*f*(.5+.7*n.v);mg.gain.setValueAtTime(ix,t);mg.gain.setTargetAtTime(ix*.12,t,.3);mod.connect(mg);mg.connect(car.frequency);
 tm.frequency.value=f*(o.tine||13.9);tg.gain.setValueAtTime(f*1.6*n.v,t);tg.gain.setTargetAtTime(0,t,.018);tm.connect(tg);tg.connect(car.frequency);
 var pk=n.v*(o.g||.42),end=t+n.d;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+.004);g.gain.setTargetAtTime(0,t+.004,(o.dec||1.8)/2.3);g.gain.setTargetAtTime(0,end,.09);
 car.connect(g);g.connect(n.out);X.wob(car.detune);X.wob(mod.detune);[car,mod,tm].forEach(function(q){q.start(t);q.stop(end+.7)})}
var MAL={marimba:[[1,1,.5],[3.93,.25,.13],[10.2,.06,.03]],vibes:[[1,1,2.2],[3.9,.16,.6],[9.8,.035,.12]],glock:[[1,1,1.5],[2.76,.3,.5],[5.4,.15,.2],[8.93,.06,.08]],
 kalimba:[[1,1,1.1],[5.4,.16,.14],[2.01,.06,.4],[8.9,.05,.03]],musicbox:[[1,1,1.7],[3.98,.22,.45],[6.9,.08,.14]],celesta:[[1,1,1.3],[2,.22,.45],[3,.08,.2],[4.2,.04,.1]]};
function mallet(X,n,o){var P=MAL[o.kind],c=X.ctx,f=mtof(n.m),g=c.createGain(),last=0;g.gain.value=n.v*(o.g||.4);g.connect(n.out);
 if(o.trem){var tl=c.createOscillator(),tg=c.createGain();tl.frequency.value=5.2;tg.gain.value=n.v*(o.g||.4)*.35;tl.connect(tg);tg.connect(g.gain);tl.start(n.t);tl.stop(n.t+3)}
 P.forEach(function(p){if(f*p[0]>SR*.42)return;var os=c.createOscillator(),eg=c.createGain(),dk=p[2]*(o.dec||1);os.frequency.value=f*p[0];
  eg.gain.setValueAtTime(0,n.t);eg.gain.linearRampToValueAtTime(p[1],n.t+.002);eg.gain.setTargetAtTime(0,n.t+.002,dk/3);if(o.damp)eg.gain.setTargetAtTime(0,n.t+n.d,.05);
  os.connect(eg);eg.connect(g);X.wob(os.detune);var e=n.t+Math.min(dk*2.6,o.damp?n.d+.3:9)+.05;os.start(n.t);os.stop(e);last=Math.max(last,e)})}
var WIND={
 flute:{osc:[['sine',1,1],['triangle',2,.12],['sine',3,.04]],cm:7,a:.05,d:.3,s:.85,r:.12,vib:14,vd:.32,br:.045,bm:2.4,g:.5},
 whistle:{osc:[['sine',1,1],['triangle',2,.05]],cm:9,a:.025,d:.2,s:.9,r:.08,vib:22,vd:.18,scoop:-55,br:.06,bm:2,g:.42},
 clarinet:{osc:[['square',1,1]],cm:3.4,q:.9,a:.04,d:.3,s:.9,r:.1,vib:7,vd:.35,g:.25},
 oboe:{osc:[['pulse',1,1,.2]],cm:5,q:1.2,a:.04,d:.25,s:.88,r:.1,vib:10,vd:.25,g:.2},
 fiddle:{osc:[['sawtooth',1,1],['sawtooth',1.003,.5]],cm:6,q:.8,a:.06,d:.3,s:.9,r:.1,vib:18,vd:.22,scoop:-28,br:.018,bm:4,g:.24},
 bassoon:{osc:[['sawtooth',1,1]],cut:850,a:.025,d:.15,s:.75,r:.06,vib:4,vd:.4,g:.3},
 horn:{osc:[['sawtooth',1,1],['triangle',1,.5]],cut:1000,a:.09,d:.4,s:.9,r:.22,vib:5,vd:.4,g:.3},
 accordion:{osc:[['sawtooth',1,1],['sawtooth',1.006,.8],['square',.5,.3]],cut:2300,a:.05,d:.3,s:.95,r:.1,vib:0,g:.14},
 brass:{osc:[['sawtooth',1,1],['sawtooth',1.005,1]],cut:1500,a:.05,d:.3,s:.85,r:.12,vib:6,vd:.3,g:.18},
 strings:{osc:[['sawtooth',1,1],['sawtooth',1.004,.8],['sawtooth',.997,.8]],cut:2400,a:.28,d:.6,s:.95,r:.45,vib:12,vd:.3,g:.11}};
function wind(X,n,o){var c=X.ctx,K=WIND[o.kind],f=mtof(n.m),t=n.t,a=o.a||K.a,end=t+Math.max(a+.02,n.d),r=o.r||K.r;
 var g=c.createGain(),pk=n.v*K.g*(o.g||1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setTargetAtTime(pk*K.s,t+a,K.d);g.gain.setTargetAtTime(0,end,r/3);
 var fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=Math.min(15000,(o.cut||K.cut)||f*K.cm);fl.Q.value=K.q||.7;fl.connect(g);g.connect(n.out);
 if(o.trem){var tl=c.createOscillator(),tg=c.createGain();tl.frequency.value=o.trem;tg.gain.value=pk*.6;tl.connect(tg);tg.connect(g.gain);tl.start(t);tl.stop(end+r*2)}
 var vg=null;if(K.vib){vg=c.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(K.vib,t+(K.vd||.3)+.05);X.lfo(vg)}
 K.osc.forEach(function(w){var os=c.createOscillator();if(w[0]==='pulse')os.setPeriodicWave(X.pw(w[3]));else os.type=w[0];os.frequency.value=f*w[1];
  if(K.scoop){os.detune.setValueAtTime(K.scoop,t);os.detune.linearRampToValueAtTime(0,t+.06)}if(vg)vg.connect(os.detune);X.wob(os.detune);
  var og=c.createGain();og.gain.value=w[2];os.connect(og);og.connect(fl);os.start(t);os.stop(end+r*2+.05)});
 if(K.br){var ns=X.noise(t,end-t+r),bf=c.createBiquadFilter(),bg=c.createGain();bf.type='bandpass';bf.frequency.value=Math.min(12000,f*K.bm);bf.Q.value=1.4;
  bg.gain.setValueAtTime(0,t);bg.gain.linearRampToValueAtTime(K.br*n.v,t+.02);bg.gain.setTargetAtTime(K.br*n.v*.35,t+.03,.08);bg.gain.setTargetAtTime(0,end,.04);ns.connect(bf);bf.connect(bg);bg.connect(n.out)}}
function chip(X,n,o){var c=X.ctx,f=mtof(n.m),t=n.t,end=t+Math.max(.03,n.d*(o.gate||.9)),os=c.createOscillator(),g=c.createGain(),pk=n.v*(o.g||.12);
 if(o.wave==='tri')os.type='triangle';else os.setPeriodicWave(X.pw(o.duty||.25));os.frequency.value=f;
 if(o.vib){var vg=c.createGain();vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(o.vib,t+.3);X.lfo(vg);vg.connect(os.detune)}
 if(o.slide){os.detune.setValueAtTime(o.slide,t);os.detune.linearRampToValueAtTime(0,t+.035)}
 g.gain.setValueAtTime(pk,t);g.gain.setTargetAtTime(pk*(o.s==null?.6:o.s),t+.005,o.dec||.12);g.gain.setTargetAtTime(0,end,.012);os.connect(g);g.connect(n.out);os.start(t);os.stop(end+.08)}
function bassv(X,n,o){var c=X.ctx,f=mtof(n.m),t=n.t,end=t+n.d,g=c.createGain(),pk=n.v*(o.g||.5);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+.008);g.gain.setTargetAtTime(pk*.65,t+.01,.25);g.gain.setTargetAtTime(0,end,.04);g.connect(n.out);
 (o.saw?[['sawtooth',1,1],['sawtooth',1.006,.8]]:[['sine',1,1],['triangle',2,.12]]).forEach(function(w){var os=c.createOscillator(),og=c.createGain();os.type=w[0];os.frequency.value=f*w[1];
  if(o.glide){os.frequency.setValueAtTime(f*w[1]*Math.pow(2,-o.glide/12),t);os.frequency.exponentialRampToValueAtTime(f*w[1],t+.06)}X.wob(os.detune);og.gain.value=w[2];os.connect(og);og.connect(g);os.start(t);os.stop(end+.25)})}
function trem(inner,rate){return function(X,n,o){var st=rate*X.spb,k=0;for(var t=n.t;t<n.t+n.d-.02;t+=st){inner(X,{m:n.m,t:t,d:st*.9,v:n.v*(k%2?.75:.95),out:n.out},o);k++}}}
var GTR=function(X,n,o){ks(X,n,{t60:o.t60||2.6,bright:.55,pos:.16,g:.6,damp:o.damp})},
 MAND=function(X,n,o){ks(X,n,{t60:1.1,bright:.82,pos:.1,g:.5,damp:o.damp})},
 BASSU=function(X,n,o){ks(X,n,{t60:1.7,bright:.22,pos:.3,g:1,damp:.07})},
 PIZZ=function(X,n,o){ks(X,n,{t60:.42,bright:.42,pos:.13,g:.65})},
 PIZZC=function(X,n,o){ks(X,n,{t60:.8,bright:.32,pos:.2,g:.9})},
 HARP=function(X,n,o){ks(X,n,{t60:3.2,bright:.5,pos:.22,g:.55})},
 GTRM=function(X,n,o){ks(X,n,{t60:1,bright:.3,pos:.2,g:.6,damp:.05})},
 W=function(kind,extra){return function(X,n,o){var q={kind:kind};for(var k in extra)q[k]=extra[k];for(k in o)q[k]=o[k];wind(X,n,q)}},
 M=function(kind,extra){return function(X,n,o){var q={kind:kind};for(var k in extra)q[k]=extra[k];for(k in o)q[k]=o[k];mallet(X,n,q)}},
 EP=function(X,n,o){ep(X,n,o)},
 SUB=function(X,n,o){bassv(X,n,{g:.6,glide:o.glide})},
 SAWB=function(X,n,o){bassv(X,n,{g:.32,saw:1})},
 CH=function(duty,extra){return function(X,n,o){var q={duty:duty};for(var k in extra)q[k]=extra[k];for(k in o)q[k]=o[k];chip(X,n,q)}};

/* ---------- drums and nature, all made from noise and sines ---------- */
function D(X,L,part,kind,t,v,o){if(!X.on(L))return;if(L==='hi')v*=1.7;t+=(X.rng()-.5)*2*X.hum*.6;v*=1+(X.rng()-.5)*.14;X.evd(part,kind,t,v);var out=X.out(part);t=Math.max(0,t);X.later(t,t+4,function(){drum(X,kind,t,v,out,o||{})})}
function tone(X,out,type,f0,f1,t,a,dec,pk,glide){var c=X.ctx,os=c.createOscillator(),g=c.createGain();os.type=type;os.frequency.setValueAtTime(f0,t);if(f1)os.frequency.exponentialRampToValueAtTime(f1,t+(glide||.08));
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setTargetAtTime(0,t+a,dec/3);os.connect(g);g.connect(out);os.start(t);os.stop(t+a+dec*2.2+.02)}
function nz(X,out,type,f,q,t,a,dec,pk,buf){var c=X.ctx,s=buf?c.createBufferSource():X.noise(t,a+dec*2.2+.05),fl=c.createBiquadFilter(),g=c.createGain();
 if(buf){s.buffer=buf;s.loop=true;s.start(t,X.rng()*1.5);s.stop(t+a+dec*2.2+.05)}fl.type=type;fl.frequency.value=f;fl.Q.value=q;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setTargetAtTime(0,t+a,dec/3);s.connect(fl);fl.connect(g);g.connect(out)}
function drum(X,k,t,v,out,o){switch(k){
 case 'kick':tone(X,out,'sine',150,46,t,.002,.32,v*.95,.09);nz(X,out,'highpass',3000,.7,t,.001,.008,v*.25);break;
 case 'snare':nz(X,out,'bandpass',1900,.8,t,.001,.17,v*.55);tone(X,out,'triangle',190,160,t,.001,.08,v*.35,.05);break;
 case 'brush':nz(X,out,'bandpass',2600,.6,t,.025,.24,v*.2);break;
 case 'rim':tone(X,out,'sine',1750,0,t,.001,.03,v*.25);nz(X,out,'bandpass',2600,3,t,.001,.03,v*.3);break;
 case 'wood':tone(X,out,'sine',o.f||880,0,t,.001,.06,v*.35);tone(X,out,'sine',(o.f||880)*2.6,0,t,.001,.025,v*.12);break;
 case 'hat':nz(X,out,'highpass',7200,.8,t,.001,.035,v*.2);break;
 case 'ohat':nz(X,out,'highpass',6800,.8,t,.001,.2,v*.16);break;
 case 'shaker':nz(X,out,'bandpass',5600,1.2,t,.014,.06,v*.17);break;
 case 'tamb':nz(X,out,'highpass',6500,.8,t,.001,.09,v*.13);nz(X,out,'bandpass',9500,4,t,.001,.14,v*.12);break;
 case 'clap':[0,.011,.023].forEach(function(d,i){nz(X,out,'bandpass',1300,1.1,t+d,.001,i===2?.12:.012,v*.42)});break;
 case 'cajon':tone(X,out,'sine',115,62,t,.002,.2,v*.8,.05);nz(X,out,'lowpass',900,.7,t,.001,.03,v*.25);break;
 case 'slap':nz(X,out,'bandpass',1700,1,t,.001,.075,v*.5);tone(X,out,'sine',240,180,t,.001,.05,v*.22,.03);break;
 case 'tom':tone(X,out,'sine',o.f||95,(o.f||95)*.72,t,.002,.35,v*.8,.12);nz(X,out,'lowpass',600,.7,t,.001,.05,v*.2);break;
 case 'timp':tone(X,out,'sine',o.f||73,(o.f||73)*.97,t,.004,1.1,v*.75,.3);tone(X,out,'sine',(o.f||73)*1.5,0,t,.004,.5,v*.2);nz(X,out,'lowpass',320,.7,t,.001,.09,v*.25);break;
 case 'bd':tone(X,out,'sine',62,44,t,.003,.6,v*.85,.18);nz(X,out,'lowpass',220,.7,t,.001,.1,v*.3);break;
 case 'tri':[3150,4870,7020].forEach(function(f,i){tone(X,out,'sine',f,0,t,.001,1.3-.3*i,v*.05)});break;
 case 'cym':(function(){var c=X.ctx,len=o.len||1.5,s=X.noise(t,len+1),fl=c.createBiquadFilter(),g=c.createGain();fl.type='highpass';fl.frequency.value=4200;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.22,t+len);g.gain.setTargetAtTime(0,t+len,.12);s.connect(fl);fl.connect(g);g.connect(out)})();break;
 case 'heart':tone(X,out,'sine',64,42,t,.002,.17,v*.62,.09);nz(X,out,'lowpass',160,.8,t,.003,.1,v*.32);tone(X,out,'sine',58,40,t+.21,.002,.15,v*.4,.08);nz(X,out,'lowpass',160,.8,t+.21,.003,.08,v*.2);break;
 case 'ck':tone(X,out,'triangle',130,40,t,.001,.14,v*.9,.06);break;
 case 'csn':nz(X,out,'highpass',1500,.7,t,.001,.11,v*.35,crushBuf());tone(X,out,'square',220,110,t,.001,.04,v*.1,.04);break;
 case 'chh':nz(X,out,'highpass',8000,.7,t,.001,.03,v*.25,crushBuf());break;
}}
function birds(X,L,bars,dens){if(!X.on(L))return;bars.forEach(function(b){if(X.rng()>dens)return;var t=X.T(b,X.rng()*3),c=X.ctx,out=X.out('nat'),n=2+Math.floor(X.rng()*3),f=2600+X.rng()*1400,pan=X.rng()*1.6-.8,rs=[];for(var q=0;q<n;q++)rs.push(X.rng());X.evd('nat','bird',t,.5);
 X.later(t,t+1,function(){var p=c.createStereoPanner();p.pan.value=pan;p.connect(out);
 for(var i=0;i<n;i++){var os=c.createOscillator(),g=c.createGain(),tt=t+i*.11,f0=f*(1+.15*Math.sin(i*2.1)),f1=f0*(rs[i]<.5?1.35:.75);os.frequency.setValueAtTime(f0,tt);os.frequency.exponentialRampToValueAtTime(f1,tt+.07);
  g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.05,tt+.01);g.gain.setTargetAtTime(0,tt+.04,.02);os.connect(g);g.connect(p);os.start(tt);os.stop(tt+.15)}})})}
function crickets(X,L,bars){if(!X.on(L))return;var c=X.ctx,out=X.out('nat');bars.forEach(function(b){for(var k=0;k<2;k++){var t=X.T(b,k*2+X.rng()*.5),fq=4500+X.rng()*300;X.later(t,t+1,(function(t,fq){return function(){var os=c.createOscillator(),am=c.createOscillator(),ag=c.createGain(),g=c.createGain();
 os.frequency.value=fq;am.type='square';am.frequency.value=28;ag.gain.value=.012;g.gain.value=0;am.connect(ag);ag.connect(g.gain);g.gain.setValueAtTime(0,t);g.gain.setValueAtTime(0,t+.32);
 os.connect(g);g.connect(out);os.start(t);am.start(t);os.stop(t+.3);am.stop(t+.3)}})(t,fq))}})}
function crackle(X,L,dens){if(!X.on(L))return;var c=X.ctx,len=Math.ceil(X.loopSec*SR),b=new AudioBuffer({length:len,numberOfChannels:1,sampleRate:SR}),d=b.getChannelData(0),r=rng(5);
 for(var i=0;i<len;i++){d[i]=(r()*2-1)*.004;if(r()<dens/SR){var a=(r()*.5+.2)*(r()<.1?2:1);for(var j=0;j<20&&i+j<len;j++)d[i+j]+=a*Math.exp(-j/3)*(j%2?-1:1)}}
 var s=c.createBufferSource(),f=c.createBiquadFilter();s.buffer=b;f.type='highpass';f.frequency.value=900;s.connect(f);f.connect(X.out('vinyl'));s.start(0)}

var EXP={noiseBuf:noiseBuf,crushBuf:crushBuf,ksBuf:ksBuf,IR:IR,satCurve:satCurve,ks:ks,ep:ep,MAL:MAL,mallet:mallet,WIND:WIND,wind:wind,chip:chip,bassv:bassv,trem:trem,GTR:GTR,MAND:MAND,BASSU:BASSU,PIZZ:PIZZ,PIZZC:PIZZC,HARP:HARP,GTRM:GTRM,W:W,M:M,EP:EP,SUB:SUB,SAWB:SAWB,CH:CH,D:D,tone:tone,nz:nz,drum:drum,birds:birds,crickets:crickets,crackle:crackle};
Object.assign(NS,EXP);
PB.inst=EXP;
})();
