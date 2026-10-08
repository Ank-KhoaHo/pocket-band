/* Pocket Band -- the deck: draws the display, builds the cassettes, pads and mixtapes, wires keys and knobs.
   All sound decisions live in PB.player; this file only reads its state and calls it. */
(function(){
'use strict';
var PB=window.PB,P=PB.player,STY=PB.STYLES,MOODS=PB.MOODS,st=P.state;
function $(s){return document.querySelector(s)}
function $$(s){return [].slice.call(document.querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var NEW_STYLES={ambient:1,jazz:1,synthwave:1,tavern:1,bossa:1,zen:1},NEW_MOODS={rainy:1,playful:1,spooky:1,adventure:1,rush:1,chase:1};
var GROUP_DOT={Calm:'#7fa7d9',Bright:'#ffd166',Moody:'#c59cff',Bold:'#ff6a3d',Fast:'#ff2d55'};
var CAT={call:['call','#ffd166'],resp:['answer','#6fd3e8'],harm:['harmony','#c59cff'],chord:['chords','#5fae4e'],bass:['bass','#e0915a'],perc:['drums','#9dff7a88'],fx:['texture','#f09ac8'],hb:['heartbeat','#ff7a6b']};

/* ---------- build the controls ---------- */
$('#tapes').innerHTML=STY.map(function(s,i){return '<button class="tape" data-style="'+s.id+'" aria-pressed="false" aria-label="'+esc(s.nm)+' cassette, key '+((i+1)%10)+'">'+
 '<span class="stripe" style="background:'+s.stripe+'"></span><span class="n">'+((i+1)%10)+'</span>'+
 '<span class="nm">'+esc(s.label)+(NEW_STYLES[s.id]?'<span class="new">NEW</span>':'')+'</span><span class="sh">'+esc(s.short)+'</span>'+
 '<span class="reels" aria-hidden="true"><span class="reel"></span><span class="window"></span><span class="reel"></span></span></button>'}).join('');
$('#pads').innerHTML=MOODS.map(function(m){return '<button class="pad'+(m.grp==='Fast'?' fast':'')+'" data-mood="'+m.id+'" aria-pressed="false">'+
 '<span class="dot" style="background:'+GROUP_DOT[m.grp]+'"></span>'+esc(m.nm)+'<span class="g">'+m.grp.toLowerCase()+(NEW_MOODS[m.id]?' · new':'')+(m.fast?' · 200+ bpm':'')+'</span></button>'}).join('');
$('#mixes').innerHTML=P.MIXTAPES.map(function(t){return '<button class="mixtape" data-mix="'+t.id+'" aria-pressed="false"><b>'+esc(t.nm)+'</b><span>'+
 t.segs.length+' parts · '+t.segs.reduce(function(a,s){return a+s[1]},0)+' bars</span></button>'}).join('');
$('#legend').innerHTML=['call','resp','harm','chord','bass','perc'].map(function(k){return '<span><i style="background:'+CAT[k][1]+'"></i>'+CAT[k][0]+'</span>'}).join('');

/* ---------- reflect the player's state ---------- */
function upper(s){return String(s).toUpperCase()}
function sync(){var S=STY[st.si],C=MOODS[st.mi],now=P.now();
 $$('[data-style]').forEach(function(b){var on=b.dataset.style===S.id;b.setAttribute('aria-pressed',on);b.classList.toggle('spinning',on&&st.playing&&!st.mixtape)});
 $$('[data-mood]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.mood===C.id)});
 $$('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.mode===st.mode)});
 $$('[data-layer]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.layer===st.layer)});
 $$('[data-mix]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.mix===st.mixtape)});
 var play=$('#play');play.setAttribute('aria-pressed',st.playing||st.busy);play.textContent=st.busy?'… Building':(st.playing?'■ Stop':'▶ Play');
 $('#viewRoll').setAttribute('aria-pressed',st.view==='roll');$('#viewScope').setAttribute('aria-pressed',st.view==='scope');
 $('#fav').setAttribute('aria-pressed',P.isFav(st.si,st.mi));$('#rm').setAttribute('aria-pressed',st.reduceMotion);document.body.classList.toggle('rm',st.reduceMotion);
 $('#nowTitle').textContent=st.mixtape?upper('Mixtape / '+P.MIXTAPES.filter(function(t){return t.id===st.mixtape})[0].nm):upper(S.label+' / '+C.nm);
 var bpm=PB.bpmOf(S,C);$('#nowMeta').textContent=bpm+' BPM · '+PB.KEYN[C.key]+' '+upper(PB.MODEN[C.mode])+' · 16 BARS · '+(16*4*60/bpm).toFixed(1)+' S';
 knobSet($('#knobVol'),st.volume*100,0,100);knobSet($('#knobLoops'),st.reps,1,4);$('#loopsLab').textContent='Loops ×'+st.reps;
 $('#knobLoops').setAttribute('aria-valuetext',st.reps+(st.reps===1?' loop':' loops'));
 renderPlays()}
function statusLine(){var S=STY[st.si];
 if(st.busy)return '… BUILDING THE LOOP';
 if(st.mixtape){var m=P.mixtapeNow();if(!m)return '… BUILDING THE MIXTAPE';var seg=m.segs.filter(function(s){return m.now>=s.t0&&m.now<s.t1})[0];return '▶ MIXTAPE · '+upper(seg?seg.nm:'')}
 if(!st.playing)return '■ STOPPED · SPACE TO PLAY';
 var n=P.now(),txt='▶ PLAYING';if(st.mode!=='one')txt+=' · LOOP '+Math.min(n.loopNo,st.reps)+'/'+st.reps;
 if(st.next)txt+=' · NEXT ▸ '+upper(STY[st.next.si].label+' / '+MOODS[st.next.mi].nm);else if(st.layer!=='full')txt+=' · LAYER '+upper(st.layer);
 return txt}
function renderPlays(){var list=P.plays(),f=0;STY.forEach(function(s,si){MOODS.forEach(function(m,mi){if(P.isFav(si,mi))f++})});
 $('#favCount').textContent=f?'· ♥ '+f:'';
 $('#plays').innerHTML=list.slice(0,5).map(function(p){var min=p.seconds<60?'<1 min':Math.round(p.seconds/60)+' min';
  return '<li>'+esc(p.styleName)+' / '+esc(p.moodName)+'<span class="t">'+min+'</span>'+(p.fav?'<span class="h" aria-label="favourite">♥</span>':'')+'</li>'}).join('');
 $('#playsEmpty').hidden=list.length>0}
P.on('change',sync);
P.on('status',function(t){$('#nowStatus').textContent=t});

/* ---------- knobs: drag up or down, wheel, or arrow keys ---------- */
function knobSet(k,v,lo,hi){k.setAttribute('aria-valuenow',Math.round(v));k.style.setProperty('--a',(-135+270*(v-lo)/(hi-lo))+'deg')}
var REPS=[1,2,4];
function knobStep(id,dir,fine){if(id==='knobVol')P.setVolume(st.volume+dir*(fine?.01:.05));else{var i=REPS.indexOf(st.reps)+dir;if(i>=0&&i<REPS.length)P.setReps(REPS[i])}}
$$('.knob').forEach(function(k){var y0=0,acc=0,drag=false;
 k.addEventListener('pointerdown',function(e){drag=true;y0=e.clientY;acc=0;k.setPointerCapture(e.pointerId)});
 k.addEventListener('pointermove',function(e){if(!drag)return;acc+=y0-e.clientY;y0=e.clientY;var step=k.id==='knobVol'?4:28;
  while(Math.abs(acc)>=step){knobStep(k.id,acc>0?1:-1,true);acc-=step*(acc>0?1:-1)}});
 k.addEventListener('pointerup',function(){drag=false});k.addEventListener('pointercancel',function(){drag=false});
 k.addEventListener('wheel',function(e){e.preventDefault();knobStep(k.id,e.deltaY<0?1:-1)},{passive:false});
 k.addEventListener('keydown',function(e){var d={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();e.stopPropagation();knobStep(k.id,d)}})});

/* ---------- clicks ---------- */
var copyTimer=0;
function copyText(t){function fallback(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return ok?Promise.resolve():Promise.reject()}
 return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t).catch(fallback):fallback()}
function download(){var b=$('#wav');b.textContent='… Saving';P.download().then(function(){b.textContent='⤓ WAV'},function(e){b.textContent='⤓ WAV';$('#nowStatus').textContent='DOWNLOAD FAILED: '+e})}
document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var d=b.dataset;
 if(d.style)P.select(PB.styleIndex[d.style],st.mi);
 else if(d.mood)P.select(st.si,PB.moodIndex[d.mood]);
 else if(d.mode)P.setMode(d.mode);
 else if(d.layer)P.setLayer(d.layer);
 else if(d.mix){if(st.mixtape===d.mix)P.stopMixtape();else P.playMixtape(d.mix)}
 else switch(b.id){
  case 'play':P.toggle();break;case 'prev':P.step(-1);break;case 'next':P.step(1);break;case 'wav':download();break;
  case 'fav':P.toggleFav();break;case 'viewRoll':P.setView('roll');break;case 'viewScope':P.setView('scope');break;
  case 'rm':P.setReduceMotion(!st.reduceMotion);break;
  case 'copyPlays':copyText(P.playsText()).then(function(){b.textContent='Copied';clearTimeout(copyTimer);copyTimer=setTimeout(function(){b.textContent='Copy'},1400)},function(){b.textContent='Copy failed'});break;
  case 'resetPlays':if(confirm('Reset my plays? This clears the listening log; favourites stay.'))P.resetPlays();break}});

/* ---------- keys ---------- */
document.addEventListener('keydown',function(e){if(e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target;
 if(t.closest&&t.closest('input,textarea,select'))return;var k=e.key;
 if(/^[0-9]$/.test(k)){var i=(+k+9)%10;if(i<STY.length){P.select(i,st.mi);e.preventDefault()}return}
 if(k==='ArrowRight'||k==='ArrowLeft'){P.step(k==='ArrowRight'?1:-1);e.preventDefault();return}
 if(k===' '){if(t.closest&&t.closest('button,[role=slider]'))return;P.toggle();e.preventDefault();return}
 var lk=k.toLowerCase(),L=['full','calm','build','tense'],M=['one','next','all','shuffle'];
 if(lk==='n')P.step(1);else if(lk==='m')P.setMode(M[(M.indexOf(st.mode)+1)%4]);else if(lk==='l')P.setLayer(L[(L.indexOf(st.layer)+1)%4]);
 else if(lk==='v')P.setView(st.view==='roll'?'scope':'roll');else if(lk==='f')P.toggleFav();else if(lk==='d')download();
 else if(k==='Escape')P.stop();else return;e.preventDefault()});

/* ---------- the display: roll, scope or mixtape timeline ---------- */
var cv=$('#lcd'),cx=cv.getContext('2d'),DPR=1,fbuf=null,tbuf=null;
function fit(){DPR=Math.min(2,window.devicePixelRatio||1);var r=cv.getBoundingClientRect();cv.width=Math.max(1,Math.round(r.width*DPR));cv.height=Math.max(1,Math.round(r.height*DPR))}
addEventListener('resize',fit);fit();
var PH='#9dff7a';
function drawRoll(W,H){var n=P.now(),r=n.loop;if(!r||!r.ev)return idle(W,H,st.playing?'':'NO TAPE PLAYING');
 var drumH=22*DPR,top=14*DPR,pitchH=H-top-drumH-6*DPR,barS=4*r.spb,win=st.reduceMotion?r.loopSec:barS*4,pos=n.pos,x0=st.reduceMotion?0:pos-win*.25;
 function X(t){return (t-x0)/win*W}
 var lo=127,hi=0;r.ev.forEach(function(e){if(e.m!=null){if(e.m<lo)lo=e.m;if(e.m>hi)hi=e.m}});if(lo>hi){lo=48;hi=84}lo-=2;hi+=2;
 function Y(m){return top+pitchH-(m-lo)/(hi-lo)*pitchH}
 cx.font=(12*DPR)+'px VT323, monospace';cx.textAlign='left';
 for(var k=-1;k<=Math.ceil(win/barS)+1;k++){var bi=Math.floor(x0/barS)+k,x=X(bi*barS),b16=((bi%16)+16)%16;
  cx.fillStyle=b16%4===0?'#9dff7a40':'#9dff7a1c';cx.fillRect(x,0,DPR,H);
  if(!st.reduceMotion||b16%4===0){cx.fillStyle=Math.floor(b16/2)%2===0?'#ffd166':'#6fd3e8';cx.globalAlpha=.8;cx.fillText((b16+1)+(b16%2===0?(Math.floor(b16/2)%2===0?' call':' answer'):''),x+3*DPR,10*DPR);cx.globalAlpha=1}}
 var L=r.loopSec;
 for(var rep=-1;rep<=1;rep++)r.ev.forEach(function(e){var t=e.t+rep*L;if(t+(e.d||.1)<x0||t>x0+win)return;var x=X(t),col=CAT[e.c]?CAT[e.c][1]:PH;
  if(e.m!=null){var w=Math.max(2*DPR,e.d/win*W-DPR),hh=Math.max(3*DPR,pitchH/(hi-lo)*.85),act=!st.reduceMotion&&rep===0&&pos>=e.t&&pos<e.t+e.d;
   cx.fillStyle=col;cx.globalAlpha=act?1:(e.c==='chord'||e.c==='bass'?.5:.9);cx.fillRect(x,Y(e.m)-hh/2,w,hh);
   if(act&&(e.c==='call'||e.c==='resp')){cx.shadowColor=col;cx.shadowBlur=10*DPR;cx.fillRect(x,Y(e.m)-hh/2,w,hh);cx.shadowBlur=0}cx.globalAlpha=1}
  else{cx.fillStyle=col;cx.globalAlpha=.45+.5*Math.min(1,e.v||.5);cx.fillRect(x,H-drumH+(e.c==='hb'?2:e.c==='fx'?14:6)*DPR,2*DPR,(5+(e.v||.5)*7)*DPR);cx.globalAlpha=1}});
 var px=X(pos);cx.fillStyle='#fff6c8';cx.shadowColor='#fff6c8';cx.shadowBlur=8*DPR;cx.fillRect(px,0,2*DPR,H);cx.shadowBlur=0}
function drawScope(W,H){var an=P.analyser;if(!an)return idle(W,H,'NO SIGNAL');
 if(!tbuf||tbuf.length!==an.fftSize){tbuf=new Float32Array(an.fftSize);fbuf=new Uint8Array(an.frequencyBinCount)}
 an.getFloatTimeDomainData(tbuf);an.getByteFrequencyData(fbuf);var sh=H*.55;
 cx.strokeStyle=PH;cx.lineWidth=2*DPR;cx.shadowColor=PH;cx.shadowBlur=8*DPR;cx.beginPath();
 for(var i=0;i<tbuf.length;i+=2){var x=i/tbuf.length*W,y=sh/2-tbuf[i]*sh*1.6;if(i)cx.lineTo(x,y);else cx.moveTo(x,y)}cx.stroke();cx.shadowBlur=0;
 var bands=16,bw=W/bands,ny=fbuf.length,base=H;
 for(var b=0;b<bands;b++){var a=Math.floor(Math.pow(ny,b/bands)),z=Math.max(a+1,Math.floor(Math.pow(ny,(b+1)/bands))),s=0;for(var j=a;j<z;j++)s+=fbuf[j];var v=s/(z-a)/255,h=v*(H-sh-6*DPR);
  var g=cx.createLinearGradient(0,base-h,0,base);g.addColorStop(0,'#ff6a3d');g.addColorStop(.4,'#ffb347');g.addColorStop(1,PH);cx.fillStyle=g;cx.fillRect(b*bw+2*DPR,base-h,bw-4*DPR,h)}}
function drawTape(W,H){var m=P.mixtapeNow();if(!m)return idle(W,H,'… BUILDING THE MIXTAPE');var span=m.end-m.start;
 cx.font=(16*DPR)+'px VT323, monospace';cx.textAlign='center';cx.textBaseline='middle';
 m.segs.forEach(function(s,i){var x=(s.t0-m.start)/span*W,w=(s.t1-s.t0)/span*W,act=m.now>=s.t0&&m.now<s.t1;
  cx.fillStyle=s.st==='tense'?'#ff7a6b':s.st==='build'?'#ffd166':s.st==='calm'?'#5fae4e':['#6fd3e8','#c59cff','#e0915a','#f09ac8'][i%4];
  cx.globalAlpha=act?.7:.25;cx.fillRect(x+DPR,H*.25,w-2*DPR,H*.5);cx.globalAlpha=1;cx.fillStyle=act?'#fff':PH;cx.fillText(upper(s.nm),x+w/2,H/2,w-6*DPR)});
 var px=Math.max(0,Math.min(1,(m.now-m.start)/span))*W;cx.fillStyle='#fff6c8';cx.fillRect(px,H*.12,2*DPR,H*.76);cx.textBaseline='alphabetic'}
function idle(W,H,txt){cx.fillStyle='#9dff7a55';cx.font=(22*DPR)+'px VT323, monospace';cx.textAlign='center';cx.fillText(txt,W/2,H/2)}
var lastStatus='';
function frame(){var W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);
 if(st.mixtape)drawTape(W,H);else if(st.view==='scope')drawScope(W,H);else if(st.playing)drawRoll(W,H);else idle(W,H,st.busy?'… BUILDING':'SPACE TO PLAY');
 var s=statusLine();if(s!==lastStatus){$('#nowStatus').textContent=s;lastStatus=s;sync()}
 requestAnimationFrame(frame)}
sync();requestAnimationFrame(frame);
PB.ready=true;
})();
