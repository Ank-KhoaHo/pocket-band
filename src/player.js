/* Pocket Band -- the player: one audio graph, playback, play modes, layers, mixtapes,
   favourites, a listening log and saved settings. The UI (deck.js) only calls PB.player. */
(function(){
'use strict';
var PB=window.PB,STY=PB.STYLES,MOODS=PB.MOODS;

/* ---------- saved settings: every access may throw (private windows, blocked site data) ---------- */
function load(k){try{return localStorage.getItem('pocket-band-'+k)}catch(e){return null}}
function store(k,v){try{localStorage.setItem('pocket-band-'+k,String(v))}catch(e){}}
function loadJSON(k,fallback,valid){try{var v=JSON.parse(load(k));return valid(v)?v:fallback}catch(e){return fallback}}

var MODES=['one','next','all','shuffle'],LAYERS=['full','calm','build','tense'],VIEWS=['roll','scope'];
var st={si:PB.styleIndex.folk,mi:PB.moodIndex.lively,playing:false,busy:false,mode:'one',reps:2,layer:'full',view:'roll',
 volume:.9,reduceMotion:false,next:null,mixtape:null};
(function restore(){var s=load('style'),m=load('mood'),r=+load('reps'),v=load('vol');
 if(s!=null&&PB.styleIndex[s]!=null)st.si=PB.styleIndex[s];else if(/^\d+$/.test(s||'')&&+s<STY.length)st.si=+s;
 if(m==='heroic')m='triumph';if(m!=null&&PB.moodIndex[m]!=null)st.mi=PB.moodIndex[m];
 if(MODES.indexOf(load('mode'))>=0)st.mode=load('mode');if(r===1||r===2||r===4)st.reps=r;
 if(LAYERS.indexOf(load('layer'))>=0)st.layer=load('layer');if(VIEWS.indexOf(load('view'))>=0)st.view=load('view');
 if(v!=null&&v!==''&&isFinite(+v))st.volume=Math.max(0,Math.min(1,+v));st.reduceMotion=load('rm')==='1'})();
var favs=loadJSON('favs',[],function(v){return Array.isArray(v)&&v.every(function(x){return typeof x==='string'})});
var plays=loadJSON('plays',{},function(v){return v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(function(k){return isFinite(v[k])})});
function keyOf(si,mi){return STY[si].id+'|'+MOODS[mi].id}
function savePrefs(){store('style',STY[st.si].id);store('mood',MOODS[st.mi].id)}
PB.currentKey=function(){return st.si+'|'+st.mi};

/* ---------- events ---------- */
var subs={change:[],status:[]};
function on(ev,fn){subs[ev].push(fn)}
function emit(ev,a){subs[ev].forEach(function(f){try{f(a)}catch(e){console.error(e)}})}

/* ---------- the audio graph: sources -> MAIN (volume) -> analyser -> speakers ---------- */
var AC=null,MAIN=null,AN=null,live=new Set();
function audio(){if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();MAIN=AC.createGain();MAIN.gain.value=st.volume;
  AN=AC.createAnalyser();AN.fftSize=2048;MAIN.connect(AN);AN.connect(AC.destination);api.analyser=AN}
 if(AC.state==='suspended')AC.resume();return AC}
function src(buf,loopSec,gain,dest,t0){var s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.loop=true;s.loopEnd=loopSec;
 g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(gain,t0+.05);s.connect(g);g.connect(dest);s.start(t0);
 live.add(s);s.onended=function(){live.delete(s)};return {s:s,g:g}}
function fadeOut(nodes,when,fade){nodes.forEach(function(n){try{n.g.gain.cancelScheduledValues(when);n.g.gain.setTargetAtTime(0,when,fade/3);n.s.stop(when+fade*3)}catch(e){}})}

/* ---------- playback ---------- */
var cur=null,tok=null,pending=false,advancing=false;
function layerGains(layer){return {base:1,hi:layer==='build'||layer==='tense'?1:0,hb:layer==='tense'?1.1:0,cut:layer==='tense'?600:20000}}
function applyLayer(layer,when){if(!cur||cur.kind!=='stems')return;var g=layerGains(layer);
 cur.nodes.forEach(function(n){n.g.gain.cancelScheduledValues(when);n.g.gain.setTargetAtTime(g[n.k],when,.12)});cur.filter.frequency.setTargetAtTime(g.cut,when,.18)}
function nextBeat(){if(!cur)return AC.currentTime+.03;var b=cur.loop.spb;return cur.start+Math.ceil((AC.currentTime-cur.start)/b+.05)*b}
function start(at){audio();var si=st.si,mi=st.mi,layer=st.layer,t={};tok=t;pending=true;st.next=null;
 if(!st.playing){st.busy=true;emit('status','Building '+STY[si].nm+' · '+MOODS[mi].nm+' …')}emit('change');
 var job=layer==='full'?PB.getLoop(si,mi):PB.getStems(si,mi);
 return job.then(function(r){if(tok!==t)return;var t0=Math.max(AC.currentTime+.03,at||0),nodes=[],filter=null,kind=layer==='full'?'loop':'stems';
  if(cur)fadeOut(cur.nodes,t0,.12);
  if(kind==='loop'){var n=src(r.buf,r.loopSec,1,MAIN,t0);n.k='base';nodes.push(n)}
  else{var g=layerGains(layer);filter=AC.createBiquadFilter();filter.type='lowpass';filter.frequency.value=g.cut;filter.Q.value=.7;filter.connect(MAIN);
   ['base','hi','hb'].forEach(function(k){var n=src(r[k],r.loopSec,g[k],k==='hb'?MAIN:filter,t0);n.k=k;nodes.push(n)})}
  cur={kind:kind,loop:r,start:t0,nodes:nodes,filter:filter,si:si,mi:mi,layer:layer};
  st.playing=true;st.busy=false;pending=false;advancing=false;planNext();emit('change')})
 .catch(function(e){if(tok!==t)return;st.busy=false;pending=false;advancing=false;emit('status','Render failed: '+e);emit('change');console.error(e)})}
function nextPick(dir){var si=st.si,mi=st.mi;
 if(st.mode==='shuffle'){do{si=Math.floor(Math.random()*STY.length);mi=Math.floor(Math.random()*MOODS.length)}while(si===st.si&&mi===st.mi);return {si:si,mi:mi}}
 mi+=dir;if(mi>=MOODS.length){mi=0;if(st.mode==='all')si=(si+1)%STY.length}else if(mi<0){mi=MOODS.length-1;if(st.mode==='all')si=(si-1+STY.length)%STY.length}
 return {si:si,mi:mi}}
function warm(si,mi){var job=st.layer==='full'?PB.getLoop(si,mi):PB.getStems(si,mi);job.catch(function(){})}
function planNext(){var n=nextPick(1);st.next=st.mode==='one'?null:n;setTimeout(function(){if(st.playing)warm(n.si,n.mi)},400)}
function advance(at){var n=st.next||nextPick(1);advancing=true;st.si=n.si;st.mi=n.mi;savePrefs();start(at)}
function stop(){stopMixtape(true);if(AC&&cur)fadeOut(cur.nodes,AC.currentTime,.08);cur=null;tok=null;
 st.playing=false;st.busy=false;pending=false;advancing=false;st.next=null;emit('change')}
function select(si,mi){stopMixtape(true);st.si=si;st.mi=mi;savePrefs();return start()}

/* ---------- the clock: advance on the loop boundary, count listening time ---------- */
var lastTick=performance.now(),unsaved=0;
function tick(){var nowMs=performance.now(),dt=Math.min(1,(nowMs-lastTick)/1000);lastTick=nowMs;
 if(st.playing&&cur&&!st.mixtape){var k=keyOf(cur.si,cur.mi);plays[k]=(plays[k]||0)+dt;unsaved+=dt;if(unsaved>=5)savePlays()}
 if(st.playing&&cur&&st.mode!=='one'&&!advancing&&!pending){var end=cur.start+cur.loop.loopSec*st.reps;if(AC.currentTime>=end-.8)advance(end)}}
function savePlays(){unsaved=0;store('plays',JSON.stringify(plays))}
setInterval(tick,200);
addEventListener('pagehide',savePlays);

/* ---------- mixtapes: moods back to back, each change on a bar line ---------- */
var MIXTAPES=[
 {id:'rise',nm:'Rise and rest',segs:[['gentle',4],['lively',4],['warm',4],['quiet',4]]},
 {id:'story',nm:'A short story',segs:[['theme',4],['stroll',4],['lively',4],['epic',4]]},
 {id:'swell',nm:'The swell',segs:[['lively',4,'calm'],['lively',4,'build'],['lively',4,'tense'],['lively',2,'build'],['lively',2,'calm']]},
 {id:'dark',nm:'Into the dark',segs:[['mystery',4],['melancholy',4],['tense',4],['triumph',4]]},
 {id:'long',nm:'The long way',segs:[['theme',4],['stroll',4],['gentle',4],['lively',2,'calm'],['lively',2,'build'],['lively',4,'tense'],['epic',4]]}];
var MIXI={};MIXTAPES.forEach(function(m){MIXI[m.id]=m});
var tape=null,ttok=null;
function segName(s){return MOODS[PB.moodIndex[s[0]]].nm+(s[2]?' · '+s[2][0].toUpperCase()+s[2].slice(1):'')}
function playMixtape(id){stop();audio();var T=MIXI[id],si=st.si,t={};ttok=t;st.mixtape=id;st.busy=true;emit('status','Building the mixtape …');emit('change');
 return Promise.all(T.segs.map(function(s){var mi=PB.moodIndex[s[0]];return s[2]?PB.getStems(si,mi):PB.getLoop(si,mi)})).then(function(rs){if(ttok!==t)return;
  var t0=AC.currentTime+.08,tt=t0,nodes=[],segs=[],xf=.04;
  T.segs.forEach(function(s,i){var r=rs[i],dur=s[1]*4*r.spb;segs.push({nm:segName(s),t0:tt,t1:tt+dur,st:s[2]||null});
   function one(buf,gain,cut){var a=AC.createBufferSource(),g=AC.createGain();a.buffer=buf;a.loop=true;a.loopEnd=r.loopSec;
    g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(gain,tt+xf);g.gain.setValueAtTime(gain,tt+dur);g.gain.linearRampToValueAtTime(0,tt+dur+xf);
    if(cut){var f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;a.connect(f);f.connect(g)}else a.connect(g);
    g.connect(MAIN);a.start(tt,0);a.stop(tt+dur+xf+.05);live.add(a);a.onended=function(){live.delete(a)};nodes.push({s:a,g:g})}
   if(s[2]){var g=layerGains(s[2]),cut=s[2]==='tense'?600:0;one(r.base,1,cut);if(g.hi)one(r.hi,1,cut);if(g.hb)one(r.hb,1.1,0)}else one(r.buf,1,0);tt+=dur});
  tape={id:id,nodes:nodes,segs:segs,start:t0,end:tt};st.busy=false;emit('change');
  setTimeout(function(){if(tape&&tape.id===id&&ttok===t)stopMixtape()},(tt-AC.currentTime)*1000+400)})}
function stopMixtape(quiet){ttok=null;var had=!!st.mixtape;if(tape&&AC)fadeOut(tape.nodes,AC.currentTime,.06);tape=null;st.mixtape=null;
 if(had){st.busy=false;if(!quiet)emit('change')}}

/* ---------- favourites, the listening log, download ---------- */
function toggleFav(){var k=keyOf(st.si,st.mi),i=favs.indexOf(k);if(i>=0)favs.splice(i,1);else favs.push(k);store('favs',JSON.stringify(favs));emit('change')}
function isFav(si,mi){return favs.indexOf(keyOf(si,mi))>=0}
function listPlays(){return Object.keys(plays).filter(function(k){return plays[k]>=1}).map(function(k){var p=k.split('|'),s=STY[PB.styleIndex[p[0]]],m=MOODS[PB.moodIndex[p[1]]];
  return s&&m?{style:p[0],mood:p[1],styleName:s.nm,moodName:m.nm,seconds:plays[k],fav:favs.indexOf(k)>=0}:null}).filter(Boolean)
 .sort(function(a,b){return b.seconds-a.seconds})}
function minutes(sec){return sec<60?'<1 min':Math.round(sec/60)+' min'}
function playsText(){return ['Pocket Band — my plays'].concat(listPlays().map(function(p,i){return (i+1)+'. '+p.styleName+' / '+p.moodName+' — '+minutes(p.seconds)+(p.fav?' ♥':'')})).join('\n')}
function resetPlays(){plays={};savePlays();emit('change')}
function download(){var si=st.si,mi=st.mi,layer=st.layer,S=STY[si],C=MOODS[mi];
 var job=layer==='full'?PB.getLoop(si,mi).then(function(r){return r.buf}):PB.getStems(si,mi).then(function(r){return PB.mixLayer(r,layer)});
 return job.then(function(buf){var ab=PB.encodeWav(buf),name=PB.wavName(S,C,PB.bpmOf(S,C)),url=URL.createObjectURL(new Blob([ab],{type:'audio/wav'})),a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},4000);return {name:name,bytes:ab.byteLength}})}

/* ---------- settings ---------- */
function setMode(m){if(MODES.indexOf(m)<0)return;st.mode=m;store('mode',m);if(st.playing)planNext();else st.next=null;emit('change')}
function setReps(n){if([1,2,4].indexOf(n)<0)return;st.reps=n;store('reps',n);emit('change')}
function setLayer(l){if(LAYERS.indexOf(l)<0||l===st.layer)return;var was=st.layer;st.layer=l;store('layer',l);
 if(st.playing&&cur&&!st.mixtape){if(was!=='full'&&l!=='full')applyLayer(l,nextBeat());else start(nextBeat())}emit('change')}
function setView(v){if(VIEWS.indexOf(v)<0)return;st.view=v;store('view',v);emit('change')}
function setVolume(v){st.volume=Math.max(0,Math.min(1,+v||0));store('vol',st.volume);if(MAIN)MAIN.gain.setTargetAtTime(st.volume,AC.currentTime,.02);emit('change')}
function setReduceMotion(b){st.reduceMotion=!!b;store('rm',b?'1':'0');emit('change')}

var api={state:st,analyser:null,MIXTAPES:MIXTAPES,on:on,select:select,play:function(){return start()},stop:stop,
 toggle:function(){if(st.playing||st.busy)stop();else start()},step:function(dir){var n=nextPick(dir);return select(n.si,n.mi)},
 setMode:setMode,setReps:setReps,setLayer:setLayer,setView:setView,setVolume:setVolume,setReduceMotion:setReduceMotion,
 toggleFav:toggleFav,isFav:isFav,plays:listPlays,playsText:playsText,resetPlays:resetPlays,download:download,
 playMixtape:playMixtape,stopMixtape:function(){stopMixtape()},
 now:function(){if(!cur||!AC)return {loop:null,pos:0,startedAt:0,loopNo:0};var L=cur.loop.loopSec,t=AC.currentTime-cur.start;
  return {loop:cur.loop,pos:((t%L)+L)%L,startedAt:cur.start,loopNo:Math.max(1,Math.floor(t/L)+1)}},
 mixtapeNow:function(){return tape&&AC?{segs:tape.segs,start:tape.start,end:tape.end,now:AC.currentTime}:null},
 audioTime:function(){return AC?AC.currentTime:0},
 /* test hooks */
 _skipToEnd:function(sec){if(cur)cur.start=AC.currentTime-(cur.loop.loopSec*st.reps-sec)},
 _activeSources:function(){return live.size}};
PB.player=api;
})();
